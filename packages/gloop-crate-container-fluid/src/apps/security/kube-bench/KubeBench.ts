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

const org = 'aquasecurity';
const name = 'kube-bench';

export const GetKubeBenchVersions = GetGithubVersions(name, org, name);

export const KubeBench = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(GetKubeBenchVersions, org, distro, name, org, name, timestamp, [`${GoInstall} .`], version);