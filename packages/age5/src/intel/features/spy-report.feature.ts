import { CurrentPointInTimeRepository, IntelRepository, MobNews, NewsReport, PointInTime, Rank, RankRepository, SpyReport, Ticks } from '@canola/domain';

import { ActivityGraphComponentFactory, ArModComponentFactory, IdListComponentFactory, insertAfter, MobComponentFactory, NoInfoComponentFactory, PositiveTextComponentFactory, TableCellComponentFactory, TableRowComponentFactory, TextComponentFactory, throwIt } from '../../shared';
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
    const activityHeaderCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory('Activity')], 2);
    const incomingHeaderCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory('Incoming')]);
    const outgoingHeaderCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory('Outgoing')]);
    const defendersLabelCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory(`Defenders [${spyReport.defenders.length} total]`)], 2);
    const defendersCell: HTMLTableCellElement = TableCellComponentFactory([spyReport.defenders.length === 0 ? NoInfoComponentFactory('No defenders') : IdListComponentFactory(spyReport.defenders)], 2);
    const hasAttackedLabelCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory(`Has attacked [${spyReport.hasAttacked.length} total]`)], 2);
    const hasAttackedCell: HTMLTableCellElement = TableCellComponentFactory([spyReport.hasAttacked.length === 0 ? NoInfoComponentFactory('No attacks') : IdListComponentFactory(spyReport.hasAttacked)], 2);
    const hasAttackedInLastDayLabelCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory(`Has attacked in last 24 hours [${spyReport.hasAttackedInLastDay.length} total]`)], 2);
    const hasAttackedInLastDayCell: HTMLTableCellElement = TableCellComponentFactory([spyReport.hasAttackedInLastDay.length === 0 ? NoInfoComponentFactory('No attacks') : IdListComponentFactory(spyReport.hasAttackedInLastDay)], 2);

    const activityCell: HTMLTableCellElement = TableCellComponentFactory([ActivityGraphComponentFactory(spyReport.activity.groupByHours(currentPointInTime))], 2);

    let incomingCell: HTMLTableCellElement | null = null;
    let outgoingCell: HTMLTableCellElement | null = null;

    if (spyReport.incoming.length > 0) {
        incomingCell = TableCellComponentFactory(spyReport.incoming.map((incoming: MobNews) => {
            return MobComponentFactory(incoming);
        }));
    } else {
        incomingCell = TableCellComponentFactory([NoInfoComponentFactory('No incoming mobs')]);
    }

    if (spyReport.outgoings.length > 0) {
        outgoingCell = TableCellComponentFactory(spyReport.outgoings.map((outgoing: MobNews) => {
            return MobComponentFactory(outgoing);
        }));
    } else {
        outgoingCell = TableCellComponentFactory([NoInfoComponentFactory('No outgoing mobs')]);
    }

    const mobHeaderRow: HTMLTableRowElement = TableRowComponentFactory(incomingHeaderCell, outgoingHeaderCell);
    const summaryHeaderRow: HTMLTableRowElement = TableRowComponentFactory(summaryHeaderCell);
    const mobRow: HTMLTableRowElement = TableRowComponentFactory(incomingCell, outgoingCell);
    const defendersRow: HTMLTableRowElement = TableRowComponentFactory(defendersCell);
    const hasAttackedRow: HTMLTableRowElement = TableRowComponentFactory(hasAttackedCell);
    const hasAttackedInLastDayRow: HTMLTableRowElement = TableRowComponentFactory(hasAttackedInLastDayCell);
    const activityRow: HTMLTableRowElement = TableRowComponentFactory(activityCell);
    const defendersHeaderRow: HTMLTableRowElement = TableRowComponentFactory(defendersLabelCell);
    const hasAttackedHeaderRow: HTMLTableRowElement = TableRowComponentFactory(hasAttackedLabelCell);
    const hasAttackedInLastDayHeaderRow: HTMLTableRowElement = TableRowComponentFactory(hasAttackedInLastDayLabelCell);
    const activityHeaderRow: HTMLTableRowElement = TableRowComponentFactory(activityHeaderCell);

    const arModCell: HTMLTableCellElement = TableCellComponentFactory([
        TextComponentFactory('Max ar modifier: '),
        PositiveTextComponentFactory(spyReport.arMod.toString()),
        ArModComponentFactory(spyReport.arMod, targetRank.score)
    ], 2);

    const arModRow: HTMLTableRowElement = TableRowComponentFactory(arModCell);
    arModRow.classList.add('lightbackground');
    mobHeaderRow.classList.add('lightbackground');
    defendersRow.classList.add('nonebackground');
    hasAttackedRow.classList.add('nonebackground');
    hasAttackedInLastDayRow.classList.add('nonebackground');
    activityRow.classList.add('nonebackground');
    summaryHeaderRow.classList.add('header');
    defendersHeaderRow.classList.add('header');
    hasAttackedHeaderRow.classList.add('header');
    hasAttackedInLastDayHeaderRow.classList.add('header');
    activityHeaderRow.classList.add('header');

    summaryHeaderRow.style.textAlign = 'center';
    defendersHeaderRow.style.textAlign = 'center';
    hasAttackedHeaderRow.style.textAlign = 'center';
    hasAttackedInLastDayHeaderRow.style.textAlign = 'center';
    activityHeaderRow.style.textAlign = 'center';
    activityCell.style.padding = '10px 20px';

    (reportHeader.parentElement ?? throwIt('Cannot append to report')).insertBefore(summaryHeaderRow, reportHeader);

    insertAfter(activityRow, summaryHeaderRow);
    insertAfter(activityHeaderRow, summaryHeaderRow);
    insertAfter(defendersRow, summaryHeaderRow);
    insertAfter(defendersHeaderRow, summaryHeaderRow);
    insertAfter(hasAttackedRow, summaryHeaderRow);
    insertAfter(hasAttackedHeaderRow, summaryHeaderRow);
    insertAfter(hasAttackedInLastDayRow, summaryHeaderRow);
    insertAfter(hasAttackedInLastDayHeaderRow, summaryHeaderRow);
    insertAfter(arModRow, summaryHeaderRow);
    insertAfter(mobRow, summaryHeaderRow);
    insertAfter(mobHeaderRow, summaryHeaderRow);
}

