/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as Str from 'effect/String';
import * as S from '@effect/schema/Schema';
import * as St from 'effect/Stream';
import * as Chunk from 'effect/Chunk';
import * as HashMap from 'effect/HashMap';
// import * as Ctx from 'effect/Context';

import * as RequestResolver from 'effect/RequestResolver';
import { PrimaryKey, symbol as PK } from 'effect/PrimaryKey';

import { Repo } from 'packages/apt/Repo.ts';
import { ClientError } from 'packages/apt/Client.ts';
import { GZipStreamClient, GZipStreamClientLive } from 'packages/Gzip.js';

import { Dependency } from 'packages/apt/Dependency.js';
import { splitAtFirst } from 'packages/Util.js';

export type DebianArch = 'amd64' | 'armel' | 'armhf' | 'i386' | 'mips64el' | 'mipsel' | 'ppc64el' | 's390x' | 'all';

export const DebianArch: S.Schema<DebianArch> = S.literal('amd64', 'armel', 'armhf', 'i386', 'mips64el', 'mipsel', 'ppc64el', 's390x', 'all');

export class Package extends S.Class<Package>()({
  name: S.string,
  version: S.string,
  arch: DebianArch,
  dependencies: S.array(Dependency)
}) {
  static toReplace = [];

  static from(strs: string[]) {
    return F.pipe(
      strs,
      A.filter(Str.isNonEmpty),
      A.map(splitAtFirst(':')),
      A.filter(([k]) => A.contains(k)(['Package', 'Version', 'Architecture', 'Depends', 'Pre-Depends'])),
      (kv) => HashMap.fromIterable(kv as Iterable<[string, string]>),
      (m) =>
        F.pipe(
          O.Do,
          O.bind('name', () => HashMap.get('Package')(m)),
          O.bind('version', () => HashMap.get('Version')(m)),
          O.bind('arch', () => HashMap.get('Architecture')(m)),
          O.map(
            (all) =>
              ({
                ...all,
                dependencies: Dependency.from(
                  F.pipe(
                    m,
                    HashMap.get('Depends'),
                    O.getOrElse(() => '')
                  ),
                  F.pipe(
                    m,
                    HashMap.get('Pre-Depends'),
                    O.getOrElse(() => '')
                  )
                )
              }) as Package
          )
        )
    );
  }
}

export class BinariesRequest
  extends S.TaggedRequest<BinariesRequest>()('ContentsAllRequest', ClientError, S.array(Package), {
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
    St.mapAccum(A.empty<string>(), (acc, chunk) => {
      acc.push(chunk);

      if (Str.isEmpty(acc[acc.length - 1]) && Str.isNonEmpty(acc[acc.length - 2])) {
        const newPackage = Package.from(acc);
        if (O.isSome(newPackage)) {
          return [[], Chunk.unsafeFromArray([O.getOrThrow(newPackage)])];
        }
      }

      return [acc, Chunk.empty()];
    }),
    St.flattenChunks,
    St.runCollect,
    Ef.map(A.fromIterable)
  )
);
