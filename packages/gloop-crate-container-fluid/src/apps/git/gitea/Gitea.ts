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

export const GetGiteaVersions = GetGithubVersions('Gitea', 'go-gitea', 'gitea');

export const Gitea = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetGiteaVersions,
    org,
    distro,
    'nats',
    'rabbitmq',
    'rabbitmq-server',
    timestamp,
    [
      'make frontend',
      'TAGS="bindata timetzdata" make backend',
      'go build contrib/environment-to-ini/environment-to-ini.go',
      'mdkir -p /builder/gitea/usr/bin',
      'mdkir -p /builder/gitea/etc/profile.d',
      'cp gitea /builder/gitea/usr/bin',
      'cp environment-to-ini  /builder/gitea/usr/bin',
      'cp contrib/autocompletion/bash_autocomplete /builder/gitea/etc/profile.d/gitea_bash_autocomplete.sh'
    ],
    version
  );
