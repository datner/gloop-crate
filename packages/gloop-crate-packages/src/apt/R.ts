/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as Ef from 'effect/Effect';
import * as F from 'effect/Function';
import * as St from 'effect/Stream';

import { HttpClient } from '@effect/platform';
import * as PlatformNode from '@effect/platform-node';
import * as Http from '@effect/platform/HttpClient';

import * as Zlib from 'node:zlib';

// usage

const uri = 'http://ftp.debian.org/debian/dists/stable/main/Contents-amd64.gz';

(async () =>
  F.pipe(
    Http.client.Client,
    Ef.map(Http.client.filterStatusOk),
    Ef.flatMap((client) => client(F.pipe(Http.request.get(uri), Http.request.accept('*/*'), Http.request.setHeader('connection', 'keep-alive')))),
    HttpClient.response.stream,
    PlatformNode.NodeStream.pipeThroughSimple(() => Zlib.createGunzip()),
    St.decodeText(),
    St.splitLines,
    St.take(10),
    St.runCollect,
    Ef.map((res) => {
      console.log(res);

      return res;
    }),
    Ef.provide(PlatformNode.NodeHttpClient.layer),
    Ef.runPromise
  ))();
