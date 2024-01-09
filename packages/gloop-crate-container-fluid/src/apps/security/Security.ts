/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { Falco, GetFalcoVersions } from './falco/Falco.ts';
import { KubeBench, GetKubeBenchVersions } from './kube-bench/KubeBench.ts';
import { KubeHunter, GetKubeHunterVersions } from './kube-hunter/KubeHunter.ts';
import { KubeArmor, GetKubeArmorVersions } from './kubearmor/KubeArmor.ts';
import { Kyverno, GetKyvernoVersions } from './kyverno/Kyverno.ts';

export const SecurityVersions = HashMap.fromIterable([
  ['falco', GetFalcoVersions],
  ['kube-bench', GetKubeBenchVersions],
  ['kube-hunter', GetKubeHunterVersions],
  ['kube-armor', GetKubeArmorVersions],
  ['kyverno', GetKyvernoVersions]
]);

export const SecurityContainers = HashMap.fromIterable([
  ['falco', Falco],
  ['kube-bench', KubeBench],
  ['kube-hunter', KubeHunter],
  ['kube-armor', KubeArmor],
  ['kyverno', Kyverno]
]);
