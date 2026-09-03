// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import Text from 'antd/lib/typography/Text';
import Form from 'antd/lib/form';
import Switch from 'antd/lib/switch';
import { Col, Row } from 'antd/lib/grid';
import Button from 'antd/lib/button';
import Alert from 'antd/lib/alert';
import { ExclamationCircleFilled } from '@ant-design/icons/lib/icons';
import Modal from 'antd/lib/modal';
import {
    Label, Project, QualitySettings, QualitySettingsSaveFields, Task,
} from 'cvat-core-wrapper';
import CVATLoadingSpinner from 'components/common/loading-spinner';
import QualitySettingsForm from './shared/settings/quality-settings-form';
import {
    QUALITY_REQUIREMENTS_ENABLED_FIELD,
    requirementToSaveFields,
} from './shared/requirements/quality-requirements-utils';

export type UpdateSettingsData = Record<number, { settings: QualitySettings, fields: QualitySettingsSaveFields }>;

interface Props {
    instance: Task | Project;
    fetching: boolean;
    qualitySettings: {
        settings: QualitySettings | null;
        childrenSettings: QualitySettings[] | null;
    };
    labels: Label[];
    setQualitySettings: (updatedSettingsData: UpdateSettingsData) => void;
    refreshQualitySettings: () => Promise<void>;
}

function QualitySettingsTab(props: Readonly<Props>): JSX.Element | null {
    const {
        instance,
        fetching,
        qualitySettings: { settings, childrenSettings },
        labels,
        setQualitySettings,
        refreshQualitySettings,
    } = props;

    const [form] = Form.useForm();
    const [requirementFormVisible, setRequirementFormVisible] = useState(false);

    const onSave = useCallback(async () => {
        if (settings) {
            const values = await form.validateFields();
            const fields: QualitySettingsSaveFields = {
                maxValidationsPerJob: values.maxValidationsPerJob ?? settings.maxValidationsPerJob,
                jobFilter: values.jobFilter ?? '',
            };

            const enabledValues = form.getFieldValue(QUALITY_REQUIREMENTS_ENABLED_FIELD) as
                Record<string, boolean> | undefined;
            const hasEnabledChanges = !!enabledValues && settings.requirements.some((requirement) => (
                typeof enabledValues[requirement.id] === 'boolean' &&
                enabledValues[requirement.id] !== requirement.enabled
            ));

            if (hasEnabledChanges) {
                fields.requirements = settings.requirements.map((requirement) => ({
                    id: requirement.id,
                    ...requirementToSaveFields(requirement),
                    enabled: enabledValues?.[requirement.id] ?? requirement.enabled,
                })) as QualitySettingsSaveFields['requirements'];
            }

            setQualitySettings({ [settings.id]: { settings, fields } });
        }
    }, [form, settings, setQualitySettings]);

    const onInheritChange = useCallback((value: boolean) => {
        if (settings) {
            setQualitySettings({ [settings.id]: { settings, fields: { inherit: value } } });
        }
    }, [settings, setQualitySettings]);

    const nonInheritedChildSettings = childrenSettings ? childrenSettings.filter((child) => !child.inherit) : [];
    const onChildInheritChange = useCallback(() => {
        const updatedSettings = nonInheritedChildSettings.reduce<UpdateSettingsData>((acc, child) => {
            acc[child.id] = {
                settings: child,
                fields: { inherit: true },
            };
            return acc;
        }, {});
        setQualitySettings(updatedSettings);
    }, [nonInheritedChildSettings, setQualitySettings]);

    if (fetching) {
        return (
            <div className='cvat-quality-control-settings-tab'>
                <div className='cvat-quality-control-loading'>
                    <CVATLoadingSpinner />
                </div>
            </div>
        );
    }

    let header: JSX.Element | null = null;
    if (instance instanceof Task && instance.projectId !== null) {
        header = (
            <div className='cvat-quality-control-settings-header'>
                <Switch checked={settings?.inherit} onChange={onInheritChange} />
                <Text>使用</Text>
                <Link to={`/projects/${instance.projectId}/quality-control#settings`}>&nbsp;项目设置</Link>
            </div>
        );
    } else if (instance instanceof Project && nonInheritedChildSettings.length !== 0) {
        header = (
            <div className='cvat-quality-control-settings-header'>
                <Alert
                    type='warning'
                    message={(
                        <div>
                            <ExclamationCircleFilled className='ant-alert-icon' />
                            <Text>{`在${nonInheritedChildSettings.length}个任务中使用了自定义设置`}</Text>
                        </div>
                    )}
                    action={(
                        <Button
                            type='primary'
                            danger
                            onClick={() => {
                                Modal.confirm({
                                    title: '你确定要强制应用项目设置吗？',
                                    icon: <ExclamationCircleFilled />,
                                    content: '此操作将覆盖所有任务中的自定义设置。',
                                    okText: '是',
                                    cancelText: '否',
                                    onOk: onChildInheritChange,
                                });
                            }}
                        >
                            强制项目设置
                        </Button>
                    )}
                />
            </div>
        );
    }

    if (settings) {
        return (
            <div className='cvat-quality-control-settings-tab'>
                {!requirementFormVisible && (
                    <Row justify='end' className='cvat-quality-settings-save-btn'>
                        <Col>
                            <Button onClick={onSave} type='primary'>
                                保存
                            </Button>
                        </Col>
                    </Row>
                )}
                {!requirementFormVisible && header}
                <QualitySettingsForm
                    form={form}
                    settings={settings}
                    labels={labels}
                    onSave={onSave}
                    onReload={refreshQualitySettings}
                    onRequirementFormVisibilityChange={setRequirementFormVisible}
                    disabled={settings.inherit && instance instanceof Task && instance.projectId !== null}
                />
            </div>
        );
    }

    return null;
}

export default React.memo(QualitySettingsTab);
