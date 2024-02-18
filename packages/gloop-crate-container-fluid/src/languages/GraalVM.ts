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

import { GitVersionsReq, GitVersionsResolver } from 'container-fluid/versions/GitVersion.ts';
import { SemanticVersion } from 'container-fluid/versions/SemanticVersion.ts';

import { Distro } from 'container-fluid/Distro.ts';
import * as Cont from 'container-fluid/Container.ts';
import { JDKVersion } from 'container-fluid/languages/JDK.ts';

export const GetGraalVMVersions = F.pipe(
  GitVersionsResolver,
  Ef.flatMap((resolver) => Ef.request(new GitVersionsReq({ name: `graalvm jdk-${JDKVersion}`, repo: 'graalvm-ce-builds', org: 'graalvm' }), resolver)),
  Ef.withRequestCaching(true),
  Ef.map(
    F.flow(
      A.filter((v) => /^jdk-[\d.]+$/.test(v)),
      A.filter((v: string) => v.includes(`jdk-${JDKVersion}.`)),
      A.map((v) => v.replace('jdk-', '')),
      A.map(SemanticVersion.parseString),
      A.sortBy(SemanticVersion.Order),
      A.map((v: SemanticVersion) => v.version)
    )
  )
);

const graalvmBootstrapPackages = HashMap.fromIterable<Distro, A.NonEmptyArray<string>>([
  ['alpine', ['go']],
  ['debian', ['go']],
  ['rocky', ['go']],
  ['photon', ['go']],
  ['notora', ['go']],
  ['ubi', ['go']]
]);

export const GraalVM = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    GetGraalVMVersions,
    Cont.versionToUse(distro, version),
    Ef.map((version) =>
      Cont.Container({
        org,
        name: `graalvm-ce-${distro}`,
        distro,
        tags: [`${org}/graalvm-ce-${distro}:${version}`],
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
                    packages: F.pipe(graalvmBootstrapPackages, HashMap.get(distro), O.getOrNull) as A.NonEmptyArray<string>,
                    run: [`echo installing ${version}`]
                  })
                ]
              })
            ]
          })
        ]
      })
    )
  );
