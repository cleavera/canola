import { age5 } from '@actoolkit/age5';
import { BrowserRequest } from '@actoolkit/browser';
import { INJECTOR, REQUEST } from '@actoolkit/core';

declare const browser: any;

try {
    INJECTOR.setValue(REQUEST, new BrowserRequest('http://www.bushtarion.com'));

    const age6Button: HTMLButtonElement = document.createElement('button');

    age6Button.textContent = 'Open age 6';
    age6Button.style.cssText = 'position: fixed; bottom: 0; right: 0; display: inline-block; padding: 10px; background: #090; color: #fff; border: 1px solid #333;';
    age6Button.addEventListener('click', () => {
        browser.runtime.sendMessage('open sesame');
    });

    age5().catch((e: Error) => {
        console.error(e);
    });

    document.body.appendChild(age6Button);
} catch (e) {
    console.error(e);
}
