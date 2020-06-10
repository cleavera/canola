import { age5 } from '@actoolkit/age5';
import { MemoryCache, BrowserRequest } from '@actoolkit/browser';
import { CACHE, INJECTOR, REQUEST } from '@actoolkit/core';

try {
    INJECTOR.setValue(CACHE, new MemoryCache(60000));
    INJECTOR.setValue(REQUEST, new BrowserRequest(`http://${window.location.host}`));

    age5().catch((e: Error) => {
        console.error(e);
    });
} catch (e) {
    console.error(e);
}
