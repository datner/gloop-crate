/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';

import { Bash } from 'container-fluid/pipeline/Bash.ts';
import { PowerShell } from 'container-fluid/pipeline/PowerShell.ts';
import { TektonCD } from 'container-fluid/pipeline/TektonCD.ts';
import { GithubActions } from 'container-fluid/pipeline/GithubActions.ts';
import { Gitlab } from 'container-fluid/pipeline/Gitlab.ts';
import { Container } from 'container-fluid/Container.ts';

export type Pipeline = 'bash' | 'powershell' | 'tektoncd' | 'github' | 'gitlab';

export const SortDependencies = (containers: Container[]): Container[][] => {
  const contains = (all: Container[][]) => (name: string) =>
    F.pipe(all, A.map(A.findFirst((c: Container) => c.name === name)), A.findFirst(O.isSome), O.isSome);

  const containsAllDeps = (all: Container[][]) => (cont: Container) =>
    F.pipe(
      cont.dependencies,
      O.map(A.filter((name: string) => !contains(all)(name))),
      O.map(A.isEmptyArray),
      O.getOrElse(() => true)
    );

  const root = F.pipe(
    containers,
    A.filter((c: Container) => O.isNone(c.dependencies))
  );

  const initial = F.pipe(
    containers,
    A.filter((cont) => !A.contains(cont)(root))
  );

  const result = Ef.loop(
    { all: [root], left: initial },
    {
      while: ({ left }) => A.isNonEmptyArray(left),
      body: ({ all }) => Ef.succeed(all),
      step: ({ all, left }) => {
        const nextLayer = F.pipe(left, A.filter(containsAllDeps(all)));

        return {
          all: [...all, nextLayer],
          left: F.pipe(
            left,
            A.filter((c) => !A.contains(c)(nextLayer))
          )
        };
      }
    }
  );

  return F.pipe(
    result,
    Ef.runSync,
    A.last,
    O.getOrElse(() => [])
  );
};

const Pipeline = (pipelineType: Pipeline, targetDir: string, containers: Container[]) => {
  switch (pipelineType) {
    case 'bash':
      return Bash(targetDir, SortDependencies(containers));
    case 'powershell':
      return PowerShell(targetDir, SortDependencies(containers));
    case 'tektoncd':
      return TektonCD(targetDir, SortDependencies(containers));
    case 'github':
      return GithubActions(targetDir, SortDependencies(containers));
    case 'gitlab':
      return Gitlab(targetDir, SortDependencies(containers));
    default:
      return '';
  }
};
