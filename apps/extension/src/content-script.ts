import { age5 } from '@canola/age5';
import { MemoryCache, BrowserRequest } from '@canola/browser';
import { CACHE, INJECTOR, REQUEST } from '@canola/core';

try {
    INJECTOR.setValue(CACHE, new MemoryCache(60000));
    INJECTOR.setValue(REQUEST, new BrowserRequest(`${window.location.protocol}//${window.location.host}`));

    age5().catch((e: Error) => {
        console.error(e);
    });
} catch (e) {
    console.error(e);
}
