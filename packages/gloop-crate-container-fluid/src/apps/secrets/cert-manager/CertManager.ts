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
import { GolangApp, GoInstall } from '../../../languages/Golang.ts';

const certManager = 'cert-manager';
export const GetCertManagerVersions = GetGithubVersions(certManager, certManager, certManager);

export const CertManager = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetCertManagerVersions,
    org,
    distro,
    'nats',
    'rabbitmq',
    'rabbitmq-server',
    timestamp,
    [
      'cd /builder/src/certmanager',
      'cd cmd/acmesolver',
      `${GoInstall} .`,
      'cd ../cainjector',
      `${GoInstall} .`,
      'cd ../controller',
      `${GoInstall} .`,
      'cd ../ctl',
      `${GoInstall} .`,
      'cd ../webhook',
      `${GoInstall} .`
    ],
    version
  );
