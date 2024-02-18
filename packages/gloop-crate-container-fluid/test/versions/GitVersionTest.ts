/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as CP from 'effect/ConfigProvider';

import { describe, it } from 'vitest';

import { HttpService, HttpServiceLive } from 'container-fluid/Http.ts';
import { GitVersionsReq, MakeGithubPaginatedRequestWith, MakeGithubRequestWith } from 'container-fluid/versions/GitVersion.ts';

describe('Git Versions Resolver', async () => {
  const tokenMissing = () => !('GITHUB_TOKEN' in process.env);

  const githubPaginated = F.pipe(
    MakeGithubPaginatedRequestWith(new GitVersionsReq({ name: 'Golang', repo: 'go', org: 'golang' }), 'GET', '/repos/{org}/{repo}/tags', 1),
    Ef.provideService(HttpService, HttpServiceLive),
    Ef.provide(Layer.setConfigProvider(CP.fromEnv()))
  );

  const githubAll = F.pipe(
    MakeGithubRequestWith(new GitVersionsReq({ name: 'Golang', repo: 'go', org: 'golang' }), 'GET', '/repos/{org}/{repo}/tags'),
    Ef.provideService(HttpService, HttpServiceLive),
    Ef.provide(Layer.setConfigProvider(CP.fromEnv()))
  );
  // const getLastGolangVersion = F.pipe(GetLastGolangVersion, Ef.provideService(HttpService, HttpServiceLive));

  it.skipIf(tokenMissing())('should be able to get paginated versions', async ({ expect }) => {
    const result = await Ef.runPromise(githubPaginated);
    expect(result).to.not.be.empty;
  });

  it.skipIf(tokenMissing())('should be able to get all versions', async ({ expect }) => {
    const result = await Ef.runPromise(githubAll);
    expect(result).to.not.be.empty;
  });
});
