// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

export async function toClipboard(text: string): Promise<boolean> {
    const fallback = (): boolean => {
        // eslint-disable-next-line
        window.prompt('不允许使用浏览器剪贴板API，请手动复制', text);
        return false;
    };

    if (window.isSecureContext) {
        try {
            await window.navigator.clipboard.writeText(text);
            return true;
        } catch {
            fallback();
            return false;
        }
    } else {
        return fallback();
    }
}
