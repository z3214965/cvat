// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { shallowEqual } from 'utils/redux';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Modal from 'antd/lib/modal';
import Space from 'antd/lib/space';
import Button from 'antd/lib/button';
import Alert from 'antd/lib/alert';

import { CombinedState } from 'reducers';
import { Storage, Task } from 'cvat-core-wrapper';
import { cloudStoragesActions } from 'actions/cloud-storage-actions';
import CVATTooltip from 'components/common/cvat-tooltip';

function SelectCSUpdatingSchemeModal(): JSX.Element | null {
    const {
        instances,
        onUpdate,
    } = useSelector((state: CombinedState) => ({
        instances: state.cloudStorages.updateWorkspace.instances,
        onUpdate: state.cloudStorages.updateWorkspace.onUpdate!,
    }), shallowEqual);

    const [instanceType, setInstanceType] = useState('');
    const dispatch = useDispatch();

    const closeModal = () => {
        dispatch(cloudStoragesActions.closeLinkedCloudStorageUpdatingModal());
    };

    useEffect(() => {
        if (instances?.length) {
            setInstanceType(instances[0] instanceof Task ? 'task' : 'project');
        }
    }, [instances]);

    if (!instances) {
        return null;
    }

    const capitalizedInstanceType = instanceType.charAt(0).toUpperCase() + instanceType.slice(1);
    const alert = '数据关联存储仅会在迁移过程中重置，后续需手动更新';
    const message = instances.length > 1 ?
        '部分资源已链接至云存储' :
        `${capitalizedInstanceType} #${instances[0].id} 已链接到云存储`;

    return (
        <Modal
            title={(
                <Space>
                    {message}
                    <CVATTooltip
                        title={(
                            <>
                                <div>
                                    <strong>移动并解除关联</strong>
                                    : 转移数据并与云存储解除绑定。
                                </div>
                                <div>
                                    <strong>移动并自动匹配</strong>
                                    : 转移数据，并尝试在目标工作空间内自动关联配置相似的云存储。
                                    相似云存储的判定规则：除密钥凭证与归属用户外，其余云存储配置完全一致。
                                </div>
                            </>
                        )}
                    >
                        <QuestionCircleOutlined className='cvat-choose-cloud-storage-change-scheme-help-button' />
                    </CVATTooltip>
                </Space>
            )}
            className='cvat-modal-choose-cloud-storage-change-scheme'
            closable={false}
            open
            footer={[
                <Button key='cancel' onClick={() => closeModal()}>
                    取消
                </Button>,
                <Button
                    key='move_and_detach'
                    type='primary'
                    onClick={() => {
                        instances.forEach((instance) => {
                            if (instance.sourceStorage.isCloudLinked()) {
                                instance.sourceStorage = Storage.buildLocalStorage();
                            }

                            if (instance.targetStorage.isCloudLinked()) {
                                instance.targetStorage = Storage.buildLocalStorage();
                            }
                        });

                        closeModal();
                        onUpdate();
                    }}
                >
                    移动并解除关联
                </Button>,
                // do not show option "move and auto match" when only data storage is linked
                (
                    instances.some((instance) => (
                        instance.sourceStorage.isCloudLinked() || instance.targetStorage.isCloudLinked()
                    ))
                ) && (
                    <Button
                        key='move_and_auto_match'
                        type='primary'
                        onClick={() => {
                            closeModal();
                            onUpdate();
                        }}
                    >
                        移动并自动匹配
                    </Button>
                ),
            ]}
        >
            {
                (
                    instances.some((instance) => (
                        instance instanceof Task && instance.cloudStorageId &&
                        (instance.sourceStorage.isCloudLinked() || instance.targetStorage.isCloudLinked())
                    ))
                ) && (
                    <Alert
                        message={alert}
                        type='warning'
                    />
                )
            }

            <p>
                请选择您希望的转账方式。
            </p>
        </Modal>
    );
}

export default React.memo(SelectCSUpdatingSchemeModal);
