// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { RefObject } from 'react';
import Input from 'antd/lib/input';
import Text from 'antd/lib/typography/Text';
import Tooltip from 'antd/lib/tooltip';
import Form, { FormInstance } from 'antd/lib/form';
import { QuestionCircleOutlined } from '@ant-design/icons';

export interface BaseConfiguration {
    name: string;
}

interface Props {
    onChange(values: BaseConfiguration): void;
    many: boolean;
    exampleMultiTaskName?: string;
}

type InputRef = React.ComponentRef<typeof Input>;

export default class BasicConfigurationForm extends React.PureComponent<Props> {
    private formRef: RefObject<FormInstance>;
    private inputRef: RefObject<InputRef>;
    private initialName: string;

    public constructor(props: Props) {
        super(props);
        this.formRef = React.createRef<FormInstance>();
        this.inputRef = React.createRef<InputRef>();

        const { many } = this.props;
        this.initialName = many ? '{{file_name}}' : '';
    }

    componentDidMount(): void {
        const { onChange } = this.props;
        onChange({
            name: this.initialName,
        });
    }

    private handleChangeName(e: React.ChangeEvent<HTMLInputElement>): void {
        const { onChange } = this.props;
        onChange({
            name: e.target.value,
        });
    }

    public submit(): Promise<void> {
        if (this.formRef.current) {
            return this.formRef.current.validateFields();
        }

        return Promise.reject(new Error('表单引用为空'));
    }

    public resetFields(): void {
        if (this.formRef.current) {
            this.formRef.current.resetFields();
        }
    }

    public focus(): void {
        if (this.inputRef.current) {
            this.inputRef.current.focus();
        }
    }

    public render(): JSX.Element {
        const { many, exampleMultiTaskName } = this.props;

        return (
            <Form ref={this.formRef} layout='vertical'>
                <Form.Item
                    className={many ? 'cvat-task-name-field-has-tooltip' : ''}
                    hasFeedback
                    name='name'
                    label={<span>名称</span>}
                    rules={[
                        {
                            required: true,
                            message: '任务名不能为空',
                        },
                    ]}
                    initialValue={this.initialName}
                >
                    <Input
                        ref={this.inputRef}
                        onChange={(e) => this.handleChangeName(e)}
                    />
                </Form.Item>
                {many ? (
                    <Text type='secondary'>
                        <Tooltip title={() => (
                            <>
                                可在模板中使用：
                                <ul>
                                    <li>
                                        任意文本 - 直接输入文字
                                    </li>
                                    <li>
                                        {'{{'}
                                        index
                                        {'}}'}
                                        &nbsp;- 文件序号
                                    </li>
                                    <li>
                                        {'{{'}
                                        file_name
                                        {'}}'}
                                        &nbsp;- 文件名称
                                    </li>
                                </ul>
                                示例:&nbsp;
                                <i>
                                    {exampleMultiTaskName || '任务名称 1 - video_1.mp4'}
                                </i>
                            </>
                        )}
                        >
                            生成名称时将使用模板。
                            {' '}
                            <QuestionCircleOutlined />
                        </Tooltip>
                    </Text>
                ) : null}
            </Form>
        );
    }
}
