import * as assert from "assert";

import * as vscode from "vscode";

import {
  Configuration,
  DEFAULT_CONFIGS,
  OverridesStatus,
} from "../../configuration";
import FakeStore from "../fakeStore";

class FakeGlobalState implements vscode.Memento {
  private storage: { [key: string]: any } = {};

  constructor() {
    this.storage = {};
  }

  update(key: string, value: any): Thenable<void> {
    if (value === undefined) {
      delete this.storage[key];
      return Promise.resolve();
    }

    return (this.storage[key] = value);
  }

  get(name: string) {
    return this.storage[name];
  }

  keys() {
    return Object.keys(this.storage);
  }

  setKeysForSync(_keys: ReadonlyArray<string>): void {
    // noop
  }
}

suite("Configuration suite", () => {
  test("automatic configuration sets defaults", () => {
    const extensionName = "ruby-extensions-pack";
    const extensionVersion = vscode.extensions.getExtension(
      `shopify.${extensionName}`
    )!.packageJSON.version;

    const globalState = new FakeGlobalState();
    globalState.update(
      `shopify.${extensionName}.${extensionVersion}.approved_all_overrides`,
      OverridesStatus.ApprovedAll
    );

    const context = {
      globalState,
    } as unknown as vscode.ExtensionContext;
    const store = new FakeStore();
    const config = new Configuration(store, context);
    config.applyDefaults();

    DEFAULT_CONFIGS.forEach(({ section, name, value }) => {
      assert.strictEqual(store.get(section, name), value);
    });
  });

  test("previous approvals are cleaned up if all settings match", () => {
    const extensionName = "ruby-extensions-pack";
    const extensionVersion = vscode.extensions.getExtension(
      `shopify.${extensionName}`
    )!.packageJSON.version;

    // Save an approval from a previous extension version
    const globalState = new FakeGlobalState();
    globalState.update(
      `shopify.${extensionName}.0.0.1.approved_all_overrides`,
      OverridesStatus.ApprovedAll
    );

    const context = { globalState } as unknown as vscode.ExtensionContext;
    const store = new FakeStore();

    // Update all settings to match the expected
    DEFAULT_CONFIGS.forEach(async ({ scope, section, name, value }) => {
      const entry = store.getConfiguration(section, scope);
      entry.update(name, value, true, true);
    });

    // Verify the previous approval is set
    assert.strictEqual(1, globalState.keys().length);
    assert.strictEqual(
      globalState.get(`shopify.${extensionName}.0.0.1.approved_all_overrides`),
      OverridesStatus.ApprovedAll
    );

    const config = new Configuration(store, context);
    config.applyDefaults();

    // Verify that the previous approval was cleaned up and passed to the current version
    assert.strictEqual(1, globalState.keys().length);
    assert.strictEqual(
      globalState.get(`shopify.${extensionName}.0.0.1.approved_all_overrides`),
      undefined
    );
    assert.strictEqual(
      globalState.get(
        `shopify.${extensionName}.${extensionVersion}.approved_all_overrides`
      ),
      OverridesStatus.ApprovedAll
    );
  });
});
