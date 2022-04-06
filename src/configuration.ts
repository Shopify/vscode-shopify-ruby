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

// We use the extension version as part of the key, so that we prompt again in case any of the defaults have changed
const EXTENSION_VERSION =
  vscode.extensions.getExtension("shopify.ruby")!.packageJSON.version;
const CANCELLED_OVERRIDES_KEY = `shopify.ruby.${EXTENSION_VERSION}.cancelled_overrides`;
const APPROVED_ALL_OVERRIDES_KEY = `shopify.ruby.${EXTENSION_VERSION}.approved_all_overrides`;

export enum OverridesStatus {
  ApprovedAll = "approvedAll",
  ApproveEach = "approveEach",
  Cancel = "cancel",
}

export class Configuration {
  private configurationStore: ConfigurationStore;
  private context: vscode.ExtensionContext;
  private overrideStatus: OverridesStatus | undefined;

  constructor(
    configurationStore: ConfigurationStore,
    context: vscode.ExtensionContext
  ) {
    this.configurationStore = configurationStore;
    this.context = context;
    this.overrideStatus = context.globalState.get(APPROVED_ALL_OVERRIDES_KEY);
  }

  async applyDefaults(force = false) {
    if (this.overrideStatus === undefined || force) {
      this.overrideStatus = await this.promptOverrideStatus();
    }

    if (this.overrideStatus === OverridesStatus.Cancel) {
      return;
    }

    const canOverride = this.overrideStatus === OverridesStatus.ApprovedAll;

    DEFAULT_CONFIGS.forEach(async ({ scope, section, name, value }) => {
      const config = this.configurationStore.getConfiguration(section, scope);

      if (
        force ||
        canOverride ||
        (await this.checkMissingSetting(config, name, value))
      ) {
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
    if (this.context.globalState.get(`${CANCELLED_OVERRIDES_KEY}.${name}`)) {
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
      this.context.globalState.update(
        `${CANCELLED_OVERRIDES_KEY}.${name}`,
        true
      );
    }

    return response === "Override";
  }

  private valuesAreDifferent(config: any, value: any) {
    return config !== undefined && config !== value;
  }

  private async promptOverrideStatus(): Promise<OverridesStatus> {
    const response = await vscode.window.showInformationMessage(
      "Would you like to apply all of the suggested configuration defaults?",
      "Override All",
      "Decide for each",
      "Cancel"
    );

    if (response === "Override All") {
      this.context.globalState.update(
        APPROVED_ALL_OVERRIDES_KEY,
        OverridesStatus.ApprovedAll
      );
      return OverridesStatus.ApprovedAll;
    } else if (response === "Decide for each") {
      this.context.globalState.update(
        APPROVED_ALL_OVERRIDES_KEY,
        OverridesStatus.ApproveEach
      );
      return OverridesStatus.ApproveEach;
    } else {
      this.context.globalState.update(
        APPROVED_ALL_OVERRIDES_KEY,
        OverridesStatus.Cancel
      );
      return OverridesStatus.Cancel;
    }
  }
}
