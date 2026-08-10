import base64
import io
import json

import yaml
from model_handler import ModelHandler
from PIL import Image


def init_context(context):
    """
    初始化 Nuclio serverless 函数的上下文环境。

    该函数在函数实例启动时执行一次，负责加载模型配置和初始化推理引擎。
    主要完成以下工作：
    1. 从 function.yaml 配置文件中读取标签定义
    2. 解析标签映射关系（ID到名称的映射）
    3. 创建并初始化 ModelHandler 实例
    4. 将模型实例存储到上下文中供后续请求使用

    Args:
        context: Nuclio 框架提供的上下文对象，包含以下关键属性：
            - logger: 日志记录器，用于输出初始化过程信息
            - user_data: 用户数据存储空间，用于在请求间共享数据
                - model: 存储初始化后的 ModelHandler 实例

    Returns:
        None: 该函数不返回值，初始化结果存储在 context.user_data 中

    Raises:
        FileNotFoundError: 当 /opt/nuclio/function.yaml 配置文件不存在时
        yaml.YAMLError: 当 YAML 文件格式错误时
        KeyError: 当配置文件中缺少必要的 metadata.annotations.spec 字段时
        json.JSONDecodeError: 当 labels_spec 不是有效的 JSON 格式时
    """

    context.logger.info("Init context...  0%")

    # Read labels
    with open("/opt/nuclio/function.yaml", "rb") as function_file:
        functionconfig = yaml.safe_load(function_file)

    labels_spec = functionconfig["metadata"]["annotations"]["spec"]
    labels = {item["id"]: item["name"] for item in json.loads(labels_spec)}

    # Read the DL model
    model = ModelHandler(labels)
    context.user_data.model = model

    context.logger.info("Init context...100%")


def handler(context, event):
    """
    处理函数，用于执行 Yolo11 ONNX 模型推理。

    该函数接收包含图像数据的请求，解码图像并运行目标检测模型，
    返回检测结果。

    Args:
        context: Nuclio 上下文对象，提供日志记录、用户数据和响应构建功能。
                context.user_data.model 应包含已加载的 Yolo11 模型实例。
        event: Nuclio 事件对象，包含请求数据。event.body 应为字典，包含：
            - image (str): Base64 编码的图像数据
            - threshold (float, optional): 检测阈值，默认为 0.5

    Returns:
        context.Response: 包含检测结果的 JSON 响应对象，格式为：
            - body: JSON 格式的检测结果列表
            - headers: 空字典
            - content_type: "application/json"
            - status_code: 200
    """

    context.logger.info("Run Yolo11 ONNX model")
    data = event.body
    buf = io.BytesIO(base64.b64decode(data["image"]))
    threshold = float(data.get("threshold", 0.5))
    image = Image.open(buf).convert("RGB")

    results = context.user_data.model.infer(image, threshold)

    return context.Response(
        body=json.dumps(results), headers={}, content_type="application/json", status_code=200
    )
