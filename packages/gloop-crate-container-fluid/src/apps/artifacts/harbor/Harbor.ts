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
import { GetDragonFlyVersions } from '../dragonfly/Dragonfly.ts';

export const GetHarborVersions = GetGithubVersions('harbor', 'goharbor', 'harbor');

const harborPackages = HashMap.fromIterable<Distro, A.NonEmptyArray<string>>([
  // ['Alpine', ['go']],
  // ['Debian', ['go']],
  // ['Photon', ['go']],
  // ['Oracle', ['go']],
  // ['Rocky', ['go']],
  // ['UBI', ['go']]
]);

export const Harbor = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    GetDragonFlyVersions,
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
                  ['HARBOR_VERSION', version],
                  ['SWAGGER_VERSION', '0.30.5'],
                  ['SERVER_VERSION', '2.0']
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
                    packages: F.pipe(harborPackages, HashMap.get(distro), O.getOrNull) as A.NonEmptyArray<string>,
                    run: F.pipe(
                      CloneRepoChunk({ name: 'harbor', git: 'https://github.com/goharbor/harbor', version: `v${version}` }),
                      A.appendAll([
                        `cd /builder/src/harbor`,
                        'go get -u github.com/go-openapi/errors',
                        'go get -u github.com/go-openapi/validate',
                        'go mod tidy',
                        'go mod vendor',
                        'go install -v github.com/go-swagger/go-swagger/cmd/swagger@v${SWAGGER_VERSION}',
                        `/builder/go/bin/swagger generate server \
    --template-dir=tools/swagger/templates \
    --spec=api/v2.0/swagger.yaml  \
    --exclude-main \
    --additional-initialism=CVE \
    --additional-initialism=GC \
    --additional-initialism=OIDC \
    --name=harbor \
    --target=src/server/v\${SERVER_VERSION}`,
                        'go install ./registryctl',
                        'go install ./jobservice',
                        'go install ./cmd/exporter',
                        'go install ./cmd/migrate-patch',
                        'go install ./cmd/standalone-db-migrator',
                        'go install ./core',
                        'mkdir -p /builder/harbor/bin',
                        `mv \${GOPATH}/bin/registryctl /builder/harbor/bin`,
                        `mv \${GOPATH}/bin/jobservice /builder/harbor/bin`,
                        `mv \${GOPATH}/bin/exporter /builder/harbor/bin/harbor-exporter`,
                        `mv \${GOPATH}/bin/migrate-patch /builder/harbor/bin/harbor-migrate-patch`,
                        `mv \${GOPATH}/bin/standalone-db-migrator /builder/harbor/bin`,
                        `mv \${GOPATH}/bin/core /builder/harbor/bin/harbor`
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
