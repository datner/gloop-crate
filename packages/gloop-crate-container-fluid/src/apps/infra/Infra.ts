/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { Atlantis, GetAtlantisVersions } from './atlantis/Atlantis.ts';
import { Clever, GetCleverVersions } from './clever/Clever.ts';
import { Kepler, GetKeplerVersions } from './kepler/Kepler.ts';
import { Kubernetes, GetKubernetesVersions } from './kubernetes/Kubernetes.ts';
import { Peaks, GetPeaksVersions } from './peaks/Peaks.ts';

export const InfraVersions = HashMap.fromIterable([
  ['atlantis', GetAtlantisVersions],
  ['clever', GetCleverVersions],
  ['kepler', GetKeplerVersions],
  ['kubernetes', GetKubernetesVersions],
  ['peaks', GetPeaksVersions]
]);

export const InfraContainers = HashMap.fromIterable([
  ['atlantis', Atlantis],
  ['clever', Clever],
  ['kepler', Kepler],
  ['kubernetes', Kubernetes],
  ['peaks', Peaks]
]);
