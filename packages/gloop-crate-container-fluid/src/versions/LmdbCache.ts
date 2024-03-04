/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as Persistence from '@effect/experimental/Persistence';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Lmdb from 'lmdb';

export const make = (options: Lmdb.RootDatabaseOptionsWithPath) =>
  F.pipe(
    Ef.acquireRelease(
      Ef.sync(() => Lmdb.open(options)),
      (lmdb) => Ef.promise(() => lmdb.close())
    ),
    Ef.map((lmdb) =>
      Persistence.BackingPersistence.of({
        [Persistence.BackingPersistenceTypeId]: Persistence.BackingPersistenceTypeId,
        make: (storeId) =>
          F.pipe(
            Ef.acquireRelease(
              Ef.sync(() => lmdb.openDB({ name: storeId })),
              (store) => Ef.promise(() => store.close())
            ),
            Ef.map((store) => ({
              get: (key) =>
                Ef.try({
                  try: () => Option.fromNullable(store.get(key)),
                  catch: (error) => new Persistence.PersistenceBackingError({ method: 'get', error })
                }),
              getMany: (keys) =>
                Ef.tryPromise({
                  try: () => store.getMany(keys).then((_) => _.map(Option.fromNullable)),
                  catch: (error) => new Persistence.PersistenceBackingError({ method: 'getMany', error })
                }),
              set: (key, value) =>
                Ef.tryPromise({
                  try: () => {
                    // if (typeof value === 'object') {
                    //   return store.put(key, { ...value, created: Date.now() });
                    // }

                    return store.put(key, value);
                  },
                  catch: (error) => new Persistence.PersistenceBackingError({ method: 'set', error })
                }),
              remove: (key) =>
                Ef.tryPromise({
                  try: () => store.remove(key),
                  catch: (error) => new Persistence.PersistenceBackingError({ method: 'remove', error })
                })
            }))
          )
      })
    )
  );

export const layer = (options: Lmdb.RootDatabaseOptionsWithPath): Layer.Layer<Persistence.BackingPersistence> =>
  Layer.scoped(Persistence.BackingPersistence, make(options));

export const layerResult = (options: Lmdb.RootDatabaseOptionsWithPath): Layer.Layer<Persistence.ResultPersistence> =>
  F.pipe(Persistence.layerResult, Layer.provide(layer(options)));
