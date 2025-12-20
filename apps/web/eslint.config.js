import { baseConfig, reactConfig, prettierConfig } from '@lome-chat/config/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...baseConfig, ...reactConfig, prettierConfig];
