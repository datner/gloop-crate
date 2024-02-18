/* eslint-disable license-header/header, eslint-comments/disable-enable-pair */
/**
     Copyright (c) 2024 Crate Monster

     This Source Code Form is "Incompatible With Secondary Licenses", as defined by the Mozilla Public License, v. 2.0.

     This Source Code Form is used to generate a Derived RedHat Universal Base Image (UBI) Dockerfiles,
     build and distribute the respective OpenSource projects managed by the Gloop Crate project.
     Gloop Crate project Dockerfiles and Images usage does not imply, in any shape or form, that Red Hat support or endorse their usage.
 */

import * as Ef from 'effect/Effect';

import { Chunks as OracleChunks } from 'container-fluid/distributions/Notora.ts';

export const Chunks = OracleChunks;

// TODO: bringing JSDOM for redhat / dockerhub sites is too cumbersome
export const GetUniversalBaseImageVersions = Ef.succeed(['7', '8', '9']);
