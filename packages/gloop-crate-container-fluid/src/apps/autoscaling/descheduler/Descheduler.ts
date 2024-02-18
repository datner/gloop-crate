/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as O from 'effect/Option';

import { GetGithubVersions } from 'container-fluid/versions/GitVersion.ts';

import { GolangApp } from 'container-fluid/languages/Golang.ts';
import { Distro } from 'container-fluid/Distro.ts';

export const GetDeschedulerVersions = GetGithubVersions('Cluster Descheduler', 'kubernetes-sigs', 'descheduler');

export const Descheduler = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetDeschedulerVersions,
    org,
    distro,
    'descheduler',
    'kubernetes-sigs',
    'descheduler',
    timestamp,
    ['mkdir -p /builder/descheduler/bin', 'mv bin/* /builder/descheduler/bin'],
    version
  );
