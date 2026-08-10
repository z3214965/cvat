import cv2
import numpy as np
import onnxruntime as ort

class ModelHandler:
    def __init__(self, labels):
        self.model = None
        self.load_network(model="yolo11x.onnx")
        self.labels = labels

    def load_network(self, model):
        device = ort.get_device()
        cuda = True if device == "GPU" else False
        try:
            providers = (
                ["CUDAExecutionProvider", "CPUExecutionProvider"]
                if cuda
                else ["CPUExecutionProvider"]
            )
            so = ort.SessionOptions()
            so.log_severity_level = 3

            self.model = ort.InferenceSession(model, providers=providers, sess_options=so)
            self.output_details = [i.name for i in self.model.get_outputs()]
            self.input_details = [i.name for i in self.model.get_inputs()]
        except Exception as e:
            raise Exception(f"Cannot load model {model}: {e}")

    def letterbox(
        self, im, new_shape=(640, 640), color=(114, 114, 114), auto=False, scaleup=True, stride=32
    ):
        shape = im.shape[:2]
        if isinstance(new_shape, int):
            new_shape = (new_shape, new_shape)

        r = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
        if not scaleup:
            r = min(r, 1.0)

        new_unpad = int(round(shape[1] * r)), int(round(shape[0] * r))
        dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]

        if auto:
            dw, dh = np.mod(dw, stride), np.mod(dh, stride)

        dw /= 2
        dh /= 2

        if shape[::-1] != new_unpad:
            im = cv2.resize(im, new_unpad, interpolation=cv2.INTER_LINEAR)
        top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
        left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
        im = cv2.copyMakeBorder(
            im, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color
        )
        return im, r, (dw, dh)

    def _infer(self, inputs: np.ndarray, conf_thres=0.25, iou_thres=0.7):
        """
        conf_thres: 置信度阈值(只有当模型对某个检测框的“置信度分数”大于或等于 0.25 时，该框才会被保留)
                    调高 (如 0.5): 检测结果更少，但准确率更高（漏检增加，误检减少）。适合对精度要求高、容忍漏检的场景。
                    调低 (如 0.1): 检测结果更多，能发现更模糊或小的目标，但会出现很多错误框（漏检减少，误检增加）。
        iou_thres: 交并比阈值(在非极大值抑制 (NMS) 过程中，如果两个框的重叠程度（IoU）超过 0.45，则保留得分高的那个，删除得分低的那个)
                    调高 (如 0.7): 允许更多的重叠框存在。适合检测紧密排列的物体（如人群、密集的车流），防止误删相邻物体。
                    调低 (如 0.3): 更严格地去重。适合检测稀疏分布的物体，确保结果干净，但可能会误删部分重叠的真实目标。
        """

        try:
            # 将颜色通道从 BGR 转换为 RGB
            img = cv2.cvtColor(inputs, cv2.COLOR_BGR2RGB)
            image = img.copy()
            image, ratio, dwdh = self.letterbox(image, auto=False)
            # 调整数组维度顺序
            # ONNX/PyTorch 模型输入通常要求 (Batch, Channels, Height, Width)，即 CHW。此处先转为 CHW
            image = image.transpose((2, 0, 1))
            # 增加一个批次维度（Batch Dimension）
            # 形状从 (C, H, W) 变为 (1, C, H, W)，因为模型期望接收一个批次的图像即使只有一张
            image = np.expand_dims(image, 0)
            # 确保数组在内存中是连续存储的。某些底层库或硬件加速器要求内存连续以提高读取效率
            image = np.ascontiguousarray(image)
            # 将数据类型从整数（通常是 uint8, 0-255）转换为浮点数（float32），这是神经网络计算的标准数据类型
            im = image.astype(np.float32)
            # 归一化像素值。将像素范围从 [0, 255] 映射到 [0.0, 1.0]，这有助于模型收敛和稳定推理
            im /= 255
            # 构建输入字典。ONNX Runtime 需要知道哪个输入节点对应哪张图像数据。self.input_details[0] 是模型输入层的名称
            inp = {self.input_details[0]: im}
            # [0]: 获取第一个输出层的结果
            pred = self.model.run(self.output_details, inp)[0]  # shape: (1, 84, 8400)
            # ------后处理------
            # 去除批次维度并转置矩阵
            pred = pred[0].T  # shape: (8400, 84)
            # 提取前4列作为边界框坐标。注意：YOLOv8/v11 输出的格式通常是 (cx, cy, w, h)，即中心点 x, 中心点 y, 宽, 高
            boxes_xywh = pred[:, :4]
            # 提取剩余列作为所有类别的置信度分数
            scores_all = pred[:, 4:]
            # 对于每个预测框，找出所有类别中置信度最高的那个值，作为该框的最终得分。
            scores = np.max(scores_all, axis=1)
            # 找出置信度最高的类别对应的索引（ID）
            labels = np.argmax(scores_all, axis=1)
            # ------置信度过滤------
            # 创建一个布尔掩码 mask，只保留得分高于 conf_thres（默认0.25）的预测框
            mask = scores >= conf_thres
            # 利用掩码筛选出有效的框、得分和标签，大幅减少后续计算量。
            boxes_xywh = boxes_xywh[mask]
            scores = scores[mask]
            labels = labels[mask]

            # 如果过滤后没有框，直接返回
            if len(boxes_xywh) == 0:
                return [], [], []

            # ------ Class-Aware NMS (类感知非极大值抑制) ------
            final_boxes = []
            final_scores = []
            final_labels = []

            # 获取所有出现的唯一类别 ID
            unique_labels = np.unique(labels)

            for cls_id in unique_labels:
                # 1. 找出当前类别的所有索引
                class_mask = labels == cls_id
                cls_boxes_xywh = boxes_xywh[class_mask]
                cls_scores = scores[class_mask]

                # 2. 将 xywh 转换为 xyxy (为了 NMS 计算 IoU)
                # 注意：这里是在 letterbox 缩放后的坐标系下转换
                x1 = cls_boxes_xywh[:, 0] - cls_boxes_xywh[:, 2] / 2
                y1 = cls_boxes_xywh[:, 1] - cls_boxes_xywh[:, 3] / 2
                x2 = cls_boxes_xywh[:, 0] + cls_boxes_xywh[:, 2] / 2
                y2 = cls_boxes_xywh[:, 1] + cls_boxes_xywh[:, 3] / 2
                cls_boxes_xyxy = np.column_stack([x1, y1, x2, y2])

                # 3. 对当前类别单独执行 NMS
                # cv2.dnn.NMSBoxes 需要 list 输入
                indices = cv2.dnn.NMSBoxes(
                    bboxes=cls_boxes_xyxy.tolist(),
                    scores=cls_scores.tolist(),
                    score_threshold=conf_thres,
                    nms_threshold=iou_thres
                )

                if len(indices) > 0:
                    indices = indices.flatten()
                    # 4. 收集保留下来的结果
                    final_boxes.append(cls_boxes_xyxy[indices])
                    final_scores.append(cls_scores[indices])
                    final_labels.append(np.full_like(cls_scores[indices], cls_id))

            # 如果没有通过 NMS 的框
            if not final_boxes:
                return [], [], []

            # 5. 合并所有类别的结果
            boxes_xyxy = np.concatenate(final_boxes, axis=0)
            scores = np.concatenate(final_scores, axis=0)
            labels = np.concatenate(final_labels, axis=0)

            # ------还原坐标到原始图像尺寸------
            boxes_xyxy[:, 0] = (boxes_xyxy[:, 0] - dwdh[0]) / ratio # x1
            boxes_xyxy[:, 1] = (boxes_xyxy[:, 1] - dwdh[1]) / ratio # y1
            boxes_xyxy[:, 2] = (boxes_xyxy[:, 2] - dwdh[0]) / ratio # x2
            boxes_xyxy[:, 3] = (boxes_xyxy[:, 3] - dwdh[1]) / ratio # y2

            return boxes_xyxy, labels, scores

        except Exception as e:
            print(f"_infer error: {e}")
            return [], [], []

    def infer(self, image, threshold):
        image = np.array(image)
        image = image[:, :, ::-1].copy()
        h, w, _ = image.shape
        boxes, labels, scores = self._infer(image, conf_thres=threshold)

        results = []
        if len(boxes) > 0:
            for label, score, box in zip(labels, scores, boxes):
                xtl = max(int(box[0]), 0)
                ytl = max(int(box[1]), 0)
                xbr = min(int(box[2]), w)
                ybr = min(int(box[3]), h)

                results.append(
                    {
                        "confidence": str(score),
                        "label": self.labels.get(label, "unknown"),
                        "points": [xtl, ytl, xbr, ybr],
                        "type": "rectangle",
                    }
                )

        return results
