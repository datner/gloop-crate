/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as Ctx from 'effect/Context';
import * as HashMap from 'effect/HashMap';

import { ResolveVersionsErr } from 'container-fluid/versions/ScrapedVersion.ts';
import { HttpService } from 'container-fluid/Http.ts';

// Distro's
import { GetAlpineVersions } from 'container-fluid/distributions/Alpine.ts';
import { GetDebianVersions } from 'container-fluid/distributions/Debian.ts';
import { GetOracleVersions } from 'container-fluid/distributions/Notora.ts';
import { GetPhotonVersions } from 'container-fluid/distributions/Photon.ts';
import { GetRockyVersions } from 'container-fluid/distributions/Rocky.ts';
import { GetUniversalBaseImageVersions } from 'container-fluid/distributions/UBI.ts';

// Languages
import { GetErlangVersions } from 'container-fluid/languages/Erlang.ts';
import { GetGolangVersions } from 'container-fluid/languages/Golang.ts';
import { GetGraalPyVersions } from 'container-fluid/languages/GraalPy.ts';
import { GetGraalVMVersions } from 'container-fluid/languages/GraalVM.ts';
import { GetJDKVersions } from 'container-fluid/languages/JDK.ts';
import { GetNodeVersions } from 'container-fluid/languages/Node.ts';
import { GetPythonVersions } from 'container-fluid/languages/Python.ts';
import { GetRubyVersions } from 'container-fluid/languages/Ruby.ts';
import { GetTruffleRubyVersions } from 'container-fluid/languages/TruffleRuby.ts';

// Everything else
import { ArtifactVersions } from 'container-fluid/apps/artifacts/Artifacts.ts';
import { AutoscalingVersions } from 'container-fluid/apps/autoscaling/Autoscaling.ts';
import { BackupsVersions } from 'container-fluid/apps/backups/Backups.ts';
import { BudgetsVersions } from 'container-fluid/apps/budgets/Budgets.ts';
import { ChaosVersions } from 'container-fluid/apps/chaos/Chaos.ts';
import { CommunicationsVersions } from 'container-fluid/apps/communications/Communications.ts';
import { ConnectivityVersions } from 'container-fluid/apps/connectivity/Connectivity.ts';
import { DatabaseVersions } from 'container-fluid/apps/database/Database.ts';
import { DeliveryVersions } from 'container-fluid/apps/delivery/Delivery.ts';
import { DevelopmentVersions } from 'container-fluid/apps/development/Development.ts';
import { DomainsVersions } from 'container-fluid/apps/domains/Domains.ts';
import { EventSourcingVersions } from 'container-fluid/apps/event-sourcing/EventSourcing.ts';
import { ExtractTransformLoadVersions } from 'container-fluid/apps/extract-transform-load/ExtractTransformLoad.ts';
import { GitVersions } from 'container-fluid/apps/git/Git.ts';
import { InfraVersions } from 'container-fluid/apps/infra/Infra.ts';
import { ItsmVersions } from 'container-fluid/apps/itsm/Itsm.ts';
import { MachineLearningVersions } from 'container-fluid/apps/machine-learning/MachineLearning.ts';
import { ObservabilityVersions } from 'container-fluid/apps/observability/Observability.ts';
import { SecretsVersions } from 'container-fluid/apps/secrets/Secrets.ts';
import { SecurityVersions } from 'container-fluid/apps/security/Security.ts';
import { ServerlessVersions } from 'container-fluid/apps/serverless/Serverless.ts';
import { ServiceMeshVersions } from 'container-fluid/apps/service-mesh/ServiceMesh.ts';
import { StorageVersions } from 'container-fluid/apps/storage/Storage.ts';

export const InvalidVersionError = (name: string, version: O.Option<string>, versions: string[]) => {
  const reversedVersions = F.pipe(versions, A.reverse, A.join(' '));

  return Ef.fail(
    new ResolveVersionsErr({ name, message: `Invalid version ${O.getOrElse(() => 'unknown')(version)}, last ${name} version is ${reversedVersions}` })
  );
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
