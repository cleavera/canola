import { CompanyName, CurrentPointInTimeRepository, IntelRepository, MobNews, NewsReport, PointInTime, Rank, RankRepository, SpyReport, Ticks } from '@canola/domain';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { ArModComponentFactory, insertAfter, MobComponentFactory, PositiveTextComponentFactory, TableCellComponentFactory, TableRowComponentFactory, TextComponentFactory, throwIt } from '../../shared';
import { isSpyReport } from '../helpers/is-spy-report.helper';

export async function spyReportFeature(): Promise<void> {
    const mainPage: HTMLDivElement = document.querySelector('#main-page-data') ?? throwIt('Cannot find main page data');

    if (!isSpyReport(mainPage)) {
        return;
    }

    const reportElement: HTMLElement = mainPage.querySelector(':scope > div > table:nth-child(2)') ?? throwIt('No spy reports found');
    const reportHeader: HTMLElement = reportElement.querySelector(':scope > tbody > tr:first-child') ?? throwIt('No spy reports found');
    const reportRows: ArrayLike<HTMLElement> = reportElement.querySelectorAll(':scope > tbody > tr:nth-child(even)') ?? throwIt('No spy reports found');
    const currentPointInTime: PointInTime = await new CurrentPointInTimeRepository().get();
    const spyReport: SpyReport = new IntelRepository().parseSpyReport(mainPage, currentPointInTime);

    spyReport.reports.forEach((report: NewsReport, index: number) => {
        const tickDifference: Ticks = PointInTime.Subtract(currentPointInTime, report.time);

        const timeOfDayCell: ChildNode = reportRows[index].firstElementChild ?? throwIt('Invalid date cell');
        let output: string = `${tickDifference.ticks.toLocaleString('en')} ticks ago.`;

        if (tickDifference.ticks === 0) {
            output = 'This tick.';
        } else if (tickDifference.ticks === 1) {
            output = 'Last tick.';
        }

        timeOfDayCell.appendChild(PositiveTextComponentFactory(` ${output}`));
    });

    const targetRank: Rank = await new RankRepository().getForId(spyReport.target.id);

    const summaryHeaderCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory('Summary')], 2);
    const incomingHeaderCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory('Incoming')]);
    const outgoingHeaderCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory('Outgoing')]);
    const defendersLabelCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory(`Defenders [${spyReport.defenders.length} total]`)], 2);
    const defendersCell: HTMLTableCellElement = TableCellComponentFactory([
        TextComponentFactory(spyReport.defenders.reduce<string>((accumulator: Maybe<string>, defender: CompanyName): string => {
            if (isNull(accumulator)) {
                return defender.id;
            }

            return `${accumulator}, ${defender.id}`;
        }, null as any)) // eslint-disable-line @typescript-eslint/no-explicit-any
    ], 2);

    let incomingCell: Maybe<HTMLTableCellElement> = null;
    let outgoingCell: Maybe<HTMLTableCellElement> = null;

    if (spyReport.incoming.length > 0) {
        incomingCell = TableCellComponentFactory(spyReport.incoming.map((incoming: MobNews) => {
            return MobComponentFactory(incoming);
        }));
    } else {
        incomingCell = TableCellComponentFactory([TextComponentFactory('No incoming mobs')]);
    }

    if (spyReport.outgoings.length > 0) {
        outgoingCell = TableCellComponentFactory(spyReport.outgoings.map((outgoing: MobNews) => {
            return MobComponentFactory(outgoing);
        }));
    } else {
        outgoingCell = TableCellComponentFactory([TextComponentFactory('No outgoing mobs')]);
    }

    const mobHeaderRow: HTMLTableRowElement = TableRowComponentFactory(incomingHeaderCell, outgoingHeaderCell);
    const summaryHeaderRow: HTMLTableRowElement = TableRowComponentFactory(summaryHeaderCell);
    const mobRow: HTMLTableRowElement = TableRowComponentFactory(incomingCell, outgoingCell);
    const defendersRow: HTMLTableRowElement = TableRowComponentFactory(defendersCell);
    const defendersHeaderRow: HTMLTableRowElement = TableRowComponentFactory(defendersLabelCell);

    const arModCell: HTMLTableCellElement = TableCellComponentFactory([
        TextComponentFactory('Max ar modifier: '),
        PositiveTextComponentFactory(spyReport.arMod.toString()),
        ArModComponentFactory(spyReport.arMod, targetRank.score)
    ], 2);

    const arModRow: HTMLTableRowElement = TableRowComponentFactory(arModCell);
    arModRow.classList.add('lightbackground');
    mobHeaderRow.classList.add('lightbackground');
    defendersRow.classList.add('nonebackground');
    summaryHeaderRow.classList.add('header');
    defendersHeaderRow.classList.add('header');

    summaryHeaderRow.style.textAlign = 'center';
    defendersHeaderRow.style.textAlign = 'center';

    (reportHeader.parentElement ?? throwIt('Cannot append to report')).insertBefore(summaryHeaderRow, reportHeader);

    insertAfter(defendersRow, summaryHeaderRow);
    insertAfter(defendersHeaderRow, summaryHeaderRow);
    insertAfter(arModRow, summaryHeaderRow);
    insertAfter(mobRow, summaryHeaderRow);
    insertAfter(mobHeaderRow, summaryHeaderRow);
}

