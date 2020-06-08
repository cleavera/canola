import { ArMod, CompanyName, CurrentPointInTimeRepository, MobNews, MobType, NewsReport, NewsRepository, PointInTime, Ticks } from '@actoolkit/domain';
import { IDict, Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { insertAfter, MobComponentFactory, PositiveTextComponentFactory, TableCellComponentFactory, TableRowComponentFactory, TextComponentFactory, throwIt } from '../../shared';
import { isSpyReport } from '../helpers/is-spy-report.helper';

export async function spyReportFeature(): Promise<void> {
    const mainPage: HTMLDivElement = document.querySelector('#main-page-data') ?? throwIt('Cannot find main page data');

    if (!isSpyReport(mainPage)) {
        return;
    }

    const targetElement: HTMLElement = mainPage.querySelector(':scope > div > table:first-child span > span') ?? throwIt('Could not find target');
    const reportElement: HTMLElement = mainPage.querySelector(':scope > div > table:nth-child(2)') ?? throwIt('No spy reports found');
    const reportHeader: HTMLElement = reportElement.querySelector(':scope > tbody > tr:first-child') ?? throwIt('No spy reports found');
    const reportRows: ArrayLike<HTMLElement> = reportElement.querySelectorAll(':scope > tbody > tr + tr') ?? throwIt('No spy reports found'); // Eugh
    const currentPointInTime: PointInTime = await new CurrentPointInTimeRepository().get();
    // const currentPointInTime: PointInTime = PointInTime.FromDateString('Tue 22nd Aug, year 3. Noon');
    // const currentPointInTime: PointInTime = PointInTime.FromDateString('Mon 18th Sep, year 3. Afternoon');
    const newsRepository: NewsRepository = new NewsRepository();
    const target: CompanyName = CompanyName.FromString(targetElement.textContent ?? throwIt('Could not find target'));
    let arMod: Maybe<ArMod> = null;
    const incomings: Array<MobNews> = [];
    const outgoings: Array<MobNews> = [];
    let recallCount: number = 0;
    const defenders: IDict<CompanyName> = {};

    for (let x = 0; x < reportRows.length - 2; x += 2) {
        const report: NewsReport = newsRepository.parseNewsReport(target, reportRows[x], reportRows[x + 1], currentPointInTime);

        const tickDifference: Ticks = PointInTime.Subtract(currentPointInTime, report.time);

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (isNull(arMod) && newsRepository.isBattle(report) && report.content.type === MobType.DEFENDING && report.content.target.id === target.id) {
            arMod = ArMod.AdjustForTime(ArMod.Max(), tickDifference);
        }

        if (newsRepository.isMob(report)) {
            const mob: MobNews = report.content;

            if (mob.originalMob.type === MobType.DEFENDING) {
                let defender: Maybe<CompanyName> = null;

                if (mob.isOutgoing) {
                    defender = mob.originalMob.target;
                } else {
                    defender = mob.originalMob.sender;
                }

                if (defender.id !== '1') {
                    defenders[defender.id] = (mob.originalMob.sender);
                }
            }

            if (!isNull(mob.mob)) {
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (mob.isOutgoing) {
                    if (outgoings.some((outgoing: MobNews) => {
                        return outgoing.mob?.target.id === mob.mob?.target.id;
                    })) {
                        recallCount--;
                    } else {
                        outgoings.push(mob);
                    }
                } else if (incomings.some((incoming: MobNews) => {
                    return incoming.mob?.sender.id === mob.mob?.sender.id;
                })) {
                    recallCount--;
                } else {
                    incomings.push(mob);
                }
            }
        }

        const timeOfDayCell: ChildNode = reportRows[x].firstElementChild ?? throwIt('Invalid date cell');
        let output: string = `${tickDifference.ticks.toLocaleString('en')} ticks ago.`;

        if (tickDifference.ticks === 0) {
            output = 'This tick.';
        } else if (tickDifference.ticks === 1) {
            output = 'Last tick.';
        }

        timeOfDayCell.appendChild(PositiveTextComponentFactory(` ${output}`));
    }

    if (isNull(arMod)) {
        arMod = ArMod.Min();
    }

    const defendingIds: Array<string> = Object.keys(defenders);

    const summaryHeaderCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory('Summary')], 2);
    const incomingHeaderCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory('Incoming')]);
    const outgoingHeaderCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory('Outgoing')]);
    const recallCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory(`Recalls: ${recallCount.toLocaleString('en')}`)], 2);
    const defendersLabelCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory(`Defenders [${defendingIds.length} total]`)], 2);
    const defendersCell: HTMLTableCellElement = TableCellComponentFactory([TextComponentFactory(defendingIds.join(', '))], 2);

    let incomingCell: Maybe<HTMLTableCellElement> = null;
    let outgoingCell: Maybe<HTMLTableCellElement> = null;

    if (incomings.length > 0) {
        incomingCell = TableCellComponentFactory(incomings.map((incoming: MobNews) => {
            return MobComponentFactory(incoming);
        }));
    } else {
        incomingCell = TableCellComponentFactory([TextComponentFactory('No incoming mobs')]);
    }

    if (outgoings.length > 0) {
        outgoingCell = TableCellComponentFactory(outgoings.map((outgoing: MobNews) => {
            return MobComponentFactory(outgoing);
        }));
    } else {
        outgoingCell = TableCellComponentFactory([TextComponentFactory('No outgoing mobs')]);
    }

    const mobHeaderRow: HTMLTableRowElement = TableRowComponentFactory(incomingHeaderCell, outgoingHeaderCell);
    const summaryHeaderRow: HTMLTableRowElement = TableRowComponentFactory(summaryHeaderCell);
    const mobRow: HTMLTableRowElement = TableRowComponentFactory(incomingCell, outgoingCell);
    const recallsRow: HTMLTableRowElement = TableRowComponentFactory(recallCell);
    const defendersRow: HTMLTableRowElement = TableRowComponentFactory(defendersCell);
    const defendersHeaderRow: HTMLTableRowElement = TableRowComponentFactory(defendersLabelCell);

    const arModCell: HTMLTableCellElement = TableCellComponentFactory([
        TextComponentFactory('Max ar modifier: '),
        PositiveTextComponentFactory(arMod.toString())
    ], 2);

    const arModRow: HTMLTableRowElement = TableRowComponentFactory(arModCell);
    arModRow.classList.add('lightbackground');
    mobHeaderRow.classList.add('lightbackground');
    defendersRow.classList.add('nonebackground');
    recallsRow.classList.add('lightbackground');
    summaryHeaderRow.classList.add('header');
    defendersHeaderRow.classList.add('header');

    summaryHeaderRow.style.textAlign = 'center';
    defendersHeaderRow.style.textAlign = 'center';

    (reportHeader.parentElement ?? throwIt('Cannot append to report')).insertBefore(summaryHeaderRow, reportHeader);

    insertAfter(defendersRow, summaryHeaderRow);
    insertAfter(defendersHeaderRow, summaryHeaderRow);
    insertAfter(arModRow, summaryHeaderRow);
    // insertAfter(recallsRow, summaryHeaderRow);
    insertAfter(mobRow, summaryHeaderRow);
    insertAfter(mobHeaderRow, summaryHeaderRow);

    // (document.querySelector('#main-page-data') ?? throwIt('Cannot find main page data')).appendChild(reportElement);
}

