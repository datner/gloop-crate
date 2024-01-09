/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as HashMap from 'effect/HashMap';

import { GetGithubVersions } from '../versions/GitVersion.ts';
import { SecurityUpdateStep } from '../containers/DistroBase.ts';

import * as Cont from '../Container.ts';
import { CloneRepoChunk, Distro } from '../Distro.ts';
import { HttpService } from '../Http.ts';
import { ResolveVersionsErr } from '../versions/ScrapedVersion.ts';

const golangBootstrapPackages = HashMap.fromIterable<Distro, A.NonEmptyArray<string>>([
  ['alpine', ['go']],
  ['debian', ['go']],
  ['rocky', ['go']],
  ['photon', ['go']],
  ['notora', ['go']],
  ['ubi', ['go']]
]);

export const GetGolangVersions = GetGithubVersions('golang', 'golang', 'go', 'go');

export const Golang = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    GetGolangVersions,
    Cont.versionToUse(distro, version),
    Ef.map((version) =>
      Cont.Container({
        org,
        name: `golang-${distro}`,
        distro,
        tags: [`${org}/golang-${distro}:${version}`],
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
                    packages: F.pipe(golangBootstrapPackages, HashMap.get(distro), O.getOrNull) as A.NonEmptyArray<string>,
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

export const LangCache: A.NonEmptyArray<string> = [
  '--mount=type=cache,id=builder-gobuild-cache-${TARGETARCH},target=/builder/.cache/go-build,uid=${BUILDER_UID},gid=${BUILDER_UID},sharing=locked',
  '--mount=type=cache,id=builder-gopath-${TARGETARCH},target=/builder/go,uid=${BUILDER_UID},gid=${BUILDER_GID},sharing=locked'
];

export const GoInstall = 'go install';

export const GoBuild = 'go build';

export const GolangApp = (
  versions: Ef.Effect<string[], ResolveVersionsErr, HttpService>,
  org: string,
  distro: Distro,
  name: string,
  gitOrg: string,
  gitRepo: string,
  timestamp: number,
  commands: string[],
  targetVersion: O.Option<string> = O.some('latest')
) =>
  F.pipe(
    versions,
    Cont.versionToUse(distro, targetVersion),
    Ef.map((version) =>
      Cont.Container({
        org,
        name: distro,
        distro,
        tags: [`${org}/${name}-${distro}:${version}`],
        dependencies: [`${org}/golang-${distro}:${version}`],
        layers: [
          Cont.Layer({
            name: 'build',
            from: `${org}/golang-${distro}:${version}`,
            prepCache: true,
            steps: [
              SecurityUpdateStep(distro, timestamp),
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
                    withLanguageCache: F.pipe(
                      LangCache,
                      A.appendAll([`--mount=type=cache,id=builder-${name}-src,target=/builder/src,uid=$\{BUILDER_UID},gid=$\{BUILDER_GID},sharing=locked`])
                    ),
                    run: F.pipe(
                      CloneRepoChunk({ name, git: `https://github.com/${gitOrg}/${gitRepo}`, version: `v${version}` }),
                      A.appendAll(commands)
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
