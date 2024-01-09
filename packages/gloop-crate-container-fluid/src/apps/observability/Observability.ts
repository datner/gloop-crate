/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { Grafana, GetGrafanaVersions } from './grafana/Grafana.ts';
import { GrafanaAgent, GetGrafanaAgentVersions } from './grafana-agent/GrafanaAgent.ts';
import { KubeStateMetrics, GetKubeStateMetricsVersions } from './kube-state-metrics/KubeStateMetrics.ts';
import { Loki, GetGrafanaLokiVersions } from './loki/Loki.ts';
import { Mimir, GetGrafanaMimirVersions } from './mimir/Mimir.ts';
import { NodeExporter, GetNodeExporterVersions } from './node-exporter/NodeExporter.ts';
import { Prometheus, GetPrometheusVersions } from './prometheus/Prometheus.ts';
import { PrometheusOperator, GetPrometheusOperatorVersions } from './prometheus-operator/PrometheusOperator.ts';
import { Pyroscope, GetGrafanaPyroscopeVersions } from './pyroscope/Pyroscope.ts';
import { Tempo, GetGrafanaTempoVersions } from './tempo/Tempo.ts';
import { Vector, GetVectorVersions } from './vector/Vector.ts';

export const ObservabilityVersions = HashMap.fromIterable([
  ['grafana', GetGrafanaVersions],
  ['grafana-agent', GetGrafanaAgentVersions],
  ['kube-state-metrics', GetKubeStateMetricsVersions],
  ['loki', GetGrafanaLokiVersions],
  ['mimir', GetGrafanaMimirVersions],
  ['node-exporter', GetNodeExporterVersions],
  ['prometheus', GetPrometheusVersions],
  ['prometheus-operator', GetPrometheusOperatorVersions],
  ['pyroscope', GetGrafanaPyroscopeVersions],
  ['tempo', GetGrafanaTempoVersions],
  ['vector', GetVectorVersions]
]);

export const ObservabilityContainers = HashMap.fromIterable([
  ['grafana', Grafana],
  ['grafana-agent', GrafanaAgent],
  ['kube-state-metrics', KubeStateMetrics],
  ['loki', Loki],
  ['mimir', Mimir],
  ['node-exporter', NodeExporter],
  ['prometheus', Prometheus],
  ['prometheus-operator', PrometheusOperator],
  ['pyroscope', Pyroscope],
  ['tempo', Tempo],
  ['vector', Vector]
]);
