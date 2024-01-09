/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { OpenVSCodeServer, GetOpenVSCodeServerVersions } from './openvscode-server/OpenVSCodeServer.ts';

export const DevelopmentVersions = HashMap.fromIterable([['openvscode-server', GetOpenVSCodeServerVersions]]);

export const DevelopmentContainers = HashMap.fromIterable([['openvscode-server', OpenVSCodeServer]]);
