/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

// import * as Ef from 'effect/Effect';
import * as F from 'effect/Function';
// import * as A from 'effect/ReadonlyArray';
// import * as O from 'effect/Option';
// import * as Data from 'effect/Data';
// import * as ConfigError from 'effect/ConfigError';

import { Container } from 'container-fluid/Container.ts';
import { CreateStructure } from 'container-fluid/pipeline/Folders.ts';

export const Gitlab = (targetDir: string, containers: Container[][]) => {
  console.log(containers);
  return F.pipe(CreateStructure(targetDir, containers));
};
