// Copyright (C) 2019-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { snakeCase } from 'lodash';
import { ArgumentError } from './exceptions';

export function isBoolean(value): boolean {
    return typeof value === 'boolean';
}

export function isInteger(value): boolean {
    return typeof value === 'number' && Number.isInteger(value);
}

export function isEmail(value): boolean {
    return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Called with specific Enum context
export function isEnum(value): boolean {
    for (const key in this) {
        if (Object.prototype.hasOwnProperty.call(this, key)) {
            if (this[key] === value) {
                return true;
            }
        }
    }

    return false;
}

export function isString(value): boolean {
    return typeof value === 'string';
}

export function checkFilter(filter, fields): void {
    for (const prop in filter) {
        if (Object.prototype.hasOwnProperty.call(filter, prop)) {
            if (!(prop in fields)) {
                throw new ArgumentError(`收到不支持的筛选属性："${prop}"`);
            } else if (!fields[prop](filter[prop])) {
                throw new ArgumentError(`收到的筛选属性 "${prop}" 不符合 API 要求`);
            }
        }
    }
}

export function checkExclusiveFields(obj, exclusive, ignore): void {
    const fields = {
        exclusive: [],
        other: [],
    };
    for (const field in obj) {
        if (!ignore.includes(field)) {
            if (exclusive.includes(field)) {
                if (fields.other.length || fields.exclusive.length) {
                    throw new ArgumentError(`请勿将筛选字段 "${field}" 与其他字段同时使用`);
                }
                fields.exclusive.push(field);
            } else {
                fields.other.push(field);
            }
        }
    }
}

export function checkObjectType(
    name: string,
    value: unknown,
    type: 'string' | 'number' | 'boolean' | 'integer' | null,
    constructor?: {
        cls: new (...args: any[]) => unknown,
        name: string,
    },
): boolean {
    if (type) {
        if (typeof value !== type) {
            // specific case for integers which aren't native type in JS
            if (type === 'integer' && Number.isInteger(value)) {
                return true;
            }

            throw new ArgumentError(`"${name}" 应为 "${type}" 类型，但实际接收到的是 "${typeof value}" 类型。`);
        }
    } else if (constructor) {
        if (!(value instanceof constructor.cls)) {
            if (value !== undefined) {
                throw new ArgumentError(`"${name}" 应为 ${constructor.name} 类的实例。`);
            }

            throw new ArgumentError(`"${name}" 应为 ${constructor.name} 类型，但实际接收到的是 "undefined"。`);
        }
    }

    return true;
}

export function checkInEnum<T>(name: string, value: T, values: T[]): boolean {
    const possibleValues = Object.values(values);
    if (!possibleValues.includes(value)) {
        throw new ArgumentError(`参数 ${name} 必须为下列值之一：[${possibleValues.join(', ')}]`);
    }

    return true;
}

export class FieldUpdateTrigger {
    #updatedFlags: Record<string, boolean> = {};

    get(key: string): boolean {
        return this.#updatedFlags[key] || false;
    }

    resetField(key: string): void {
        delete this.#updatedFlags[key];
    }

    reset(): void {
        this.#updatedFlags = {};
    }

    update(name: string): void {
        this.#updatedFlags[name] = true;
    }

    getUpdated(data: object, propMap: Record<string, string> = {}): Record<string, unknown> {
        const source = data as Record<string, unknown>;
        const result: Record<string, unknown> = {};
        for (const updatedField of Object.keys(this.#updatedFlags)) {
            result[propMap[updatedField] || updatedField] = source[updatedField];
        }
        return result;
    }
}

export function camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);
}

export function isResourceURL(url: string): boolean {
    return /\/([0-9]+)$/.test(url);
}

export function isPageSize(value: number | 'all'): boolean {
    return isInteger(value) || value === 'all';
}

export function fieldsToSnakeCase(params: Record<string, any>): Record<string, any> {
    const result = {};
    for (const [k, v] of Object.entries(params)) {
        result[snakeCase(k)] = v;
    }
    return result;
}

export function filterFieldsToSnakeCase(
    filter: Record<string, string | number>,
    keysToSnake: string[],
): Record<string, string | number> {
    let searchParams: Record<string, string | number> = {};
    for (const key of Object.keys(filter)) {
        if (!keysToSnake.includes(key)) {
            searchParams[key] = filter[key];
        }
    }
    searchParams = fieldsToSnakeCase(searchParams);

    const filtersGroup = [];
    for (const key of keysToSnake) {
        if (filter[key]) {
            filtersGroup.push({ '==': [{ var: camelToSnakeCase(key) }, filter[key]] });
        }
    }

    if (typeof searchParams.filter === 'string') {
        const parsed = JSON.parse(searchParams.filter);
        searchParams.filter = JSON.stringify({ and: [parsed, ...filtersGroup] });
    } else if (filtersGroup.length) {
        searchParams.filter = JSON.stringify({ and: [...filtersGroup] });
    }
    return searchParams;
}
