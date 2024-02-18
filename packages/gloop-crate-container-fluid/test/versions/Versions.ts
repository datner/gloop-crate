/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as Layer from 'effect/Layer';
import * as CP from 'effect/ConfigProvider';
import * as Order from 'effect/Order';

import { SemanticVersion } from 'container-fluid/versions/SemanticVersion.ts';
import { ResolveVersionsErr } from 'container-fluid/versions/ScrapedVersion.ts';
import { HttpService, HttpServiceLive } from 'container-fluid/Http.ts';

import { it } from 'vitest';

const tokenMissing = () => !('GITHUB_TOKEN' in process.env);

export const testVersions = (
  versions: Ef.Effect<string[], ResolveVersionsErr, HttpService>,
  semanticOrder: boolean = false,
  testGitVersions: boolean = false
) => {
  const getVersions = F.pipe(versions, Ef.provideService(HttpService, HttpServiceLive), Ef.provide(Layer.setConfigProvider(CP.fromEnv())));

  const testWithIt = testGitVersions ? it.skipIf(tokenMissing()) : it;

  testWithIt('should be able to scrape all versions sorted in asc order', async ({ expect }) => {
    const result = await Ef.runPromise(getVersions);
    expect(result.length).toBeGreaterThan(1);

    const last = F.pipe(A.last(result), O.getOrThrow);
    const beforeLast = F.pipe(result, A.get(A.length(result) - 2), O.getOrThrow);

    if (semanticOrder) {
      expect(SemanticVersion.Order(SemanticVersion.parseString(last), SemanticVersion.parseString(beforeLast))).toBe(1);
    } else {
      expect(Order.string(last, beforeLast)).toBe(1);
    }
  });
};

export default testVersions;
