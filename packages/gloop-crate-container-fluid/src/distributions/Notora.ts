/* eslint-disable license-header/header, eslint-comments/disable-enable-pair */
/**
     Copyright (c) 2024 Crate Monster

     This Source Code Form is "Incompatible With Secondary Licenses", as defined by the Mozilla Public License, v. 2.0.

     This Source Code Form is used to generate a Derived Oracle Linux Image Dockerfiles,
     build and distribute the respective OpenSource projects managed by the Gloop Crate project.
     Gloop Crate project Dockerfiles and Images usage does not imply, in any shape or form, that Oracle support or endorse their usage.
 */

import * as Ef from 'effect/Effect';
import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as Order from 'effect/Order';
import * as HashMap from 'effect/HashMap';

import { ScrapeVersionsResolver, ScrapeVersionsReq } from '../versions/ScrapedVersion.ts';

import { Chunk, ChunkTemplate } from '../Distro.ts';

const Upgrade = `microdnf upgrade -y --refresh --best --nodocs --noplugins --setopt=install_weak_deps=0 --setopt=keepcache=1`;

export const Chunks = HashMap.fromIterable<Chunk, ChunkTemplate>([
  ['PkgCachePrep', () => [`sed -i 's|keepcache=0|keepcache=1|g' /etc/yum.conf`, `echo -e "\\nkeepcache=1" >> /etc/yum.conf`]],
  [
    'BasePrep',
    () => [`echo $TZ > /etc/timezone`, 'cp "/usr/share/zoneinfo/${TZ}" /etc/localtime || true', `echo "$LANG UTF-8" >> /etc/locale.gen`, `locale-gen $LANG`]
  ],

  ['PkgCache', () => ['--mount=type=cache,id=oracle-cache-yum-${TARGETARCH},target=/var/cache/yum,sharing=locked']],
  ['Install', ({ packages }) => [`microdnf install -y --refresh --best --nodocs --noplugins --setopt=install_weak_deps=0 --setopt=keepcache=1 ${packages}`]],
  ['Update', () => [Upgrade]],
  ['SecurityUpdate', () => [Upgrade, `update-ca-trust`, `openssl rehash`]],
  // We deliberately don't purge the cache
  // [`microdnf clean all`]
  ['Cleanup', () => ['echo No cleanup'] as A.NonEmptyArray<string>],
  [
    'Download',
    ({ packages }) => [
      // assuming tmp workdir
      // `apk fetch -R ${packages}`,
      `for pkg in /tmp/*.rpm; do rpm2cpio "${packages}" | cpio -idmv ; done`
    ]
  ]
]);

export const GetOracleVersions = F.pipe(
  Ef.request(new ScrapeVersionsReq({ name: 'Oracle', link: 'https://docs.oracle.com/en-us/iaas/images', selector: 'a' }), ScrapeVersionsResolver),
  Ef.withRequestCaching(true),
  Ef.map(
    F.flow(
      A.filter((r) => /^Oracle Linux \d+\.x/.test(r)),
      A.map((r) => r.replace(/^Oracle Linux (\d+)\.x/, '$1')),
      A.dedupe,
      A.sortBy(Order.string)
    )
  )
);
