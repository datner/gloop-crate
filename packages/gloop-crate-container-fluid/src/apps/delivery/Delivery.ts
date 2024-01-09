/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { ArgoCD, GetArgoCDVersions } from './argo-cd/ArgoCD.ts';
import { ArgoEvents, GetArgoEventsVersions } from './argo-events/ArgoEvents.ts';
import { ArgoRollouts, GetArgoRolloutsVersions } from './argo-rollouts/ArgoRollouts.ts';
import { TektonCDOperator, GetTektonCDOperatorVersions } from './tektoncd-operator/TektonOperator.ts';
import { TektonCDDashboard, GetTektonCDDashboardVersions } from './tektoncd-dashboard/TektonDashboard.ts';
import { TektonCDPipeline, GetTektonCDPipelineVersions } from './tektoncd-pipeline/TektonPipeline.ts';
import { TektonCDTriggers, GetTektonCDTriggersVersions } from './tektoncd-triggers/TektonTriggers.ts';

export const DeliveryVersions = HashMap.fromIterable([
  ['argo-cd', GetArgoCDVersions],
  ['argo-events', GetArgoEventsVersions],
  ['argo-rollouts', GetArgoRolloutsVersions],
  ['tektoncd-dashboard', GetTektonCDDashboardVersions],
  ['tektoncd-operator', GetTektonCDOperatorVersions],
  ['tektoncd-pipeline', GetTektonCDPipelineVersions],
  ['tektoncd-triggers', GetTektonCDTriggersVersions]
]);

export const DeliveryContainers = HashMap.fromIterable([
  ['argo-cd', ArgoCD],
  ['argo-events', ArgoEvents],
  ['argo-rollouts', ArgoRollouts],
  ['tektoncd-dashboard', TektonCDDashboard],
  ['tektoncd-operator', TektonCDOperator],
  ['tektoncd-pipeline', TektonCDPipeline],
  ['tektoncd-triggers', TektonCDTriggers]
]);
