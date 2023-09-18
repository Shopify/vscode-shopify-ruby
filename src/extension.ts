import * as vscode from "vscode";

import { Configuration } from "./configuration";

export async function activate(context: vscode.ExtensionContext) {
  const configuration = new Configuration(vscode.workspace, context);
  await configuration.applyDefaults();
  await configuration.offerTheme();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "rubyExtensionsPack.forceApplyDefaults",
      () => configuration.applyDefaults(true),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("rubyExtensionsPack.clearState", () =>
      configuration.clearState(),
    ),
  );
}

export function deactivate() {}
