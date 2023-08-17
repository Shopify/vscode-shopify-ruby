import * as assert from "assert";

import * as vscode from "vscode";

import {
  Configuration,
  DEFAULT_CONFIGS,
  OverridesStatus,
} from "../../configuration";
import FakeStore from "../fakeStore";
import FakeGlobalState from "../fakeGlobalState";

suite("Configuration suite", () => {
  test("automatic configuration sets defaults", () => {
    const extensionName = "ruby-extensions-pack";
    const extensionVersion = vscode.extensions.getExtension(
      `shopify.${extensionName}`,
    )!.packageJSON.version;

    const globalState = new FakeGlobalState();
    globalState.update(
      `shopify.${extensionName}.${extensionVersion}.approved_all_overrides`,
      OverridesStatus.ApprovedAll,
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
      `shopify.${extensionName}`,
    )!.packageJSON.version;

    // Save an approval from a previous extension version
    const globalState = new FakeGlobalState();
    globalState.update(
      `shopify.${extensionName}.0.0.1.approved_all_overrides`,
      OverridesStatus.ApprovedAll,
    );

    const context = { globalState } as unknown as vscode.ExtensionContext;
    const store = new FakeStore();

    // Update all settings to match the expected
    DEFAULT_CONFIGS.forEach(({ scope, section, name, value }) => {
      const entry = store.getConfiguration(section, scope);
      entry.update(name, value, true, true);
    });

    // Verify the previous approval is set
    assert.strictEqual(1, globalState.keys().length);
    assert.strictEqual(
      globalState.get(`shopify.${extensionName}.0.0.1.approved_all_overrides`),
      OverridesStatus.ApprovedAll,
    );

    const config = new Configuration(store, context);
    config.applyDefaults();

    // Verify that the previous approval was cleaned up and passed to the current version
    assert.strictEqual(1, globalState.keys().length);
    assert.strictEqual(
      globalState.get(`shopify.${extensionName}.0.0.1.approved_all_overrides`),
      undefined,
    );
    assert.strictEqual(
      globalState.get(
        `shopify.${extensionName}.${extensionVersion}.approved_all_overrides`,
      ),
      OverridesStatus.ApprovedAll,
    );
  });

  test("clearState deletes all settings and cache", () => {
    const extensionName = "ruby-extensions-pack";
    const extensionVersion = vscode.extensions.getExtension(
      `shopify.${extensionName}`,
    )!.packageJSON.version;

    const globalState = new FakeGlobalState();
    globalState.update(
      `shopify.${extensionName}.${extensionVersion}.approved_all_overrides`,
      OverridesStatus.ApprovedAll,
    );

    const context = { globalState } as unknown as vscode.ExtensionContext;
    const store = new FakeStore();
    const config = new Configuration(store, context);

    // Apply defaults and verify that settings are set and that there is a cache entry
    config.applyDefaults();

    DEFAULT_CONFIGS.forEach(({ section, name, value }) => {
      assert.strictEqual(store.get(section, name), value);
    });
    assert.strictEqual(globalState.keys().length, 1);

    // Clear the state and verify that all settings and the cache were cleared
    config.clearState();

    DEFAULT_CONFIGS.forEach(({ section, name }) => {
      assert.strictEqual(store.get(section, name), undefined);
    });

    assert.strictEqual(globalState.keys().length, 0);
  });
});
