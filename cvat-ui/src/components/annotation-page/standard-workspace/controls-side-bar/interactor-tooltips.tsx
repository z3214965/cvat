// Copyright (C) 2021-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Image from 'antd/lib/image';
import Paragraph from 'antd/lib/typography/Paragraph';
import Text from 'antd/lib/typography/Text';

interface Props {
    name?: string;
    gif?: string;
    message?: string;
    withNegativePoints?: boolean;
}

function InteractorTooltips(props: Props): JSX.Element {
    const {
        name, gif, message, withNegativePoints,
    } = props;
    const UNKNOWN_MESSAGE = '所选交互工具暂无帮助说明';
    const desc = message || UNKNOWN_MESSAGE;
    return (
        <div className='cvat-interactor-tip-container'>
            {name ? (
                <>
                    <Paragraph>{desc}</Paragraph>
                    <Paragraph>
                        <Text>您可以防止服务器请求被占用</Text>
                        <Text strong>{' Ctrl '}</Text>
                        <Text>key</Text>
                    </Paragraph>
                    <Paragraph>
                        <Text>在图片上左键单击，可添加正提示点。</Text>
                        {withNegativePoints ? (
                            <Text>在图片上右键单击，可添加负提示点。</Text>
                        ) : null}
                    </Paragraph>
                    {gif ? <Image className='cvat-interactor-tip-image' alt='Example gif' src={gif} /> : null}
                </>
            ) : (
                <Text>选择交互工具以查看帮助提示</Text>
            )}
        </div>
    );
}

export default React.memo(InteractorTooltips);
