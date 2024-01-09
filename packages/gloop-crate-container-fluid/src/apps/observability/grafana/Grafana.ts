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

import { GetGithubVersions } from '../../../versions/GitVersion.ts';

import * as Cont from '../../../Container.ts';
import { CloneRepoChunk, Distro } from '../../../Distro.ts';
import { LangCache } from '../../../languages/Golang.ts';

export const GetGrafanaVersions = GetGithubVersions('Grafana', 'grafana', 'grafana');

const grafanaPackages = HashMap.fromIterable<Distro, A.NonEmptyArray<string>>([
  ['alpine', ['go']],
  ['debian', ['go']],
  ['rocky', ['go']],
  ['photon', ['go']],
  ['notora', ['go']],
  ['ubi', ['go']]
]);

export const Grafana = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    GetGrafanaVersions,
    Cont.versionToUse(distro, version),
    Ef.map((version) =>
      Cont.Container({
        org,
        name: distro,
        distro,
        tags: [`${org}/keda:${version}`],
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
                  ['BINGO_VERSION', 'latest']
                ]),
                commands: [
                  Cont.Command({
                    withCache: true,
                    withCleanup: true,
                    withUpdate: true,
                    withLanguageCache: F.pipe(
                      LangCache,
                      A.appendAll(['--mount=type=cache,id=builder-grafana-src,target=/builder/src,uid=${BUILDER_UID},gid=${BUILDER_GID},sharing=locked'])
                    ),
                    packages: F.pipe(grafanaPackages, HashMap.get(distro), O.getOrNull) as A.NonEmptyArray<string>,
                    run: F.pipe(
                      CloneRepoChunk({ name: 'grafana', git: 'https://github.com/grafana/grafana', version: `v${version}` }),
                      A.appendAll([
                        `git checkout v${version}`,
                        'npm install -g yarn',
                        'yarn',
                        'NODE_ENV=production yarn build',
                        'go mod download',
                        `go install github.com/bwplotka/bingo@\${BINGO_VERSION}`,
                        `\${GOPATH}/bin/bingo get -v`,
                        'make build-go GO_BUILD_TAGS=oss WIRE_TAGS=oss',
                        'mkdir -p /builder/grafana/bin',
                        'cp /builder/src/grafana/bin/linux-amd64/grafana* /builder/grafana/bin',
                        'cp -r /builder/src/grafana/conf /builder/grafana/conf',
                        'cp -r /builder/src/grafana/public /builder/grafana/public'
                      ])
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
