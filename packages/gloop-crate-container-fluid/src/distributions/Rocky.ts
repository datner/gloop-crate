/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as Ef from 'effect/Effect';
import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as Order from 'effect/Order';

import { ScrapeVersionsResolver, ScrapeVersionsReq } from '../versions/ScrapedVersion.ts';

import { Chunks as OracleChunks } from './Notora.ts';

export const Chunks = OracleChunks;

export const GetRockyVersions = F.pipe(
  Ef.request(
    new ScrapeVersionsReq({ name: 'Rocky', link: 'https://wiki.rockylinux.org/rocky/version', selector: 'div.tabbed-set div.tabbed-content table tr td' }),
    ScrapeVersionsResolver
  ),
  Ef.withRequestCaching(true),
  Ef.map(
    F.flow(
      A.filter((r) => /^[\d.]+$/.test(r)),
      A.map((r) => r.replace(/^([\d.]+)$/, '$1')),
      A.dedupe,
      A.sortBy(Order.string)
    )
  )
);
