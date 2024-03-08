/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as S from '@effect/schema/Schema';
import { PrimaryKey, symbol as PK } from 'effect/PrimaryKey';
import * as A from 'effect/ReadonlyArray';
import * as F from 'effect/Function';
import * as Str from 'effect/String';

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

  static from(s: string) {
    return F.pipe(
      s,
      Str.split(' '),
      A.filter(Str.isNonEmpty),
      ([source, uri, release, ...components]) => new Repo({ source: source === 'deb-src', uri, release, components })
    );
  }

  static fromSourcesList(sourcesList: string) {
    return F.pipe(sourcesList, Str.split('\n'), A.map(Str.replace(/#.*/, '')), A.map(Str.trim), A.filter(Str.isNonEmpty), A.map(Repo.from));
  }

  [PK]() {
    return this.toString();
  }
}
