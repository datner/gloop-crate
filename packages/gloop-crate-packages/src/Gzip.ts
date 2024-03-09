/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { createGunzip } from 'node:zlib';

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as O from 'effect/Option';
import * as Ctx from 'effect/Context';
import * as St from 'effect/Stream';
import * as S from '@effect/schema/Schema';

import * as Http from '@effect/platform/HttpClient';
import * as NodeStream from '@effect/platform-node/NodeStream';
import * as PlatformNode from '@effect/platform-node';

export class GZipStreamClient extends Ctx.Tag('GZipStreamClient')<
  GZipStreamClient,
  {
    readonly read: (uri: string) => St.Stream<string, GzipStreamError>;
  }
>() {}

export class GzipStreamError
  extends S.TaggedError<GzipStreamError>()('GzipStreamError', {
    message: S.string
  })
  implements Error
{
  static fromErr(err: unknown) {
    return new GzipStreamError({ message: (err as Error).message });
  }
}

export const appendUintArray = ({ buffer, len }: { buffer: Uint8Array; len: number }, other: Uint8Array) => {
  if (buffer.byteLength < len + other.byteLength) {
    // resize + 1Kb
    const newBuffer = new Uint8Array(len + other.byteLength + 1024);
    newBuffer.set(buffer, 0);
    newBuffer.set(other, len + 1);

    return {
      buffer: newBuffer,
      len: buffer.byteLength + other.byteLength
    };
  }

  buffer.set(other as Uint8Array, len + 1);
  return {
    buffer: buffer,
    len: buffer.byteLength + other.byteLength
  };
};

export const GZipStreamClientLive = GZipStreamClient.of({
  read: (uri: string) =>
    F.pipe(
      Http.client.Client,
      Ef.map(Http.client.filterStatusOk),
      Ef.flatMap((client) => client(F.pipe(Http.request.get(uri)))),
      Ef.provide(PlatformNode.NodeHttpClient.layer),
      Http.response.stream,
      NodeStream.pipeThroughSimple(() => createGunzip()),
      St.decodeText,
      St.splitLines,
      St.catchSome((err: unknown) => {
        if ((err as GzipStreamError | Http.error.ResponseError)._tag === 'ResponseError') {
          return O.some(St.empty);
        }

        return O.none();
      })
    ) as St.Stream<string, GzipStreamError>
});
