/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe } from 'vitest';

import { Base } from 'container-fluid/containers/DistroBase.ts';
import { testContainerRender } from './Container.ts';

describe('Base Image', () => {
  testContainerRender((distro) => Base('org', distro, Date.parse('01 01 2024')), 'base');
});
