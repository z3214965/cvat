// Copyright (C) 2019-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

const NO_BREAK_SPACE = '\u00a0';
const UNDEFINED_ATTRIBUTE_VALUE = '__undefined__';
const CHANGELOG_URL = 'https://github.com/cvat-ai/cvat/blob/develop/CHANGELOG.md';
const LICENSE_URL = 'https://github.com/cvat-ai/cvat/blob/develop/LICENSE';
const DISCORD_URL = 'https://discord.gg/fNR3eXfk6C';
const GITHUB_URL = 'https://github.com/cvat-ai/cvat';
const GITHUB_IMAGE_URL = 'https://github.com/cvat-ai/cvat/raw/develop/site/content/en/images/cvat.jpg';
const GUIDE_URL = 'https://docs.cvat.ai/docs';
const QUALITY_TARGET_METRICS_GUIDE_URL =
    `${GUIDE_URL}/qa-analytics/auto-qa/#quality-target-metrics`;
const UPGRADE_GUIDE_URL = 'https://docs.cvat.ai/docs/administration/advanced/upgrade_guide';
const SHARE_MOUNT_GUIDE_URL =
    'https://docs.cvat.ai/docs/administration/basics/installation/#share-path';
const NUCLIO_GUIDE =
    'https://docs.cvat.ai//docs/administration/advanced/installation_automatic_annotation/';
const FILTERS_GUIDE_URL = 'https://docs.cvat.ai/docs/manual/advanced/filter/';
const DATASET_MANIFEST_GUIDE_URL = 'https://docs.cvat.ai/docs/manual/advanced/dataset_manifest/';
const CANVAS_BACKGROUND_COLORS = ['#ffffff', '#f1f1f1', '#e5e5e5', '#d8d8d8', '#CCCCCC', '#B3B3B3', '#999999'];
const NEW_LABEL_COLOR = '#b3b3b3';
const LATEST_COMMENTS_SHOWN_QUICK_ISSUE = 3;
const QUICK_ISSUE_INCORRECT_POSITION_TEXT = '位置错误';
const QUICK_ISSUE_INCORRECT_ATTRIBUTE_TEXT = '属性错误';
const DEFAULT_PROJECT_SUBSETS = ['Train', 'Test', 'Validation'];
const CANVAS_WORKSPACE_ROWS = 12;
const CANVAS_WORKSPACE_COLS = 12;
const CANVAS_WORKSPACE_MARGIN = 8;
const CANVAS_WORKSPACE_DEFAULT_CONTEXT_HEIGHT = 4;
const CANVAS_WORKSPACE_PADDING = CANVAS_WORKSPACE_MARGIN / 2;
const OUTSIDE_PIC_URL = 'https://docs.cvat.ai/images/image019.jpg';
const DEFAULT_AWS_REGIONS: string[][] = [
    ['us-east-1', '美国东部（弗吉尼亚北部）'],
    ['us-east-2', '美国东部（俄亥俄）'],
    ['us-west-1', '美国西部（加利福尼亚北部）'],
    ['us-west-2', '美国西部（俄勒冈）'],
    ['ap-south-1', '亚太（孟买）'],
    ['ap-northeast-1', '亚太（东京）'],
    ['ap-northeast-2', '亚太（首尔）'],
    ['ap-northeast-3', '亚太（大阪）'],
    ['ap-southeast-1', '亚太（新加坡）'],
    ['ap-southeast-2', '亚太（悉尼）'],
    ['ca-central-1', '加拿大（中部）'],
    ['eu-central-1', '欧洲（法兰克福）'],
    ['eu-west-1', '欧洲（爱尔兰）'],
    ['eu-west-2', '欧洲（伦敦）'],
    ['eu-west-3', '欧洲（巴黎）'],
    ['eu-north-1', '欧洲（斯德哥尔摩）'],
    ['sa-east-1', '南美（圣保罗）'],
];

const DEFAULT_GOOGLE_CLOUD_STORAGE_LOCATIONS: string[][] = [
    ['NORTHAMERICA-NORTHEAST1', '蒙特利尔'],
    ['NORTHAMERICA-NORTHEAST2', '多伦多'],
    ['US-CENTRAL1', '艾奥瓦'],
    ['US-EAST1', '南卡罗来纳'],
    ['US-EAST4', '弗吉尼亚北部'],
    ['US-WEST1', '俄勒冈'],
    ['US-WEST2', '洛杉矶'],
    ['US-WEST3', '盐湖城'],
    ['US-WEST4', '拉斯维加斯'],
    ['SOUTHAMERICA-EAST1', '圣保罗'],
    ['EUROPE-CENTRAL2', '华沙'],
    ['EUROPE-NORTH1', '芬兰'],
    ['EUROPE-WEST1', '比利时'],
    ['EUROPE-WEST2', '伦敦'],
    ['EUROPE-WEST3', '法兰克福'],
    ['EUROPE-WEST4', '荷兰'],
    ['EUROPE-WEST6', '苏黎世'],
    ['ASIA-EAST1', '中国台湾'],
    ['ASIA-EAST2', '中国香港'],
    ['ASIA-NORTHEAST1', '东京'],
    ['ASIA-NORTHEAST2', '大阪'],
    ['ASIA-NORTHEAST3', '首尔'],
    ['ASIA-SOUTH1', '孟买'],
    ['ASIA-SOUTH2', '德里'],
    ['ASIA-SOUTHEAST1', '新加坡'],
    ['ASIA-SOUTHEAST2', '雅加达'],
    ['AUSTRALIA-SOUTHEAST1', '悉尼'],
    ['AUSTRALIA-SOUTHEAST2', '墨尔本'],
    // 多区域
    ['ASIA', '亚洲的数据中心'],
    ['EU', '欧盟成员国境内的数据中心'],
    ['US', '美国的数据中心'],
    // 双区域
    ['ASIA1', '亚太东北1区 和 亚太东北2区'],
    ['EUR4', '欧洲北部1区 和 欧洲西部4区'],
    ['NAM4', '美国中部1区 和 美国东部1区'],
];


const MAXIMUM_NOTIFICATION_MESSAGE_LENGTH = 600; // all above will be sent to console
const HEALTH_CHECK_RETRIES = 10;
const HEALTH_CHECK_PERIOD = 3000; // ms
const HEALTH_CHECK_REQUEST_TIMEOUT = 15000; // ms

const CONTROLS_LOGS_INTERVAL = 90000; // 1.5 min in ms
const ACTIVITY_EVENTS_INTERVAL_MS = 60000;

const RESET_NOTIFICATIONS_PATHS = {
    from: [
        '/auth/login',
        '/auth/register',
        '/auth/logout',
    ],
    exclude: [
        '/auth',
    ],
};
const BUCKET_CONTENT_KEY = 'All files';

const NUMERIC_VALUE_CLAMP_THRESHOLD = 5000;
const MAX_REPLICAS_TO_ADD = 100; // per job and action, UI only. The server limit is MAX_JOBS_PER_TASK
const OPENCV_PATH = '/assets/opencv_4.8.0.js';

const LOCAL_STORAGE_SEEN_GUIDES_MEMORY_LIMIT = 10;
const LOCAL_STORAGE_LAST_FRAME_MEMORY_LIMIT = 20;

const REQUEST_SUCCESS_NOTIFICATION_DURATION = 5; // seconds

const BLACKLISTED_GO_BACK_PATHS = [
    /\/auth.+/,
];

const PAID_PLACEHOLDER_CONFIG = {
    url: 'https://www.cvat.ai/pricing/cloud',
    features: {
        qualityControl:
        '质量控制功能可通过创建真值作业，轻松完成标注质量评估。系统会自动将该任务下所有作业与这份基准数据进行比对，计算标注精准度，以此保障标注成果质量达标。',
        analyticsReport:
        '分析报告功能可全面展示资源相关数据洞察，涵盖目标统计、工作时长、标注效率等核心指标。' +
        '支持按时间段、子资源、操作人员筛选数据，清晰呈现工作效能变化趋势。' +
        '同时，该功能会展示资源内的历史作业数据，并搭配可视化图表直观呈现各项信息。' +
        '适合需要深度数据分析、优化资源管理的用户使用。',
    },
};

// ====================== 中文配置开始 ======================
const SUPPORT_LANGUAGES: string[] = (
    process.env.REACT_APP_SUPPORTED_LANGUAGES || 'en'
).split(',');

const DEFAULT_LANGUAGE: string =
  process.env.REACT_APP_DEFAULT_LANGUAGE || 'en';

const LANGUAGE_RESOURCES = {
    en: require('./locales/en.json'),
    'zh-CN': require('./locales/zh-CN.json'),
};
// ====================== 中文配置结束 ======================

export default {
    UNDEFINED_ATTRIBUTE_VALUE,
    NO_BREAK_SPACE,
    CHANGELOG_URL,
    LICENSE_URL,
    DISCORD_URL,
    GITHUB_URL,
    GITHUB_IMAGE_URL,
    GUIDE_URL,
    QUALITY_TARGET_METRICS_GUIDE_URL,
    UPGRADE_GUIDE_URL,
    SHARE_MOUNT_GUIDE_URL,
    CANVAS_BACKGROUND_COLORS,
    NEW_LABEL_COLOR,
    NUCLIO_GUIDE,
    FILTERS_GUIDE_URL,
    LATEST_COMMENTS_SHOWN_QUICK_ISSUE,
    QUICK_ISSUE_INCORRECT_POSITION_TEXT,
    QUICK_ISSUE_INCORRECT_ATTRIBUTE_TEXT,
    DEFAULT_PROJECT_SUBSETS,
    DEFAULT_AWS_REGIONS,
    DEFAULT_GOOGLE_CLOUD_STORAGE_LOCATIONS,
    OUTSIDE_PIC_URL,
    DATASET_MANIFEST_GUIDE_URL,
    HEALTH_CHECK_RETRIES,
    HEALTH_CHECK_PERIOD,
    HEALTH_CHECK_REQUEST_TIMEOUT,
    CANVAS_WORKSPACE_ROWS,
    CANVAS_WORKSPACE_COLS,
    CANVAS_WORKSPACE_MARGIN,
    CANVAS_WORKSPACE_PADDING,
    CANVAS_WORKSPACE_DEFAULT_CONTEXT_HEIGHT,
    CONTROLS_LOGS_INTERVAL,
    ACTIVITY_EVENTS_INTERVAL_MS,
    RESET_NOTIFICATIONS_PATHS,
    BUCKET_CONTENT_KEY,
    NUMERIC_VALUE_CLAMP_THRESHOLD,
    MAX_REPLICAS_TO_ADD,
    OPENCV_PATH,
    LOCAL_STORAGE_SEEN_GUIDES_MEMORY_LIMIT,
    LOCAL_STORAGE_LAST_FRAME_MEMORY_LIMIT,
    REQUEST_SUCCESS_NOTIFICATION_DURATION,
    BLACKLISTED_GO_BACK_PATHS,
    PAID_PLACEHOLDER_CONFIG,
    MAXIMUM_NOTIFICATION_MESSAGE_LENGTH,
    SUPPORT_LANGUAGES,
    DEFAULT_LANGUAGE,
    LANGUAGE_RESOURCES,
};
