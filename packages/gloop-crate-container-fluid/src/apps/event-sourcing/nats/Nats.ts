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

export const GetNatsVersions = GetGithubVersions('Nats', 'nats-io', 'nats-server');

export const Nats = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(GetNatsVersions, org, distro, 'nats', 'nats-io', 'nats-server', timestamp, ['mkdir -p /builder/nats/bin', 'mv bin/* /builder/nats/bin'], version);
