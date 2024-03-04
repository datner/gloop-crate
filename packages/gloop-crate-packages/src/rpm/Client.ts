/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as S from '@effect/schema';
import { PrimaryKey, symbol as PK } from 'effect/PrimaryKey';
import * as A from 'effect/ReadonlyArray';
import * as F from 'effect/Function';
import * as Str from 'effect/String';

export class Repo
  extends S.Schema.Class<Repo>()({
    source: S.Schema.boolean,
    uri: S.Schema.string,
    release: S.Schema.string,
    components: S.Schema.array(S.Schema.string)
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

  [PK]() {
    return this.toString();
  }
}

export const RPMClient = () => {};
