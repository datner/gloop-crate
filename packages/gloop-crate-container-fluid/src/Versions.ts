/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as O from 'effect/Option';
import * as Ctx from 'effect/Context';
import * as HashMap from 'effect/HashMap';

import { ResolveVersionsErr } from './versions/ScrapedVersion.ts';
import { HttpService } from './Http.ts';

// Distro's
import { GetAlpineVersions } from './distributions/Alpine.ts';
import { GetDebianVersions } from './distributions/Debian.ts';
import { GetOracleVersions } from './distributions/Notora.ts';
import { GetPhotonVersions } from './distributions/Photon.ts';
import { GetRockyVersions } from './distributions/Rocky.ts';
import { GetUniversalBaseImageVersions } from './distributions/UBI.ts';

// Languages
import { GetErlangVersions } from './languages/Erlang.ts';
import { GetGolangVersions } from './languages/Golang.ts';
import { GetGraalPyVersions } from './languages/GraalPy.ts';
import { GetGraalVMVersions } from './languages/GraalVM.ts';
import { GetJDKVersions } from './languages/JDK.ts';
import { GetNodeVersions } from './languages/Node.ts';
import { GetPythonVersions } from './languages/Python.ts';
import { GetRubyVersions } from './languages/Ruby.ts';
import { GetTruffleRubyVersions } from './languages/TruffleRuby.ts';

// Everything else
import { ArtifactVersions } from './apps/artifacts/Artifacts.ts';
import { AutoscalingVersions } from './apps/autoscaling/Autoscaling.ts';
import { BackupsVersions } from './apps/backups/Backups.ts';
import { BudgetsVersions } from './apps/budgets/Budgets.ts';
import { ChaosVersions } from './apps/chaos/Chaos.ts';
import { CommunicationsVersions } from './apps/communications/Communications.ts';
import { ConnectivityVersions } from './apps/connectivity/Connectivity.ts';
import { DatabaseVersions } from './apps/database/Database.ts';
import { DeliveryVersions } from './apps/delivery/Delivery.ts';
import { DevelopmentVersions } from './apps/development/Development.ts';
import { DomainsVersions } from './apps/domains/Domains.ts';
import { EventSourcingVersions } from './apps/event-sourcing/EventSourcing.ts';
import { ExtractTransformLoadVersions } from './apps/extract-transform-load/ExtractTransformLoad.ts';
import { GitVersions } from './apps/git/Git.ts';
import { InfraVersions } from './apps/infra/Infra.ts';
import { ItsmVersions } from './apps/itsm/Itsm.ts';
import { MachineLearningVersions } from './apps/machine-learning/MachineLearning.ts';
import { ObservabilityVersions } from './apps/observability/Observability.ts';
import { SecretsVersions } from './apps/secrets/Secrets.ts';
import { SecurityVersions } from './apps/security/Security.ts';
import { ServerlessVersions } from './apps/serverless/Serverless.ts';
import { ServiceMeshVersions } from './apps/service-mesh/ServiceMesh.ts';
import { StorageVersions } from './apps/storage/Storage.ts';
import * as A from 'effect/ReadonlyArray';

export const InvalidVersionError = (name: string, version: O.Option<string>, lastVersion: O.Option<string>) => {
  const toUnknown = O.getOrElse(() => 'unknown');
  return Ef.fail(new ResolveVersionsErr({ name, message: `Invalid version ${toUnknown(version)}, last ${name} version is ${toUnknown(lastVersion)}` }));
};

const DistroVersions = HashMap.fromIterable([
  ['alpine', GetAlpineVersions],
  ['debian', GetDebianVersions],
  ['rocky', GetRockyVersions],
  ['notora', GetOracleVersions],
  ['photon', GetPhotonVersions],
  ['ubi', GetUniversalBaseImageVersions]
]);

const LanguageVersions = HashMap.fromIterable([
  ['erlang', GetErlangVersions],
  ['golang', GetGolangVersions],
  ['graalpython', GetGraalPyVersions],
  ['graalvm', GetGraalVMVersions],
  ['jdk', GetJDKVersions],
  ['node', GetNodeVersions],
  ['python', GetPythonVersions],
  ['ruby', GetRubyVersions],
  ['truffleruby', GetTruffleRubyVersions]
]);

const AllVersions = F.pipe(
  [
    DistroVersions,
    LanguageVersions,
    // Everything else
    ArtifactVersions,
    AutoscalingVersions,
    BackupsVersions,
    BudgetsVersions,
    ChaosVersions,
    CommunicationsVersions,
    ConnectivityVersions,
    DatabaseVersions,
    DeliveryVersions,
    DevelopmentVersions,
    DomainsVersions,
    EventSourcingVersions,
    ExtractTransformLoadVersions,
    GitVersions,
    InfraVersions,
    ItsmVersions,
    MachineLearningVersions,
    ObservabilityVersions,
    SecretsVersions,
    SecurityVersions,
    ServerlessVersions,
    ServiceMeshVersions,
    StorageVersions
  ],
  A.map(HashMap.toEntries),
  A.flatten,
  HashMap.fromIterable
);

type DerivedVersionsEf = Ef.Effect<HashMap.HashMap<string, string>, ResolveVersionsErr, HttpService>;

type DerivedVersionsFunc = (version: string) => DerivedVersionsEf;
export const DerivedVersions = HashMap.fromIterable<string, DerivedVersionsFunc>([]);

export class Versions extends Ctx.Tag('Versions')<
  Versions,
  {
    readonly getVersions: (name: string) => O.Option<Ef.Effect<string[], ResolveVersionsErr, HttpService>>;
    readonly getDerivedVersions: (name: string, version: string) => DerivedVersionsEf;
  }
>() {}

export const VersionsLive = Versions.of({
  getVersions: (name: string) => F.pipe(AllVersions, HashMap.get(name)),
  getDerivedVersions: (name: string, version: string) =>
    F.pipe(
      DerivedVersions,
      HashMap.get(name),
      O.map((derived) => derived(version)),
      O.getOrElse(() => Ef.succeed(HashMap.empty()))
    )
});
