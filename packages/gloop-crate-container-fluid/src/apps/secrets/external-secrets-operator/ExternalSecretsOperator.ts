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
import { GoInstall, GolangApp } from '../../../languages/Golang.ts';

export const GetExternalSecretsOperatorVersions = GetGithubVersions('External Secrets Operator', 'external-secrets', 'external-secrets');

export const ExternalSecretsOperator = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetExternalSecretsOperatorVersions,
    org,
    distro,
    'nats',
    'rabbitmq',
    'rabbitmq-server',
    timestamp,
    [`${GoInstall} .`, '/builder/go/bin/external-secrets --version', 'ldd /builder/go/bin/external-secrets'],
    version
  );
