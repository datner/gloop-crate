/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { ClusterDNSOperator, GetClusterDNSOperatorVersions } from './cluster-dns-operator/ClusterDNSOperator.ts';
import { CoreDNS, GetCoreDNSVersions } from './coredns/CoreDNS.ts';

export const DomainsVersions = HashMap.fromIterable([
  ['cluster-dns-operator', GetClusterDNSOperatorVersions],
  ['coredns', GetCoreDNSVersions]
]);

export const DomainsContainers = HashMap.fromIterable([
  ['cluster-dns-operator', ClusterDNSOperator],
  ['coredns', CoreDNS]
]);
