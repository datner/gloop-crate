/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

// import * as Ef from 'effect/Effect';
import * as HashMap from 'effect/HashMap';

import { AddonResizer, GetAddonResizerVersions } from './addon-resizer/AddonResizer.ts';
import { ClusterAutoscaler, GetClusterAutoscalerVersions } from './cluster-autoscaler/ClusterAutoscaler.ts';
import { Descheduler, GetDeschedulerVersions } from './descheduler/Descheduler.ts';
import { Keda, GetKedaVersions } from './keda/Keda.ts';
import { VerticalPodAutoscaler, GetVerticalPodAutoscalerVersions } from './vpa/Vpa.ts';

export const AutoscalingVersions = HashMap.fromIterable([
  ['addon-autoscaler', GetAddonResizerVersions],
  ['cluster-autoscaler', GetClusterAutoscalerVersions],
  ['descheduler', GetDeschedulerVersions],
  ['keda', GetKedaVersions],
  ['vertical-pod-autoscaler', GetVerticalPodAutoscalerVersions]
]);

export const AutoscalingContainers = HashMap.fromIterable([
  ['addon-resizer', AddonResizer],
  ['cluster-autoscaler', ClusterAutoscaler],
  ['descheduler', Descheduler],
  ['keda', Keda],
  ['vpa', VerticalPodAutoscaler]
]);
