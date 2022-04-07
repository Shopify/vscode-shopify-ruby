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
  { section: "byesig", name: "fold", value: false },
  { section: "byesig", name: "enabled", value: true },
  { section: "byesig", name: "opacity", value: 0.5 },
  { section: "byesig", name: "showIcon", value: false },
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

const CANCELLED_OVERRIDES_KEY = "shopify.ruby.cancelled_overrides";

export class Configuration {
  private configurationStore;
  private context;

  constructor(
    configurationStore: ConfigurationStore,
    context: vscode.ExtensionContext
  ) {
    this.configurationStore = configurationStore;
    this.context = context;
  }

  applyDefaults(force = false) {
    DEFAULT_CONFIGS.forEach(async ({ scope, section, name, value }) => {
      const config = this.configurationStore.getConfiguration(section, scope);

      if (force || (await this.checkMissingSetting(config, name, value))) {
        config.update(name, value, true, true);
      }
    });
  }

  private async checkMissingSetting(
    config: ConfigurationEntry,
    name: string,
    value: any
  ): Promise<boolean> {
    // If the user cancelled the override, don't prompt again
    if (this.context.workspaceState.get(`${CANCELLED_OVERRIDES_KEY}.${name}`)) {
      return false;
    }

    const existingConfig = config.inspect(name);

    // If the value configured already matches the default, don't prompt
    if (
      existingConfig &&
      (existingConfig.globalValue === value ||
        existingConfig.globalLanguageValue === value)
    ) {
      return false;
    }

    // If the global value is set and is different, scope per language or not, prompt to override
    if (
      existingConfig &&
      (this.valuesAreDifferent(existingConfig.globalValue, value) ||
        this.valuesAreDifferent(existingConfig.globalLanguageValue, value))
    ) {
      return this.promptOverride(
        `The existing configuration for ${name} doesn't match our suggested default`,
        name
      );
    }

    // If the workspace value is set and is different, scope per language or not, prompt to override
    if (
      existingConfig &&
      (this.valuesAreDifferent(existingConfig.workspaceValue, value) ||
        this.valuesAreDifferent(existingConfig.workspaceFolderValue, value) ||
        this.valuesAreDifferent(existingConfig.workspaceLanguageValue, value) ||
        this.valuesAreDifferent(
          existingConfig.workspaceFolderLanguageValue,
          value
        ))
    ) {
      return this.promptOverride(
        `The existing workspace configuration for ${name} doesn't match our suggested default`,
        name
      );
    }

    return this.promptOverride(
      `No configuration found for ${name}. Would you like to apply the suggested default?`,
      name
    );
  }

  private async promptOverride(
    message: string,
    name: string
  ): Promise<boolean> {
    const response = await vscode.window.showInformationMessage(
      message,
      "Override",
      "Cancel"
    );

    if (response === "Cancel") {
      this.context.workspaceState.update(
        `${CANCELLED_OVERRIDES_KEY}.${name}`,
        true
      );
    }

    return response === "Override";
  }

  private valuesAreDifferent(config: any, value: any) {
    return config !== undefined && config !== value;
  }
}
