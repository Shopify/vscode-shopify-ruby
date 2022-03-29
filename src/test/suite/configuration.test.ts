import * as assert from "assert";

import * as vscode from "vscode";

import {
  ConfigurationEntry,
  ConfigurationStore,
  Configuration,
  DEFAULT_CONFIGS,
} from "../../configuration";

class FakeStore implements ConfigurationStore {
  private storage: { [key: string]: any } = {};

  constructor() {
    this.storage = {};
  }

  get(section: string, name: string) {
    return this.storage[`${section}.${name}`];
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
      inspect: (_name: string) => {
        return {};
      },
    };
  }
}

suite("Configuration suite", () => {
  test("automatic configuration sets defaults", () => {
    const store = new FakeStore();
    const config = new Configuration(store);
    config.applyDefaults();

    DEFAULT_CONFIGS.forEach(({ section, name, value }) => {
      assert.strictEqual(store.get(section, name), value);
    });
  });
});
