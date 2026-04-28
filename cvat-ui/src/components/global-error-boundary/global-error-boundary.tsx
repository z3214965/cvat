// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';
import React from 'react';
import { connect } from 'react-redux';
import Result from 'antd/lib/result';
import Text from 'antd/lib/typography/Text';
import Paragraph from 'antd/lib/typography/Paragraph';
import Collapse from 'antd/lib/collapse';
import TextArea from 'antd/lib/input/TextArea';

import { ThunkDispatch } from 'utils/redux';
import { resetAfterErrorAsync } from 'actions/boundaries-actions';
import { CombinedState } from 'reducers';
import { logError } from 'cvat-logger';
import config from 'config';

interface OwnProps {
    children: JSX.Element;
}

interface StateToProps {
    job: any | null;
    serverVersion: string;
    uiVersion: string;
}

interface DispatchToProps {
    restore(): void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const {
        annotation: {
            job: { instance: job },
        },
        about: { server, packageVersion },
    } = state;

    return {
        job,
        serverVersion: server.version as string,
        uiVersion: packageVersion.ui,
    };
}

function mapDispatchToProps(dispatch: ThunkDispatch): DispatchToProps {
    return {
        restore(): void {
            dispatch(resetAfterErrorAsync());
        },
    };
}

type Props = StateToProps & DispatchToProps & OwnProps;
class GlobalErrorBoundary extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        logError(error, true, {
            type: 'component',
            componentStack: errorInfo.componentStack,
        });
    }

    public render(): React.ReactNode {
        const {
            restore, job, serverVersion, uiVersion,
        } = this.props;

        const { hasError, error } = this.state;

        const restoreGlobalState = (): void => {
            this.setState({
                error: null,
                hasError: false,
            });

            restore();
        };

        if (hasError && error) {
            const message = `${error.name}\n${error.message}\n\n${error.stack}`;
            return (
                <div className='cvat-global-boundary'>
                    <Result
                        status='error'
                        title='哎呀，发生未知错误'
                        subTitle='更有可能的是，这个工具存在一些问题'
                    >
                        <div>
                            <Paragraph>
                                <Paragraph strong>发生了什么事？</Paragraph>
                                <Paragraph>程序错误刚刚发生</Paragraph>
                                <Collapse
                                    accordion
                                    defaultActiveKey={['errorMessage']}
                                    items={[{
                                        key: 'errorMessage',
                                        label: '异常详情',
                                        children: (
                                            <Text type='danger'>
                                                <TextArea
                                                    className='cvat-global-boundary-error-field'
                                                    autoSize
                                                    value={message}
                                                />
                                            </Text>
                                        ),
                                    }]}
                                />
                            </Paragraph>

                            <Paragraph>
                                <Text strong>我该怎么办？</Text>
                            </Paragraph>
                            <ul>
                                <li>
                                    通知管理员或直接提交问题在
                                    <a href={config.GITHUB_URL}> GitHub. </a>
                                    同时请提供以下信息：
                                    <ul>
                                        <li>上方完整的错误信息</li>
                                        <li>复现问题的操作步骤</li>
                                        <li>您的操作系统及浏览器版本</li>
                                        <li>CVAT 版本</li>
                                        <ul>
                                            <li>
                                                <Text strong>服务端: </Text>
                                                {serverVersion}
                                            </li>
                                            <li>
                                                <Text strong>前端: </Text>
                                                {uiVersion}
                                            </li>
                                        </ul>
                                    </ul>
                                </li>
                                {job ? (
                                    <li>
                                        按
                                        {/* eslint-disable-next-line */}
                                        <a onClick={restoreGlobalState}> 这 </a>
                                        如果你希望 CVAT 尝试恢复标注进度 或
                                        {/* eslint-disable-next-line */}
                                        <a onClick={() => window.location.reload()}> 刷新 </a>
                                        页面
                                    </li>
                                ) : (
                                    <li>
                                        {/* eslint-disable-next-line */}
                                        <a onClick={() => window.location.reload()}>刷新 </a>
                                        页面
                                    </li>
                                )}
                            </ul>
                        </div>
                    </Result>
                </div>
            );
        }

        const { children } = this.props;
        return children;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GlobalErrorBoundary);
