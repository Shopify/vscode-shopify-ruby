import * as vscode from "vscode";

import { ConfigurationEntry, ConfigurationStore } from "../configurationStore";

export default class FakeStore implements ConfigurationStore {
  private storage: { [key: string]: any } = {};
  private workspaceStorage: { [key: string]: any } = {};

  constructor() {
    this.storage = {};
    this.workspaceStorage = {};
  }

  get(section: string, name: string) {
    return this.storage[`${section}.${name}`];
  }

  addToWorkspace(section: string, name: string, value: any) {
    this.workspaceStorage[`${section}.${name}`] = value;
  }

  getConfiguration(
    section: string,
    _scope: vscode.ConfigurationScope | null | undefined
  ): ConfigurationEntry {
    return {
      update: (
        name: string,
        value: any,
        _configurationTarget:
          | boolean
          | vscode.ConfigurationTarget
          | null
          | undefined,
        _overrideInLanguage: boolean | undefined
      ) => {
        return (this.storage[`${section}.${name}`] = value);
      },
      inspect: (name: string) => {
        return {
          globalValue: this.storage[`${section}.${name}`],
          workspaceValue: this.workspaceStorage[`${section}.${name}`],
        };
      },
    };
  }
}
