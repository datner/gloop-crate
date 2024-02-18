/* eslint-disable license-header/header, eslint-comments/disable-enable-pair */
/**
     Copyright (c) 2024 Crate Monster

     This Source Code Form is "Incompatible With Secondary Licenses", as defined by the Mozilla Public License, v. 2.0.

     This Source Code Form is used to generate a Derived PhotonOS Image Dockerfiles,
     build and distribute the respective OpenSource projects managed by the Gloop Crate project.
     Gloop Crate project Dockerfiles and Images usage does not imply, in any shape or form, that VMWare support or endorse their usage.
 */

import * as Ef from 'effect/Effect';
import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as Order from 'effect/Order';
import * as HashMap from 'effect/HashMap';

import { ScrapeVersionsResolver, ScrapeVersionsReq } from 'container-fluid/versions/ScrapedVersion.ts';

import { Chunk, ChunkTemplate } from 'container-fluid/Distro.ts';

export const Chunks = HashMap.fromIterable<Chunk, ChunkTemplate>([
  [
    'PkgCachePrep',
    () => [
      `sed -i 's|enabled=0|enabled=1|g' /etc/yum.repos.d/photon-srpms.repo`,
      `sed -i 's|enabled=0|enabled=1|g' /etc/yum.repos.d/photon-updates.repo`,
      `sed -i 's|enabled=0|enabled=1|g' /etc/yum.repos.d/photon-release.repo`,
      `sed -i 's|keepcache=0|keepcache=1|g' /etc/tdnf/tdnf.conf`,
      `echo -e "\\nkeepcache=1" >> /etc/tdnf/tdnf.conf`
    ]
  ],
  [
    'BasePrep',
    () => [`echo $TZ > /etc/timezone`, 'cp "/usr/share/zoneinfo/${TZ}" /etc/localtime || true', `echo "$LANG UTF-8" >> /etc/locale.gen`, `locale-gen $LANG`]
  ],

  ['PkgCache', () => ['--mount=type=cache,id=cache-tdnf-${TARGETARCH},target=/var/cache/tdnf,sharing=locked']],
  ['Install', ({ packages }) => [`tdnf install -y --best --refresh --noplugins --setopt=install_weak_deps=0 --setopt=keepcache=1 ${packages}`]],
  ['Update', () => [`tdnf makecache`, `tdnf upgrade -y --best --refresh --noplugins --setopt=install_weak_deps=0 --setopt=keepcache=1`]],
  ['SecurityUpdate', () => [`tdnf -y --best --refresh --security upgrade`, `rehash_ca_certificates.sh`]],
  // We deliberately don't purge the cache
  // ['tdnf clean all']
  ['Cleanup', () => ['echo No cleanup'] as A.NonEmptyArray<string>],
  ['Download', ({ packages }) => [`${packages}`]]
]);

export const GetPhotonVersions = F.pipe(
  Ef.request(new ScrapeVersionsReq({ name: 'Photon', link: 'https://packages.vmware.com/photon', selector: 'a' }), ScrapeVersionsResolver),
  Ef.withRequestCaching(true),
  Ef.map(
    F.flow(
      A.filter((r) => /^[\d.]+\//.test(r)),
      A.map((r) => r.replace(/^([\d.]+)\//, '$1')),
      A.dedupe,
      A.sortBy(Order.string)
    )
  )
);
