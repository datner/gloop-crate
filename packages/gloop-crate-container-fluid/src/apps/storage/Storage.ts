/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { Minio, GetMinioVersions } from './minio/MInio.ts';
import { MinioOperator, GetMinioOperatorVersions } from './minio-operator/MInioOperator.ts';
import { Rook, GetRookVersions } from './rook/Rook.ts';

export const StorageVersions = HashMap.fromIterable([
  ['minio', GetMinioVersions],
  ['minio-operator', GetMinioOperatorVersions],
  ['rook', GetRookVersions]
]);

export const StorageContainers = HashMap.fromIterable([
  ['minio', Minio],
  ['minio-operator', MinioOperator],
  ['rook', Rook]
]);
