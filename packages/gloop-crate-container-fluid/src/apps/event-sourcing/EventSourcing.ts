/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { Kafka, GetKafkaVersions } from './kafka/Kafka.ts';
import { Nats, GetNatsVersions } from './nats/Nats.ts';
import { RabbitMQ, GetRabbitMQVersions } from './rabbitmq/RabbitMQ.ts';
import { RedPanda, GetRedPandaVersions } from './redpanda/RedPanda.ts';
import { RedPandaOperator, GetRedPandaOperatorVersions } from './redpanda-operator/RedPandaOperator.ts';
import { Strimzi, GetStrimziVersions } from './strimzi/Strimzi.ts';

export const EventSourcingVersions = HashMap.fromIterable([
  ['kafka', GetKafkaVersions],
  ['nats', GetNatsVersions],
  ['rabbitmq', GetRabbitMQVersions],
  ['redpanda', GetRedPandaVersions],
  ['redpanda-operator', GetRedPandaOperatorVersions],
  ['strimzi', GetStrimziVersions]
]);

export const EventSourcingContainers = HashMap.fromIterable([
  ['kafka', Kafka],
  ['nats', Nats],
  ['rabbitmq', RabbitMQ],
  ['redpanda', RedPanda],
  ['redpanda-operator', RedPandaOperator],
  ['strimzi', Strimzi]
]);
