/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as HashMap from 'effect/HashMap';
// import * as ConfigError from 'effect/ConfigError';

import { GetGithubVersions } from 'container-fluid/versions/GitVersion.ts';
import { Distro } from 'container-fluid/Distro.ts';
import * as Cont from 'container-fluid/Container.ts';

export const GetGraalPyVersions = GetGithubVersions('graalpython', 'oracle', 'graalpython', 'graal-');

const graalPyBootstrapPackages = HashMap.fromIterable<Distro, A.NonEmptyArray<string>>([
  ['alpine', ['go']],
  ['debian', ['go']],
  ['rocky', ['go']],
  ['photon', ['go']],
  ['notora', ['go']],
  ['ubi', ['go']]
]);

export const GraalPy = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    GetGraalPyVersions,
    Cont.versionToUse(distro, version),
    Ef.map((version) =>
      Cont.Container({
        org,
        name: `graalpython-${distro}`,
        distro,
        tags: [`${org}/graalpython-${distro}:${version}`],
        layers: [
          Cont.Layer({
            name: 'bootstrap',
            from: `${org}/${distro}-build:${version}`,
            prepCache: true,
            steps: [
              Cont.Step({
                commands: [
                  Cont.Command({
                    withCache: true,
                    withCleanup: true,
                    withUpdate: true,
                    packages: F.pipe(graalPyBootstrapPackages, HashMap.get(distro), O.getOrNull) as A.NonEmptyArray<string>,
                    run: ['echo installing']
                  })
                ]
              })
            ]
          })
        ]
      })
    )
  );
