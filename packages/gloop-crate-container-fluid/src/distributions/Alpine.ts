/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as Ef from 'effect/Effect';
import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as HashMap from 'effect/HashMap';

import { ScrapeVersionsReq, CachedScrapeVersionsResolver } from 'container-fluid/versions/ScrapedVersion.ts';
import { SemanticVersion } from 'container-fluid/versions/SemanticVersion.ts';
import { Chunk, ChunkTemplate } from 'container-fluid/Distro.ts';

export const Chunks = HashMap.fromIterable<Chunk, ChunkTemplate>([
  ['PkgCachePrep', () => [`apk -U update`, `apk -U upgrade -q`, `apk add alpine-conf`, `setup-apkcache /var/cache/apk`]],
  [
    'BasePrep',
    () => [`echo $TZ > /etc/timezone`, 'cp "/usr/share/zoneinfo/${TZ}" /etc/localtime || true', `echo "$LANG UTF-8" >> /etc/locale.gen`, `locale-gen $LANG`]
  ],
  ['PkgCache', () => ['--mount=type=cache,id=cache-apk-${TARGETARCH},target=/var/cache/apk,sharing=locked']],
  ['Install', ({ packages }) => [`apk add ${packages}`]],
  ['Update', () => [`apk -U update`, `apk -U upgrade -q`]],
  ['SecurityUpdate', () => [`apk -U update`, `apk -U upgrade --force-refresh `, `update-ca-certificates`, `openssl rehash`]],
  // We deliberately don't purge the cache
  // [`apk cache --purge`]
  ['Cleanup', () => ['echo No cleanup'] as A.NonEmptyArray<string>],
  [
    'Download',
    ({ packages }) => [
      // assuming tmp workdir
      `apk fetch -R ${packages}`,
      `mkdir -p apks/var/cache/apk`,
      `apk index -o apks/var/cache/apk/APKINDEX.00000000.tar.gz *.apk`,
      `for apk in *.apk; do tar xfz "$apk" --directory apks --overwrite; done`,
      `rm -rf apks/.* || true`
    ]
  ]
]);

export const GetAlpineVersions = F.pipe(
  Ef.request(
    new ScrapeVersionsReq({ name: 'Alpine', link: 'https://www.alpinelinux.org/releases', selector: 'div.releases tr td a' }),
    CachedScrapeVersionsResolver
  ),
  Ef.withRequestCaching(true),
  Ef.map(
    F.flow(
      A.filter((r) => /^[\d.]+$/.test(r)),
      A.map(SemanticVersion.parseString),
      A.sortBy(SemanticVersion.Order),
      A.map((v: SemanticVersion) => v.version)
    )
  )
);
