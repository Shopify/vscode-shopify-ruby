import * as vscode from "vscode";

import {
  ConfigurationStore,
  APPROVED_ALL_OVERRIDES_KEY,
  SHADOWED_SETTINGS_KEY,
  EXTENSION_NAME,
} from "./configurationStore";
import { Setting, OverrideType } from "./setting";

export const DEFAULT_CONFIGS = [
  {
    scope: { languageId: "ruby" },
    section: "editor",
    name: "defaultFormatter",
    value: "Shopify.ruby-lsp",
  },
  {
    scope: { languageId: "ruby" },
    section: "editor",
    name: "formatOnSave",
    value: true,
  },
  {
    scope: { languageId: "ruby" },
    section: "editor",
    name: "formatOnType",
    value: true,
  },
  {
    scope: { languageId: "ruby" },
    section: "editor",
    name: "tabSize",
    value: 2,
  },
  {
    scope: { languageId: "ruby" },
    section: "editor",
    name: "insertSpaces",
    value: true,
  },
  { section: "files", name: "trimTrailingWhitespace", value: true },
  { section: "files", name: "insertFinalNewline", value: true },
  { section: "editor", name: "rulers", value: [120] },
  {
    scope: { languageId: "ruby" },
    section: "editor.semanticHighlighting",
    name: "enabled",
    value: true,
  },
];

export enum OverridesStatus {
  ApprovedAll = "approvedAll",
  ApproveEach = "approveEach",
  Cancel = "cancel",
}

export class Configuration {
  private context: vscode.ExtensionContext;
  private overrideStatus: OverridesStatus | undefined;
  private settings: Setting[];
  private allSettingsMatch: boolean;
  private configurationStore: ConfigurationStore;

  constructor(
    configurationStore: ConfigurationStore,
    context: vscode.ExtensionContext
  ) {
    this.settings = DEFAULT_CONFIGS.map(
      (config) =>
        new Setting(
          context,
          configurationStore,
          config.section,
          config.name,
          config.value,
          config.scope
        )
    );
    this.allSettingsMatch = this.settings.every((setting) => setting.match());
    this.context = context;
    this.overrideStatus = this.getApproveAll();
    this.configurationStore = configurationStore;
  }

  async applyDefaults(force = false) {
    if (this.allSettingsMatch) {
      return;
    }

    if (this.overrideStatus === undefined || force) {
      this.overrideStatus = await this.promptOverrideStatus();
    }

    if (this.overrideStatus === OverridesStatus.Cancel) {
      return;
    }

    const canOverride = this.overrideStatus === OverridesStatus.ApprovedAll;

    if (force || canOverride) {
      this.settings.forEach((setting) => setting.update());
      this.showShadowedWarning();
    } else {
      this.recursivelyPromptSetting(0);
    }
  }

  async offerTheme() {
    // Avoid offering to use the new theme more than once
    if (
      this.context.globalState.get(`shopify.${EXTENSION_NAME}.offeredTheme`)
    ) {
      return;
    }

    const setting = new Setting(
      this.context,
      this.configurationStore,
      "workbench",
      "colorTheme",
      "Spinel"
    );

    // If the user is already using the new theme, don't offer it
    if (setting.match()) {
      this.context.globalState.update(
        `shopify.${EXTENSION_NAME}.offeredTheme`,
        true
      );
      return;
    }

    const response = await vscode.window.showInformationMessage(
      "The new Spinel theme is tailored for Ruby code. Would you like to try it?",
      "Yes",
      "No"
    );

    if (response === "Yes") {
      setting.update();
    }

    this.context.globalState.update(
      `shopify.${EXTENSION_NAME}.offeredTheme`,
      true
    );
  }

  clearState() {
    // Clear setting config and cache
    this.settings.forEach((setting) => setting.clear());

    // Clear approval cache
    const existingKeys = this.context.globalState
      .keys()
      .filter((key) =>
        key.match(/shopify\.ruby-extensions-pack\..*\.approved_all_overrides/)
      );

    existingKeys.forEach((key) => {
      this.context.globalState.update(key, undefined);
    });
  }

  // Recursively step through each setting and prompt the user for their override decision
  private recursivelyPromptSetting(settingIndex: number) {
    // Exit when we're at the end of the list
    if (settingIndex >= this.settings.length) {
      return;
    }

    const setting = this.settings[settingIndex];

    // Only trigger the next prompt when the current promise is resolved (when the user has made a selection)
    setting
      .promptOverride()
      .then((overrideType) => {
        if (overrideType !== OverrideType.None) {
          setting.update(overrideType);
        }
        this.recursivelyPromptSetting(settingIndex + 1);
      })
      .catch(() => {});
  }

  private async promptOverrideStatus(): Promise<OverridesStatus> {
    const response = await vscode.window.showInformationMessage(
      "Would you like to apply all of the suggested configuration defaults?",
      "Apply All",
      "Decide for each",
      "Cancel"
    );

    if (response === "Apply All") {
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

  private getApproveAll(): OverridesStatus | undefined {
    const currentKey: OverridesStatus | undefined =
      this.context.globalState.get(APPROVED_ALL_OVERRIDES_KEY);

    // If there is an override status for the current plugin version, return it
    if (currentKey) {
      return currentKey;
    }

    // Otherwise, try to find a previous override status
    const existingKeys = this.context.globalState.keys();
    const previousApprovalKey = existingKeys.find((key) =>
      key.match(/shopify\.ruby-extensions-pack\..*\.approved_all_overrides/)
    );

    if (previousApprovalKey === undefined) {
      return undefined;
    }

    // If all overrides were previously approved and the current settings match, then carry over the override status
    if (
      this.context.globalState.get(previousApprovalKey) ===
        OverridesStatus.ApprovedAll &&
      this.allSettingsMatch
    ) {
      // Delete previous entries
      existingKeys.forEach((key) => {
        this.context.globalState.update(key, undefined);
      });

      this.context.globalState.update(
        APPROVED_ALL_OVERRIDES_KEY,
        OverridesStatus.ApprovedAll
      );
      return OverridesStatus.ApprovedAll;
    }

    // If overrides were previously approved, but values don't match, then prompt again
    return undefined;
  }

  private showShadowedWarning() {
    // If we already warned about settings being shadowed by workspace settings for this repo, don't show it again
    if (this.context.workspaceState.get(SHADOWED_SETTINGS_KEY)) {
      return;
    }

    const shadowedSettings = this.settings.filter(
      (setting) => setting.shadowedByWorkspaceSetting
    );

    if (shadowedSettings.length > 0) {
      const names = shadowedSettings
        .map((setting) => setting.fullName())
        .join(", ");
      this.context.workspaceState.update(SHADOWED_SETTINGS_KEY, true);

      vscode.window.showWarningMessage(
        `These settings won't take effect because they are overridden by .vscode/settings.json: ${names}`
      );
    }
  }
}
