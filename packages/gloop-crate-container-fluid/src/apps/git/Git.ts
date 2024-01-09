/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { Gitea, GetGiteaVersions } from './gitea/Gitea.ts';
import { Gitlab, GetGitlabVersions } from './gitlab/Gitlab.ts';

export const GitVersions = HashMap.fromIterable([
  ['gitea', GetGiteaVersions],
  ['gitlab', GetGitlabVersions]
]);

export const GitContainers = HashMap.fromIterable([
  ['gitea', Gitea],
  ['gitlab', Gitlab]
]);
