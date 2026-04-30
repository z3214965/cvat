// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Select from 'antd/lib/select';
import { JobStage, JobState } from 'cvat-core-wrapper';
import { handleDropdownKeyDown } from 'utils/dropdown-utils';

interface JobStateSelectorProps {
    value: JobState | null;
    onSelect: (newValue: JobState) => void;
}

export function JobStateSelector({ value, onSelect }: Readonly<JobStateSelectorProps>): JSX.Element {
    return (
        <Select
            className='cvat-job-item-state'
            popupClassName='cvat-job-item-state-dropdown'
            value={value}
            onChange={onSelect}
            onKeyDown={handleDropdownKeyDown}
            placeholder='选择一个状态'
        >
            <Select.Option value={JobState.NEW}>待处理</Select.Option>
            <Select.Option value={JobState.IN_PROGRESS}>进行中</Select.Option>
            <Select.Option value={JobState.REJECTED}>已驳回</Select.Option>
            <Select.Option value={JobState.COMPLETED}>已完成</Select.Option>
        </Select>
    );
}

interface JobStageSelectorProps {
    value: JobStage | null;
    onSelect: (newValue: JobStage) => void;
}

export function JobStageSelector({ value, onSelect }: Readonly<JobStageSelectorProps>): JSX.Element {
    return (
        <Select
            className='cvat-job-item-stage'
            popupClassName='cvat-job-item-stage-dropdown'
            value={value}
            onChange={onSelect}
            onKeyDown={handleDropdownKeyDown}
            placeholder='选择一个阶段'
        >
            <Select.Option value={JobStage.ANNOTATION}>
                标注
            </Select.Option>
            <Select.Option value={JobStage.VALIDATION}>
                校验
            </Select.Option>
            <Select.Option value={JobStage.ACCEPTANCE}>
                验收
            </Select.Option>
        </Select>
    );
}
