/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { Dragonfly, GetDragonFlyVersions } from 'container-fluid/apps/artifacts/dragonfly/Dragonfly.ts';
import { Harbor, GetHarborVersions } from 'container-fluid/apps/artifacts/harbor/Harbor.ts';
import { Reposilite, GetReposiliteVersions } from 'container-fluid/apps/artifacts/reposilite/Reposilite.ts';
import { Verdaccio, GetVerdaccioVersions } from 'container-fluid/apps/artifacts/verdaccio/Verdaccio.ts';

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
