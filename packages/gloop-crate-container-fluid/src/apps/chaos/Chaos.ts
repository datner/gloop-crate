/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { ChaosMesh, GetChaosMeshVersions } from './chaos-mesh/ChaosMesh.ts';
import { Litmus, GetLitmusVersions } from './litmus/Litmus.ts';

export const ChaosVersions = HashMap.fromIterable([
  ['chaos-mesh', GetChaosMeshVersions],
  ['litmus', GetLitmusVersions]
]);

export const ChaosContainers = HashMap.fromIterable([
  ['chaos-mesh', ChaosMesh],
  ['litmus', Litmus]
]);
