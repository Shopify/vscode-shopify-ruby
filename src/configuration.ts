import * as vscode from "vscode";

export const DEFAULT_CONFIGS = [
  { section: "ruby", name: "useBundler", value: true },
  { section: "ruby", name: "useLanguageServer", value: false },
  { section: "ruby.lint", name: "rubocop", value: false },
  { section: "ruby", name: "codeCompletion", value: false },
  { section: "ruby", name: "intellisense", value: false },
  { section: "ruby", name: "format", value: false },
  {
    scope: { languageId: "ruby" },
    section: "editor",
    name: "defaultFormatter",
    value: "Shopify.rubocop-lsp",
  },
  {
    scope: { languageId: "ruby" },
    section: "editor",
    name: "formatOnSave",
    value: true,
  },
];

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

  inspect(section: string):
    | {
        globalValue?: any;
        workspaceValue?: any;
        workspaceFolderValue?: any;
        globalLanguageValue?: any;
        workspaceLanguageValue?: any;
        workspaceFolderLanguageValue?: any;
      }
    | undefined;
}

export interface ConfigurationStore {
  getConfiguration(
    section: string,
    scope: vscode.ConfigurationScope | null | undefined
  ): ConfigurationEntry;
}

export class Configuration {
  private configurationStore;

  constructor(configurationStore: ConfigurationStore) {
    this.configurationStore = configurationStore;
  }

  applyDefaults(force = false) {
    DEFAULT_CONFIGS.forEach(({ scope, section, name, value }) => {
      const config = this.configurationStore.getConfiguration(section, scope);

      if (force || this.missingSetting(config, name)) {
        config.update(name, value, true, true);
      }
    });
  }

  private missingSetting(config: ConfigurationEntry, name: string): boolean {
    const existingConfig = config.inspect(name);

    return (
      existingConfig !== undefined &&
      existingConfig.globalValue === undefined &&
      existingConfig.workspaceValue === undefined &&
      existingConfig.workspaceFolderValue === undefined &&
      existingConfig.globalLanguageValue === undefined &&
      existingConfig.workspaceLanguageValue === undefined &&
      existingConfig.workspaceFolderLanguageValue === undefined
    );
  }
}
