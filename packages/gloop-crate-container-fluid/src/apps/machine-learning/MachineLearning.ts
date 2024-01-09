/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { Kubeflow, GetKubeflowVersions } from './kubeflow/Kubeflow.ts';
import { KubeflowTrainingOperator, GetKubeflowTrainingOperatorVersions } from './kubeflow-operator/KubeflowOperator.ts';
import { MerlinCore, GetNvidiaMerlinCoreVersions } from './nvidia-merlin-core/MerlinCore.ts';
import { MerlinHugeCTR, GetNvidiaMerlinHugeCTRVersions } from './nvidia-merlin-hugectr/HugeCTR.ts';
import { MerlinModels, GetNvidiaMerlinModelsVersions } from './nvidia-merlin-models/MerlinModels.ts';
import { MerlinNVTabular, GetNvidiaMerlinNVTabularVersions } from './nvidia-merlin-nvtabular/NVTabular.ts';
import { MerlinSystems, GetNvidiaMerlinSystemsVersions } from './nvidia-merlin-systems/MerlinSystems.ts';
import { Transformers4Rec, GetNvidiaMerlinTransformers4RecVersions } from './nvidia-merlin-transformers-4rec/Transformers4Rec.ts';
import { Triton, GetNvidiaTritonVersions } from './nvidia-triton/Triton.ts';
import { ONNXRuntime, GetONNXRuntimeVersions } from './onnxruntime/ONNXRuntime.ts';

export const MachineLearningVersions = HashMap.fromIterable([
  ['kubeflow', GetKubeflowVersions],
  ['kubeflow-training-operator', GetKubeflowTrainingOperatorVersions],
  ['merlin-core', GetNvidiaMerlinCoreVersions],
  ['merlin-hugectr', GetNvidiaMerlinHugeCTRVersions],
  ['merlin-models', GetNvidiaMerlinModelsVersions],
  ['merlin-nvtabular', GetNvidiaMerlinNVTabularVersions],
  ['merlin-systems', GetNvidiaMerlinSystemsVersions],
  ['merlin-transformers-4rec', GetNvidiaMerlinTransformers4RecVersions],
  ['triton', GetNvidiaTritonVersions],
  ['onnx-runtime', GetONNXRuntimeVersions]
]);

export const MachineLearningContainers = HashMap.fromIterable([
  ['kubeflow', Kubeflow],
  ['kubeflow-training-operator', KubeflowTrainingOperator],
  ['merlin-core', MerlinCore],
  ['merlin-hugectr', MerlinHugeCTR],
  ['merlin-models', MerlinModels],
  ['merlin-nvtabular', MerlinNVTabular],
  ['merlin-systems', MerlinSystems],
  ['merlin-transformers-4rec', Transformers4Rec],
  ['triton', Triton],
  ['onnx-runtime', ONNXRuntime]
]);
