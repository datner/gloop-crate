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
import { Chunk, Distro } from 'container-fluid/Distro.ts';
import { Versions } from 'container-fluid/Versions.ts';
import { ResolveVersionsErr } from 'container-fluid/versions/ScrapedVersion.ts';

const commonPackages = ['ca-certificates', 'openssl', 'tzdata', 'gnupg', 'curl', 'findutils', 'fontconfig'];

// TODO: additional language packs, on demand ?
const rhelBasePackages = ['rpm', 'cpio', 'glibc-langpack-en', 'nss', 'nss_wrapper', ...commonPackages];

const basePackages = HashMap.fromIterable<Distro, string[]>([
  ['alpine', ['alpine-conf', 'musl', 'musl-utils', 'musl-locales', 'musl-locales-lang', 'nss', 'nss_wrapper', ...commonPackages]],
  ['debian', ['locales', 'locales-all', 'apt-utils', 'debsecan', 'lsb-release', 'libnss3', 'libnss3-dev', 'libnss3-tools', ...commonPackages]],
  ['rocky', rhelBasePackages],
  ['photon', ['ca-certificates-pki', 'openssl-c_rehash', 'findutils', 'nss', 'nss-devel', 'nss-libs', ...commonPackages]],
  ['notora', rhelBasePackages],
  ['ubi', rhelBasePackages]
]);

export const SecurityUpdateStep = (distro: Distro, timestamp: number) =>
  Cont.Step({
    env: new Map([['TIMESTAMP', timestamp.toString()]]),
    cleanupEnv: ['TIMESTAMP'],
    commands: [
      Cont.Command({
        withCache: true,
        withCleanup: true,
        run: Chunk(distro, 'SecurityUpdate', { distro }) as A.NonEmptyArray<string>
      })
    ]
  });

const normalizeDistroName = (distro: Distro): string => distro.replace('notora', 'oracle');

export const Base = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    Versions,
    Ef.flatMap((versions) => versions.getVersions(distro)),
    Ef.flatMap(Cont.versionToUse(distro, version)),
    ResolveVersionsErr.wrapAnyError(distro),
    Ef.map((version) =>
      Cont.Container({
        org: '',
        name: distro,
        distro,
        tags: [`${org}/${distro}:${version}`],
        layers: [
          Cont.Layer({
            name: 'base',
            from: `${normalizeDistroName(distro)}:${version}`,
            prepCache: true,
            steps: [
              Cont.Step({
                env: new Map([
                  ['LANG', 'en_US'],
                  ['LANGUAGE', 'en_US'],
                  ['LC_ALL', 'en_US'],
                  ['TZ', 'UTC']
                ]),
                commands: [
                  Cont.Command({
                    withCache: true,
                    withCleanup: true,
                    withUpdate: true,
                    packages: F.pipe(basePackages, HashMap.get(distro), O.getOrNull) as A.NonEmptyArray<string>,
                    run: Chunk(distro, 'BasePrep', { distro }) as A.NonEmptyArray<string>
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
