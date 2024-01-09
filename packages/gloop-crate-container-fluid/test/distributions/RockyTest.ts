/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe } from 'vitest';

import { GetRockyVersions } from '../../src/distributions/Rocky.ts';
import { testVersions } from '../versions/Versions.ts';

describe('Rocky Versions', async () => {
  testVersions(GetRockyVersions);
});
