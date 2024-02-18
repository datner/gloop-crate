/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as HashMap from 'effect/HashMap';

import * as Cont from 'container-fluid/Container.ts';
import { Distro } from 'container-fluid/Distro.ts';
import { SecurityUpdateStep } from 'container-fluid/containers/DistroBase.ts';
import { ResolveVersionsErr } from 'container-fluid/versions/ScrapedVersion.ts';
import { Versions } from 'container-fluid/Versions.ts';

const commonPackages = [
  'autoconf',
  'automake',
  'gettext',
  'libtool',
  'gcc',
  'llvm',
  'make',
  'patch',
  'cmake',
  'binutils',
  'patchutils',
  'elfutils',
  'bison',
  'flex',
  'git',
  'zip',
  'jq'
];

const rhelBuild: A.NonEmptyArray<string> = ['gcc-c++', 'pkgconf', ...commonPackages];

const buildPackages = HashMap.fromIterable<Distro, A.NonEmptyArray<string>>([
  ['alpine', ['alpine-sdk', 'pkgconf']],
  ['debian', ['build-essential', 'dh-autoreconf', 'pkg-config']],
  ['rocky', rhelBuild],
  ['notora', rhelBuild],
  ['photon', ['build-essential', 'pkg-config']],
  ['ubi', rhelBuild]
]);

export const Build = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    Versions,
    Ef.flatMap((versions) => versions.getVersions(distro)),
    ResolveVersionsErr.wrapAnyError(distro),
    Ef.flatMap(Cont.versionToUse(distro, version)),
    Ef.map((version) =>
      Cont.Container({
        org,
        name: `${distro}-build`,
        distro,
        tags: [`${org}/${distro}-build:${version}`],
        dependencies: [`${org}/${distro}:${version}`],
        layers: [
          Cont.Layer({
            name: 'build',
            from: `${org}/${distro}:${version}`,
            steps: [
              Cont.Step({
                commands: [
                  Cont.Command({
                    withUpdate: true,
                    withCache: true,
                    withCleanup: true,
                    packages: F.pipe(buildPackages, HashMap.get(distro), O.getOrNull) as A.NonEmptyArray<string>,
                    run: ['echo Installed build packages...']
                  })
                ]
              }),
              SecurityUpdateStep(distro, timestamp)
            ]
          })
        ]
      })
    )
  );
