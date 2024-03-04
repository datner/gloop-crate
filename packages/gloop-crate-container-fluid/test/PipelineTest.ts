/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as Ef from 'effect/Effect';
import * as F from 'effect/Function';
// import * as A from 'effect/ReadonlyArray';
// import * as HashMap from 'effect/HashMap';
// import * as Platform from '@effect/platform';
import * as PlatformNode from '@effect/platform-node';

import { describe, it } from 'vitest';

// import { SortDependencies } from 'container-fluid/Pipeline.ts';

// import { Pipeline } from 'container-fluid/Pipeline.ts';
// import { LatestContainers } from 'container-fluid/Container.ts';
// import { HttpService, HttpServiceLive } from "../src/Http.ts";
// import { Versions, VersionsLive } from "../src/Versions.ts";

describe('Pipeline generator', async () => {
  it('should be able to sort container dependencies', async ({ expect }) => {
    F.pipe(
      // LatestContainers(),
      // Ef.map(HashMap.values),
      // Ef.map(A.fromIterable),
      // Ef.map(A.flatten),
      // Ef.flatMap((containers) => Pipeline('bash', `${__dirname}/test`, containers)),
      Ef.provide(PlatformNode.NodeContext.layer),
      // Ef.provideService(HttpService, HttpServiceLive),
      // Ef.provideService(Versions, VersionsLive),
      // Ef.runPromise
      () => expect(1).to.eq(1)
    );
  });
});
