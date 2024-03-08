/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as S from '@effect/schema/Schema';
import * as St from 'effect/Stream';
import * as O from 'effect/Option';
// import * as Ctx from 'effect/Context';

import * as RequestResolver from 'effect/RequestResolver';
import { PrimaryKey, symbol as PK } from 'effect/PrimaryKey';

import { Repo } from 'packages/apt/Repo.ts';
import { ClientError } from 'packages/apt/Client.ts';
import { GZipStreamClient, GZipStreamClientLive } from 'packages/Gzip.js';

export type DebianArch = 'amd64' | 'armel' | 'armhf' | 'i386' | 'mips64el' | 'mipsel' | 'ppc64el' | 's390x' | 'all';

export const DebianArch: S.Schema<DebianArch> = S.literal('amd64', 'armel', 'armhf', 'i386', 'mips64el', 'mipsel', 'ppc64el', 's390x', 'all');

export class BinariesRequest
  extends S.TaggedRequest<BinariesRequest>()('ContentsAllRequest', ClientError, S.array(S.string), {
    repo: Repo,
    arch: S.option(DebianArch)
  })
  implements PrimaryKey
{
  toString() {
    return this.repo.toString();
  }

  [PK]() {
    return this.repo.toString();
  }
}

export const BinariesResolver = RequestResolver.fromEffect((req: BinariesRequest) =>
  F.pipe(
    GZipStreamClient,
    St.provideService(GZipStreamClient, GZipStreamClientLive),
    St.flatMap((client) =>
      F.pipe(
        req.arch,
        O.getOrElse(() => 'all'),
        (arch) => client.read(`${req.repo.uri}/debian/dists/${req.repo.release}/${F.pipe(req.repo.components, A.join('/'))}/binary-${arch}/Packages.gz`)
      )
    ),
    St.mapError(ClientError.fromErr),
    St.runCollect,
    Ef.map(A.fromIterable)
  )
);
