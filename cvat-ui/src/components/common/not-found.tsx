// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Result from 'antd/lib/result';
import Button from 'antd/lib/button';
import { useHistory } from 'react-router-dom';

function useReturnButton(fallbackPath: string): () => void {
    const history = useHistory();
    const handleReturn = (): void => {
        if (history.length > 2) {
            history.goBack();
        } else {
            history.push(fallbackPath);
        }
    };
    return handleReturn;
}

export const JobNotFoundComponent = React.memo((): JSX.Element => {
    const handleReturn = useReturnButton('/jobs');
    return (
        <Result
            className='cvat-not-found'
            status='404'
            title='抱歉，未找到该作业'
            subTitle='请确保您尝试获取的信息确实存在，并且您有权访问'
            extra={<Button type='primary' onClick={handleReturn}>返回上一页</Button>}
        />
    );
});

export const TaskNotFoundComponent = React.memo((): JSX.Element => {
    const handleReturn = useReturnButton('/tasks');
    return (
        <Result
            className='cvat-not-found'
            status='404'
            title='在获取任务的过程中出现了问题'
            subTitle='请确保您尝试获取的信息确实存在，并且您有权访问'
            extra={<Button type='primary' onClick={handleReturn}>返回上一页</Button>}
        />
    );
});

export const ProjectNotFoundComponent = React.memo((): JSX.Element => {
    const handleReturn = useReturnButton('/projects');
    return (
        <Result
            className='cvat-not-found'
            status='404'
            title='在获取项目的过程中出现了问题'
            subTitle='请确保您尝试获取的信息确实存在，并且您有资格访问该信息'
            extra={<Button type='primary' onClick={handleReturn}>返回上一页</Button>}
        />
    );
});

export const CloudStorageNotFoundComponent = React.memo((): JSX.Element => {
    const handleReturn = useReturnButton('/cloudstorages');
    return (
        <Result
            className='cvat-not-found'
            status='404'
            title='抱歉，未找到所请求的云存储'
            subTitle='请确保您请求的ID存在，并且您拥有相应的权限'
            extra={<Button type='primary' onClick={handleReturn}>返回上一页</Button>}
        />
    );
});
