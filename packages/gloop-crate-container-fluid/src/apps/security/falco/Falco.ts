/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

// import * as F from 'effect/Function';
// import * as Ef from 'effect/Effect';
// import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
// import * as ConfigError from 'effect/ConfigError';

import { GetGithubVersions } from 'container-fluid/versions/GitVersion.ts';

import { Distro } from 'container-fluid/Distro.ts';
import { GolangApp } from 'container-fluid/languages/Golang.ts';

export const GetFalcoVersions = GetGithubVersions('falco', 'falcosecurity', 'falco');

export const Falco = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetFalcoVersions,
    org,
    distro,
    'falco',
    'falcosecurity',
    'falco',
    timestamp,
    [
      'mkdir build',
      'cd build',
      'cmake -DUSE_BUNDLED_DEPS=ON -DFALCOSECURITY_LIBS_SOURCE_DIR=/builder/src/libs -DBUILD_BPF=ON -DCMAKE_INSTALL_PREFIX=/builder/falco -DCMAKE_BUILD_TYPE=Release ..',
      'make',
      'make DESTDIR=/builder/falco install'
    ],
    version
  );
