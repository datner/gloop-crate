/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

// import * as F from 'effect/Function';
// import * as Ef from 'effect/Effect';
// import * as A from 'effect/ReadonlyArray';
import * as S from '@effect/schema/Schema';
// import * as Str from 'effect/String';
import * as St from 'effect/Stream';
// import * as Ch from 'effect/Chunk';
// import * as O from 'effect/Option';
import * as Ctx from 'effect/Context';

import { GZipStreamClient, /* GZipStreamClientLive, */ GzipStreamError } from 'packages/Gzip.ts';
import { Repo } from 'packages/apt/Repo.ts';

export class ClientError
  extends S.TaggedError<GzipStreamError>()('GzipStreamError', {
    message: S.string
  })
  implements Error
{
  static fromErr(err: Error) {
    return new ClientError({ message: err.message });
  }
}

export class DebianAptClient extends Ctx.Tag('GZipStreamClient')<
  GZipStreamClient,
  {
    readonly packages: (repo: Repo) => St.Stream<string, ClientError>;
  }
>() {}

// export const DebianAptResolverLive = DebianAptClient.of({
//   packages: (repo: Repo) => {
//     return F.pipe(
//       GZipStreamClient,
//       St.provideService(GZipStreamClient, GZipStreamClientLive),
//     );
//   }
// });
