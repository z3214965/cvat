// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { Config } from '@react-awesome-query-builder/antd';
import asyncFetchUsers from 'components/resource-sorting-filtering/request-users';

export const config: Partial<Config> = {
    fields: {
        state: {
            label: '状态',
            type: 'select',
            operators: ['select_any_in', 'select_equals'], // ['select_equals', 'select_not_equals', 'select_any_in', 'select_not_any_in']
            valueSources: ['value'],
            fieldSettings: {
                listValues: [
                    { value: 'new', title: '新建' },
                    { value: 'in progress', title: '进行中' },
                    { value: 'rejected', title: '拒绝' },
                    { value: 'completed', title: '完成' },
                ],
            },
        },
        stage: {
            label: '阶段',
            type: 'select',
            operators: ['select_any_in', 'select_equals'],
            valueSources: ['value'],
            fieldSettings: {
                listValues: [
                    { value: 'annotation', title: '标注' },
                    { value: 'validation', title: '验证' },
                    { value: 'acceptance', title: '接受' },
                ],
            },
        },
        dimension: {
            label: '维度',
            type: 'select',
            operators: ['select_equals'],
            valueSources: ['value'],
            fieldSettings: {
                listValues: [
                    { value: '2d', title: '2D' },
                    { value: '3d', title: '3D' },
                ],
            },
        },
        assignee: {
            label: '负责人',
            type: 'select',
            valueSources: ['value'],
            operators: ['select_equals'],
            fieldSettings: {
                useAsyncSearch: true,
                forceAsyncSearch: true,
                asyncFetch: asyncFetchUsers,
            },
        },
        updatedDate: {
            label: '最后更新',
            type: 'datetime',
            operators: ['between', 'greater', 'greater_or_equal', 'less', 'less_or_equal'],
        },
        type: {
            label: '类型',
            type: 'select',
            operators: ['select_equals'],
            valueSources: ['value'],
            fieldSettings: {
                listValues: [
                    { value: 'annotation', title: '标注' },
                    { value: 'ground_truth', title: '基准真值' },
                    { value: 'consensus_replica', title: '共识副本' },
                ],
            },
        },
        id: {
            label: 'ID',
            type: 'number',
            operators: ['equal', 'between', 'greater', 'greater_or_equal', 'less', 'less_or_equal'],
            fieldSettings: { min: 0 },
            valueSources: ['value'],
        },
        parent_job_id: {
            label: '父ID',
            type: 'number',
            operators: [
                'is_empty',
                'is_not_empty',
                'equal',
                'between',
                'greater',
                'greater_or_equal',
                'less',
                'less_or_equal',
            ],
            fieldSettings: { min: 0 },
            valueSources: ['value'],
        },
    },
};

export const localStorageRecentCapacity = 10;
export const localStorageRecentKeyword = 'recentlyAppliedJobsFilters';
export const predefinedFilterValues = {
    'Assigned to me': '{"and":[{"==":[{"var":"assignee"},"<username>"]}]}',
    'Not completed': '{"!":{"or":[{"==":[{"var":"state"},"completed"]},{"==":[{"var":"stage"},"acceptance"]}]}}',
    'Not a replica': '{"and":[{"!":{"var":"parent_job_id"}}]}',
};
