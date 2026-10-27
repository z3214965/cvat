// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Icon from '@ant-design/icons';

import { CursorIcon } from 'icons';
import { ActiveControl, CombinedState, ContextMenuType } from 'reducers';
import { Canvas } from 'cvat-canvas-wrapper';
import { Canvas3d } from 'cvat-canvas3d-wrapper';
import { selectObjectsAsync } from 'actions/annotation-actions';
import CVATTooltip from 'components/common/cvat-tooltip';
import GlobalHotKeys from 'utils/mousetrap-react';
import { ThunkDispatch } from 'utils/redux';
import { ShortcutScope } from 'utils/enums';
import { registerComponentShortcuts } from 'actions/shortcuts-actions';
import { subKeyMap } from 'utils/component-subkeymap';

export interface Props {
    canvasInstance: Canvas | Canvas3d;
    cursorShortkey: string;
    activeControl: ActiveControl;
}

const componentShortcuts = {
    CANCEL: {
        name: '取消',
        description: '取消所有激活的画布模式',
        sequences: ['esc'],
        scope: ShortcutScope.STANDARD_WORKSPACE_CONTROLS,
    },
};

registerComponentShortcuts(componentShortcuts);

function CursorControl(props: Props): JSX.Element {
    const {
        canvasInstance, activeControl, cursorShortkey,
    } = props;

    const dispatch = useDispatch<ThunkDispatch>();
    const { keyMap } = useSelector((state: CombinedState) => state.shortcuts);
    const selectedStatesID = useSelector(
        (state: CombinedState) => state.annotation.annotations.selectedStatesID,
    );
    const selectionContextMenuVisible = useSelector((state: CombinedState) => (
        state.annotation.canvas.contextMenu.visible &&
        state.annotation.canvas.contextMenu.type === ContextMenuType.CANVAS_SELECTION
    ));

    const handler = async (): Promise<void> => {
        if (selectedStatesID.length || selectionContextMenuVisible) {
            await dispatch(selectObjectsAsync([]));
        }

        if (activeControl !== ActiveControl.CURSOR) {
            canvasInstance.cancel();
        }
    };

    const handlers: Record<keyof typeof componentShortcuts, (event?: KeyboardEvent) => void> = {
        CANCEL: async (event: KeyboardEvent | undefined) => {
            if (event) event.preventDefault();
            await handler();
        },
    };

    return (
        <>
            <GlobalHotKeys
                keyMap={subKeyMap(componentShortcuts, keyMap)}
                handlers={handlers}
            />
            <CVATTooltip title={`光标 ${cursorShortkey}`} placement='right'>
                <Icon
                    component={CursorIcon}
                    className={
                        activeControl === ActiveControl.CURSOR ?
                            'cvat-active-canvas-control cvat-cursor-control' :
                            'cvat-cursor-control'
                    }
                    onClick={handler}
                />
            </CVATTooltip>
        </>
    );
}

Object.assign(CursorControl, { displayName: 'CursorControl' });
export default React.memo(CursorControl);
