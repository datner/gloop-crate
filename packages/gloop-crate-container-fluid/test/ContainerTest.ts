/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe, it } from 'vitest';
import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as HashMap from 'effect/HashMap';
import * as Layer from 'effect/Layer';
import * as CP from 'effect/ConfigProvider';

import { Container, ContainerToString, LatestContainers, versionToUse } from 'container-fluid/Container.ts';
import { HttpService, HttpServiceLive } from 'container-fluid/Http.ts';
import { Versions, VersionsLive } from 'container-fluid/Versions.ts';
// import { ResolveVersionsErr } from 'container-fluid/versions/ScrapedVersion.ts';

const tokenMissing = () => !('GITHUB_TOKEN' in process.env);

describe('Render dockerfiles', async () => {
  it('should be able to pick a version', async ({ expect }) => {
    const versions = ['1', '2', '3'];
    F.pipe(
      [
        { toUse: '3', expected: '3' },
        { toUse: 'latest', expected: '3' }
      ],
      A.forEach(({ toUse, expected }) => {
        const result = Ef.runSync(F.pipe(Ef.succeed(versions), versionToUse('debian', O.some(toUse)), Ef.provideService(HttpService, HttpServiceLive)));
        expect(result).to.eq(expected);
      })
    );
  });

  it.skipIf(tokenMissing())(
    'should be able to render containers',
    async ({ expect }) => {
      await F.pipe(
        LatestContainers(),
        Ef.provideService(Versions, VersionsLive),
        Ef.provideService(HttpService, HttpServiceLive),
        Ef.provide(Layer.setConfigProvider(CP.fromEnv())),
        Ef.map((containersMap) => HashMap.toEntries(containersMap)),
        Ef.flatMap(
          F.flow(
            A.map(([distro, containers]) =>
              F.pipe(
                containers,
                A.map((container: Container) =>
                  F.pipe(container, ContainerToString(distro), (rendered) =>
                    Ef.tryPromise(() => expect(rendered).toMatchFileSnapshot(`__snapshots__/render-containers/${distro}/${container.name}/Dockerfile`))
                  )
                ),
                Ef.all
              )
            ),
            Ef.all
          )
        ),
        Ef.runPromise
      );
    },
    { timeout: 60000 }
  );
});
