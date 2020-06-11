import { CACHE, ICache, INJECTOR } from '@canola/core';

function _throwNoCacheStrategy(): never {
    throw new Error('No cache strategy registered');
}

export function getCacheService(): ICache {
    return INJECTOR.get<ICache>(CACHE) ?? _throwNoCacheStrategy();
}
