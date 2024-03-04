/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as Ef from 'effect/Effect';
import * as F from 'effect/Function';
import * as St from 'effect/Stream';

import { describe, it } from 'vitest';
import { GZipStreamClient, GZipStreamClientLive } from 'packages/Gzip.ts';

describe('Gzip file processing', async () => {
  it('should be able to download and unpack gzip files', async ({ expect }) => {
    const chunk = await F.pipe(
      GZipStreamClient,
      Ef.map((client) => client.read('http://ftp.debian.org/debian/dists/stable/main/Contents-amd64.gz')),
      Ef.map(St.take(10)),
      Ef.flatMap(St.runCollect),
      Ef.provideService(GZipStreamClient, GZipStreamClientLive),
      Ef.runPromise
    );

    console.log(chunk);
    expect(chunk.length).toBeGreaterThan(9);
  });
});