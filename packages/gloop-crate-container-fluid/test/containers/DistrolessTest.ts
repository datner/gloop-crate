/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe } from 'vitest';

import * as O from 'effect/Option';

import { Distroless } from '../../src/containers/Distroless.ts';
import { testContainerRender } from './Container.ts';

describe('Distroless Image', () => {
  testContainerRender((distro) => Distroless('org', distro, Date.parse('01 01 2024'), O.some('latest')), 'distroless');
});
