/**
      Copyright (c) 2024 Crate Monster

      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import js from '@eslint/js';
import globals from 'globals';

import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

import comments from 'eslint-plugin-eslint-comments';
import licenseHeader from 'eslint-plugin-license-header';
import noSecrets from 'eslint-plugin-no-secrets';
import noUseExtend from 'eslint-plugin-no-use-extend-native';
import node from 'eslint-plugin-node';
import optimizeRegex from 'eslint-plugin-optimize-regex';
import prettier from 'eslint-plugin-prettier';
import promise from 'eslint-plugin-promise';
import regexp from 'eslint-plugin-regexp';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import turbo from 'eslint-plugin-turbo';

const plugins = {
  '@typescript-eslint': tsPlugin,
  'eslint-comments': comments,
  'no-secrets': noSecrets,
  'license-header': licenseHeader,
  'no-use-extend-native': noUseExtend,
  node,
  'optimize-regex': optimizeRegex,
  prettier,
  promise,
  regexp,
  security,
  sonarjs,
  turbo
};

const overrides = {
  'no-redeclare': 'off',
  'no-unused-vars': 'off',
  'node/no-unpublished-import': 'off',
  'node/no-missing-import': 'off'
};

const rules = {
  ...tsPlugin.configs.recommended['rules'],
  ...comments.configs.recommended.rules,
  'license-header/header': ['error', './Header.txt'],
  ...noUseExtend.configs.recommended.rules,
  ...node.configs.recommended.rules,
  ...optimizeRegex.configs.recommended.rules,
  'prettier/prettier': 'error',
  ...promise.configs.recommended.rules,
  ...regexp.configs.recommended.rules,
  ...security.configs.recommended.rules,
  ...sonarjs.configs.recommended.rules,
  ...turbo.configs.recommended.rules,
  ...js.configs.recommended.rules,
  ...overrides
};

const settings = {
  react: {
    version: '18.2'
  }
};

// const jsonFiles = ['*.json', '**/src/**/.*json'];

const javaScriptFiles = ['*.js', '*.cjs', '**/src/**/*.js', '**/src/**/*.jsx'];

const typeScriptFiles = ['*.ts', '*.tsx', '**/src/**/*.ts', '**/src/**/*.tsx'];

const testFiles = ['**/test/**/*Test.ts', '**/test/**/*.ts'];

const ignores = ['**/node_modules/**/*'];

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: [...javaScriptFiles, ...typeScriptFiles, ...testFiles],
    ignores,
    languageOptions: {
      parser: tsParser,
      parserOptions: {},
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn'
    },
    plugins,
    rules,
    settings
  }
];
