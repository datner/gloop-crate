/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { SemVer } from 'semver';
import * as S from '@effect/schema/Schema';
import { PrimaryKey, symbol as PK } from 'effect/PrimaryKey';
import * as Equivalence from '@effect/schema/Equivalence';
import * as Order from 'effect/Order';

export class SemanticVersion
  extends S.Class<SemanticVersion>()({
    major: S.number,
    minor: S.number,
    patch: S.number,
    version: S.string,
    raw: S.string
  })
  implements PrimaryKey
{
  static parseString(version: string) {
    const wrapped = new SemVer(version);
    return new SemanticVersion({ major: wrapped.major, minor: wrapped.minor, patch: wrapped.patch, version: wrapped.version, raw: wrapped.raw });
  }

  static Eq = Equivalence.make(SemanticVersion);

  static Order = Order.make((a: SemanticVersion, b: SemanticVersion) => Order.string(a.raw, b.raw));

  toString() {
    return this.raw;
  }

  [PK]() {
    return this.toString();
  }

  equals(that: SemanticVersion) {
    return SemanticVersion.Eq(this, that);
  }
}
