/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe, it } from 'vitest';

import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as HashSet from 'effect/HashSet';

import { BuildStep, StepToString } from 'container-fluid/containers/BuildStep.ts';

import { AllDistros, Distro } from 'container-fluid/Distro.ts';

import { testBuildSteps } from './RenderFixtures.ts';

describe('Dockerfile steps', async () => {
  it('should be able to render', async ({ expect }) => {
    await Promise.all(
      F.pipe(
        AllDistros,
        HashSet.values,
        A.fromIterable,
        A.map((distro: Distro) =>
          Promise.all(
            testBuildSteps.map(([name, step]) =>
              F.pipe(step as BuildStep, StepToString(distro), (rendered) =>
                expect(rendered).toMatchFileSnapshot(`__snapshots__/render-step/Dockerfile.${distro}-${name}`)
              )
            )
          )
        )
      )
    );
  });
});
