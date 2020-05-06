import { age6ContentScript } from '@actoolkit/age-6';
import { BrowserRequest } from '@actoolkit/browser';
import { INJECTOR, REQUEST } from '@actoolkit/core';

declare const browser: any;

try {
    INJECTOR.setValue(REQUEST, new BrowserRequest('http://www.bushtarion.com'));

    age6ContentScript().catch((e: Error) => {
        console.error(e);
    });

    const age6Button: HTMLButtonElement = document.createElement('button');

    age6Button.textContent = 'Open age 6';
    age6Button.style.cssText = 'position: fixed; bottom: 0; right: 0;';
    age6Button.addEventListener('click', () => {
        browser.runtime.sendMessage('open sesame');
    });

    document.body.appendChild(age6Button);
} catch (e) {
    console.error(e);
}
