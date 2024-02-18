/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe, it } from 'vitest';

import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as HashSet from 'effect/HashSet';

import { BuildStepCommand, CommandToString, joinRunCommands } from 'container-fluid/containers/BuildStepCommand.ts';
import { AllDistros, Distro } from 'container-fluid/Distro.ts';

import { testCommands } from './RenderFixtures.ts';

describe('Dockerfile RUN commands', async () => {
  it('should be able to join', async ({ expect }) => {
    const result = O.getOrThrow(joinRunCommands(['some1', 'some2', 'some3']));

    expect(result).to.equal('RUN some1 ; \\\n    some2 ; \\\n    some3');
  });

  it('should be able to render', async ({ expect }) => {
    await Promise.all(
      F.pipe(
        AllDistros,
        HashSet.values,
        A.fromIterable,
        A.map((distro: Distro) =>
          Promise.all(
            testCommands.map(([name, command]) =>
              F.pipe(command as BuildStepCommand, CommandToString(distro), (rendered) =>
                expect(rendered).toMatchFileSnapshot(`__snapshots__/render-command/${distro}-${name}.ts.snap`)
              )
            )
          )
        )
      )
    );
  });
});
