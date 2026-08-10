# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

import cv2
import numpy as np
import onnxruntime as ort


class ModelHandler:
    def __init__(self, labels):
        self.model = None
        self.load_network(model="yolov7-nms-640.onnx")
        self.labels = labels

    def load_network(self, model):
        """
        加载ONNX模型并初始化推理会话。

        根据设备类型（GPU/CPU）配置相应的执行提供者，创建推理会话并获取模型的输入输出信息。

        Args:
            model (str): ONNX模型文件的路径。

        Raises:
            Exception: 当模型加载失败时抛出异常，包含具体的错误信息。
        """

        device = ort.get_device()
        cuda = True if device == "GPU" else False
        try:
            providers = (
                ["CUDAExecutionProvider", "CPUExecutionProvider"]
                if cuda
                else ["CPUExecutionProvider"]
            )
            # 创建ONNX Runtime会话配置对象，用于控制推理会话的各种行为
            so = ort.SessionOptions()
            # 设置日志输出的严重级别为"错误"级别
            so.log_severity_level = 3
            # 负责加载和执行模型
            self.model = ort.InferenceSession(model, providers=providers, sess_options=so)
            # 返回模型所有输出节点的信息对象列表
            self.output_details = [i.name for i in self.model.get_outputs()]
            # 获取模型所有输入节点的名称列表
            self.input_details = [i.name for i in self.model.get_inputs()]
        except Exception as e:
            raise Exception(f"Cannot load model {model}: {e}")

    def letterbox(
        self, im, new_shape=(640, 640), color=(114, 114, 114), auto=True, scaleup=True, stride=32
    ):
        """
        对图像进行缩放和填充，使其满足步长倍数约束

        Args:
            im: 输入图像数组
            new_shape: 目标形状 (height, width)，默认为 (640, 640)
            color: 填充颜色，默认为 (114, 114, 114)
            auto: 是否使用最小矩形填充，默认为 True
            scaleup: 是否允许放大图像，默认为 True（设为 False 时仅缩小，用于验证集获得更好的 mAP）
                scaleup=True（训练时）：小图可以放大到640，增加数据多样性
                scaleup=False（验证/测试时）：小图保持原尺寸，避免插值引入伪影，提高mAP
            stride: 步长约束，默认为 32

        Returns:
            tuple: 包含三个元素：
                - 处理后的图像数组
                - 缩放比例
                - 填充量元组 (dw, dh)
        """

        # 提取图像的原始尺寸
        shape = im.shape[:2]  # im.shape返回(height, width, channels)，切片取前两个维度：(height, width)
        # 统一 new_shape 格式
        if isinstance(new_shape, int):
            new_shape = (new_shape, new_shape)
        # 计算缩放比例（保持宽高比）
        # 为什么取最小值？保证缩放后的图像能完全放入目标尺寸内，保持原始宽高比不变形
        r = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
        # 限制最大缩放比例为1.0（不放大小图）
        # 假设原始图像是 (320, 320)，目标是 (640, 640)
        # r = 640 / 320 = 2.0  # 需要放大2倍
        # if scaleup=True:
        #   r = 2.0  # 允许放大
        # if scaleup=False:
        #   r = min(2.0, 1.0) = 1.0  # 不放大，保持原尺寸
        if not scaleup:
            r = min(r, 1.0) # 如果 scaleup=False，则缩放比例不超过1.0
        # 计算按比例缩放后的实际尺寸（不含填充）
        # new_unpad = (width, height) 而不是 (height, width)
        new_unpad = int(round(shape[1] * r)), int(round(shape[0] * r))
        # 计算宽度和高度方向需要填充的总像素数
        dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]
        # 确保填充后的尺寸是stride的倍数
        if auto:
            # np.mod(dw, stride) 计算 dw % stride（取余数）
            # YOLO模型的卷积层通常有stride=32的约束
            # 目的是让最终尺寸能被32整除，避免卷积时出现尺寸不对齐
            dw, dh = np.mod(dw, stride), np.mod(dh, stride)
        # 计算单侧填充量，将填充量平分到两侧
        dw /= 2
        dh /= 2
        # 如果尺寸改变，则进行缩放，shape[::-1] 反转元组：(height, width) → (width, height)
        if shape[::-1] != new_unpad:
            im = cv2.resize(im, new_unpad, interpolation=cv2.INTER_LINEAR) # 使用线性插值（INTER_LINEAR）进行缩放
        # 计算上下填充的具体像素，处理奇数填充量的分配
        top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
        # 计算左右填充的具体像素
        left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
        # 在图像四周添加恒定颜色的边框
        im = cv2.copyMakeBorder(
            im, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color
        )
        return im, r, (dw, dh)

    def _infer(self, inputs: np.ndarray):
        """
        对输入图像执行YOLOv7模型推理，返回检测结果的边界框、标签和置信度。

        对输入图像进行预处理（颜色空间转换、letterbox填充、归一化等），
        执行ONNX模型推理，并对检测结果进行后处理以还原到原始图像坐标。

        Args:
            inputs (np.ndarray): 输入的图像数据，格式为BGR的numpy数组。

        Returns:
            list: 包含三个元素的列表 [boxes, labels, scores]：
                - boxes (np.ndarray): 检测框坐标数组，形状为(N, 4)，格式为[x1, y1, x2, y2]。
                - labels (np.ndarray): 检测目标的类别标签数组，形状为(N,)。
                - scores (np.ndarray): 检测目标的置信度分数数组，形状为(N,)。

        Note:
            检测框坐标会被还原到原始图像的坐标系中，并取整为整数类型。
        """

        try:
            # 颜色空间转换（BGR → RGB）
            # YOLOv7模型训练时使用RGB颜色空间
            # OpenCV默认使用BGR颜色空间、PIL/Pillow使用RGB格式
            img = cv2.cvtColor(inputs, cv2.COLOR_BGR2RGB)
            image = img.copy()
            image, ratio, dwdh = self.letterbox(image, auto=False)
            # 调整维度顺序（HWC → CHW）
            # OpenCV、PIL/Pillow使用 HWC 格式（Height-Width-Channel）= (640, 640, 3)
            # PyTorch/ONNX模型期望 CHW 格式（Channel-Height-Width）= (3, 640, 640)
            image = image.transpose((2, 0, 1))
            # 添加批次维度（TODO：此处需要注意批处理）
            # 扩展后形状：(1, 3, 640, 640) = (batch, channel, height, width)
            # 为什么需要批次维度？ONNX模型期望批量输入（即使只处理一张图），模型输入张量的标准格式是4维：[N, C, H, W]，N=1 表示单张图片的批次
            image = np.expand_dims(image, 0)
            # 确保内存连续性
            # 将数组转换为内存连续的C风格数组，transpose 操作可能导致内存不连续
            # 为什么需要连续内存？ONNX Runtime/CUDA要求输入数据在内存中连续，提高数据传输效率，避免潜在的运行时错误
            image = np.ascontiguousarray(image)
            # 数据类型转换（uint8 → float32）
            # 原始图像数据类型：uint8（0-255的整数）
            # 转换后数据类型：float32（浮点数）
            # 为什么需要转换？神经网络模型使用浮点数运算，float32是深度学习的标准精度，支持梯度计算和归一化操作
            im = image.astype(np.float32)
            # 像素值归一化
            # 为什么需要归一化？加速模型收敛，提高数值稳定性，YOLOv7训练时使用的就是归一化后的数据，必须与训练时的预处理保持一致
            im /= 255
            # 构建模型输入字典
            # 为什么用字典？ONNX模型可能有多个输入节点，通过节点名称映射到对应的张量数据，这是ONNX Runtime的标准输入格式
            inp = {self.input_details[0]: im}
            # 执行ONNX模型推理，[0]提取第一个输出（主要检测结果）
            # 第一个参数：要获取的输出节点名称列表，第二个参数：输入数据字典
            # 返回的 detections 包含什么？YOLOv7 with NMS的输出格式通常是：
            # [batch_size, num_detections, 6]
            # 其中每行: [batch_id, x1, y1, x2, y2, class_id, confidence]
            detections = self.model.run(self.output_details, inp)[0]
            # 解析检测结果，提取边界框、标签和置信度
            boxes = detections[:, 1:5] # 提取边界框坐标，对应：[x1, y1, x2, y2]（左上角和右下角坐标）
            labels = detections[:, 5] # 提取类别标签，对应：类别ID（如 0=person, 1=car等）
            scores = detections[:, -1] # 提取置信度分数
            # 将检测框坐标还原到原始图像尺寸
            # dwdh 是 (dw, dh)，表示单侧填充量，dwdh * 2 得到总填充量 (2*dw, 2*dh)，从检测框坐标中减去填充量
            # 为什么需要这一步？检测框坐标是在填充后的图像上预测的，需要去除填充部分，还原到缩放后的图像坐标
            boxes -= np.array(dwdh * 2) # 去除letterbox填充的影响
            # 举例说明：原图尺寸：(1280, 720)，缩放后：(640, 360)，ratio = 0.5，检测框x坐标：320（缩放后），还原后：320 / 0.5 = 640（原图）
            boxes /= ratio # 还原缩放比例
            # 为什么需要取整？像素坐标必须是整数，浮点数坐标无法直接用于图像绘制，int32是标准的坐标数据类型
            boxes = boxes.round().astype(np.int32) # 坐标取整和类型转换
            # 初始化输出列表，后续会依次添加 boxes、labels、scores
            output = list()
            output.append(boxes)
            output.append(labels)
            output.append(scores)
            return output

        except Exception as e:
            print(e)

    def infer(self, image, threshold):
        """
        对输入图像进行目标检测推理，并返回满足置信度阈值的检测结果。

        将输入图像转换为RGB格式，执行模型推理，然后对检测结果进行过滤和坐标边界处理，
        最终返回包含检测框位置、标签和置信度的结构化结果。

        Args:
            image: 输入的图像数据，支持可转换为numpy数组的格式（如PIL Image、numpy数组等）。
            threshold (float): 置信度阈值，只有置信度大于等于该值的检测结果才会被返回。

        Returns:
            list[dict]: 检测结果列表，每个元素为一个字典，包含以下键值对：
                - "confidence" (str): 检测目标的置信度值（字符串格式）。
                - "label" (str): 检测目标的类别标签，如果标签ID不在标签字典中则为"unknown"。
                - "points" (list[int]): 检测矩形框的坐标点 [左上角x, 左上角y, 右下角x, 右下角y]。
                - "type" (str): 检测框类型，固定为"rectangle"。

        Note:
            检测框坐标会被限制在图像有效范围内（0到图像宽度/高度之间）。
        """

        # 防御性编程，保证数据类型的一致性
        image = np.array(image)
        # 输入是 RGB 格式 → 转换为 BGR 格式
        # YOLOv7模型训练时通常使用RGB颜色空间
        # OpenCV默认使用BGR颜色空间、PIL/Pillow使用RGB格式
        image = image[:, :, ::-1].copy()
        h, w, _ = image.shape  # 提取图像尺寸信息
        detections = self._infer(image)

        results = []
        if detections:
            boxes = detections[0]
            labels = detections[1]
            scores = detections[2]

            for label, score, box in zip(labels, scores, boxes):
                if score >= threshold:
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
