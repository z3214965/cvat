// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

export function getInstanceTypeText(instanceType: string): string {
    const replacements: Array<{ pattern: RegExp; replacement: string }> = [
        { pattern: /^project$/i, replacement: '项目' },
        { pattern: /^projects$/i, replacement: '项目' },
        { pattern: /(^|\s)project(\s|$)/gi, replacement: '$1项目$2' },
        { pattern: /(^|\s)projects(\s|$)/gi, replacement: '$1项目$2' },
        { pattern: /^task$/i, replacement: '任务' },
        { pattern: /^tasks$/i, replacement: '任务' },
        { pattern: /(^|\s)task(\s|$)/gi, replacement: '$1任务$2' },
        { pattern: /(^|\s)tasks(\s|$)/gi, replacement: '$1任务$2' },
        { pattern: /^job$/i, replacement: '作业' },
        { pattern: /^jobs$/i, replacement: '作业' },
        { pattern: /(^|\s)job(\s|$)/gi, replacement: '$1作业$2' },
        { pattern: /(^|\s)jobs(\s|$)/gi, replacement: '$1作业$2' },
    ];

    for (const { pattern, replacement } of replacements) {
        if (pattern.test(instanceType)) {
            return instanceType.replace(pattern, replacement);
        }
    }

    return '无效类型';
}

export function getResourceText(resource: string): string {
    if (resource === 'dataset') {
        return '数据集';
    }
    if (resource === 'annotations' || resource === 'annotation') {
        return '标注';
    }
    return '无效资源';
}
