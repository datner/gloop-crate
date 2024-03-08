/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as S from '@effect/schema/Schema';
import * as Str from 'effect/String';
import * as O from 'effect/Option';

import { PrimaryKey, symbol as PK } from 'effect/PrimaryKey';
import { splitAtFirst } from 'packages/Util.ts';

export class Dependency
  extends S.Class<Dependency>()({
    name: S.string,
    alternatives: S.array(S.string),
    version: S.option(S.string)
  })
  implements PrimaryKey
{
  toString() {
    return `${this.name} (>= ${this.version})`;
  }

  [PK]() {
    return this.toString();
  }

  static versionFrom(v: string) {
    // eslint-disable-next-line prettier/prettier
    return F.pipe(
      v,
      Str.replace(/^\(/, ''),
      Str.replace(/\)$/, ''),
      Str.split(' '),
      A.last,
      O.getOrThrow
    );
  }

  static boundedVersion(str: string) {
    return F.pipe(
      str,
      splitAtFirst(' '),
      ([name, v]) =>
        new Dependency({
          name,
          alternatives: A.empty(),
          version: O.some(Dependency.versionFrom(v))
        })
    );
  }

  static alternativesVersion(str: string) {
    return F.pipe(
      str,
      Str.split(' | '),
      (all) =>
        F.pipe(
          O.Do,
          O.bind('name', () => A.get(0)(all)),
          O.bind('alternatives', () => A.tail(all))
        ),
      O.map(
        ({ name, alternatives }) =>
          new Dependency({
            name,
            alternatives,
            version: O.none()
          })
      ),
      O.getOrThrow
    );
  }

  static from(depends: string, preDepends: string = ''): Dependency[] {
    return F.pipe(
      [depends, preDepends],
      A.filter(Str.isNonEmpty),
      A.join(', '),
      Str.split(', '),
      (all) => [
        F.pipe(all, A.filter(Str.includes('>=')), A.map(Dependency.boundedVersion)),
        F.pipe(all, A.filter(Str.includes(' | ')), A.map(Dependency.alternativesVersion))
      ],
      A.flatten
    );
  }
}
