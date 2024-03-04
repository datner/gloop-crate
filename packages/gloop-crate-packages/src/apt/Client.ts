/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
// import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as S from '@effect/schema/Schema';
import * as Str from 'effect/String';
import * as St from 'effect/Stream';
import * as Ch from 'effect/Chunk';
import * as O from 'effect/Option';

import { PrimaryKey, symbol as PK } from 'effect/PrimaryKey';

import { GZipStreamClient, GzipStreamError } from 'packages/Gzip.ts';

export class AptClientError
  extends S.TaggedError<GzipStreamError>()('GzipStreamError', {
    message: S.string
  })
  implements Error
{
  static fromErr(err: Error) {
    return new AptClientError({ message: err.message });
  }
}

export class Repo
  extends S.Class<Repo>()({
    source: S.boolean,
    uri: S.string,
    release: S.string,
    components: S.array(S.string)
  })
  implements PrimaryKey
{
  toString() {
    return `${this.source ? 'deb-src' : 'deb'} ${this.uri} ${this.release} ${A.join(' ')(this.components)}`;
  }

  static fromString(s: string) {
    return F.pipe(
      s,
      Str.split(' '),
      A.filter(Str.isNonEmpty),
      ([source, uri, release, ...components]) => new Repo({ source: source === 'deb-src', uri, release, components })
    );
  }

  static fromSourcesList(sourcesList: string) {
    return F.pipe(sourcesList, Str.split('\n'), A.map(Str.replace(/#.*/, '')), A.map(Str.trim), A.filter(Str.isNonEmpty), A.map(Repo.fromString));
  }

  packages(): St.Stream<string, AptClientError, GZipStreamClient> {
    const componentsConcat = F.pipe(this.components, A.join('/'));

    return F.pipe(
      GZipStreamClient,
      St.flatMap((client) => client.read(`${this.uri}/debian/dists/${this.release}/${componentsConcat}/Contents-all.gz`)),
      // eslint-disable-next-line prettier/prettier
      St.mapChunks(F.flow(
          A.fromIterable,
          A.map(F.flow(Str.split(' '), A.filter(Str.isNonEmpty), A.last, O.getOrThrow)),
          A.dedupe,
          A.map(F.flow(Str.split('/'), A.last, O.getOrThrow)),
          Ch.fromIterable
        )
      ),
      St.mapError(AptClientError.fromErr)
    );
  }

  [PK]() {
    return this.toString();
  }
}

export class Dependency
  extends S.Class<Package>()({
    name: S.string,
    version: S.string
  })
  implements PrimaryKey
{
  toString() {
    return `${this.name} (>= ${this.version})`;
  }

  [PK]() {
    return this.toString();
  }
}

export class Package extends S.Class<Package>()({
  name: S.string,
  version: S.string,
  dependencies: S.array(Dependency)
}) {}

export const AptClient = () => {};
