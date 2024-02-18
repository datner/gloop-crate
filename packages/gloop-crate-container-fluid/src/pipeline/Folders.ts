/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as Ef from 'effect/Effect';
import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
// import * as S from 'effect/String';
// import * as O from 'effect/Option';
// import * as Data from 'effect/Data';
// import * as ConfigError from 'effect/ConfigError';
import * as Platform from '@effect/platform';

import { Container, CopyContext } from 'container-fluid/Container.ts';

export const CreateStructure = (targetDir: string, containers: Container[][]) =>
  F.pipe(
    Ef.Do,
    Ef.bind('fs', () => Platform.FileSystem.FileSystem),
    Ef.bind('path', () => Platform.Path.Path),
    Ef.flatMap(({ fs, path }) =>
      F.pipe(
        fs.makeDirectory(targetDir),
        Ef.orElse(() => Ef.succeed(F.constVoid())),
        Ef.flatMap(() =>
          F.pipe(
            containers,
            A.flatten,
            A.map((container: Container) => F.pipe(fs.makeDirectory(path.join(targetDir, container.name)), Ef.map(F.constant(container)))),
            Ef.all,
            Ef.withConcurrency(4),
            Ef.map(A.map((container) => CopyContext(container, path.join(targetDir, container.name)))),
            Ef.flatMap(Ef.all)
          )
        )
      )
    ),
    Ef.map(F.constVoid)
  );
