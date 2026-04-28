// Copyright (C) 2024 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { RuleObject } from 'antd/lib/form';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ValidateErrorEntity } from 'rc-field-form/lib/interface';

export const isInteger =
    ({ min, max, filter }: { min?: number; max?: number; filter?: (intValue: number) => boolean }) =>
    (_: RuleObject, value?: number | string): Promise<void> => {
        if (typeof value === 'undefined' || value === '') {
            return Promise.resolve();
        }

        const intValue = +value;
        if (Number.isNaN(intValue) || !Number.isInteger(intValue)) {
            return Promise.reject(new Error('值必须为正整数'));
        }

        if (typeof min !== 'undefined' && intValue < min) {
            return Promise.reject(new Error(`值必须大于${min}`));
        }

        if (typeof max !== 'undefined' && intValue > max) {
            return Promise.reject(new Error(`值必须小于 ${max}`));
        }

        if (filter && !filter(intValue)) {
            return Promise.reject(new Error(`值不能等于${intValue}`));
        }

        return Promise.resolve();
    };

export function formFieldsError(error: any): string[] {
    return (error as ValidateErrorEntity).errorFields
        ? (error as ValidateErrorEntity).errorFields.map((field) => `${field.name} : ${field.errors.join(';')}`)
        : [error.toString()];
}
