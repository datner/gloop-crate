/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { Istio, GetIstioVersions } from './istio/Istio.ts';
import { Linkerd2, GetLinkerd2Versions } from './linkerd2/Linkerd2.ts';

export const ServiceMeshVersions = HashMap.fromIterable([
  ['istio', GetIstioVersions],
  ['linkerd2', GetLinkerd2Versions]
]);

export const ServiceMeshContainers = HashMap.fromIterable([
  ['istio', Istio],
  ['linkerd2', Linkerd2]
]);
