/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

// import * as F from 'effect/Function';
// import * as Ef from 'effect/Effect';
// import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
// import * as ConfigError from 'effect/ConfigError';

import { GetGithubVersions } from 'container-fluid/versions/GitVersion.ts';

import { Distro } from 'container-fluid/Distro.ts';
import { GoInstall, GolangApp } from '../../../languages/Golang.ts';
export const GetKnativeEventingVersions = GetGithubVersions('knative-eventing', 'knative', 'eventing');

export const KnativeEventing = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  GolangApp(
    GetKnativeEventingVersions,
    org,
    distro,
    'nats',
    'rabbitmq',
    'rabbitmq-server',
    timestamp,
    [
      `${GoInstall} ./cmd/apiserver_receive_adapter`,
      `${GoInstall} ./cmd/appender`,
      `${GoInstall} ./cmd/controller`,
      `${GoInstall} ./cmd/event_display`,
      `${GoInstall} ./cmd/heartbeats`,
      `${GoInstall} ./cmd/heartbeats_receiver`,
      `${GoInstall} ./cmd/in_memory/channel_controller`,
      `${GoInstall} ./cmd/in_memory/channel_dispatcher`,
      `${GoInstall} ./cmd/mtchannel_broker`,
      `${GoInstall} ./cmd/mtping`,
      `${GoInstall} ./cmd/pong`,
      `${GoInstall} ./cmd/schema`,
      `${GoInstall} ./cmd/webhook`,
      `${GoInstall} ./cmd/websocketsource`
    ],
    version
  );
