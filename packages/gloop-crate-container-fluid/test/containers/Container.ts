/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { it } from 'vitest';
import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as EfLayer from 'effect/Layer';
import * as CP from 'effect/ConfigProvider';
import * as CE from 'effect/ConfigError';

import { AllDistros, Distro } from 'container-fluid/Distro.ts';
import { HttpService, HttpServiceLive } from 'container-fluid/Http.ts';
import { Versions, VersionsLive } from 'container-fluid/Versions.ts';
import { ResolveVersionsErr } from 'container-fluid/versions/ScrapedVersion.ts';
import { Container, ContainerToString } from 'container-fluid/Container.ts';
import * as HashSet from 'effect/HashSet';
import * as A from 'effect/ReadonlyArray';

export const testContainerRender = (
  ef: (distro: Distro) => Ef.Effect<Container, ResolveVersionsErr | CE.ConfigError, Versions | HttpService>,
  name: string
) => {
  it(`should be able to render ${name} image dockerfiles`, async ({ expect }) => {
    await Promise.all(
      F.pipe(
        AllDistros,
        HashSet.values,
        A.fromIterable,
        A.map((distro: Distro) =>
          F.pipe(
            ef(distro),
            Ef.provideService(HttpService, HttpServiceLive),
            Ef.provideService(Versions, VersionsLive),
            Ef.provide(EfLayer.setConfigProvider(CP.fromEnv())),
            Ef.map(ContainerToString(distro)),
            Ef.flatMap((rendered) => Ef.promise(() => expect(rendered).toMatchFileSnapshot(`__snapshots__/render-${name}/${distro}/Dockerfile`))),
            Ef.runPromise
          )
        )
      )
    );
  });
};
