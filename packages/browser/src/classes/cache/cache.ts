import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { CacheItem } from '../cache-item/cache-item';

export class Cache {
    private readonly _cache: Map<string, CacheItem>;
    private readonly _defaultLifespan: number;

    constructor(defaultLifespan: number) {
        this._defaultLifespan = defaultLifespan;
        this._cache = new Map<string, CacheItem>();
    }

    public has(key: string, maxAge: Maybe<number> = null): boolean {
        const cacheItem: Maybe<CacheItem> = this._cache.get(key) ?? null;

        if (isNull(cacheItem)) {
            return false;
        }

        if (isNull(maxAge)) {
            return true;
        }

        return (cacheItem.updated + maxAge) > Date.now();
    }

    public get(key: string): string {
        const cacheEntry: Maybe<CacheItem> = this._cache.get(key) ?? null;

        if (isNull(cacheEntry)) {
            throw new Error(`Missing cache entry for ${key}`);
        }

        return cacheEntry.value;
    }

    public set(key: string, value: string): void {
        const cacheEntry: Maybe<CacheItem> = this._cache.get(key) ?? null;

        if (!isNull(cacheEntry)) {
            cacheEntry.refresh(value);

            return;
        }

        this._cache.set(key, new CacheItem(value, () => {
            this._cache.delete(key);
        }, this._defaultLifespan));
    }

    public clear(): void {
        this._cache.forEach((cacheEntry: CacheItem) => {
            cacheEntry.onDestroy();
        });

        this._cache.clear();
    }
}
