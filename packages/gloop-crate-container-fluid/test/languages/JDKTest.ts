/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe } from 'vitest';

import { GetJDKVersions } from '../../src/languages/JDK.ts';

import { testVersions } from '../versions/Versions.ts';

describe('JDK Versions', async () => {
  testVersions(GetJDKVersions);
});
