/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as O from 'effect/Option';

import { GetGithubVersions } from 'container-fluid/versions/GitVersion.ts';

import { Distro } from 'container-fluid/Distro.ts';
import { GolangApp } from 'container-fluid/languages/Golang.ts';

export const GetVerticalPodAutoscalerVersions = GetGithubVersions('Vertical Pod Autoscaler', 'kubernetes', 'autoscaler', 'vertical-pod-autoscaler-');

export const VerticalPodAutoscaler = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetVerticalPodAutoscalerVersions,
    org,
    distro,
    'vpa',
    'kubernetes',
    'autoscaler',
    timestamp,
    ['cd vertical-pod-autoscaler/pkg/admission-controller', 'make', 'mkdir -p /builder/vpa/bin', 'mv admission-controller /builder/vpa/bin'],
    version
  );
