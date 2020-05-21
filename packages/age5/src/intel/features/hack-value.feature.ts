import { Funds, HackReport, IntelRepository, Rank, RankRepository, Score } from '@actoolkit/domain';

import { NegativeTextComponentFactory, PositiveTextComponentFactory, throwIt } from '../../shared';
import { isHackReport } from '../helpers/is-hack-report.helper';

export async function hackValueFeature(): Promise<void> {
    const mainPage: HTMLElement = document.getElementById('main-page-data') ?? throwIt('Cannot find main page data');

    if (!isHackReport(mainPage)) {
        return;
    }

    const reports: Array<HTMLTableElement> = Array.from(document.querySelectorAll('#main-page-data > table'));
    const intelRepository: IntelRepository = new IntelRepository();
    const rankRepository: RankRepository = new RankRepository();

    await Promise.all(reports.map(async(reportElement: HTMLTableElement, index: number): Promise<void> => {
        const report: HackReport = await intelRepository.parseHackReport(reportElement);
        const titleCell: HTMLTableCellElement = reportElement.querySelector('tr:nth-of-type(2) > td') ?? throwIt(`Cannot find title cell for hack report ${index}`);
        const rank: Rank = await rankRepository.getForId(report.target.id);
        const staffValue: Funds = report.staff.value();
        const hiddenScore: Score = Score.Subtract(rank.score, Score.ForFunds(staffValue));

        titleCell.appendChild(PositiveTextComponentFactory(`[${staffValue.toString()}]`, 'Visible funds'));
        titleCell.appendChild(NegativeTextComponentFactory(`[${hiddenScore.toFunds().toString()}]`, 'Hidden funds'));
    }));
}
