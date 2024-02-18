/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as Ef from 'effect/Effect';
import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as Order from 'effect/Order';
import * as HashMap from 'effect/HashMap';

import { ScrapeVersionsResolver, ScrapeVersionsReq } from 'container-fluid/versions/ScrapedVersion.ts';

import { Chunk, ChunkTemplate } from 'container-fluid/Distro.ts';

const Update = ['DEBIAN_FRONTEND=noninteractive apt-get update -y', 'DEBIAN_FRONTEND=noninteractive apt-get upgrade -y'];

export const Chunks = HashMap.fromIterable<Chunk, ChunkTemplate>([
  [
    'PkgCachePrep',
    () => [`rm -f /etc/apt/apt.conf.d/docker-clean`, `echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache`]
  ],
  [
    'BasePrep',
    () => [
      `echo $TZ > /etc/timezone`,
      'cp "/usr/share/zoneinfo/${TZ}" /etc/localtime || true',
      `echo "$LANG UTF-8" >> /etc/locale.gen`,
      `locale-gen $LANG`,
      `update-locale LC_CTYPE=$LANG`,
      `update-locale LANG=$LANG`,
      `update-locale LC_ALL=$LC_ALL`,
      `update-locale LANGUAGE=$LANGUAGE`,
      `dpkg-reconfigure locales`
    ]
  ],
  [
    'PkgCache',
    () => [
      '--mount=type=cache,id=cache-apt-${TARGETARCH},target=/var/cache/apt,sharing=locked',

      '--mount=type=cache,id=lib-apt-${TARGETARCH},target=/var/lib/apt,sharing=locked'
    ]
  ],

  ['Install', ({ packages }) => [`DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ${packages}`]],
  ['Update', () => Update as A.NonEmptyArray<string>],
  [
    'SecurityUpdate',
    () => [
      'DEBIAN_FRONTEND=noninteractive apt-get update -y',

      'DEBIAN_FRONTEND=noninteractive apt-get install -y openssl ca-certificates $(debsecan --suite $(lsb_release -cs) --format packages --only-fixed)',
      'update-ca-certificates',
      `openssl rehash`
    ]
  ],
  [
    'Cleanup',
    () => [
      'DEBIAN_FRONTEND=noninteractive apt-get purge -y --auto-remove',
      `find /usr -name '*.pyc' -type f -exec bash -c 'for pyc; do dpkg -S "$pyc" &> /dev/null || rm -vf "$pyc"; done' -- '{}' + `,
      'rm -rf /var/lib/apt/lists/*'
    ]
  ],
  [
    'Download',
    ({ packages }) => [
      // assuming we're in tmp workdir
      `apk fetch -R ${packages}`
    ]
  ]
]);

export const GetDebianVersions = F.pipe(
  Ef.request(
    new ScrapeVersionsReq({ name: 'Debian', link: 'https://www.debian.org/releases/index.en.html', selector: 'div#content h2 + ul li a' }),
    ScrapeVersionsResolver
  ),
  Ef.withRequestCaching(true),
  Ef.map(
    F.flow(
      A.filter((r) => /^Debian [\d.]+/.test(r)),
      A.map((r) => r.replace(/^Debian ([\d.]+) .*/, '$1')),
      A.sortBy(Order.string)
    )
  )
);
