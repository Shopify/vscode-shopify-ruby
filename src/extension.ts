import * as vscode from "vscode";

import { Configuration } from "./configuration";

export async function activate(_context: vscode.ExtensionContext) {
  // If rubocop-lsp is activated before shadowenv, then it cannot find the right gem path and the server doesn't start
  // This workaround just activates shadowenv and restarts the LSP after, to make sure it starts properly
  vscode.extensions.getExtension("shopify.vscode-shadowenv")?.activate();
  vscode.commands.executeCommand("rubocop-lsp.restart");

  new Configuration(vscode.workspace).applyDefaults();
}

export function deactivate() {}
