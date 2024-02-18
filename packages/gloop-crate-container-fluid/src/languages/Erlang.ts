/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as HashMap from 'effect/HashMap';

import { GetGithubVersions } from 'container-fluid/versions/GitVersion.ts';

import * as Cont from 'container-fluid/Container.ts';
import { Distro } from 'container-fluid/Distro.ts';
import { ResolveVersionsErr } from 'container-fluid/versions/ScrapedVersion.ts';

export const GetErlangVersions = GetGithubVersions('erlang', 'erlang', 'otp', 'OTP-');

const erlangBootstrapPackages = HashMap.fromIterable<Distro, A.NonEmptyArray<string>>([
  ['alpine', ['go']],
  ['debian', ['go']],
  ['rocky', ['go']],
  ['photon', ['go']],
  ['notora', ['go']],
  ['ubi', ['go']]
]);

export const Erlang = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    GetErlangVersions,
    Cont.versionToUse(distro, version),
    ResolveVersionsErr.wrapAnyError(distro),
    Ef.map((version) =>
      Cont.Container({
        org,
        name: `erlang-${distro}`,
        distro,
        tags: [`${org}/erlang-${distro}:${version}`],
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
                    packages: F.pipe(erlangBootstrapPackages, HashMap.get(distro), O.getOrNull) as A.NonEmptyArray<string>,
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
