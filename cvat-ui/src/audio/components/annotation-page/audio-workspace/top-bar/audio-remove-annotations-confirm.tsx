// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useEffect, useState } from 'react';
import Modal from 'antd/lib/modal';
import Text from 'antd/lib/typography/Text';
import InputNumber from 'antd/lib/input-number';
import Collapse from 'antd/lib/collapse';

import type { RemoveAnnotationsConfirmProps } from 'components/annotation-page/top-bar/remove-annotations-confirm';

type TimeValue = {
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
};

function timeToMilliseconds(value: TimeValue): number | undefined {
    const hasValue = (
        typeof value.minutes === 'number' ||
        typeof value.seconds === 'number' ||
        typeof value.milliseconds === 'number'
    );
    if (!hasValue) return undefined;

    return (value.minutes ?? 0) * 60 * 1000 + (value.seconds ?? 0) * 1000 + (value.milliseconds ?? 0);
}

function AudioTimeInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: TimeValue;
    onChange(value: TimeValue): void;
}): JSX.Element {
    return (
        <div className='cvat-audio-remove-annotations-time-row'>
            <Text className='cvat-audio-remove-annotations-time-label'>{`${label}:`}</Text>
            <InputNumber
                min={0}
                placeholder='min'
                className='cvat-audio-remove-annotations-time-input'
                value={value.minutes}
                onChange={(minutes) => onChange({ ...value, minutes: minutes ?? undefined })}
            />
            <Text className='cvat-audio-remove-annotations-time-separator'>:</Text>
            <InputNumber
                min={0}
                max={59}
                placeholder='sec'
                className='cvat-audio-remove-annotations-time-input'
                value={value.seconds}
                onChange={(seconds) => onChange({ ...value, seconds: seconds ?? undefined })}
            />
            <Text className='cvat-audio-remove-annotations-time-separator'>:</Text>
            <InputNumber
                min={0}
                max={999}
                placeholder='ms'
                className='cvat-audio-remove-annotations-time-input'
                value={value.milliseconds}
                onChange={(milliseconds) => onChange({ ...value, milliseconds: milliseconds ?? undefined })}
            />
        </div>
    );
}

function AudioRemoveAnnotationsConfirm(props: RemoveAnnotationsConfirmProps): JSX.Element {
    const {
        open,
        stopFrame,
        onClose,
        onRemove,
    } = props;
    const [removeFrom, setRemoveFrom] = useState<TimeValue>({});
    const [removeUpTo, setRemoveUpTo] = useState<TimeValue>({});

    useEffect(() => {
        if (open) {
            setRemoveFrom({});
            setRemoveUpTo({});
        }
    }, [open]);

    return (
        <Modal
            destroyOnClose
            open={open}
            title='移除音频标注'
            className='cvat-modal-confirm-remove-annotation cvat-modal-confirm-remove-audio-annotation'
            okButtonProps={{
                type: 'primary',
                danger: true,
            }}
            okText='删除'
            onCancel={onClose}
            onOk={() => {
                const from = timeToMilliseconds(removeFrom);
                const to = timeToMilliseconds(removeUpTo);
                onRemove(
                    typeof from === 'number' ? Math.min(from, stopFrame) : undefined,
                    typeof to === 'number' ? Math.min(to, stopFrame) : undefined,
                    false,
                );
                onClose();
            }}
        >
            <div>
                <Text>即将从该任务中移除音频片段标注。</Text>
                <Text>若不设置时间范围，将移除全部音频片段标注。</Text>
                <Text>如需仅删除指定时间段内的片段，请在下方设置时间范围。</Text>
                <Text>修改仅在保存任务后生效。</Text>
                <br />
                <br />
                <br />
                <Collapse
                    bordered={false}
                    items={[{
                        key: 1,
                        label: <Text>选择时间范围</Text>,
                        children: (
                            <div className='cvat-audio-remove-annotations-time-range'>
                                <AudioTimeInput label='起始' value={removeFrom} onChange={setRemoveFrom} />
                                <AudioTimeInput label='结束' value={removeUpTo} onChange={setRemoveUpTo} />
                            </div>
                        ),
                    }]}
                />
            </div>
        </Modal>
    );
}

export default React.memo(AudioRemoveAnnotationsConfirm);
