/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { KnativeEventing, GetKnativeEventingVersions } from './knative-eventing/KnativeEventing.ts';
import { KnativeOperator, GetKnativeOperatorVersions } from './knative-operator/KnativeOperator.ts';
import { KnativeServing, GetKnativeServingVersions } from './knative-serving/KnativeServing.ts';
import { OpenFAAS, GetOpenFAASVersions } from './openfaas/OpenFAAS.ts';

export const ServerlessVersions = HashMap.fromIterable([
  ['knative-eventing', GetKnativeEventingVersions],
  ['knative-operator', GetKnativeOperatorVersions],
  ['knative-serving', GetKnativeServingVersions],
  ['openfaas', GetOpenFAASVersions]
]);

export const ServerlessContainers = HashMap.fromIterable([
  ['knative-eventing', KnativeEventing],
  ['knative-operator', KnativeOperator],
  ['knative-serving', KnativeServing],
  ['openfaas', OpenFAAS]
]);
