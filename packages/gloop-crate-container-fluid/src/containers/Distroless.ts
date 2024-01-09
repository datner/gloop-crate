/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';

import * as Cont from '../Container.ts';
import { Distro } from '../Distro.ts';
import { Versions } from '../Versions.ts';
import { ResolveVersionsErr } from '../versions/ScrapedVersion.ts';

const commonPackages = ['ca-certificates', 'openssl', 'tzdata'];

const rhelDistroless = ['setup', 'glibc-devel', 'libgcc', 'libgomp', ...commonPackages];

const distrolessPackages = new Map<Distro, string[]>([
  ['alpine', ['musl-utils', ...commonPackages]],
  ['debian', ['libtinfo6', 'libc6', 'libgcc-s1', 'netbase', 'base-passwd', 'libcc1-0', 'libgomp1', ...commonPackages]],
  ['rocky', rhelDistroless],
  ['photon', []],
  ['notora', rhelDistroless],
  ['ubi', rhelDistroless]
]);

export const Distroless = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    Versions,
    Ef.flatMap((versions) => versions.getVersions(distro)),
    ResolveVersionsErr.wrapAnyError(distro),
    Ef.flatMap(Cont.versionToUse(distro, version)),
    Ef.map((version) =>
      Cont.Container({
        org,
        name: `${distro}-distroless`,
        distro,
        tags: [`${org}/${distro}-distroless:${version}`],
        dependencies: [`${org}/${distro}-build:${version}`, `${org}/${distro}:${version}`],
        layers: [
          Cont.Layer({
            name: 'distroless',
            from: `${org}/${distro}-build:${version}`,
            steps: [
              Cont.Step({
                commands: [
                  Cont.Command({
                    withUpdate: true,
                    withCache: true,
                    withCleanup: true,
                    withDownload: true,
                    packages: distrolessPackages.get(distro)! as A.NonEmptyArray<string>,
                    run: ['']
                  })
                ]
              })
            ]
          })
        ]
      })
    )
  );
