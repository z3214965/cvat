// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import Icon from '@ant-design/icons';
import Popover from 'antd/lib/popover';
import Button from 'antd/lib/button';
import Text from 'antd/lib/typography/Text';
import { Row, Col } from 'antd/lib/grid';

import { IntervalToolsIcon } from 'icons';
import { ActiveControl, CombinedState } from 'reducers';
import { Label } from 'cvat-core-wrapper';
import CVATTooltip from 'components/common/cvat-tooltip';
import LabelSelector from 'components/label-selector/label-selector';
import GlobalHotKeys from 'utils/mousetrap-react';
import { ShortcutScope } from 'utils/enums';
import { registerComponentShortcuts } from 'actions/shortcuts-actions';
import { subKeyMap } from 'utils/component-subkeymap';
import { useSelector } from 'react-redux';

export interface Props {
    activeControl: ActiveControl;
    createRegionShortkey: string;
    recordRegionShortkey: string;
    extendRegionShortkey: string;
    labels: Label[];
    activeLabelId: number | null;
    onUpdateActiveControl(activeControl: ActiveControl): void;
    onSetActiveLabel(labelId: number | null): void;
    onExtendRegion(labelId: number): void;
}

const componentShortcuts = {
    CREATE_AUDIO_REGION: {
        name: '创建音频区间',
        description: '开启音频区间创建模式 — 在波形图上拖动以创建区间',
        sequences: ['n'],
        scope: ShortcutScope.AUDIO_WORKSPACE_CONTROLS,
    },
    RECORD_AUDIO_REGION: {
        name: '录制音频区间',
        description: (
            '切换实时音频区间录制功能。' +
            '首次按下，在当前播放位置标记区间起点；' +
            '再次按下或暂停音频，即可确定区间终点。'
        ),
        sequences: ['shift+n'],
        scope: ShortcutScope.AUDIO_WORKSPACE_CONTROLS,
    },
    EXTEND_AUDIO_REGION_FROM_LAST: {
        name: '从上个区间延伸创建区间',
        description: (
            '新建音频区间：起始点为最近创建区间的末尾；如果尚无区间，则从音频开头开始，结束点为当前播放位置。'
        ),
        sequences: ['shift+e'],
        scope: ShortcutScope.AUDIO_WORKSPACE_CONTROLS,
    },
};

registerComponentShortcuts(componentShortcuts);

function IntervalRegionControl(props: Props): JSX.Element {
    const {
        activeControl,
        createRegionShortkey,
        recordRegionShortkey,
        extendRegionShortkey,
        labels,
        activeLabelId,
        onUpdateActiveControl,
        onSetActiveLabel,
        onExtendRegion,
    } = props;

    const { keyMap } = useSelector((state: CombinedState) => state.shortcuts);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const noLabels = labels.length === 0;
    const drawing = activeControl === ActiveControl.AUDIO_REGION_CREATE;
    const recording = activeControl === ActiveControl.AUDIO_REGION_RECORD;
    const isActive = drawing || recording;

    const createUpdateActiveControlHandler = (nextControl: ActiveControl): (() => void) => (): void => {
        if (noLabels || activeLabelId === null) return;

        onUpdateActiveControl(nextControl);
        setPopoverOpen(false);
    };

    const drawInterval = createUpdateActiveControlHandler(ActiveControl.AUDIO_REGION_CREATE);
    const recordInterval = createUpdateActiveControlHandler(ActiveControl.AUDIO_REGION_RECORD);
    const extendInterval = (): void => {
        if (noLabels || recording || activeLabelId === null) return;

        onExtendRegion(activeLabelId);
        setPopoverOpen(false);
    };

    const stopActiveIntervalControl = (): void => {
        if (isActive) {
            onUpdateActiveControl(ActiveControl.CURSOR);
            setPopoverOpen(false);
        }
    };

    const handlers: Record<keyof typeof componentShortcuts, (event?: KeyboardEvent) => void> = {
        CREATE_AUDIO_REGION: (event?: KeyboardEvent) => {
            if (event) event.preventDefault();
            if (drawing) {
                stopActiveIntervalControl();
            } else {
                drawInterval();
            }
        },
        RECORD_AUDIO_REGION: (event?: KeyboardEvent) => {
            if (event) event.preventDefault();
            if (recording) {
                stopActiveIntervalControl();
            } else {
                recordInterval();
            }
        },
        EXTEND_AUDIO_REGION_FROM_LAST: (event?: KeyboardEvent) => {
            if (event) event.preventDefault();
            extendInterval();
        },
    };

    const renderAction = (
        label: string,
        description: string,
        shortcut: string,
        onClick: () => void,
        disabled = false,
    ): JSX.Element => (
        <CVATTooltip title={`${description} ${shortcut}`} placement='bottom'>
            <Button
                block
                type='primary'
                disabled={disabled}
                onClick={onClick}
            >
                {label}
            </Button>
        </CVATTooltip>
    );

    const popoverContent = (
        <div className='cvat-audio-interval-region-popover-content'>
            <Row justify='start'>
                <Col>
                    <Text className='cvat-text-color' strong>音频区间</Text>
                </Col>
            </Row>
            <Row justify='start' className='cvat-audio-interval-popover-label-row'>
                <Col>
                    <Text className='cvat-text-color'>标签</Text>
                </Col>
            </Row>
            <Row justify='center'>
                <Col span={24}>
                    <LabelSelector
                        style={{ width: '100%' }}
                        labels={labels}
                        value={activeLabelId}
                        onChange={(label: Label) => {
                            if (label.id !== undefined) {
                                onSetActiveLabel(label.id);
                            }
                        }}
                    />
                </Col>
            </Row>
            <Row gutter={8} style={{ marginTop: 8 }}>
                <Col span={8}>
                    {renderAction(
                        'Draw',
                        '在波形图上绘制区间',
                        createRegionShortkey,
                        drawInterval,
                        activeLabelId === null,
                    )}
                </Col>
                <Col span={8}>
                    {renderAction(
                        'Record',
                        '从当前播放位置录制区间',
                        recordRegionShortkey,
                        recordInterval,
                        activeLabelId === null,
                    )}
                </Col>
                <Col span={8}>
                    {renderAction(
                        'Extend',
                        '从上一区间末尾到当前时间创建区间',
                        extendRegionShortkey,
                        extendInterval,
                        activeLabelId === null || recording,
                    )}
                </Col>
            </Row>
        </div>
    );

    return (
        <>
            <GlobalHotKeys
                keyMap={subKeyMap(componentShortcuts, keyMap)}
                handlers={handlers}
            />
            <Popover
                overlayClassName='cvat-audio-interval-region-popover'
                trigger='click'
                placement='right'
                open={popoverOpen && !noLabels}
                onOpenChange={(visible) => setPopoverOpen(visible && !noLabels)}
                content={popoverContent}
            >
                <CVATTooltip
                    title={
                        noLabels ?
                            '请为任务添加标签后才可创建区间' :
                            '音频区间工具'
                    }
                    placement='right'
                >
                    <Icon
                        component={IntervalToolsIcon}
                        className={
                            (isActive ?
                                'cvat-active-canvas-control cvat-audio-interval-region-control' :
                                'cvat-audio-interval-region-control') +
                            (noLabels ? ' cvat-audio-interval-region-control-disabled' : '')
                        }
                        onClick={() => {
                            if (noLabels) return;
                            if (isActive) {
                                stopActiveIntervalControl();
                            } else {
                                setPopoverOpen(!popoverOpen);
                            }
                        }}
                    />
                </CVATTooltip>
            </Popover>
        </>
    );
}

export default React.memo(IntervalRegionControl);
