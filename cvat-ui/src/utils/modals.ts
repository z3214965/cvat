// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import Modal from 'antd/lib/modal';

import { Organization, Project, Task } from 'cvat-core-wrapper';

export function confirmTransferModal(
    instances: Project[] | Task[],
    activeWorkspace: Organization | null,
    dstWorkspace: Organization | null,
    onOk: () => void,
): void {
    const first = instances[0];
    if (!first) {
        return;
    }

    const instanceType = first instanceof Task ? '任务' : '项目';
    const movingItems = instances.length > 1 ? `${instances.length} ${instanceType}s` : ` ${instanceType} #${first.id}`;
    let details = `您打算将 ${movingItems} 移至 ${dstWorkspace ? `组织 ${dstWorkspace.slug}` : '个人工作空间'}。 `;
    if (activeWorkspace) {
        details += `组织成员将失去访问权限 ${instances.length > 1 ? '这些资源' : '该资源'}.`;
    }

    Modal.confirm({
        title: '工作区之间数据传输',
        content: `${details} 是否要继续？`,
        className: 'cvat-modal-confirm-project-transfer-between-workspaces',
        onOk,
        okButtonProps: {
            type: 'primary',
            danger: true,
        },
        okText: '继续',
        cancelText: '取消',
    });
}
