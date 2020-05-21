import { IntelRepository, Workforce } from '@actoolkit/domain';

import { PositiveTextComponentFactory, throwIt } from '../../shared';
import { isHackReport } from '../helpers/is-hack-report.helper';

export async function hackValueFeature(): Promise<void> {
    const mainPage: HTMLElement = document.getElementById('main-page-data') ?? throwIt('Cannot find main page data');

    if (!isHackReport(mainPage)) {
        return;
    }

    const reports: Array<HTMLTableElement> = Array.from(document.querySelectorAll('#main-page-data > table'));
    const repo: IntelRepository = new IntelRepository();

    await Promise.all(reports.map(async(report: HTMLTableElement, index: number): Promise<void> => {
        const staff: Workforce = await repo.parseHackReport(report);
        const titleCell: HTMLTableCellElement = report.querySelector('tr:nth-of-type(2) > td') ?? throwIt(`Cannot find title cell for hack report ${index}`);

        titleCell.appendChild(PositiveTextComponentFactory(`[${staff.value().toString()}]`));
    }));
}
