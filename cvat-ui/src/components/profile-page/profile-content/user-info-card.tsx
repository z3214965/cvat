// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { isEqual } from 'lodash';
import { CombinedState } from 'reducers';

import Form from 'antd/lib/form';
import Card from 'antd/lib/card';
import { Col, Row } from 'antd/lib/grid';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';

import { updateUserAsync } from 'actions/auth-actions';
import validationRules from 'utils/validation-rules';

interface ProfileFormValues {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    primaryRole?: string;
    customRole?: string;
}

const roleOptions = [
    { value: 'ml_engineer', label: '机器学习工程师' },
    { value: 'data_scientist', label: '数据科学家' },
    { value: 'annotation_specialist', label: '标注专员' },
    { value: 'project_manager', label: '项目经理' },
    { value: 'founder_executive', label: '创始人或高管' },
    { value: 'researcher', label: '研究员' },
    { value: 'student', label: '学生' },
    { value: 'educator', label: '教育工作者' },
    { value: 'other', label: '其他' },
];
const predefinedRoles = new Set(roleOptions.map(({ value }) => value).filter((value) => value !== 'other'));

function UserInfoCard(): JSX.Element {
    const user = useSelector((state: CombinedState) => state.auth.user);
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    let initialPrimaryRole: string | undefined;
    if (user?.primaryRole) {
        initialPrimaryRole = predefinedRoles.has(user.primaryRole) ? user.primaryRole : 'other';
    }
    const [primaryRole, setPrimaryRole] = useState<string | undefined>(initialPrimaryRole);

    const initialValues: ProfileFormValues = {
        username: user?.username,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        primaryRole: initialPrimaryRole,
        customRole: initialPrimaryRole === 'other' ? user?.primaryRole || undefined : undefined,
    };

    useEffect(() => {
        form.setFieldsValue(initialValues);
        setPrimaryRole(initialPrimaryRole);
    }, [user, form]);

    const onFinish = async (values: ProfileFormValues): Promise<void> => {
        const currentEditableValues = {
            username: values.username,
            firstName: values.firstName,
            lastName: values.lastName,
            primaryRole: values.primaryRole === 'other' ? values.customRole?.trim() : values.primaryRole,
        };
        const initialEditableValues = {
            username: initialValues.username,
            firstName: initialValues.firstName,
            lastName: initialValues.lastName,
            primaryRole: user?.primaryRole || undefined,
        };
        if (user && !isEqual(currentEditableValues, initialEditableValues)) {
            const updatedFields: Parameters<typeof user.save>[0] = {};
            if (values.username !== initialValues.username) {
                updatedFields.username = values.username;
            }
            if (values.firstName !== initialValues.firstName) {
                updatedFields.firstName = values.firstName;
            }
            if (values.lastName !== initialValues.lastName) {
                updatedFields.lastName = values.lastName;
            }
            if (currentEditableValues.primaryRole !== initialEditableValues.primaryRole) {
                updatedFields.primaryRole = currentEditableValues.primaryRole;
            }

            await dispatch(updateUserAsync(user, updatedFields));
        }
    };

    return (
        <Card title='个人信息' className='cvat-profile-info-card'>
            <Form
                form={form}
                layout='vertical'
                onFinish={onFinish}
                initialValues={initialValues}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label='名字'
                            name='firstName'
                            rules={validationRules.firstName}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='姓氏'
                            name='lastName'
                            rules={validationRules.lastName}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    label='主要角色'
                    name='primaryRole'
                >
                    <Select options={roleOptions} onChange={setPrimaryRole} />
                </Form.Item>
                {primaryRole === 'other' && (
                    <Form.Item
                        label='请说明你的角色'
                        name='customRole'
                        rules={[
                            { required: true, whitespace: true, message: '请输入你的角色' },
                            { max: 255, message: '角色名称不能超过255个字符' },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                )}
                <Form.Item
                    label='邮箱'
                    name='email'
                    rules={validationRules.email}
                >
                    <Input disabled />
                </Form.Item>
                <Form.Item
                    label='用户名'
                    name='username'
                    rules={validationRules.userName}
                >
                    <Input />
                </Form.Item>

                <Form.Item>
                    <Row justify='end'>
                        <Button
                            type='primary'
                            htmlType='submit'
                        >
                            保存更改
                        </Button>
                    </Row>
                </Form.Item>
            </Form>
        </Card>
    );
}

export default React.memo(UserInfoCard);
