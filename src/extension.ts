import * as vscode from 'vscode';
import { markdownItYamlPlugin } from './markdownItPlugin';

export function activate(context: vscode.ExtensionContext) {
  return {
    extendMarkdownIt(md: any) {
      return markdownItYamlPlugin(md);
    }
  };
}

export function deactivate() {}
