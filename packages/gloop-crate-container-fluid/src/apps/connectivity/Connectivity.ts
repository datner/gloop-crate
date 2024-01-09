/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { Cilium, GetCiliumVersions } from './cilium/Cilium.ts';
import { MetalLB, GetMetalLBVersions } from './metallb/MetalLB.ts';
import { MirrorD, GetMirrorDVersions } from './mirrord/MirrorD.ts';

export const ConnectivityVersions = HashMap.fromIterable([
  ['cilium', GetCiliumVersions],
  ['metalLB', GetMetalLBVersions],
  ['mirrord', GetMirrorDVersions]
]);

export const ConnectivityContainers = HashMap.fromIterable([
  ['cilium', Cilium],
  ['metalLB', MetalLB],
  ['mirrord', MirrorD]
]);
