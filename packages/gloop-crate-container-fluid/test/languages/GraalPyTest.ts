/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe } from 'vitest';

import { GetGraalPyVersions } from '../../src/languages/GraalPy.ts';
import { testVersions } from '../versions/Versions.ts';

describe('GraalPy Versions', async () => {
  testVersions(GetGraalPyVersions, true, true);
});
