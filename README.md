[![Build status](https://badge.buildkite.com/631679622eda9238c439afbf514f6f6a138ba67f48a54c09c6.svg)](https://buildkite.com/shopify/vscode-shopify-ruby)

# VS Code Shopify Ruby

This extension pack contains a collection of pre-configured plugins for working with Ruby in VS Code.

## Usage

**Note**

This extension will automatically configure the other plugins included in the pack, changing the user configurations in settings.json. If you have customized configuration for any of the plugins included, you may want to back it up before installing `vscode-shopify-ruby`.

Search for `vscode-shopify-ruby` in the extensions tab and click install.

## Extension development

### Auto format

To automatically fix prettier and eslint errors on save, install the official eslint plugin and add the following configuration to your settings.json.

```json
"[typescript]": {
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
}
```

### Debugging

Interactive debugging works for both running the extension or tests. In the debug panel, select whether to run the extension in development mode or run tests, set up some breakpoints and start with F5.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/Shopify/vscode-shopify-ruby.
This project is intended to be a safe, welcoming space for collaboration, and contributors
are expected to adhere to the
[Contributor Covenant](https://github.com/Shopify/vscode-shopify-ruby/blob/main/CODE_OF_CONDUCT.md)
code of conduct.

## License

The extension is available as open source under the terms of the
[MIT License](https://github.com/Shopify/vscode-shopify-ruby/blob/main/LICENSE.txt).
