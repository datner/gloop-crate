/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe } from 'vitest';

import { GetUniversalBaseImageVersions } from '../../src/distributions/UBI.ts';
import { testVersions } from '../versions/Versions.ts';

describe('UBI Versions', async () => {
  testVersions(GetUniversalBaseImageVersions);
});
