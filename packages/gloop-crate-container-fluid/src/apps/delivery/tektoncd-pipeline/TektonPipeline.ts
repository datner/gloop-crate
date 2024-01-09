/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
// import * as ConfigError from 'effect/ConfigError';

import { GetGithubVersions } from '../../../versions/GitVersion.ts';

import { CloneRepoChunk, Distro } from '../../../Distro.ts';
import * as Cont from '../../../Container.ts';

export const GetTektonCDPipelineVersions = GetGithubVersions('TektonCD Pipeline', 'tektoncd', 'pipeline');

export const TektonCDPipeline = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    GetTektonCDPipelineVersions,
    Cont.versionToUse(distro, version),
    Ef.map((version) =>
      Cont.Container({
        org,
        name: distro,
        distro,
        tags: [`${org}/scylladb:${version}`],
        dependencies: [`${org}/${distro}-build:${version}`],
        layers: [
          Cont.Layer({
            name: 'build',
            from: `${org}/${distro}-build:${version}`,
            prepCache: true,
            steps: [
              Cont.Step({
                args: new Map([
                  ['BUILDER_UID', '1000'],
                  ['BUILDER_GID', '1000']
                ]),
                commands: [
                  Cont.Command({
                    withCache: true,
                    withCleanup: true,
                    withUpdate: true,
                    withLanguageCache: [
                      '--mount=type=cache,target=/builder/go,uid=${BUILDER_UID},gid=${BUILDER_GID}',
                      '--mount=type=cache,target=/builder/src,uid=${BUILDER_UID},gid=${BUILDER_GID}'
                    ],
                    run: F.pipe(
                      CloneRepoChunk({ name: 'tektoncd-pipeline', git: 'https://github.com/tektoncd/pipeline', version: `v${version}` }),
                      A.appendAll([`cd /builder/src/tektoncd-pipeline`, `mv bin/tektoncd-pipeline /builder/tektoncd-pipeline/bin`])
                    ) as A.NonEmptyArray<string>
                  })
                ]
              })
            ]
          })
        ]
      })
    )
  );