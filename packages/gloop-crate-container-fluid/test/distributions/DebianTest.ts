/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe } from 'vitest';

import { GetDebianVersions } from 'container-fluid/distributions/Debian.ts';
import { testVersions } from '../versions/Versions.ts';

describe('Debian Versions', async () => {
  testVersions(GetDebianVersions);
});
