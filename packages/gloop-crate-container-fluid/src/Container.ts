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

import { AllDistros, Distro } from './Distro.ts';

import { InvalidVersionError, Versions } from './Versions.ts';
import { HttpService } from './Http.ts';
import { ResolveVersionsErr } from './versions/ScrapedVersion.ts';
import { BuildLayer, LayerToString } from './containers/BuildLayer.ts';

export { Layer } from './containers/BuildLayer.ts';
export { Step } from './containers/BuildStep.ts';
export { Command } from './containers/BuildStepCommand.ts';

import { Base } from './containers/DistroBase.ts';
import { Build } from './containers/DistroBuild.ts';
import { Distroless } from './containers/Distroless.ts';
import { Erlang } from './languages/Erlang.ts';
import { Golang } from './languages/Golang.ts';
import { GraalPy } from './languages/GraalPy.ts';
import { JDK } from './languages/JDK.ts';
import { Node } from './languages/Node.ts';
import { Python } from './languages/Python.ts';
import { Ruby } from './languages/Ruby.ts';
import { Rust } from './languages/Rust.ts';
import { TruffleRuby } from './languages/TruffleRuby.ts';

import { ArtifactsContainers } from './apps/artifacts/Artifacts.ts';
import { AutoscalingContainers } from './apps/autoscaling/Autoscaling.ts';
import { BackupsContainers } from './apps/backups/Backups.ts';
import { BudgetsContainers } from './apps/budgets/Budgets.ts';
import { ChaosContainers } from './apps/chaos/Chaos.ts';
import { CommunicationsContainers } from './apps/communications/Communications.ts';
import { ConnectivityContainers } from './apps/connectivity/Connectivity.ts';
import { DatabaseContainers } from './apps/database/Database.ts';
import { DeliveryContainers } from './apps/delivery/Delivery.ts';
import { DevelopmentContainers } from './apps/development/Development.ts';
import { DomainsContainers } from './apps/domains/Domains.ts';
import { EventSourcingContainers } from './apps/event-sourcing/EventSourcing.ts';
import { ExtractTransformLoadContainers } from './apps/extract-transform-load/ExtractTransformLoad.ts';
import { GitContainers } from './apps/git/Git.ts';
import { InfraContainers } from './apps/infra/Infra.ts';
import { ItsmContainers } from './apps/itsm/Itsm.ts';
import { MachineLearningContainers } from './apps/machine-learning/MachineLearning.ts';
import { ObservabilityContainers } from './apps/observability/Observability.ts';
import { SecretsContainers } from './apps/secrets/Secrets.ts';
import { SecurityContainers } from './apps/security/Security.ts';
import { ServerlessContainers } from './apps/serverless/Serverless.ts';
import { ServiceMeshContainers } from './apps/service-mesh/ServiceMesh.ts';
import { StorageContainers } from './apps/storage/Storage.ts';

export type CopyFromTo = { from: string; to: string; layer: string };

// @ts-expect-error Data.Case
export interface Container extends Data.Case {
  readonly _tag: 'Container';

  readonly org: string;
  readonly name: string;
  readonly layers: BuildLayer[];
  readonly availableVersions: Ef.Effect<string[], ResolveVersionsErr, HttpService>;

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
        O.filter((r) => A.contains(availableVersions, r)),
        O.match({
          onNone: () => InvalidVersionError(distro, version, A.last(availableVersions)),
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
    LanguageContainers,
    // Everything else
    ArtifactsContainers,
    AutoscalingContainers,
    BackupsContainers,
    BudgetsContainers,
    ChaosContainers,
    CommunicationsContainers,
    ConnectivityContainers,
    DatabaseContainers,
    DeliveryContainers,
    DevelopmentContainers,
    DomainsContainers,
    EventSourcingContainers,
    ExtractTransformLoadContainers,
    GitContainers,
    InfraContainers,
    ItsmContainers,
    MachineLearningContainers,
    ObservabilityContainers,
    SecretsContainers,
    SecurityContainers,
    ServerlessContainers,
    ServiceMeshContainers,
    StorageContainers
  ],
  A.map(HashMap.toEntries),
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
