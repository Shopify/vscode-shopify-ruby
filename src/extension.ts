import * as vscode from "vscode";

import { Configuration } from "./configuration";
import { Setting } from "./setting";

export async function activate(context: vscode.ExtensionContext) {
  const configuration = new Configuration(vscode.workspace, context);

  if (vscode.extensions.getExtension("rebornix.ruby")) {
    showRebornixDeprecationWarning(context);
  }

  await configuration.applyDefaults();
  await configuration.offerTheme();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "rubyExtensionsPack.forceApplyDefaults",
      () => configuration.applyDefaults(true)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("rubyExtensionsPack.clearState", () =>
      configuration.clearState()
    )
  );
}

export function deactivate() {}

const DEPRECATED_REBORNIX_RUBY_CONFIG = [
  { section: "ruby", name: "useBundler", value: undefined },
  { section: "ruby", name: "useLanguageServer", value: undefined },
  { section: "ruby", name: "lint", value: undefined },
  { section: "ruby", name: "codeCompletion", value: undefined },
  { section: "ruby", name: "intellisense", value: undefined },
  { section: "ruby", name: "format", value: undefined },
];

// TODO: This function and surrounding code should be
// removed in the next version after rebornix.ruby is deprecated
export async function showRebornixDeprecationWarning(
  context: vscode.ExtensionContext
): Promise<void> {
  const response = await vscode.window.showWarningMessage(
    "The Ruby LSP has fully replaced the Ruby plugin functionality. Uninstall the `rebornix.ruby` and the `wingrunr21.vscode-ruby` extensions. Click `Cleanup` to remove related configuration.",
    "Cleanup",
    "Cancel"
  );

  if (response === "Cleanup") {
    const settings = DEPRECATED_REBORNIX_RUBY_CONFIG.map(
      (config) =>
        new Setting(
          context,
          vscode.workspace,
          config.section,
          config.name,
          undefined
        )
    );
    settings.forEach((setting) => setting.clear());
  }
}
