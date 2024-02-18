/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as Ef from 'effect/Effect';
import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as Platform from '@effect/platform';

export const CopyFile = (from: string, to: string) =>
  F.pipe(
    Platform.FileSystem.FileSystem,
    Ef.flatMap((fs) =>
      F.pipe(
        fs.stat(from),
        Ef.flatMap((stat) => {
          if (stat.type === 'File') {
            return fs.copyFile(from, to);
          }

          return Ef.log(`${from} is a ${stat.type}`);
        })
      )
    )
  );

export const CopyRecursive = (from: string, to: string): Ef.Effect<void, Platform.Error.PlatformError, Platform.FileSystem.FileSystem | Platform.Path.Path> =>
  F.pipe(
    Ef.Do,
    Ef.bind('fs', () => Platform.FileSystem.FileSystem),
    Ef.bind('path', () => Platform.Path.Path),
    Ef.flatMap(({ fs, path }) =>
      F.pipe(
        fs.readDirectory(from),
        Ef.map(
          A.map((file) =>
            F.pipe(
              fs.stat(path.join(from, file)),
              Ef.map((stat) => ({ file, stat }))
            )
          )
        ),
        Ef.flatMap(Ef.all),
        Ef.map(
          A.map(({ file, stat }) => {
            if (stat.type === 'Directory') {
              return F.pipe(
                fs.makeDirectory(path.join(to, file)),
                Ef.andThen(() => CopyRecursive(path.join(from, file), path.join(to, file)))
              );
            }

            return CopyFile(path.join(from, file), path.join(to, file));
          })
        ),
        Ef.flatMap(Ef.all)
      )
    ),
    Ef.map(F.constVoid)
  );
