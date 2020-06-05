import { Maybe } from '@cleavera/types';

import { ICacheKey } from './cache-key.interface';

export interface ICache {
    has(key: ICacheKey, maxAge?: Maybe<number>): boolean;
    get<T = unknown>(key: ICacheKey): T;
    set(key: ICacheKey, value: unknown, cacheExpiry?: number): void;
    clear(): void;
}
