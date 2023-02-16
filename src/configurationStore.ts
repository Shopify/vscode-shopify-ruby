import * as vscode from "vscode";

export const EXTENSION_NAME = "ruby-extensions-pack";
const EXTENSION_VERSION = vscode.extensions.getExtension(
  `shopify.${EXTENSION_NAME}`
)!.packageJSON.version;
export const CANCELLED_OVERRIDES_KEY = `shopify.${EXTENSION_NAME}.${EXTENSION_VERSION}.cancelled_overrides`;
export const APPROVED_ALL_OVERRIDES_KEY = `shopify.${EXTENSION_NAME}.${EXTENSION_VERSION}.approved_all_overrides`;
export const SHADOWED_SETTINGS_KEY = `shopify.${EXTENSION_NAME}.${EXTENSION_VERSION}.shadowed_settings`;

export type ConfigurationInfo =
  | {
      globalValue?: any;
      workspaceValue?: any;
      workspaceFolderValue?: any;
      globalLanguageValue?: any;
      workspaceLanguageValue?: any;
      workspaceFolderLanguageValue?: any;
    }
  | undefined;

export interface ConfigurationEntry {
  update(
    section: string,
    value: any,
    configurationTarget?:
      | boolean
      | vscode.ConfigurationTarget
      | null
      | undefined,
    overrideInLanguage?: boolean | undefined
  ): Thenable<void>;

  inspect(section: string): ConfigurationInfo;
}

export interface ConfigurationStore {
  getConfiguration(
    section: string,
    scope: vscode.ConfigurationScope | null | undefined
  ): ConfigurationEntry;
}
