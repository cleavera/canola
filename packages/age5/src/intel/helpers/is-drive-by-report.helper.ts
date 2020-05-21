import { IDomElement } from '@actoolkit/core';

import { throwIt } from '../../shared';

const DRIVE_BY_REPORT_PATTERN: RegExp = /Drive-By on (.+) successful:/;

export function isDriveByReport(mainPageElement: IDomElement): boolean {
    const pageText: string = mainPageElement.textContent ?? throwIt('Not valid intel page');

    return DRIVE_BY_REPORT_PATTERN.test(pageText);
}
