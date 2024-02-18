/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Data from 'effect/Data';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as S from 'effect/String';

import { addNullableFields, BuildStepCommand, CommandToString, toEmpty } from 'container-fluid/containers/BuildStepCommand.ts';
import { Chunk, Distro } from 'container-fluid/Distro.ts';

export type CopyFromTo = {
  from: string;
  to: string;
  layer: O.Option<string>;
};

// @ts-expect-error Data.Case
export interface BuildStep extends Data.Case {
  readonly _tag: 'BuildStep';

  readonly commands: A.NonEmptyArray<BuildStepCommand>;
  readonly env: Map<string, string>;
  readonly args: Map<string, string>;

  readonly workdir: O.Option<string>;
  readonly user: O.Option<string>;
  readonly uid: O.Option<number>;
  readonly gid: O.Option<number>;
  readonly makeUser: O.Option<boolean>;
  readonly copy: O.Option<A.NonEmptyArray<CopyFromTo>>;
  readonly cleanupEnv: O.Option<A.NonEmptyArray<string>>;
}

const BuildStep = Data.tagged<BuildStep>('BuildStep');

type StepProps = {
  commands: A.NonEmptyArray<BuildStepCommand>;
  env?: Map<string, string>;
  args?: Map<string, string>;

  workdir?: string;
  user?: string;
  uid?: number;
  gid?: number;
  makeUser?: boolean;
  copy?: A.NonEmptyArray<CopyFromTo>;
  cleanupEnv?: A.NonEmptyArray<string>;
};

const nonNullableFields = ['commands', 'env', 'args'];

const nullableFields = ['workdir', 'user', 'uid', 'gid', 'makeUser', 'copy', 'cleanupEnv'];

export const Step = (args: StepProps) =>
  F.pipe(
    Object.entries(args),
    A.filter(([key]) => !nonNullableFields.includes(key)),
    addNullableFields(nullableFields),
    A.map(([key, val]) => [key, O.fromNullable(val)]),
    A.prepend(['commands', args.commands]),
    A.prepend(['args', args.args ? args.args : new Map()]),
    A.prepend(['env', args.env ? args.env : new Map()]),
    A.prepend(['_tag', 'BuildStep']),
    Object.fromEntries,
    BuildStep
  );

export const joinEnvs = (all: string[]) =>
  F.pipe(
    all,
    A.head,
    O.map(() => all),
    O.map(A.drop(1)),
    O.map(A.map((s) => `    ${s}`)),
    O.map(A.prepend(`ENV ${all[0]}`)),
    O.map(A.join(' \\\n')),
    O.map((result) => [result]),
    O.getOrElse(() => [])
  );

export const StepToString = (distro: Distro) =>
  F.flow((step: BuildStep) => {
    // NOTE: Assuming user is absent if it needs to be created
    const user = F.pipe(
      step.user,
      O.flatMap((user) => (step.makeUser ? O.some(`USER ${user}`) : O.none())),
      A.fromOption
    );

    const workDir = F.pipe(
      step.workdir,
      O.map((workdir) => `WORKDIR ${workdir}`),
      A.fromOption
    );

    const toCopyToString = (toCopy: CopyFromTo) =>
      F.pipe(
        toCopy.layer,
        O.map((layer) => `--from=${layer}`),
        O.getOrElse(() => ''),
        (fromLayer) => `COPY ${fromLayer} ${toCopy.from} ${toCopy.to}`
      );

    const toCopy = F.pipe(step.copy, O.map(A.map(toCopyToString)), toEmpty);

    const withOptArg =
      <T extends { toString(): string }>(name: string, arg: O.Option<T>) =>
      (entries: string[][]) =>
        F.pipe(
          arg,
          O.map((value: T) => [[name, value.toString()]]),
          O.getOrElse(() => [] as string[][]),
          (value) => [...entries, ...value]
        );

    const args = F.pipe(
      Array.from(step.args.entries()),
      withOptArg('UID', step.uid),
      withOptArg('GID', step.gid),
      A.map(A.join('=')),
      A.map((s) => `ARG ${s}`),
      A.join('\n'),
      (result) => (result ? [result] : [])
    );

    const makeUser = F.pipe(
      O.Do,
      O.bind('uid', () => step.uid),
      O.bind('gid', () => step.gid),
      O.bind('name', () => step.user),
      O.bind('makeUser', () => step.makeUser),
      O.flatMap(({ name, uid, gid, makeUser }) =>
        makeUser
          ? O.some(
              Chunk(distro, 'MakeUser', {
                name,
                uid: uid.toString(),
                gid: gid.toString()
              }) as A.NonEmptyArray<string>
            )
          : O.none()
      )
    );

    const envs = F.pipe(Array.from(step.env.entries()), A.map(A.join('=')), joinEnvs);

    const cleanupEnv = F.pipe(step.cleanupEnv, O.map(A.map((name) => `${name}=""`)), O.map(joinEnvs), toEmpty);

    const commands = F.pipe(step.commands, A.map(CommandToString(distro, makeUser))) as string[];

    const all = [user, workDir, toCopy, args, envs, commands, cleanupEnv];

    return F.pipe(all, A.map(A.filter(S.isNonEmpty)), A.map(A.join('\n')), A.filter(S.isNonEmpty), A.join('\n\n'));
  });
