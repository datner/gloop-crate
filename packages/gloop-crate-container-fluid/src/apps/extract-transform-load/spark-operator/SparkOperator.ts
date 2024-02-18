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
import { GolangApp } from 'container-fluid/languages/Golang.ts';

export const GetSparkOperatorVersions = GetGithubVersions('Spark Operator', 'GoogleCloudPlatform', 'spark-on-k8s-operator');

export const SparkOperator = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetSparkOperatorVersions,
    org,
    distro,
    'nats',
    'rabbitmq',
    'rabbitmq-server',
    timestamp,
    ['go build -a -o /builder/spark-operator main.go'],
    version
  );
