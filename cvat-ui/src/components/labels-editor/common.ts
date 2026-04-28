// Copyright (C) 2021-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { SerializedLabel, SerializedAttribute, getCore, LabelType } from 'cvat-core-wrapper';

export interface SkeletonConfiguration {
    type: 'skeleton';
    svg: string;
    sublabels: SerializedLabel[];
}

export type LabelOptColor = SerializedLabel;

const core = getCore();
let id = 0;

function validateParsedAttribute(attr: SerializedAttribute): void {
    if (typeof attr !== 'object' || attr === null) {
        throw new Error('属性必须是JSON对象');
    }

    if (typeof attr.name !== 'string') {
        throw new Error('属性名必须是字符串');
    }

    if (attr.name.trim().length === 0) {
        throw new Error('属性名称不得为空');
    }

    if (typeof attr.id !== 'undefined' && !Number.isInteger(attr.id)) {
        throw new Error(`属性: "${attr.name}": id必须是整数或未定义`);
    }

    if (!['checkbox', 'number', 'text', 'radio', 'select'].includes((attr.input_type ?? '').toLowerCase())) {
        throw new Error(`属性: "${attr.name}": 未知的的输入类型: ${attr.input_type}`);
    }

    if (typeof attr.mutable !== 'boolean') {
        throw new Error(`属性: "${attr.name}": 可变属性必须是布尔值`);
    }

    if (!Array.isArray(attr.values) || !attr.values.length) {
        throw new Error(`属性: "${attr.name}": 属性值必须是非空数组`);
    }

    for (const value of attr.values) {
        if (typeof value !== 'string') {
            throw new Error(`属性: "${attr.name}": 每个属性值都必须是字符串`);
        }
    }

    const attrValues = attr.values.map((value: string) => value.trim());
    if (new Set(attrValues).size !== attrValues.length) {
        throw new Error(`属性: "${attr.name}": 属性值必须唯一`);
    }

    if (attr.default_value) {
        if (!core.utils.validateAttributeValue(attr.default_value, new core.classes.Attribute(attr))) {
            throw new Error(`属性: "${attr.name}": 无效的默认值 "${attr.default_value}"`);
        }
    }
}

export function validateParsedLabel(label: SerializedLabel): void {
    if (typeof label !== 'object' || label === null) {
        throw new Error('标签必须是JSON对象');
    }

    if (typeof label.name !== 'string') {
        throw new Error('标签名称必须是字符串');
    }

    if (label.name.trim().length === 0) {
        throw new Error('标签名称不得为空');
    }

    if (typeof label.id !== 'undefined' && !Number.isInteger(label.id)) {
        throw new Error(`标签 "${label.name}": id必须是整数或未定义`);
    }

    if (label.color && typeof label.color !== 'string') {
        throw new Error(`标签 "${label.name}": 颜色必须为字符串`);
    }

    if (label.color && !label.color.match(/^#[0-9a-fA-F]{6}$|^$/)) {
        throw new Error(`标签 "${label.name}": 颜色值无效`);
    }

    if (!Array.isArray(label.attributes)) {
        throw new Error(`标签 "${label.name}": 属性必须是一个数组`);
    }

    for (const attr of label.attributes) {
        validateParsedAttribute(attr);
    }

    const attrNames = label.attributes.map((attr: SerializedAttribute) => attr.name.trim());
    if (new Set(attrNames).size !== attrNames.length) {
        throw new Error(`标签 "${label.name}": 属性名称必须唯一`);
    }

    if (!Object.values(LabelType).includes(label.type)) {
        throw new Error(`标签 "${label.name}": 未知标签类型 "${label.type}"`);
    }

    if (label.type === LabelType.SKELETON) {
        if (!Array.isArray(label.sublabels) || label.sublabels.length === 0) {
            throw new Error(`标签 "${label.name}": 骨架必须提供非空的子标签数组`);
        }

        for (const sublabel of label.sublabels) {
            validateParsedLabel(sublabel);
        }

        const sublabelsNames = label.sublabels.map((sublabel: SerializedLabel) => sublabel.name.trim());
        if (new Set(sublabelsNames).size !== sublabelsNames.length) {
            throw new Error(`标签 "${label.name}": 子标签名称必须唯一`);
        }

        if (typeof label.svg !== 'string') {
            throw new Error(`标签 "${label.name}": 骨架必须提供一个正确的SVG模板`);
        }

        const sublabelIds = label.sublabels
            .map((sublabel: SerializedLabel) => sublabel.id)
            .filter((sublabelId: number | undefined) => sublabelId !== undefined);
        const matches = label.svg.matchAll(/data-label-id="([\d]+)"/g);
        for (const match of matches) {
            const refersToId = +match[1];
            if (!sublabelIds.includes(refersToId)) {
                throw new Error(
                    `标签 "${label.name}": SVG 骨架引用了 ID 为 ${refersToId} 的子标签, 这在子标签数组中并不存在`,
                );
            }
        }
    }
}

export function idGenerator(): number {
    return --id;
}

export function equalArrayHead(arr1: string[], arr2: string[]): boolean {
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}

export function toSVGCoord(svg: SVGSVGElement, coord: number[], raiseError = false): number[] {
    const result = [];
    const ctm = svg.getScreenCTM();

    if (!ctm) {
        if (raiseError) throw new Error('屏幕 CTM 为空');
        return coord;
    }

    const inversed = ctm.inverse();
    if (!inversed) {
        if (raiseError) throw new Error('逆屏幕 CTM 为空');
        return coord;
    }

    for (let i = 0; i < coord.length; i += 2) {
        let point = svg.createSVGPoint();
        point.x = coord[i];
        point.y = coord[i + 1];
        point = point.matrixTransform(inversed);
        result.push(point.x, point.y);
    }

    return result;
}

export function fromSVGCoord(svg: SVGSVGElement, coord: number[], raiseError = false): number[] {
    const result = [];
    const ctm = svg.getScreenCTM();
    if (!ctm) {
        if (raiseError) throw new Error('逆屏幕 CTM 为空');
        return coord;
    }

    for (let i = 0; i < coord.length; i += 2) {
        let point = svg.createSVGPoint();
        point.x = coord[i];
        point.y = coord[i + 1];
        point = point.matrixTransform(ctm);
        result.push(point.x, point.y);
    }

    return result;
}
