// Copyright (C) 2021-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

const validationPatterns = {
    validatePasswordLength: {
        pattern: /^(?=.{8,256}$)/,
        message: '密码长度必须介于8到256个字符之间',
    },

    passwordContainsNumericCharacters: {
        pattern: /(?=.*[0-9])/,
        message: '密码必须至少包含1个数字字符',
    },

    passwordContainsUpperCaseCharacter: {
        pattern: /(?=.*[A-Z])/,
        message: '密码必须至少包含1个大写字母字符',
    },

    passwordContainsLowerCaseCharacter: {
        pattern: /(?=.*[a-z])/,
        message: '密码必须至少包含1个小写字母字符',
    },

    validateUsernameLength: {
        pattern: /(?=.{5,})/,
        message: '用户名必须至少包含5个字符',
    },

    validateUsernameCharacters: {
        pattern: /^[a-zA-Z0-9_\-.]{5,}$/,
        message: '仅可使用字符 (a-z), (A-Z), (0-9), -, _, . ',
    },

    /*
        \p{Pd} - dash connectors
        \p{Pc} - connector punctuations
        \p{Cf} - invisible formatting indicator
        \p{L} - any alphabetic character
        Useful links:
        https://stackoverflow.com/questions/4323386/multi-language-input-validation-with-utf-8-encoding
        https://stackoverflow.com/questions/280712/javascript-unicode-regexes
        https://stackoverflow.com/questions/6377407/how-to-validate-both-chinese-unicode-and-english-name
    */
    validateName: {
        // eslint-disable-next-line
        pattern: /^(\p{L}|\p{Pd}|\p{Cf}|\p{Pc}|['\s]){2,}$/gu,
        message: '无效名称',
    },

    validateAttributeName: {
        pattern: /\S+/,
        message: '无效名称',
    },

    validateLabelName: {
        pattern: /\S+/,
        message: '无效名称',
    },

    validateAttributeValue: {
        pattern: /\S+/,
        message: '无效属性值',
    },

    validateURL: {
        // eslint-disable-next-line
        pattern: /^(https?:\/\/)[^\s$.?#].[^\s]*$/, // url, ip
        message: '无效的URL',
    },

    validateOrganizationSlug: {
        pattern: /^[a-zA-Z\d]+$/,
        message: '只允许使用拉丁字母和数字',
    },

    validatePhoneNumber: {
        pattern: /^[+]*[-\s0-9]*$/g,
        message: '输入的电话号码不正确',
    },
};

export default validationPatterns;
