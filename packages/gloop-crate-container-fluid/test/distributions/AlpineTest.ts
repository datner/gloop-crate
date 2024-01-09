/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe } from 'vitest';

import { GetAlpineVersions } from '../../src/distributions/Alpine.ts';
import { testVersions } from '../versions/Versions.ts';

describe('Alpine Versions', async () => {
  testVersions(GetAlpineVersions, true);
});
