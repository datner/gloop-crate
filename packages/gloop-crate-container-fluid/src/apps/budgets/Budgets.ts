/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

// import * as Ef from 'effect/Effect';
import * as HashMap from 'effect/HashMap';

import { Infracost, GetInfraCostVersions } from './infracost/Infracost.ts';
import { OpenCost, GetOpenCostVersions } from './opencost/Opencost.ts';

export const BudgetsVersions = HashMap.fromIterable([
  ['infracost', GetInfraCostVersions],
  ['opencost', GetOpenCostVersions]
]);

export const BudgetsContainers = HashMap.fromIterable([
  ['infracost', Infracost],
  ['opencost', OpenCost]
]);
