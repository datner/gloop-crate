/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

// import * as F from 'effect/Function';
// import * as Ef from 'effect/Effect';
// import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
// import * as ConfigError from 'effect/ConfigError';

import { GetGithubVersions } from 'container-fluid/versions/GitVersion.ts';

import { Distro } from 'container-fluid/Distro.ts';
import { GoInstall, GolangApp } from '../../../languages/Golang.ts';

export const GetPrometheusVersions = GetGithubVersions('Prometheus', 'grafana', 'prometheus');

export const Prometheus = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetPrometheusVersions,
    org,
    distro,
    'nats',
    'rabbitmq',
    'rabbitmq-server',
    timestamp,
    [
      'cd web/ui',
      'npm install',
      'cd /builder/src/prometheus/web/ui/module/lezer-promql',
      'npm install',
      'npm install -g rollup"',
      'NODE_ENV=production bash build.sh"',
      'cd /builder/src/prometheus/web/ui/module/codemirror-promql',
      'npm install"',
      'npm install -g typescript"',
      'NODE_ENV=production bash build.sh"',
      'cd /builder/src/prometheus/web/ui/react-app',
      'npm install"',
      'npm install -g react-scripts sass"',
      'NODE_ENV=production TSC_COMPILE_ON_ERROR=true DISABLE_ESLINT_PLUGIN=true npm run build"',
      'cd /builder/src/prometheus/web/ui',
      'mv ./react-app/build ./static/react',
      'cd /builder/src/prometheus/',
      `${GoInstall} ./cmd/prometheus"`,
      `${GoInstall} ./cmd/promtool`
    ],
    version
  );
