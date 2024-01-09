/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

// import * as F from 'effect/Function';
// import * as Ef from 'effect/Effect';
// import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
// import * as ConfigError from 'effect/ConfigError';

import { GetGithubVersions } from '../../../versions/GitVersion.ts';

import { Distro } from '../../../Distro.ts';
import { GolangApp } from '../../../languages/Golang.ts';

export const GetGrafanaTempoVersions = GetGithubVersions('Tempo', 'grafana', 'tempo');

export const Tempo = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetGrafanaTempoVersions,
    org,
    distro,
    'nats',
    'rabbitmq',
    'rabbitmq-server',
    timestamp,
    [
      'mkdir -p /builder/go/bin',
      'make tempo"',
      'mv ./bin/linux/tempo-amd64 /builder/go/bin/tempo',
      'make tempo-query"',
      'mv ./bin/linux/tempo-query-amd64 /builder/go/bin/tempo-query',
      'make tempo-cli"',
      'mv ./bin/linux/tempo-cli-amd64 /builder/go/bin/tempo-cli',
      'make tempo-vulture"',
      'mv ./bin/linux/tempo-vulture-amd64 /builder/go/bin/tempo-vulture'
    ],
    version
  );
