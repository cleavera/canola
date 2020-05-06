declare const browser: any;

function openWindow() {
    let createData = {
        url: 'age6/index.html'
    };

    browser.tabs.create(createData);
}

browser.runtime.onMessage.addListener(openWindow);
