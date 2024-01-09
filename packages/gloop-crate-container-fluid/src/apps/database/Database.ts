/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { CloudNativePG, GetCNPGVersions } from './cnpg/Cnpg.ts';
import { MongoDB, GetMongoDBVersions } from './mongodb/MongoDB.ts';
import { MongoDBOperator, GetMongoDBOperatorVersions } from './mongodb-operator/MongoDBOperator.ts';
import { PostgreSQL, GetPostgreSQLVersions } from './postgresql/PostgreSQL.ts';
import { Redis, GetRedisVersions } from './redis/Redis.ts';
import { Scylla, GetScyllaVersions } from './scylla/Scylla.ts';
import { ScyllaManager, GetScyllaManagerVersions } from './scylla-manager/ScyllaManager.ts';
import { ScyllaOperator, GetScyllaOperatorVersions } from './scylla-operator/ScyllaOperator.ts';

export const DatabaseVersions = HashMap.fromIterable([
  ['cnpg', GetCNPGVersions],
  ['mongodb', GetMongoDBVersions],
  ['mongodb-operator', GetMongoDBOperatorVersions],
  ['postgresql', GetPostgreSQLVersions],
  ['redis', GetRedisVersions],
  ['scylla', GetScyllaVersions],
  ['scylla-manager', GetScyllaManagerVersions],
  ['scylla-operator', GetScyllaOperatorVersions]
]);

export const DatabaseContainers = HashMap.fromIterable([
  ['cnpg', CloudNativePG],
  ['mongodb', MongoDB],
  ['mongodb-operator', MongoDBOperator],
  ['postgresql', PostgreSQL],
  ['redis', Redis],
  ['scylla', Scylla],
  ['scylla-manager', ScyllaManager],
  ['scylla-operator', ScyllaOperator]
]);
