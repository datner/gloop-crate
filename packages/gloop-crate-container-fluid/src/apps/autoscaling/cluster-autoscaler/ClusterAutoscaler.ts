/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as O from 'effect/Option';

import { GetGithubVersions } from '../../../versions/GitVersion.ts';

import { Distro } from '../../../Distro.ts';
import { GolangApp } from '../../../languages/Golang.ts';

export const GetClusterAutoscalerVersions = GetGithubVersions('Cluster Autoscaler', 'kubernetes', 'autoscaler', 'cluster-autoscaler-');

export const ClusterAutoscaler = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetClusterAutoscalerVersions,
    org,
    distro,
    'descheduler',
    'kubernetes',
    'autoscaler',
    timestamp,
    ['mkdir -p /builder/autoscaler/bin', 'mv bin/* /builder/autoscaler/bin'],
    version
  );
