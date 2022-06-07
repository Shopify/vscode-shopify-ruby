import * as assert from "assert";

import * as vscode from "vscode";

import FakeStore from "../fakeStore";
import FakeGlobalState from "../fakeGlobalState";
import { OverrideType, Setting } from "../../setting";
import { CANCELLED_OVERRIDES_KEY } from "../../configurationStore";

suite("Setting suite", () => {
  test("match returns true if existing value matches", () => {
    const store = new FakeStore();
    store
      .getConfiguration("editor", undefined)
      .update("defaultFormatter", "Shopify.ruby-lsp", true, true);

    const setting = new Setting(
      {} as vscode.ExtensionContext,
      store,
      "editor",
      "defaultFormatter",
      "Shopify.ruby-lsp",
      undefined
    );

    assert.strictEqual(setting.match(), true);
  });

  test("match returns false if existing value is different", () => {
    const store = new FakeStore();
    store
      .getConfiguration("editor", undefined)
      .update("defaultFormatter", "Shopify.some-other-formatter", true, true);

    const setting = new Setting(
      {} as vscode.ExtensionContext,
      store,
      "editor",
      "defaultFormatter",
      "Shopify.ruby-lsp",
      undefined
    );

    assert.strictEqual(setting.match(), false);
  });

  test("needsOverride returns true if existing config is undefined", () => {
    const store = new FakeStore();
    const setting = new Setting(
      {} as vscode.ExtensionContext,
      store,
      "editor",
      "defaultFormatter",
      "Shopify.ruby-lsp",
      undefined
    );

    assert.strictEqual(setting.needsOverride(), true);
  });

  test("needsOverride returns true if existing config is has a different value", () => {
    const store = new FakeStore();
    store
      .getConfiguration("editor", undefined)
      .update("defaultFormatter", "Shopify.some-other-formatter", true, true);

    const setting = new Setting(
      {} as vscode.ExtensionContext,
      store,
      "editor",
      "defaultFormatter",
      "Shopify.ruby-lsp",
      undefined
    );

    assert.strictEqual(setting.needsOverride(), true);
  });

  test("needsOverride returns false if existing config exists and matches", () => {
    const store = new FakeStore();
    store
      .getConfiguration("editor", undefined)
      .update("defaultFormatter", "Shopify.ruby-lsp", true, true);

    const setting = new Setting(
      {} as vscode.ExtensionContext,
      store,
      "editor",
      "defaultFormatter",
      "Shopify.ruby-lsp",
      undefined
    );

    assert.strictEqual(setting.needsOverride(), false);
  });

  test("update changes the value of the setting in the store", () => {
    const store = new FakeStore();
    store
      .getConfiguration("editor", undefined)
      .update("defaultFormatter", "Shopify.some-other-formatter", true, true);

    const setting = new Setting(
      {} as vscode.ExtensionContext,
      store,
      "editor",
      "defaultFormatter",
      "Shopify.ruby-lsp",
      undefined
    );

    setting.update();

    assert.strictEqual(
      store.get("editor", "defaultFormatter"),
      "Shopify.ruby-lsp"
    );
    assert.strictEqual(
      store.get("editor", "defaultFormatter", false),
      undefined
    );
  });

  test("update both changes the value of global and workspace settings", () => {
    const store = new FakeStore();
    const setting = new Setting(
      {} as vscode.ExtensionContext,
      store,
      "editor",
      "defaultFormatter",
      "Shopify.ruby-lsp",
      undefined
    );

    setting.update(OverrideType.Both);

    assert.strictEqual(
      store.get("editor", "defaultFormatter"),
      "Shopify.ruby-lsp"
    );
    assert.strictEqual(
      store.get("editor", "defaultFormatter", false),
      "Shopify.ruby-lsp"
    );
  });

  test("update can change only workspace settings", () => {
    const store = new FakeStore();
    const setting = new Setting(
      {} as vscode.ExtensionContext,
      store,
      "editor",
      "defaultFormatter",
      "Shopify.ruby-lsp",
      undefined
    );

    setting.update(OverrideType.Workspace);

    assert.strictEqual(store.get("editor", "defaultFormatter"), undefined);
    assert.strictEqual(
      store.get("editor", "defaultFormatter", false),
      "Shopify.ruby-lsp"
    );
  });

  test("full name returns section and name", () => {
    const setting = new Setting(
      {} as vscode.ExtensionContext,
      new FakeStore(),
      "editor",
      "defaultFormatter",
      "Shopify.ruby-lsp",
      undefined
    );

    assert.strictEqual(setting.fullName(), "editor.defaultFormatter");
  });

  test("printable value returns JSON string", () => {
    const setting = new Setting(
      {} as vscode.ExtensionContext,
      new FakeStore(),
      "section",
      "name",
      { key: "value" },
      undefined
    );

    assert.strictEqual(setting.printableValue(), '{"key":"value"}');
  });

  test("shadowedByWorkspaceSetting returns true if a workspace value exists", () => {
    const store = new FakeStore();
    store.addToWorkspace(
      "editor",
      "defaultFormatter",
      "Shopify.other-formatter"
    );

    const setting = new Setting(
      {} as vscode.ExtensionContext,
      store,
      "editor",
      "defaultFormatter",
      "Shopify.ruby-lsp",
      undefined
    );

    assert.strictEqual(setting.shadowedByWorkspaceSetting, true);
  });

  test("clear deletes configuration entry", () => {
    const store = new FakeStore();
    store
      .getConfiguration("editor", undefined)
      .update("defaultFormatter", "Shopify.ruby-lsp", true, true);

    const context = {
      globalState: new FakeGlobalState(),
    } as unknown as vscode.ExtensionContext;

    const setting = new Setting(
      context,
      store,
      "editor",
      "defaultFormatter",
      "Shopify.ruby-lsp",
      undefined
    );

    setting.clear();
    assert.strictEqual(store.get("editor", "defaultFormatter"), undefined);
  });

  test("clear deletes cancelled cache entry", () => {
    const store = new FakeStore();
    store
      .getConfiguration("editor", undefined)
      .update("defaultFormatter", "Shopify.ruby-lsp", true, true);

    const globalState = new FakeGlobalState();
    globalState.update(`${CANCELLED_OVERRIDES_KEY}.defaultFormatter`, true);

    const context = { globalState } as unknown as vscode.ExtensionContext;
    const setting = new Setting(
      context,
      store,
      "editor",
      "defaultFormatter",
      "Shopify.ruby-lsp",
      undefined
    );

    setting.clear();
    assert.strictEqual(
      globalState.get(`${CANCELLED_OVERRIDES_KEY}.defaultFormatter`),
      undefined
    );
  });
});
