/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe } from 'vitest';

import { GetGraalVMVersions } from 'container-fluid/languages/GraalVM.ts';

import { testVersions } from '../versions/Versions.ts';

describe('GraalVM Versions', async () => {
  testVersions(GetGraalVMVersions, true, true);
});
