/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as Ef from 'effect/Effect';
import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as Data from 'effect/Data';
import * as HashSet from 'effect/HashSet';
import * as HashMap from 'effect/HashMap';
import * as Platform from '@effect/platform';

import { AllDistros, Distro } from 'container-fluid/Distro.ts';

import { InvalidVersionError, Versions } from 'container-fluid/Versions.ts';
import { HttpService } from 'container-fluid/Http.ts';
import { ResolveVersionsErr } from 'container-fluid/versions/ScrapedVersion.ts';
import { BuildLayer, LayerToString } from 'container-fluid/containers/BuildLayer.ts';

export { Layer } from 'container-fluid/containers/BuildLayer.ts';
export { Step } from 'container-fluid/containers/BuildStep.ts';
export { Command } from 'container-fluid/containers/BuildStepCommand.ts';

import { CopyRecursive } from 'container-fluid/Copy.ts';

import { Base } from 'container-fluid/containers/DistroBase.ts';
import { Build } from 'container-fluid/containers/DistroBuild.ts';
import { Distroless } from 'container-fluid/containers/Distroless.ts';
import { Erlang } from 'container-fluid/languages/Erlang.ts';
import { Golang } from 'container-fluid/languages/Golang.ts';
import { GraalPy } from 'container-fluid/languages/GraalPy.ts';
import { JDK } from 'container-fluid/languages/JDK.ts';
import { Node } from 'container-fluid/languages/Node.ts';
import { Python } from 'container-fluid/languages/Python.ts';
import { Ruby } from 'container-fluid/languages/Ruby.ts';
import { Rust } from 'container-fluid/languages/Rust.ts';
import { TruffleRuby } from 'container-fluid/languages/TruffleRuby.ts';

// import { ArtifactsContainers } from 'container-fluid/apps/artifacts/Artifacts.ts';
// import { AutoscalingContainers } from 'container-fluid/apps/autoscaling/Autoscaling.ts';
// import { BackupsContainers } from 'container-fluid/apps/backups/Backups.ts';
// import { BudgetsContainers } from 'container-fluid/apps/budgets/Budgets.ts';
// import { ChaosContainers } from 'container-fluid/apps/chaos/Chaos.ts';
// import { CommunicationsContainers } from 'container-fluid/apps/communications/Communications.ts';
// import { ConnectivityContainers } from 'container-fluid/apps/connectivity/Connectivity.ts';
// import { DatabaseContainers } from 'container-fluid/apps/database/Database.ts';
// import { DeliveryContainers } from 'container-fluid/apps/delivery/Delivery.ts';
// import { DevelopmentContainers } from 'container-fluid/apps/development/Development.ts';
// import { DomainsContainers } from 'container-fluid/apps/domains/Domains.ts';
// import { EventSourcingContainers } from 'container-fluid/apps/event-sourcing/EventSourcing.ts';
// import { ExtractTransformLoadContainers } from 'container-fluid/apps/extract-transform-load/ExtractTransformLoad.ts';
// import { GitContainers } from 'container-fluid/apps/git/Git.ts';
// import { InfraContainers } from 'container-fluid/apps/infra/Infra.ts';
// import { ItsmContainers } from 'container-fluid/apps/itsm/Itsm.ts';
// import { MachineLearningContainers } from 'container-fluid/apps/machine-learning/MachineLearning.ts';
// import { ObservabilityContainers } from 'container-fluid/apps/observability/Observability.ts';
// import { SecretsContainers } from 'container-fluid/apps/secrets/Secrets.ts';
// import { SecurityContainers } from 'container-fluid/apps/security/Security.ts';
// import { ServerlessContainers } from 'container-fluid/apps/serverless/Serverless.ts';
// import { ServiceMeshContainers } from 'container-fluid/apps/service-mesh/ServiceMesh.ts';
// import { StorageContainers } from 'container-fluid/apps/storage/Storage.ts';

// export type CopyFromTo = { from: string; to: string; layer: string };

// @ts-expect-error Data.Case
export interface Container extends Data.Case {
  readonly _tag: 'Container';

  readonly org: string;
  readonly name: string;
  readonly layers: BuildLayer[];
  readonly availableVersions: Ef.Effect<string[], ResolveVersionsErr, HttpService>;

  readonly contextSource: O.Option<string>;
  readonly tags: string[];
  readonly distro: Distro;

  readonly entrypoint: O.Option<A.NonEmptyArray<string>>;
  readonly cmd: O.Option<A.NonEmptyArray<string>>;
  readonly healthcheck: O.Option<A.NonEmptyArray<string>>;
  readonly expose: O.Option<A.NonEmptyArray<number>>;

  readonly dependencies: O.Option<A.NonEmptyArray<string>>;
}

const DockerContainer = Data.tagged<Container>('Container');

type ContainerProps = {
  org: string;
  name: string;
  layers: BuildLayer[];

  tags: string[];
  distro: Distro;

  entrypoint?: A.NonEmptyArray<string>;
  cmd?: A.NonEmptyArray<string>;
  healthcheck?: A.NonEmptyArray<string>;
  expose?: A.NonEmptyArray<number>;

  dependencies?: A.NonEmptyArray<string>;
};

const containerNullable = ['entrypoint', 'cmd', 'healthcheck', 'expose', 'dependencies'];

export const Container = (args: ContainerProps) => {
  const entries = Object.entries(args);

  const nullableEntries = F.pipe(
    entries,
    A.filter(([key]) => containerNullable.includes(key)),
    A.map(([key, val]) => [key, O.fromNullable(val)])
  );

  const nonNullableEntries = F.pipe(
    entries,
    A.filter(([key]) => !containerNullable.includes(key))
  );

  return F.pipe(nullableEntries, A.appendAll(nonNullableEntries), A.prepend(['_tag', 'Container']), Object.fromEntries, DockerContainer);
};

export const versionToUse = (distro: Distro, version: O.Option<string>) => (availableVersions: Ef.Effect<string[], ResolveVersionsErr, HttpService>) =>
  F.pipe(
    availableVersions,
    Ef.flatMap((availableVersions) =>
      F.pipe(
        version,
        O.flatMap((version: string) => (version === 'latest' ? F.pipe(availableVersions, A.last) : O.some(version))),
        O.filter((r) => A.contains(availableVersions, r.toString())),
        O.match({
          onNone: () => InvalidVersionError(distro, version, availableVersions),
          onSome: (version) => Ef.succeed(version)
        })
      )
    )
  );

export const ContainerToString = (distro: Distro) =>
  F.flow((container: Container) => {
    const layers = F.pipe(container.layers, A.map(LayerToString(distro)));

    return F.pipe([...layers], A.join('\n\n'));
  });

export type ContainerFunc = (
  org: string,
  distro: Distro,
  timestamp: number,
  version?: O.Option<string>
) => Ef.Effect<Container, ResolveVersionsErr, HttpService | Versions>;

const DistroContainers = HashMap.fromIterable([
  ['base', Base],
  ['build', Build],
  ['distroless', Distroless]
]);

const LanguageContainers = HashMap.fromIterable([
  ['erlang', Erlang],
  ['golang', Golang],
  ['graalpython', GraalPy],
  ['jdk', JDK],
  ['node', Node],
  ['python', Python],
  ['ruby', Ruby],
  ['rust', Rust],
  ['truffleruby', TruffleRuby]
]);

export const AllContainers = F.pipe(
  [
    DistroContainers,
    LanguageContainers
    // // Everything else
    // ArtifactsContainers,
    // AutoscalingContainers,
    // BackupsContainers,
    // BudgetsContainers,
    // ChaosContainers,
    // CommunicationsContainers,
    // ConnectivityContainers,
    // DatabaseContainers,
    // DeliveryContainers,
    // DevelopmentContainers,
    // DomainsContainers,
    // EventSourcingContainers,
    // ExtractTransformLoadContainers,
    // GitContainers,
    // InfraContainers,
    // ItsmContainers,
    // MachineLearningContainers,
    // ObservabilityContainers,
    // SecretsContainers,
    // SecurityContainers,
    // ServerlessContainers,
    // ServiceMeshContainers,
    // StorageContainers
  ],
  A.map(HashMap.toEntries), // TODO: HashMap.concat ?
  A.flatten,
  HashMap.fromIterable
);

export const LatestContainers = (org: string = 'crate-monster', timestamp: number = Date.parse('01 01 2024'), version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    AllDistros,
    HashSet.map((distro: Distro) =>
      F.pipe(
        AllContainers,
        HashMap.map((func) => func(org, distro, timestamp, version)),
        HashMap.values,
        Ef.all,
        Ef.map((containers) => [distro, containers])
      )
    ),
    Ef.all,
    Ef.map((r) => HashMap.fromIterable(r as Iterable<readonly [Distro, Container[]]>))
  );

export const CopyContext = (container: Container, targetDir: string) =>
  F.pipe(
    container.contextSource,
    O.match({
      onSome: (context) => CopyRecursive(context, targetDir),
      onNone: () => Ef.succeed(F.constVoid()) as Ef.Effect<void, Platform.Error.PlatformError, Platform.FileSystem.FileSystem | Platform.Path.Path>
    })
  );
