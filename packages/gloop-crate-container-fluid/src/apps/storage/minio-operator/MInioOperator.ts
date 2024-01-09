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

export const GetMinioOperatorVersions = GetGithubVersions('minio operator', 'minio', 'operator');

export const MinioOperator = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetMinioOperatorVersions,
    org,
    distro,
    'nats',
    'rabbitmq',
    'rabbitmq-server',
    timestamp,
    [
      'npm install -g yarn',
      'GOOS=$TARGETOS GOARCH=$TARGETARCH make regen-crd',
      'GOOS=$TARGETOS GOARCH=$TARGETARCH make operator',
      'GOOS=$TARGETOS GOARCH=$TARGETARCH make binary'
    ],
    version
  );
