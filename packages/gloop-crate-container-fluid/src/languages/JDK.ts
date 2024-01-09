/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as Order from 'effect/Order';
import * as HashMap from 'effect/HashMap';
// import * as ConfigError from 'effect/ConfigError';

import { ScrapeVersionsReq, ScrapeVersionsResolver } from '../versions/ScrapedVersion.ts';

import { Distro } from '../Distro.ts';
import * as Cont from '../Container.ts';

export const JDKVersion = 21;

export const GetJDKVersions = F.pipe(
  Ef.request(
    new ScrapeVersionsReq({
      name: `temurin jdk-${JDKVersion}`,
      link: `https://github.com/adoptium/temurin${JDKVersion}-binaries/releases`,
      selector: 'a.Link.Link--muted span.wb-break-all'
    }),
    ScrapeVersionsResolver
  ),
  Ef.withRequestCaching(true),
  Ef.map(
    F.flow(
      A.map((s) => s.trim()),
      A.filter((r) => /^jdk-[\d.+]+$/.test(r)),
      A.map((v) => v.replace('jdk-', '')),
      A.sortBy(Order.string)
    )
  )
);

const jdkBootstrapPackages = HashMap.fromIterable<Distro, A.NonEmptyArray<string>>([
  ['alpine', ['go']],
  ['debian', ['go']],
  ['rocky', ['go']],
  ['photon', ['go']],
  ['notora', ['go']],
  ['ubi', ['go']]
]);

export const JDK = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    GetJDKVersions,
    Cont.versionToUse(distro, version),
    Ef.map((version) =>
      Cont.Container({
        org,
        name: `temurin-jdk${JDKVersion}-${distro}`,
        distro,
        tags: [`${org}/temurin-jdk${JDKVersion}-${distro}:${version}`],
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
                    packages: F.pipe(jdkBootstrapPackages, HashMap.get(distro), O.getOrNull) as A.NonEmptyArray<string>,
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
