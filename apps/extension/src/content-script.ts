import { age6ContentScript } from '@actoolkit/age-6';
import { BrowserRequest } from '@actoolkit/browser';
import { INJECTOR, REQUEST } from '@actoolkit/core';

try {
    INJECTOR.setValue(REQUEST, new BrowserRequest());

    age6ContentScript().catch((e: Error) => {
        console.error(e);
    });
} catch (e) {
    console.error(e);
}
