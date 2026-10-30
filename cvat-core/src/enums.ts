// Copyright (C) 2019-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier = MIT

export enum ShareFileType {
    DIR = 'DIR',
    REG = 'REG',
}

export enum ChunkType {
    IMAGESET = 'imageset',
    VIDEO = 'video',
}

export enum TaskStatus {
    ANNOTATION = 'annotation',
    VALIDATION = 'validation',
    COMPLETED = 'completed',
}
export const TaskStatusCH: Record<TaskStatus, string> = {
    [TaskStatus.ANNOTATION]: '标注',
    [TaskStatus.VALIDATION]: '验证',
    [TaskStatus.COMPLETED]: '完成',
};

export type ProjectStatus = TaskStatus;

export enum subsetLabelCH {
    Train = '训练集',
    Test = '测试集',
    Validation = '验证集',
};

export enum JobStage {
    ANNOTATION = 'annotation',
    VALIDATION = 'validation',
    ACCEPTANCE = 'acceptance',
}
export const JobStageCH: Record<JobStage, string> = {
    [JobStage.ANNOTATION]: '标注',
    [JobStage.VALIDATION]: '验证',
    [JobStage.ACCEPTANCE]: '验收',
};

export enum JobState {
    NEW = 'new',
    IN_PROGRESS = 'in progress',
    COMPLETED = 'completed',
    REJECTED = 'rejected',
}
export const JobStateCH: Record<JobState, string> = {
    [JobState.NEW]: '待处理',
    [JobState.IN_PROGRESS]: '进行中',
    [JobState.REJECTED]: '已驳回',
    [JobState.COMPLETED]: '已完成',
};

export enum JobType {
    ANNOTATION = 'annotation',
    GROUND_TRUTH = 'ground_truth',
    REPLICA = 'replica',
}

export enum DimensionType {
    DIMENSION_1D = '1d',
    DIMENSION_2D = '2d',
    DIMENSION_3D = '3d',
}

export enum RQStatus {
    QUEUED = 'queued',
    STARTED = 'started',
    FINISHED = 'finished',
    CANCELED = 'canceled',
    FAILED = 'failed',
    UNKNOWN = 'unknown',
}

export enum TaskMode {
    ANNOTATION = 'annotation',
    INTERPOLATION = 'interpolation',
}

export enum MediaType {
    IMAGE = 'image',
    POINT_CLOUD = 'point_cloud',
    AUDIO = 'audio',
}

export enum AttributeType {
    CHECKBOX = 'checkbox',
    RADIO = 'radio',
    SELECT = 'select',
    NUMBER = 'number',
    TEXT = 'text',
}

export enum ObjectType {
    TAG = 'tag',
    SHAPE = 'shape',
    TRACK = 'track',
    INTERVAL = 'interval',
}

export enum ShapeType {
    RECTANGLE = 'rectangle',
    POLYGON = 'polygon',
    POLYLINE = 'polyline',
    POINTS = 'points',
    ELLIPSE = 'ellipse',
    CUBOID = 'cuboid',
    SKELETON = 'skeleton',
    MASK = 'mask',
}
export const ShapeTypeCH: Record<ShapeType, string> = {
    [ShapeType.RECTANGLE]: '矩形',
    [ShapeType.POLYGON]: '多边形',
    [ShapeType.POLYLINE]: '线',
    [ShapeType.POINTS]: '点',
    [ShapeType.ELLIPSE]: '长方体',
    [ShapeType.CUBOID]: '椭圆',
    [ShapeType.SKELETON]: '骨架',
    [ShapeType.MASK]: '掩码',
};

export enum Source {
    MANUAL = 'manual',
    SEMI_AUTO = 'semi-auto',
    AUTO = 'auto',
    FILE = 'file',
    GT = 'Ground truth',
    CONSENSUS = 'consensus',
}

export enum EventScope {
    loadTool = 'load:cvat',

    loadJob = 'load:job',
    loadWorkspace = 'load:workspace',
    saveJob = 'save:job',
    exception = 'send:exception',

    drawObject = 'draw:object',
    pasteObject = 'paste:object',
    copyObject = 'copy:object',
    propagateObject = 'propagate:object',
    dragObject = 'drag:object',
    resizeObject = 'resize:object',
    deleteObject = 'delete:object',
    mergeObjects = 'merge:objects',
    splitObjects = 'split:objects',
    groupObjects = 'group:objects',
    sliceObject = 'slice:object',
    joinObjects = 'join:objects',

    changeFrame = 'change:frame',
    zoomImage = 'zoom:image',
    fitImage = 'fit:image',
    rotateImage = 'rotate:image',

    undoAction = 'action:undo',
    redoAction = 'action:redo',

    debugInfo = 'debug:info',

    annotationsAction = 'run:annotations_action',
    clickElement = 'click:element',
    userActivity = 'user:activity',
}

export enum HistoryActions {
    CHANGED_OBJECTS = '修改对象',
    CHANGED_LABEL = '修改标签',
    CHANGED_ATTRIBUTES = '修改属性',
    CHANGED_POINTS = '修改点位',
    CHANGED_ROTATION = '对象已旋转',
    CHANGED_OUTSIDE = '修改超出帧标记',
    CHANGED_OCCLUDED = '修改遮挡标记',
    CHANGED_ZORDER = '修改Z轴层级',
    CHANGED_KEYFRAME = '修改关键帧',
    CHANGED_LOCK = '修改锁定状态',
    CHANGED_PINNED = '修改固定状态',
    CHANGED_COLOR = '修改颜色',
    CHANGED_HIDDEN = '修改隐藏状态',
    CHANGED_HIDDEN_AND_SELECTION = '修改隐藏与选中状态',
    CHANGED_SOURCE = '修改数据源',
    CHANGED_SKELETON = '修改骨架',
    CHANGED_AUDIO_POSITION = '修改音频位置',
    CHANGED_AUDIO_INTERVALS = '修改音频片段',
    CHANGED_SELECTION = '修改选中项',
    MERGED_OBJECTS = '合并对象',
    JOINED_OBJECTS = '连接对象',
    SLICED_OBJECT = '切分对象',
    SPLITTED_TRACK = '拆分追踪轨迹',
    SPLIT_INTERVAL = '拆分片段',
    GROUPED_OBJECTS = '编组对象',
    CREATED_OBJECTS = '创建对象',
    REMOVED_OBJECT = '删除对象',
    REMOVED_SELECTION = '取消选中',
    REMOVED_FRAME = '删除帧',
    RESTORED_FRAME = '恢复帧',
    COMMIT_ANNOTATIONS = '提交标注',
}

export enum ModelKind {
    DETECTOR = 'detector',
    INTERACTOR = 'interactor',
    TRACKER = 'tracker',
    REID = 'reid',
}

export enum ModelProviders {
    CVAT = 'cvat',
}

export const colors = [
    '#33ddff',
    '#fa3253',
    '#34d1b7',
    '#ff007c',
    '#ff6037',
    '#ddff33',
    '#24b353',
    '#b83df5',
    '#66ff66',
    '#32b7fa',
    '#ffcc33',
    '#83e070',
    '#fafa37',
    '#5986b3',
    '#8c78f0',
    '#ff6a4d',
    '#f078f0',
    '#2a7dd1',
    '#b25050',
    '#cc3366',
    '#cc9933',
    '#aaf0d1',
    '#ff00cc',
    '#3df53d',
    '#fa32b7',
    '#fa7dbb',
    '#ff355e',
    '#f59331',
    '#3d3df5',
    '#733380',
];

export enum CloudStorageProviderType {
    AWS_S3_BUCKET = 'AWS_S3_BUCKET',
    AZURE_CONTAINER = 'AZURE_CONTAINER',
    GOOGLE_CLOUD_STORAGE = 'GOOGLE_CLOUD_STORAGE',
}

export enum CloudStorageCredentialsType {
    KEY_SECRET_KEY_PAIR = 'KEY_SECRET_KEY_PAIR',
    ACCOUNT_NAME_TOKEN_PAIR = 'ACCOUNT_NAME_TOKEN_PAIR',
    ANONYMOUS_ACCESS = 'ANONYMOUS_ACCESS',
    CONNECTION_STRING = 'CONNECTION_STRING',
    KEY_FILE_PATH = 'KEY_FILE_PATH',
}

export enum CloudStorageStatus {
    AVAILABLE = 'AVAILABLE',
    NOT_FOUND = 'NOT_FOUND',
    FORBIDDEN = 'FORBIDDEN',
}

export enum MembershipRole {
    WORKER = 'worker',
    SUPERVISOR = 'supervisor',
    MAINTAINER = 'maintainer',
    OWNER = 'owner',
}

export enum SortingMethod {
    LEXICOGRAPHICAL = 'lexicographical',
    NATURAL = 'natural',
    PREDEFINED = 'predefined',
    RANDOM = 'random',
}

export enum StorageLocation {
    LOCAL = 'local',
    CLOUD_STORAGE = 'cloud_storage',
}

export enum DataStorageLocation {
    LOCAL = StorageLocation.LOCAL,
    CLOUD_STORAGE = StorageLocation.CLOUD_STORAGE,
    SHARE = 'share',
}

export enum WebhookSourceType {
    ORGANIZATION = 'organization',
    PROJECT = 'project',
}

export enum WebhookContentType {
    JSON = 'application/json',
}

export enum LabelType {
    ANY = 'any',
    RECTANGLE = 'rectangle',
    POLYGON = 'polygon',
    POLYLINE = 'polyline',
    POINTS = 'points',
    ELLIPSE = 'ellipse',
    CUBOID = 'cuboid',
    INTERVAL = 'interval',
    SKELETON = 'skeleton',
    MASK = 'mask',
    TAG = 'tag',
}
