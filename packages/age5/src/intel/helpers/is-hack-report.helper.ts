import { IDomElement } from '@canola/core';

import { throwIt } from '../../shared';

const HACK_REPORT_PATTERN: RegExp = /System hack on (.+) successful:/;

export function isHackReport(mainPageElement: IDomElement): boolean {
    const pageText: string = mainPageElement.textContent ?? throwIt('Not valid intel page');

    return HACK_REPORT_PATTERN.test(pageText);
}
