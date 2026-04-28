// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { getCore, Task } from 'cvat-core-wrapper';

const core = getCore();

export async function fetchTask(id: number): Promise<Task> {
    let taskInstance = null;
    try {
        [taskInstance] = await core.tasks.get({ id });
    } catch (error: unknown) {
        throw new Error('在服务器上未找到该任务');
    }
    return taskInstance;
}
