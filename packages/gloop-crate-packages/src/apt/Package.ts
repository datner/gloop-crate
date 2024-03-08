/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as S from '@effect/schema/Schema';
import * as O from 'effect/Option';
import * as HashMap from 'effect/HashMap';

import { Dependency } from 'packages/apt/Dependency.ts';
import { DebianArch } from 'packages/apt/BinariesResolver.ts';
import { splitAtFirst } from 'packages/Util.ts';

const getKV = (m: HashMap.HashMap<string, string>) => (key: string) => F.pipe(m, HashMap.get(key), O.getOrThrow);

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
      A.map(splitAtFirst(':')),
      A.filter(([k]) => A.contains(k)(['Package', 'Version', 'Architecture', 'Depends', 'Pre-Depends'])),
      (kv) => HashMap.fromIterable(kv as Iterable<[string, string]>),
      getKV,
      (kv) =>
        new Package({
          name: kv('Package'),
          version: kv('Version'),
          arch: kv('Architecture') as DebianArch,
          dependencies: Dependency.from(kv('Depends'), kv('Pre-Depends'))
        })
    );
  }
}
