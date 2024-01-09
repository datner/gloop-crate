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

const org = 'aquasecurity';
const name = 'kube-hunter';

export const GetKubeHunterVersions = GetGithubVersions(name, org, name);

export const KubeHunter = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetKubeHunterVersions,
    org,
    distro,
    name,
    org,
    name,
    timestamp,
    [
      'pip install -r requirements.txt',
      "pip install click jsonschema ply colorama jmespath termcolor typing-extensions 'jmespath<2.0.0' 's3transfer<0.7.0' 'attrs>=17.3.0' 'urllib3<1.27'",
      'make deps',
      'make install'
    ],
    version
  );
