/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as O from 'effect/Option';

import { GetGithubVersions } from '../../../versions/GitVersion.ts';

import { Distro } from '../../../Distro.ts';
import { GolangApp } from '../../../languages/Golang.ts';

export const GetAddonResizerVersions = GetGithubVersions('Cluster Autoscaler', 'kubernetes', 'autoscaler', 'addon-resizer-');

export const AddonResizer = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetAddonResizerVersions,
    org,
    distro,
    'addon-resizer',
    'kubernetes',
    'autoscaler',
    timestamp,
    [
      'cd addon-resizer/pkg/admission-controller',
      'make build-manager-server',
      'mkdir -p /builder/dragonfly/bin',
      'mv bin/linux_amd64/* /builder/dragonfly/bin'
    ],
    version
  );
