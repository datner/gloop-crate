/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Str from 'effect/String';
import * as O from 'effect/Option';

export const splitAtFirst = (sep: string) => (str: string) =>
  F.pipe(str, Str.indexOf(sep), O.getOrThrow, (idx) => [Str.slice(0, idx)(str), F.pipe(str, Str.slice(idx + 1), Str.trim)]);
