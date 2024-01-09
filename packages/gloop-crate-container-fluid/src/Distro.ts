/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as HashSet from 'effect/HashSet';
import * as HashMap from 'effect/HashMap';

import { Chunks as AlpineChunks } from './distributions/Alpine.ts';
import { Chunks as DebianChunks } from './distributions/Debian.ts';
import { Chunks as OracleChunks } from './distributions/Notora.ts';
import { Chunks as PhotonChunks } from './distributions/Photon.ts';
import { Chunks as RockyChunks } from './distributions/Rocky.ts';
import { Chunks as UBIChunks } from './distributions/UBI.ts';

export type Distro = 'alpine' | 'debian' | 'rocky' | 'notora' | 'photon' | 'ubi';

export const AllDistros = HashSet.fromIterable<Distro>(['alpine', 'debian', 'rocky', 'notora', 'photon', 'ubi']);

export type Chunk = 'PkgCachePrep' | 'PkgCache' | 'BasePrep' | 'Install' | 'Update' | 'SecurityUpdate' | 'Cleanup' | 'Download' | 'MakeUser' | 'CloneRepo';

export type ChunkTemplate = (args: { [k: string]: string }) => A.NonEmptyArray<string>;

export type InstallChunk = {
  (args: { packages: string }): A.NonEmptyArray<string>;
};

export type BasePrepChunk = {
  (args: { distro: Distro }): A.NonEmptyArray<string>;
};

export type NoArgsChunk = {
  (): A.NonEmptyArray<string>;
};

export const MakeUserChunk: ChunkTemplate = ({ name, uid, gid }) => [
  `addgroup --gid ${gid} ${name}`,
  `mkdir -p /${name}`,
  `adduser --ingroup ${name} --disabled-password --gecos "" --uid ${uid} --home /${name} --shell /bin/sh ${name}`,
  `chown -R ${name}:${name} /${name}`
];

export type MakeUserChunk = {
  (args: { name: string; uid: string; gid: string }): A.NonEmptyArray<string>;
};

export const CloneRepoChunk: ChunkTemplate = ({ name, git, version }) => [
  `[ ! -d "/builder/src/${name}" ] && git clone --depth=1 ${git} /builder/src/${name}`,
  `cd /builder/src/${name}`,
  `rm /builder/.gitconfig || true`,
  `git config pull.rebase false`,
  `git checkout ${version}`,
  `git clean -fd`,
  `git fetch --all --tags`,
  'git checkout -- .'
];

export type CloneRepoChunk = {
  (args: { name: string; git: string }): A.NonEmptyArray<string>;
};

export const commonChunks = HashMap.fromIterable([
  ['CloneRepo', CloneRepoChunk],
  ['MakeUser', MakeUserChunk]
]);

const AllChunks = HashMap.fromIterable([
  ['alpine', HashMap.fromIterable([...AlpineChunks, ...commonChunks])],
  ['debian', HashMap.fromIterable([...DebianChunks, ...commonChunks])],
  ['rocky', HashMap.fromIterable([...RockyChunks, ...commonChunks])],
  ['notora', HashMap.fromIterable([...OracleChunks, ...commonChunks])],
  ['photon', HashMap.fromIterable([...PhotonChunks, ...commonChunks])],
  ['ubi', HashMap.fromIterable([...UBIChunks, ...commonChunks])]
]) as HashMap.HashMap<Distro, HashMap.HashMap<Chunk, ChunkTemplate>>;

export const Chunk = (distro: Distro, chunk: Chunk, args: { [k: string]: string } = {}): A.NonEmptyArray<string> =>
  F.pipe(
    AllChunks,
    HashMap.get(distro),
    O.flatMap(HashMap.get(chunk)),
    O.map((ch) => ch(args)),
    O.getOrThrow
  );
