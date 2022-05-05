import * as vscode from "vscode";

import { Configuration } from "./configuration";

export async function activate(context: vscode.ExtensionContext) {
  const configuration = new Configuration(vscode.workspace, context);
  configuration.applyDefaults();

  context.subscriptions.push(
    vscode.commands.registerCommand("ruby.force_apply_defaults", () =>
      configuration.applyDefaults(true)
    )
  );
}

export function deactivate() {}
