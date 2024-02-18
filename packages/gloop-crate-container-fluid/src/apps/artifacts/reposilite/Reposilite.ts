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
import { CloneRepoChunk, Distro } from 'container-fluid/Distro.ts';
import * as Cont from '../../../Container.ts';
import { CopyFromTo } from '../../../containers/BuildStep.ts';

export const GetReposiliteVersions = GetGithubVersions('Reposilite', 'dzikoysk', 'reposilite');

const reposilitePackages = HashMap.fromIterable<Distro, A.NonEmptyArray<string>>([
  // ['Alpine', ['go']],
  // ['Debian', ['go']],
  // ['Photon', ['go']],
  // ['Oracle', ['go']],
  // ['Rocky', ['go']],
  // ['UBI', ['go']]
]);

export const Reposilite = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    GetReposiliteVersions,
    Cont.versionToUse(distro, version),
    Ef.map((version) =>
      Cont.Container({
        org,
        name: distro,
        distro,
        tags: [`${org}/golang:${version}`],
        dependencies: [`${org}/golang:${version}`],
        layers: [
          Cont.Layer({
            name: 'build',
            from: `${org}/golang:${version}`,
            prepCache: true,
            steps: [
              Cont.Step({
                args: new Map([
                  ['BUILDER_UID', '1000'],
                  ['BUILDER_GID', '1000'],
                  ['REPOSILITE_VERSION', version],
                  ['NODE_VERSION', '21.2.0']
                ]),
                copy: [
                  {
                    from: 'build.gradle.kts',
                    to: '/builder/build.gradle.kts',
                    layer: O.none()
                  }
                ] as A.NonEmptyArray<CopyFromTo>,
                commands: [
                  Cont.Command({
                    withCache: true,
                    withCleanup: true,
                    withUpdate: true,
                    withLanguageCache: [
                      '--mount=type=cache,target=/builder/go,uid=${BUILDER_UID},gid=${BUILDER_GID}',
                      '--mount=type=cache,target=/builder/src,uid=${BUILDER_UID},gid=${BUILDER_GID}',
                      '--mount=type=cache,target=/builder/.gradle,uid=${BUILDER_UID},gid=${BUILDER_UID}',
                      '--mount=type=cache,target=/builder/.ivy2,uid=${BUILDER_UID},gid=${BUILDER_UID}',
                      '--mount=type=cache,target=/builder/.cache,uid=${BUILDER_UID},gid=${BUILDER_UID}'
                    ],
                    packages: F.pipe(reposilitePackages, HashMap.get(distro), O.getOrNull) as A.NonEmptyArray<string>,
                    run: F.pipe(
                      CloneRepoChunk({ name: 'reposilite', git: 'https://github.com/dzikoysk/reposilite', version: `v${version}` }),
                      A.appendAll([
                        `cd /builder/src/reposilite`,
                        'cp -f  /builder/build.gradle.kts /builder/src/reposilite/reposilite-backend',
                        "sed -i 's|download.set(true)|download.set(false)|g' ./reposilite-frontend/build.gradle.kts",
                        `sed -i 's|version.set("18.16.1")|version.set("\${NODE_VERSION}")|g' ./reposilite-frontend/build.gradle.kts`,
                        './gradlew :reposilite-backend:jar',
                        'mkdir -p /builder/reposilite/bin',
                        'mkdir -p /builder/reposilite/data',
                        'mkdir -p /builder/reposilite/log',
                        `cp reposilite-backend/build/libs/reposilite-3*.jar /builder/reposilite/bin`
                      ])
                    )
                  })
                ]
              })
            ]
          })
        ]
      })
    )
  );
