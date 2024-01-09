/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
// import * as Req from 'effect/Request';
import * as Resolver from 'effect/RequestResolver';
import * as Config from 'effect/Config';
import * as ConfigError from 'effect/ConfigError';
import * as Secret from 'effect/Secret';
import * as A from 'effect/ReadonlyArray';
import * as S from '@effect/schema/Schema';
import * as Order from 'effect/Order';

import { PrimaryKey, symbol as PK } from 'effect/PrimaryKey';
// import * as ExperimentalRequestResolver from '@effect/experimental/RequestResolver';

import { request as GithubRequest } from '@octokit/request';
import { ResolveVersionsErr } from 'container-fluid/versions/ScrapedVersion.ts';
import { HttpService } from 'container-fluid/Http.ts';
// import {SemanticVersion} from "./SemanticVersion";

export class GitVersionsReq
  extends S.TaggedRequest<GitVersionsReq>()('GitVersionsReq', ResolveVersionsErr, S.array(S.string), {
    name: S.string,
    repo: S.string,
    org: S.string
  })
  implements PrimaryKey
{
  [PK]() {
    return `${this.repo}/${this.org}`;
  }
}

// Schema.from();

type Method = 'GET' | 'POST';

type ReleaseInfo = unknown & {
  name: string;
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
};

type TagInfo = unknown & {
  name: string;
};

export const MakeGithubPaginatedRequestWith = (req: GitVersionsReq, method: Method, url: string, page: number = 1) =>
  F.pipe(
    Ef.Do,
    Ef.bind('token', () => Config.secret('GITHUB_TOKEN')),
    Ef.bind('http', () => HttpService),
    Ef.flatMap(({ http, token }) =>
      Ef.tryPromise({
        try: (signal) =>
          GithubRequest({
            headers: {
              authorization: `token ${Secret.value(token)}`
            },
            request: {
              // eslint-disable-next-line no-undef
              fetch: (input: string | URL | Request, init?: RequestInit) => http.fetch(input, { ...init, signal })
            },
            method,
            url,
            org: req.org,
            repo: req.repo,
            page,
            per_page: 100
          }),
        catch: (err: unknown) => new ResolveVersionsErr({ name: `${req.org}/${req.repo}`, message: (err as Error).message })
      })
    ),
    Ef.map((resp) => resp.data as ReleaseInfo[] | TagInfo[]),
    Ef.map(
      A.map((result) => {
        if (Object.keys(<NonNullable<unknown>>result).includes('tag_name')) {
          return (result as ReleaseInfo).tag_name;
        }

        return (result as TagInfo).name;
      })
    ),
    Ef.mapError((err: ResolveVersionsErr | ConfigError.ConfigError) => {
      if (ConfigError.isConfigError(err)) {
        return new ResolveVersionsErr({ name: `${req.org}/${req.repo}`, message: 'Configuration error' });
      }

      return err as ResolveVersionsErr;
    })
  );

export const MakeGithubRequestWith = (req: GitVersionsReq, method: Method, url: string) => {
  let res: string[][] = [];

  return F.pipe(
    Ef.whileLoop({
      while: () => (res[res.length - 1] || []).length > 0 || res.length == 0,
      body: () => MakeGithubPaginatedRequestWith(req, method, url, res.length + 1),
      step: (page: string[]) => {
        res = [...res, page];
      }
    }),
    Ef.map(() => res),
    Ef.map(A.flatten)
  );
};

export const GetGithubVersions = (name: string, org: string, repo: string, prefix: string = 'v') =>
  F.pipe(
    GitVersionsResolver,
    Ef.flatMap((resolver) =>
      Ef.request(
        new GitVersionsReq({
          name,
          repo,
          org
        }),
        resolver
      )
    ),
    Ef.withRequestCaching(true),
    Ef.map(
      F.flow(
        // eslint-disable-next-line security/detect-non-literal-regexp
        A.filter((v) => new RegExp(`^${prefix}[\\d.]+$`).test(v)),
        A.map((v) => v.replace(prefix, '')),
        A.sortBy(Order.string)
      )
    )
  );

export const GetRepoTags = (req: GitVersionsReq) => MakeGithubRequestWith(req, 'GET', '/repos/{org}/{repo}/tags');

export const GetRepoReleases = (req: GitVersionsReq) => MakeGithubRequestWith(req, 'GET', '/repos/{org}/{repo}/releases');

// export const GetVersions = (req: GitVersionsReq) =>

export const GitVersionsResolver = F.pipe(
  Resolver.fromEffect((req: GitVersionsReq) =>
    F.pipe(
      Ef.Do,
      Ef.bind('tags', () => GetRepoTags(req)),
      Ef.bind('releases', () => GetRepoReleases(req)),
      Ef.map(({ tags, releases }) => (A.isEmptyArray(releases) ? tags : releases))
    )
  ),
  Resolver.contextFromServices(HttpService)
  // Ef.map((resolver) => ExperimentalRequestResolver.persisted(resolver, 'e'))
);
