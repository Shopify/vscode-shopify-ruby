import * as vscode from "vscode";

export default class FakeGlobalState implements vscode.Memento {
  private storage: { [key: string]: any } = {};

  constructor() {
    this.storage = {};
  }

  update(key: string, value: any): Thenable<void> {
    if (value === undefined) {
      delete this.storage[key];
      return Promise.resolve();
    }

    return (this.storage[key] = value);
  }

  get(name: string) {
    return this.storage[name];
  }

  keys() {
    return Object.keys(this.storage);
  }

  setKeysForSync(_keys: ReadonlyArray<string>): void {
    // noop
  }
}
