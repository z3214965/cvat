// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { Row, Col } from 'antd/lib/grid';
import Button from 'antd/lib/button';
import InputNumber from 'antd/lib/input-number';
import Radio, { RadioChangeEvent } from 'antd/lib/radio';
import Switch from 'antd/lib/switch';
import Text from 'antd/lib/typography/Text';
import { RectDrawingMethod, CuboidDrawingMethod } from 'cvat-canvas-wrapper';

import { ShapeType, Label, DimensionType } from 'cvat-core-wrapper';
import { clamp } from 'utils/math';
import LabelSelector from 'components/label-selector/label-selector';
import CVATTooltip from 'components/common/cvat-tooltip';

interface Props {
    shapeType: ShapeType;
    labels: any[];
    minimumPoints: number;
    rectDrawingMethod?: RectDrawingMethod;
    cuboidDrawingMethod?: CuboidDrawingMethod;
    numberOfPoints?: number;
    selectedLabelID: number | null;
    repeatShapeShortcut: string;
    simplifyPoly?: boolean;
    onChangeLabel(value: Label | null): void;
    onChangePoints(value: number | undefined): void;
    onChangeRectDrawingMethod(event: RadioChangeEvent): void;
    onChangeCuboidDrawingMethod(event: RadioChangeEvent): void;
    onChangeSimplifyPoly?(value: boolean): void;
    onDrawTrack(): void;
    onDrawShape(): void;
    jobInstance: any;
}

function DrawShapePopoverComponent(props: Props): JSX.Element {
    const {
        labels,
        shapeType,
        minimumPoints,
        selectedLabelID,
        numberOfPoints,
        rectDrawingMethod,
        cuboidDrawingMethod,
        repeatShapeShortcut,
        simplifyPoly,
        onDrawTrack,
        onDrawShape,
        onChangeLabel,
        onChangePoints,
        onChangeRectDrawingMethod,
        onChangeCuboidDrawingMethod,
        onChangeSimplifyPoly,
        jobInstance,
    } = props;

    const is2D = jobInstance.dimension === DimensionType.DIMENSION_2D;
    const simplifyDisabled = typeof numberOfPoints !== 'undefined';
    const simplifyTooltip = simplifyDisabled ?
        '已设置固定顶点数量时，简化功能不可用' :
        '绘制图形后，自动启动多边形 / 折线简化';

    return (
        <div className='cvat-draw-shape-popover-content'>
            <Row justify='start'>
                <Col>
                    <Text className='cvat-text-color' strong>{`绘制新的 ${shapeType} 图形`}</Text>
                </Col>
            </Row>
            <Row justify='start'>
                <Col>
                    <Text className='cvat-text-color'>标签</Text>
                </Col>
            </Row>
            <Row justify='center'>
                <Col span={24}>
                    <LabelSelector
                        style={{ width: '100%' }}
                        labels={labels}
                        value={selectedLabelID}
                        onChange={onChangeLabel}
                    />
                </Col>
            </Row>
            {is2D && shapeType === ShapeType.RECTANGLE && (
                <>
                    <Row>
                        <Col>
                            <Text className='cvat-text-color'> 绘制方式 </Text>
                        </Col>
                    </Row>
                    <Row justify='space-around'>
                        <Col>
                            <Radio.Group
                                style={{ display: 'flex' }}
                                value={rectDrawingMethod}
                                onChange={onChangeRectDrawingMethod}
                            >
                                <Radio value={RectDrawingMethod.CLASSIC} style={{ width: 'auto' }}>
                                    两点绘制
                                </Radio>
                                <Radio value={RectDrawingMethod.EXTREME_POINTS} style={{ width: 'auto' }}>
                                    四点绘制
                                </Radio>
                            </Radio.Group>
                        </Col>
                    </Row>
                </>
            )}
            {is2D && shapeType === ShapeType.CUBOID && (
                <>
                    <Row>
                        <Col>
                            <Text className='cvat-text-color'> 绘制方式 </Text>
                        </Col>
                    </Row>
                    <Row justify='space-around'>
                        <Col>
                            <Radio.Group
                                style={{ display: 'flex' }}
                                value={cuboidDrawingMethod}
                                onChange={onChangeCuboidDrawingMethod}
                            >
                                <Radio value={CuboidDrawingMethod.CLASSIC} style={{ width: 'auto' }}>
                                    矩形生成
                                </Radio>
                                <Radio value={CuboidDrawingMethod.CORNER_POINTS} style={{ width: 'auto' }}>
                                    四点绘制
                                </Radio>
                            </Radio.Group>
                        </Col>
                    </Row>
                </>
            )}
            {is2D && [ShapeType.POLYGON, ShapeType.POLYLINE, ShapeType.POINTS].includes(shapeType) ? (
                <>
                    <Row justify='space-around' align='middle'>
                        <Col span={14}>
                            <Text className='cvat-text-color'> 顶点数量: </Text>
                        </Col>
                        <Col span={10}>
                            <InputNumber
                                onChange={(value: number | undefined | string | null) => {
                                    if (typeof value === 'undefined' || value === null) {
                                        onChangePoints(undefined);
                                    } else {
                                        const clampedValue = Math.floor(
                                            clamp(+value, minimumPoints, Number.MAX_SAFE_INTEGER),
                                        );
                                        onChangePoints(clampedValue);
                                    }
                                }}
                                className='cvat-draw-shape-popover-points-selector'
                                min={minimumPoints}
                                value={numberOfPoints}
                                step={1}
                            />
                        </Col>
                    </Row>
                    {[ShapeType.POLYGON, ShapeType.POLYLINE].includes(shapeType) && (
                        <CVATTooltip title={simplifyTooltip}>
                            <Row justify='space-around' align='middle'>
                                <Col span={14}>
                                    <Text className='cvat-text-color'>简化</Text>
                                </Col>
                                <Col span={10}>
                                    <Switch
                                        checked={simplifyPoly}
                                        disabled={simplifyDisabled}
                                        onChange={onChangeSimplifyPoly}
                                        className='cvat-draw-shape-popover-simplify-checkbox'
                                    />
                                </Col>
                            </Row>
                        </CVATTooltip>
                    )}
                </>
            ) : null}
            <Row justify='space-around'>
                <Col span={24}>
                    <CVATTooltip title={`按 ${repeatShapeShortcut} 快捷键重复绘制`}>
                        <Button className={`cvat-draw-${shapeType}-shape-button`} onClick={onDrawShape}>形状</Button>
                    </CVATTooltip>
                    {shapeType !== ShapeType.MASK && (
                        <CVATTooltip title={`按 ${repeatShapeShortcut} 快捷键重复绘制`}>
                            <Button
                                className={`cvat-draw-${shapeType}-track-button`}
                                onClick={onDrawTrack}
                            >
                                追踪
                            </Button>
                        </CVATTooltip>
                    )}
                </Col>
            </Row>
        </div>
    );
}

export default React.memo(DrawShapePopoverComponent);
