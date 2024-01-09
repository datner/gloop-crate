/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as A from 'effect/ReadonlyArray';
import * as F from 'effect/Function';
import * as O from 'effect/Option';

import { BuildStepCommand, Command } from '../../src/containers/BuildStepCommand.ts';
import { BuildStep, CopyFromTo } from '../../src/containers/BuildStep.ts';
import { Container, Layer, Step } from '../../src/Container.ts';

const run: A.NonEmptyArray<string> = ['echo OK', 'echo Testing... Testing...'];

const packages: A.NonEmptyArray<string> = ['some'];

export const testCommands = [
  [
    'Cached',
    Command({
      run,
      packages: ['some'],
      withCache: true
    })
  ],
  [
    'CleanedUp',
    Command({
      run,
      packages,
      withCache: true,
      withCleanup: true
    })
  ],
  [
    'DistrolessDownload',
    Command({
      run,
      packages,
      withCache: true,
      withCleanup: true,
      withDownload: true
    })
  ]
];

const commands = F.pipe(
  testCommands,
  A.map(([, command]) => command as BuildStepCommand),
  A.drop(testCommands.length - 1)
) as A.NonEmptyArray<BuildStepCommand>;

const copy: A.NonEmptyArray<CopyFromTo> = [
  {
    from: '.',
    to: 'app',
    layer: O.some('build')
  }
];

export const testBuildSteps = [
  [
    'WithUser',
    Step({
      commands,
      copy,

      env: new Map([['env', 'env']]),
      args: new Map([['args', 'args']]),
      cleanupEnv: ['env'],

      uid: 1000,
      gid: 1000,
      user: 'test',
      makeUser: true
    })
  ],
  [
    'WithoutUser',
    Step({
      commands,
      copy,

      env: new Map([['env', 'env']]),
      args: new Map([['args', 'args']]),

      uid: 1000,
      gid: 1000,
      user: 'test'
    })
  ]
];

export const testBuildLayer = Layer({
  name: 'test',
  from: 'test:latest',
  steps: [testBuildSteps[0][1] as BuildStep]
});

export const testContainer = Container({
  org: 'testorg',
  name: 'testname',
  layers: [testBuildLayer],
  entrypoint: ['/bin/test'],
  tags: ['testorg/testname:latest'],
  distro: 'debian'
});
