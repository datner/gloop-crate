/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { OnCall, GetOncallVersions } from './oncall/Oncall.ts';

export const ItsmVersions = HashMap.fromIterable([['oncall', GetOncallVersions]]);

export const ItsmContainers = HashMap.fromIterable([['oncall', OnCall]]);
