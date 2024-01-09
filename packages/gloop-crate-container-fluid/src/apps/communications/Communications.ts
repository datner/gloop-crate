/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as HashMap from 'effect/HashMap';

import { RocketChat, GetRocketChatVersions } from './rocketchat/RocketChat.ts';

export const CommunicationsVersions = HashMap.fromIterable([['rocket-chat', GetRocketChatVersions]]);

export const CommunicationsContainers = HashMap.fromIterable([['rocket-chat', RocketChat]]);
