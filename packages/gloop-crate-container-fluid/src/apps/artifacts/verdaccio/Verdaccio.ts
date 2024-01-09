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

export const GetVerdaccioVersions = GetGithubVersions('Verdaccio', 'verdaccio', 'verdaccio');

export const Verdaccio = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    GetVerdaccioVersions,
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
                  ['KEDA_VERSION', version],
                  ['CONTROLLER_GEN_VERSION', '']
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
                    // packages: kedaPackages.get(distro) as A.NonEmptyArray<string>,
                    run: F.pipe(
                      CloneRepoChunk({ name: 'keda', git: 'https://github.com/verdaccio/verdaccio', version: `v${version}` }),
                      A.appendAll([
                        `cd /builder/src/keda`,
                        `go install -v github.com/golang/mock/mockgen@v\${MOCKGEN_VERSION}`,
                        `go install -v sigs.k8s.io/controller-tools/cmd/controller-gen@v\${CONTROLLER_GEN_VERSION}`,
                        'cp /builder/go/bin/mockgen bin/',
                        'cp /builder/go/bin/controller-gen bin/',
                        'make controller-gen',
                        'bin/mockgen -destination=pkg/mock/mock_scaling/mock_interface.go -package=mock_scaling -source=pkg/scaling/scale_handler.go',
                        'bin/mockgen -destination=pkg/mock/mock_scaler/mock_scaler.go -package=mock_scalers -source=pkg/scalers/scaler.go',
                        `go build -o bin/keda main.go`,
                        `go build -o bin/keda-adapter adapter/main.go`,
                        'mkdir -p /builder/keda/bin',
                        `mv bin/keda /builder/keda/bin`,
                        `mv bin/keda-adapter /builder/keda/bin`
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
