import tsParser from "@typescript-eslint/parser";
import shopifyPlugin from "@shopify/eslint-plugin";

const isVsCode = Boolean(process.env.VSCODE_CWD);

const developmentOverrides = isVsCode
  ? {
      "no-console": "warn",
      "@shopify/no-debugger": "warn",
    }
  : {};

const config = [
  ...shopifyPlugin.configs.core,
  ...shopifyPlugin.configs.typescript,
  ...shopifyPlugin.configs.prettier,
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: {
        project: "tsconfig.json",
      },
    },

    settings: {
      "import/resolver": {
        typescript: {
          project: "tsconfig.json",
        },
      },
    },

    rules: {
      "consistent-return": "off",
      "no-warning-comments": "off",
      "max-len": ["error", { code: 120 }],
      ...developmentOverrides,
    },
  },

];

export default config;
