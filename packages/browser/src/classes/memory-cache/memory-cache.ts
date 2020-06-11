import { ICache, ICacheKey } from '@canola/core';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { CacheItem } from '../cache-item/cache-item';

export class MemoryCache implements ICache {
    private readonly _cache: Map<ICacheKey, CacheItem>;
    private readonly _defaultLifespan: number;

    constructor(defaultLifespan: number) {
        this._defaultLifespan = defaultLifespan;
        this._cache = new Map<ICacheKey, CacheItem>();
    }

    public has(key: ICacheKey, maxAge: Maybe<number> = null): boolean {
        const cacheItem: Maybe<CacheItem> = this._cache.get(key) ?? null;

        if (isNull(cacheItem)) {
            return false;
        }

        if (isNull(maxAge)) {
            return true;
        }

        return (cacheItem.updated + maxAge) > Date.now();
    }

    public get<T = unknown>(key: ICacheKey): T {
        const cacheEntry: Maybe<CacheItem> = this._cache.get(key) ?? null;

        if (isNull(cacheEntry)) {
            throw new Error(`Missing cache entry for ${key.toString()}`);
        }

        return cacheEntry.value;
    }

    public set(key: ICacheKey, value: unknown, cacheExpiry: number = this._defaultLifespan): void {
        const cacheEntry: Maybe<CacheItem> = this._cache.get(key) ?? null;

        if (!isNull(cacheEntry)) {
            cacheEntry.refresh(value);

            return;
        }

        this._cache.set(key, new CacheItem(value, () => {
            this._cache.delete(key);
        }, cacheExpiry));
    }

    public clear(): void {
        this._cache.forEach((cacheEntry: CacheItem) => {
            cacheEntry.onDestroy();
        });

        this._cache.clear();
    }
}
