/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { Dragonfly, GetDragonFlyVersions } from './dragonfly/Dragonfly.ts';
import { Harbor, GetHarborVersions } from './harbor/Harbor.ts';
import { Reposilite, GetReposiliteVersions } from './reposilite/Reposilite.ts';
import { Verdaccio, GetVerdaccioVersions } from './verdaccio/Verdaccio.ts';

export const ArtifactVersions = HashMap.fromIterable([
  ['dragonfly', GetDragonFlyVersions],
  ['harbor', GetHarborVersions],
  ['reposilite', GetReposiliteVersions],
  ['verdaccio', GetVerdaccioVersions]
]);

export const ArtifactsContainers = HashMap.fromIterable([
  ['dragonfly', Dragonfly],
  ['harbor', Harbor],
  ['reposilite', Reposilite],
  ['verdaccio', Verdaccio]
]);
