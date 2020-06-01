import { IDomElement } from '@actoolkit/core';

import { throwIt } from '../../shared';

const SPY_REPORT_PATTERN: RegExp = /Spy report on (.+) successful:/;

export function isSpyReport(mainPageElement: IDomElement): boolean {
    const pageText: string = mainPageElement.textContent ?? throwIt('Not valid intel page');

    return SPY_REPORT_PATTERN.test(pageText);
}
