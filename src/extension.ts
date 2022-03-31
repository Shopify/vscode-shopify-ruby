import * as vscode from "vscode";

import { Configuration } from "./configuration";

export async function activate(context: vscode.ExtensionContext) {
  // If rubocop-lsp is activated before shadowenv, then it cannot find the right gem path and the server doesn't start
  // This workaround just activates shadowenv and restarts the LSP after, to make sure it starts properly
  vscode.extensions.getExtension("shopify.vscode-shadowenv")?.activate();
  vscode.commands.executeCommand("rubocop-lsp.restart");

  const configuration = new Configuration(vscode.workspace, context);
  configuration.applyDefaults();

  context.subscriptions.push(
    vscode.commands.registerCommand("ruby.force_apply_defaults", () =>
      configuration.applyDefaults(true)
    )
  );
}

export function deactivate() {}
