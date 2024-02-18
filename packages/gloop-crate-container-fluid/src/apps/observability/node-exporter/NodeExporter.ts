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

export const GetNodeExporterVersions = GetGithubVersions('Node Exporter', 'prometheus', 'node_exporter');

export const NodeExporter = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetNodeExporterVersions,
    org,
    distro,
    'nats',
    'rabbitmq',
    'rabbitmq-server',
    timestamp,
    [`${GoInstall} github.com/prometheus/promu@latest`, `$GOPATH/bin/promu --config .promu.yml build --prefix /builder/src/nodeexporter`],
    version
  );
