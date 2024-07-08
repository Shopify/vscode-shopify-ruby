import * as vscode from "vscode";

export async function activate(context: vscode.ExtensionContext) {
  await offerTheme(context);
}

export function deactivate() {}

async function offerTheme(context: vscode.ExtensionContext) {
  const cacheKey = "shopify.ruby-extensions-pack.offeredTheme";

  // Avoid offering to use the new theme more than once
  if (context.globalState.get(cacheKey)) {
    return;
  }

  const config = vscode.workspace.getConfiguration("workbench");
  const theme = config.get("colorTheme");

  // If the user is already using the new theme, don't offer it
  if (theme !== "Spinel") {
    await context.globalState.update(cacheKey, true);
    return;
  }

  const response = await vscode.window.showInformationMessage(
    "The Spinel theme is tailored for better visuals when working with Ruby. Would you like to try it?",
    "Yes",
    "No",
  );

  if (response === "Yes") {
    await config.update(
      "colorTheme",
      "Spinel",
      vscode.ConfigurationTarget.Global,
    );
  }

  await context.globalState.update(cacheKey, true);
}
