/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as S from 'effect/String';
import * as Data from 'effect/Data';

import { Chunk, Distro } from 'container-fluid/Distro.ts';
import { BuildStep, StepToString } from 'container-fluid/containers/BuildStep.ts';
import { addNullableFields, fromBoolean, joinRunCommands } from 'container-fluid/containers/BuildStepCommand.ts';

// @ts-expect-error Data.Case
export interface BuildLayer extends Data.Case {
  readonly _tag: 'BuildLayer';

  readonly name: string;
  readonly from: string;
  readonly steps: A.NonEmptyArray<BuildStep>;
  readonly prepCache: O.Option<boolean>;
}

const BuildLayer = Data.tagged<BuildLayer>('BuildLayer');

type LayerProps = {
  name: string;
  from: string;
  steps: A.NonEmptyArray<BuildStep>;
  prepCache?: boolean;
};

const nullableFields = ['prepCache'];

export const Layer = (args: LayerProps) =>
  F.pipe(
    Object.entries(args),
    A.filter(([key]) => nullableFields.includes(key)),
    addNullableFields(nullableFields),
    A.map(([key, val]) => [key, O.fromNullable(val)]),
    A.prepend(['name', args.name]),
    A.prepend(['from', args.from]),
    A.prepend(['steps', args.steps]),
    A.prepend(['_tag', 'BuildLayer']),
    Object.fromEntries,
    (args: BuildLayer) => BuildLayer(args)
  );

export const LayerToString = (distro: Distro) =>
  F.flow((step: BuildLayer) => {
    const from = `FROM ${step.from}`;

    const withCache = F.pipe(
      step.steps,
      A.findFirst((step) =>
        F.pipe(
          step.commands,
          A.findFirst((cmd) =>
            F.pipe(
              cmd.withCache,
              O.getOrElse(() => false)
            )
          ),
          O.isSome
        )
      ),
      O.isSome
    );

    const cache = F.pipe(
      step.prepCache,
      O.map((prep) => prep && withCache),
      O.flatMap(fromBoolean(Chunk(distro, 'PkgCachePrep'))),
      O.flatMap(joinRunCommands),
      A.fromOption
    );

    const steps = F.pipe(step.steps, A.map(StepToString(distro)));

    return F.pipe([from], A.appendAll(cache), A.appendAll(steps), A.filter(S.isNonEmpty), A.join('\n\n'));
  });
