import * as vscode from "vscode";

import {
  ConfigurationEntry,
  ConfigurationStore,
  ConfigurationInfo,
  CANCELLED_OVERRIDES_KEY,
} from "./configurationStore";

export enum OverrideType {
  Global = "Override",
  Workspace = "Override workspace",
  Both = "Override both",
  None = "Cancel",
}

export class Setting {
  public name: string;
  public shadowedByWorkspaceSetting: boolean;
  private section: string;
  private value: any;
  private scope?: { languageId: string };
  private configurationStore: ConfigurationStore;
  private configurationEntry: ConfigurationEntry;
  private existingConfig: ConfigurationInfo;
  private context: vscode.ExtensionContext;

  constructor(
    context: vscode.ExtensionContext,
    configurationStore: ConfigurationStore,
    section: string,
    name: string,
    value: any,
    scope?: { languageId: string }
  ) {
    this.context = context;
    this.configurationStore = configurationStore;
    this.section = section;
    this.name = name;
    this.value = value;
    this.scope = scope;

    this.configurationEntry = this.configurationStore.getConfiguration(
      this.section,
      this.scope
    );
    this.existingConfig = this.configurationEntry.inspect(this.name);
    this.shadowedByWorkspaceSetting = this.shadowed();
  }

  match(): boolean {
    return (
      JSON.stringify(this.existingConfig?.globalValue) ===
        JSON.stringify(this.value) ||
      JSON.stringify(this.existingConfig?.globalLanguageValue) ===
        JSON.stringify(this.value)
    );
  }

  needsOverride(): boolean {
    return this.existingConfig === undefined || !this.match();
  }

  update(type: OverrideType = OverrideType.Global): void {
    if (type === OverrideType.Both) {
      this.configurationEntry.update(this.name, this.value, true, true);
      this.configurationEntry.update(this.name, this.value, false, true);
    } else {
      this.configurationEntry.update(
        this.name,
        this.value,
        type === OverrideType.Global,
        true
      );
    }
  }

  fullName(): string {
    return `${this.section}.${this.name}`;
  }

  printableValue(): string {
    return JSON.stringify(this.value);
  }

  clear() {
    this.configurationEntry.update(this.name, undefined, true, true);
    this.context.globalState.update(
      `${CANCELLED_OVERRIDES_KEY}.${this.name}`,
      undefined
    );
  }

  async promptOverride(): Promise<OverrideType> {
    // If the user cancelled the override or if the setting does not need, don't prompt
    if (
      this.context.globalState.get(`${CANCELLED_OVERRIDES_KEY}.${this.name}`) ||
      !this.needsOverride()
    ) {
      return OverrideType.None;
    }

    let message = `The setting ${this.fullName()} doesn't match our recommendation (${this.printableValue()})`;
    let options: OverrideType[] = [OverrideType.Global, OverrideType.None];

    if (this.shadowedByWorkspaceSetting) {
      message = message.concat(" and is shadowed by a workspace setting");
      options = [
        OverrideType.Global,
        OverrideType.Workspace,
        OverrideType.Both,
        OverrideType.None,
      ];
    }

    const response = await vscode.window.showInformationMessage(
      message,
      ...options
    );

    if (response === "Cancel") {
      this.context.globalState.update(
        `${CANCELLED_OVERRIDES_KEY}.${this.name}`,
        true
      );
    }

    return response ?? OverrideType.None;
  }

  private valuesAreDifferent(config: any, value: any) {
    return (
      config !== undefined && JSON.stringify(config) !== JSON.stringify(value)
    );
  }

  private shadowed(): boolean {
    return Boolean(
      this.existingConfig &&
        (this.valuesAreDifferent(
          this.existingConfig.workspaceValue,
          this.value
        ) ||
          this.valuesAreDifferent(
            this.existingConfig.workspaceFolderValue,
            this.value
          ) ||
          this.valuesAreDifferent(
            this.existingConfig.workspaceLanguageValue,
            this.value
          ) ||
          this.valuesAreDifferent(
            this.existingConfig.workspaceFolderLanguageValue,
            this.value
          ))
    );
  }
}
