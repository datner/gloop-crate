/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

// import * as Ef from 'effect/Effect';
import * as HashMap from 'effect/HashMap';

import { Velero, GetVeleroVersions } from './velero/Velero.ts';

export const BackupsVersions = HashMap.fromIterable([['velero', GetVeleroVersions]]);

export const BackupsContainers = HashMap.fromIterable([['velero', Velero]]);
