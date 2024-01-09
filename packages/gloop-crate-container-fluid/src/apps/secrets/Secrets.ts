/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { CertManager, GetCertManagerVersions } from './cert-manager/CertManager.ts';
import { Cosign, GetCosignVersions } from './cosign/Cosign.ts';
import { ExternalSecretsOperator, GetExternalSecretsOperatorVersions } from './external-secrets-operator/ExternalSecretsOperator.ts';
import { GitSign, GetGitSignVersions } from './gitsign/GitSign.ts';

export const SecretsVersions = HashMap.fromIterable([
  ['cert-manager', GetCertManagerVersions],
  ['cosign', GetCosignVersions],
  ['external-secrets-operator', GetExternalSecretsOperatorVersions],
  ['gitsign', GetGitSignVersions]
]);

export const SecretsContainers = HashMap.fromIterable([
  ['cert-manager', CertManager],
  ['cosign', Cosign],
  ['external-secrets-operator', ExternalSecretsOperator],
  ['gitsign', GitSign]
]);
