/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Data from 'effect/Data';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';

import { Chunk, Distro } from 'container-fluid/Distro.ts';

// @ts-expect-error Data.Case
export interface BuildStepCommand extends Data.Case {
  readonly _tag: 'BuildStepCommand';

  readonly run: O.Option<A.NonEmptyArray<string>>;

  readonly packages: O.Option<A.NonEmptyArray<string>>;
  readonly withLanguageCache: O.Option<A.NonEmptyArray<string>>;
  readonly withCache: O.Option<boolean>;
  readonly withUpdate: O.Option<boolean>;
  readonly withCleanup: O.Option<boolean>;
  readonly withDownload: O.Option<boolean>;
}

const BuildStepCommand = Data.tagged<BuildStepCommand>('BuildStepCommand');

type CommandProps = {
  run: A.NonEmptyArray<string>;
  packages?: A.NonEmptyArray<string>;
  withLanguageCache?: A.NonEmptyArray<string>;
  withCache?: boolean;
  withUpdate?: boolean;
  withCleanup?: boolean;
  withDownload?: boolean;
};

export const addNullableFields = (nullableFields: string[]) => (entries: Iterable<[string, unknown]>) =>
  F.pipe(
    nullableFields,
    A.filter((key) => !Object.keys(entries).includes(key)),
    A.map((missingKey) => [missingKey, null]),
    A.appendAll(entries)
  );

export const Command = (args: CommandProps) =>
  F.pipe(
    Object.entries(args),
    A.filter(([key]) => (key as string) !== 'run'),
    addNullableFields(['packages', 'withLanguageCache', 'withCache', 'withUpdate', 'withCleanup', 'withDownload']),
    A.map(([key, val]) => [key, O.fromNullable(val)]),
    A.prepend(['run', args.run]),
    A.prepend(['_tag', 'BuildStepCommand']),
    Object.fromEntries,
    BuildStepCommand
  );

const getChunks = (distro: Distro) => (packages: readonly string[]) =>
  F.pipe(
    ['PkgCache', 'Update', 'Install', 'Download', 'Cleanup'] as Chunk[],
    A.map((chunk): [Chunk, string[]] => [chunk, Chunk(distro, chunk, { packages: A.join(' ')(packages) })]),
    (entries) => new Map(entries)
  );

export const toEmpty = <T>(opt: O.Option<T[]>) => O.getOrElse(() => [] as T[])(opt);

export const fromBoolean =
  <T>(contents: T[]) =>
  (withContents: boolean) =>
    withContents ? O.some(contents) : O.none();

export const joinRunCommands = (all: string[]) =>
  F.pipe(
    all,
    A.head,
    O.map(() => all),
    O.map(A.drop(1)),
    O.map(A.map((r) => `    ${r}`)),
    O.map(A.prepend(`RUN ${all[0]}`)),
    O.map(A.join(' ; \\\n'))
  );

export const CommandToString = (distro: Distro, prepend: O.Option<A.NonEmptyArray<string>> = O.none()) =>
  F.flow((cmd: BuildStepCommand) => {
    const chunks = F.pipe(
      cmd.packages,
      O.getOrElse(() => []),
      getChunks(distro)
    );

    const formatPkgCache = (all: string[]) =>
      F.pipe(
        all,
        A.drop(1),
        A.appendAll(
          F.pipe(
            cmd.withLanguageCache,
            O.getOrElse(() => [])
          )
        ),
        A.append('set -eux'),
        A.map((s) => `    ${s}`),
        A.prepend(all[0]),
        A.join(' \\\n'),
        (w) => [w]
      );

    const cache = F.pipe(
      cmd.withCache,
      O.flatMap(F.pipe(chunks.get('PkgCache')!, formatPkgCache, fromBoolean)),
      O.getOrElse(() => ['set -eux'])
    );

    return F.pipe(
      cache,
      A.appendAll(F.pipe(prepend, toEmpty)),
      A.appendAll(F.pipe(cmd.withUpdate, O.flatMap(fromBoolean(chunks.get('Update')!)), toEmpty)),
      A.appendAll(F.pipe(O.some(chunks.get('Install')!), toEmpty)),
      A.appendAll(F.pipe(cmd.withDownload, O.flatMap(fromBoolean(chunks.get('Download')!)), toEmpty)),
      A.appendAll(F.pipe(cmd.withCleanup, O.flatMap(fromBoolean(chunks.get('Cleanup')!)), toEmpty)),
      joinRunCommands,
      O.getOrThrow
    );
  });
