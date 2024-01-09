/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as Ctx from 'effect/Context';

export class HttpService extends Ctx.Tag('HttpService')<
  HttpService,
  {
    fetch: typeof fetch;
  }
>() {}

export const HttpServiceLive = HttpService.of({ fetch });
