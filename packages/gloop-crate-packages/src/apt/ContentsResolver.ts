/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as S from '@effect/schema/Schema';
import * as Str from 'effect/String';
import * as St from 'effect/Stream';
import * as Ch from 'effect/Chunk';
import * as O from 'effect/Option';
// import * as Ctx from 'effect/Context';

import * as RequestResolver from 'effect/RequestResolver';
import { PrimaryKey, symbol as PK } from 'effect/PrimaryKey';

import { Repo } from 'packages/apt/Repo.ts';
import { ClientError } from 'packages/apt/Client.ts';
import { GZipStreamClient, GZipStreamClientLive } from 'packages/Gzip.js';

export class ContentsRequest
  extends S.TaggedRequest<ContentsRequest>()('ContentsRequest', ClientError, S.array(S.string), {
    repo: Repo,
    limit: S.option(S.number),
    start: S.option(S.string)
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

export const ContentsResolver = RequestResolver.fromEffect((req: ContentsRequest) => {
  console.error(`${req.repo.uri}/debian/dists/${req.repo.release}/${F.pipe(req.repo.components, A.join('/'))}/Contents-all.gz`);
  return F.pipe(
    GZipStreamClient,
    St.provideService(GZipStreamClient, GZipStreamClientLive),
    St.flatMap((client) =>
      F.pipe(
        client.read(`${req.repo.uri}/debian/dists/${req.repo.release}/${F.pipe(req.repo.components, A.join('/'))}/Contents-all.gz`),
        St.mapChunks(
          F.flow(
            A.fromIterable<string>,
            A.map(F.flow(Str.split(' '), A.filter(Str.isNonEmpty), A.last, O.getOrThrow)),
            A.dedupe,
            A.map(F.flow(Str.split('/'), A.last, O.getOrThrow)),
            Ch.fromIterable<string>
          )
        )
      )
    ),
    (st) => (O.isSome(req.start) ? St.dropUntil<string>((r) => r === O.getOrThrow(req.start))(st) : st),
    (st) => (O.isSome(req.limit) ? St.take(O.getOrThrow(req.limit))(st) : st),
    St.mapError(ClientError.fromErr),
    St.runCollect,
    Ef.map(A.fromIterable)
  );
});
