/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as O from 'effect/Option';

import { GetGithubVersions } from '../../../versions/GitVersion.ts';

import { Distro } from '../../../Distro.ts';
import { GolangApp } from '../../../languages/Golang.ts';

export const GetDragonFlyVersions = GetGithubVersions('Dragonfly', 'dragonflyoss', 'Dragonfly2');

export const Dragonfly = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetDragonFlyVersions,
    org,
    distro,
    'dragonfly',
    'dragonflyoss',
    'Dragonfly2',
    timestamp,
    [
      'cd /builder/src/dragonfly',
      'make build-dfget',
      'make build-dfcache',
      'make build-dfstore',
      'make build-scheduler',
      'make build-dfstore',
      'make build-trainer',
      'make build-manager-server',
      'mkdir -p /builder/dragonfly/bin',
      'mv bin/linux_amd64/* /builder/dragonfly/bin'
    ],
    version
  );
