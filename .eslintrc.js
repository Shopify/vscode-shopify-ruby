/* eslint-env node */

// eslint-disable-next-line no-process-env
const isVsCode = Boolean(process.env.VSCODE_CWD);

const developmentOverrides = isVsCode
  ? {
      "no-console": "warn",
      "@shopify/no-debugger": "warn",
    }
  : {};

module.exports = {
  extends: [
    "plugin:@shopify/typescript",
    "plugin:@shopify/typescript-type-checking",
    "plugin:@shopify/prettier",
  ],
  parserOptions: {
    project: "tsconfig.json",
  },
  rules: {
    "consistent-return": "off",
    "no-warning-comments": "off",
    "max-len": ["error", { code: 120 }],
    ...developmentOverrides,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "tsconfig.json",
      },
    },
  },
};
