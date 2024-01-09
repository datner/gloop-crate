/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { Flink, GetFlinkVersions } from './flink/Flink.ts';
import { FlinkOperator, GetFlinkOperatorVersions } from './flink-operator/FlinkOperator.ts';
import { Spark, GetSparkVersions } from './spark/Spark.ts';
import { SparkOperator, GetSparkOperatorVersions } from './spark-operator/SparkOperator.ts';

export const ExtractTransformLoadVersions = HashMap.fromIterable([
  ['flink', GetFlinkVersions],
  ['flink-operator', GetFlinkOperatorVersions],
  ['spark', GetSparkVersions],
  ['spark-operator', GetSparkOperatorVersions]
]);

export const ExtractTransformLoadContainers = HashMap.fromIterable([
  ['flink', Flink],
  ['flink-operator', FlinkOperator],
  ['spark', Spark],
  ['spark-operator', SparkOperator]
]);
