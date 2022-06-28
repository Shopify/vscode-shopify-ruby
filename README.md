<p align="center">
  <img alt="Ruby extensions pack logo" width="200" src="icon.png" />
</p>

![Build Status](https://github.com/Shopify/vscode-shopify-ruby/workflows/CI/badge.svg)

# VS Code Shopify Ruby

This extension pack contains an opinionated collection of pre-configured extensions for Ruby development in VS Code:

- [Ruby](https://marketplace.visualstudio.com/items?itemName=rebornix.ruby)
- [shadowenv](https://marketplace.visualstudio.com/items?itemName=Shopify.vscode-shadowenv)
- [Ruby Sorbet](https://marketplace.visualstudio.com/items?itemName=sorbet.sorbet-vscode-extension)
- [VSCode rdbg Ruby Debugger](https://marketplace.visualstudio.com/items?itemName=koichisasada.vscode-rdbg)
- [byesig](https://marketplace.visualstudio.com/items?itemName=itarato.byesig)
- [ruby-lsp](https://marketplace.visualstudio.com/items?itemName=Shopify.ruby-lsp)

## Usage

Search for [`ruby-extensions-pack`](https://marketplace.visualstudio.com/items?itemName=Shopify.ruby-extensions-pack) in the extensions tab and click install.

When activated, this extension will prompt you about overriding your existing configuration to use the recommended defaults.
You may want to backup your `settings.json` file before trying this extension out.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/Shopify/vscode-shopify-ruby.
This project is intended to be a safe, welcoming space for collaboration, and contributors
are expected to adhere to the
[Contributor Covenant](https://github.com/Shopify/vscode-shopify-ruby/blob/main/CODE_OF_CONDUCT.md)
code of conduct.

### Executing tests

1. Open VS Code on this repo
2. Make sure dependencies are installed (`yarn install`)
3. On VS Code's run and debug tab, select the `Extension tests` task
4. Click the run button or press F5 to run tests. Output is displayed in the debug console

### Testing the extension locally

1. Open VS Code on this repo
2. Make sure dependencies are installed (`yarn install`)
3. On VS Code's run and debug tab, select the `Extension` task
4. This will open a second VS Code window where the development version of the extension is running. Use it to verify
   that the extension is working as expected
5. If needed, the cache and recommended settings can be cleared by running the `Ruby extensions pack: Clear cache`
   command. This will make the extension prompt overrides again

### Debugging

To debug the extension, add breakpoints using the VS Code interface and either run the tests or the extension in
development mode.

## License

The extension is available as open source under the terms of the
[MIT License](https://github.com/Shopify/vscode-shopify-ruby/blob/main/LICENSE.txt).
