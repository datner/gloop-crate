/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Resolver from 'effect/RequestResolver';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as S from '@effect/schema/Schema';
import { PrimaryKey, symbol as PK } from 'effect/PrimaryKey';

import { load as ParseBody } from 'cheerio';

import { HttpService } from 'container-fluid/Http.ts';
import { SemanticVersion } from 'container-fluid/versions/SemanticVersion.ts';

export class ResolveVersionsErr extends S.TaggedError<ResolveVersionsErr>()('ResolveVersionsErr', {
  name: S.string,
  version: S.optional(SemanticVersion),
  message: S.optional(S.string)
}) {
  static wrapAnyError<A, E extends ResolveVersionsErr | Error, R>(name: string) {
    return (eff: Ef.Effect<A, E, R>): Ef.Effect<A, ResolveVersionsErr, R> =>
      F.pipe(
        eff,
        Ef.mapError((someErr: E) => {
          if ('_tag' in someErr && someErr._tag === 'ResolveVersionsErr') {
            return someErr as ResolveVersionsErr;
          }

          return new ResolveVersionsErr({ name, message: someErr.message });
        })
      );
  }
}

export class ScrapeVersionsReq
  extends S.TaggedRequest<ScrapeVersionsReq>()('ScrapeVersionsReq', ResolveVersionsErr, S.array(S.string), {
    name: S.string,
    link: S.string,
    selector: S.string
  })
  implements PrimaryKey
{
  [PK]() {
    return `${this.name}/${this.link}/${this.selector}`;
  }
}

export const ScrapeVersionsResolver = F.pipe(
  Resolver.fromEffect((req: ScrapeVersionsReq) =>
    F.pipe(
      HttpService,
      Ef.flatMap((http) =>
        Ef.tryPromise({
          try: (signal) => http.fetch(req.link, { signal }),
          catch: (error: unknown) =>
            new ResolveVersionsErr({ name: req.name, message: `unable to resolve ${req.name} versions from ${req.link} ${(error as Error).message}` })
        })
      ),
      Ef.flatMap((resp) => Ef.promise(() => resp.text())),
      Ef.map(
        F.flow(
          ParseBody,
          ($) => $(req.selector).contents(),
          Object.values,
          A.filter((node) => node.nodeType == 3),
          A.map((node: Text) => node.data)
        )
      )
    )
  ),
  Resolver.contextFromServices(HttpService)
);
