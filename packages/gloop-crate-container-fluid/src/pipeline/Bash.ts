/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as path from 'node:path';

import { Container } from 'container-fluid/Container.ts';

import * as Ef from 'effect/Effect';
import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as Platform from '@effect/platform';
import { CreateStructure } from 'container-fluid/pipeline/Folders.ts';

const buildContainer = (cwd: string, dir: string, tags: string[], withPids = true) => {
  const tagArgs = F.pipe(
    tags,
    A.map((tag: string) => `-t ${tag}`)
  );

  const storePIDs = withPids ? `; pids+=($!)` : '';

  return `cd ${path.relative(cwd, dir)} && docker build ${tagArgs} . ${storePIDs}`;
};

const buildAllContainersScript = (targetDir: string, containers: Container[][]) => {
  const renderedLayers = F.pipe(
    containers,
    A.map(
      F.flow(
        A.map((cont) => buildContainer(targetDir, cont.name, cont.tags)),
        A.join('\n')
      )
    ),
    A.join('\nwait_all\n')
  );

  return `#!/usr/bin/env bash
set -eux

cd "$(dirname "$0")" || exit 1

pids=()
function wait_all() {
  for pid in \${pids[*]}; do
    wait $pid
  done
  pids=()
}

${renderedLayers}
`;
};

export const Bash = (targetDir: string, containers: Container[][], scriptName = 'build.sh') =>
  F.pipe(
    CreateStructure(targetDir, containers),
    Ef.flatMap(F.constant(Ef.Do)),
    Ef.bind('fs', () => Platform.FileSystem.FileSystem),
    Ef.bind('path', () => Platform.Path.Path),
    Ef.flatMap(({ fs, path }) =>
      fs.writeFileString(path.join(targetDir, scriptName), buildAllContainersScript(targetDir, containers), {
        flag: 'w+'
      })
    )
  );
