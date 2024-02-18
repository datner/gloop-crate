/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

// import * as Ef from 'effect/Effect';
import * as HashMap from 'effect/HashMap';

import { AddonResizer, GetAddonResizerVersions } from 'container-fluid/apps/autoscaling/addon-resizer/AddonResizer.ts';
import { ClusterAutoscaler, GetClusterAutoscalerVersions } from 'container-fluid/apps/autoscaling/cluster-autoscaler/ClusterAutoscaler.ts';
import { Descheduler, GetDeschedulerVersions } from 'container-fluid/apps/autoscaling/descheduler/Descheduler.ts';
import { Keda, GetKedaVersions } from 'container-fluid/apps/autoscaling/keda/Keda.ts';
import { VerticalPodAutoscaler, GetVerticalPodAutoscalerVersions } from 'container-fluid/apps/autoscaling/vpa/Vpa.ts';

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
