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
        if (isNull(arMod) && (newsRepository.isBattle(report)) && (report.content.type === MobType.DEFENDING)) {
            arMod = ArMod.AdjustForTime(ArMod.Max(), tickDifference);
        }

        if (newsRepository.isMob(report)) {
            const mob: MobNews = report.content;

            if (mob.originalMob.type === MobType.DEFENDING) {
                let defender;

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

    const incomingCell: HTMLTableCellElement = TableCellComponentFactory(incomings.map((incoming: MobNews) => {
        return MobComponentFactory(incoming);
    }));

    const outgoingCell: HTMLTableCellElement = TableCellComponentFactory(outgoings.map((outgoing: MobNews) => {
        return MobComponentFactory(outgoing);
    }));

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

let content = `<div id="main-page-data">


<!-- Header file ends here --><form name="subform" method="POST" action="intelligence.php">
<input type="hidden" name="CK" value="80dca3836999d326d7406214106b307d">
<table width="100%" border="0">
<tbody><tr>
<td colspan="3" class="header" width="100%" align="center">
Gather Intelligence:
</td>
</tr>
<tr>
<td width="33%">
</td>
<td width="34%" align="center">
Target ID(s):
</td>
<td width="33%">
</td>
</tr>
<tr>
<td align="right">
<select name="IntelType">
<option value="Drive">Drive-By</option>
<option value="Fly">Fly-Over</option>
<option value="Hax">Hax0r</option>
<option value="Spy" selected="">Spy</option>
</select>
</td>
<td align="center">
<input type="text" name="Target" size="10" maxlength="75" value="1385">
</td>
<td align="left">
<input onclick="Push();" name="Submit" type="button" value="Send">
</td>
</tr>
</tbody></table>
</form>
<div align="center">
<table width="100%" align="center">
<tbody><tr>
<td colspan="2" width="100%" align="center">
<span class="friendly">Spy report on <span title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker"><a href="id_view.php?ID=1385">dead slowly rises</a> [1385]</span> successful:</span></td>
</tr>
</tbody></table>
<table width="100%" align="center">
<tbody><tr class="header">
<td colspan="2" width="100%" align="center">
<a name="Top">Reported News</a></td>
</tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
Tired of hanging around, we all decided to get to know each other. Big George 'The Ripper' likes knitting.</td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[close] 199,999 allied Hippy attacked, distracting 179,408 hostile staff.</span><br>
<span class="friendly">[all] 6,589,762 allied Assassin attacked, killing 7,274,214 hostile staff.</span><br>
<span class="friendly">[close] 3,031,560 allied Yob attacked, disabling 4,383,012 hostile staff.</span><br>
<span class="friendly">[close] 54,777 allied Small Droid made some funny beeps and disabled 272,519 hostile staff.</span><br>
<span class="friendly">[close] 54,369 allied White Wizard zapped 172,907 hostile staff.</span><br>
<span class="friendly">[all] 139,956 allied Jeep attacked, killing 118,184 hostile staff.</span><br>
<span class="friendly">[all] 541,334 allied White Knight attacked, slaying 7,727,683 hostile staff.</span><br>
<span class="friendly">[close] 10,639 allied Stunbot attacked, disabling 133,647 hostile staff.</span><br>
<span class="friendly">[close] 1,500,000 allied Cloner attacked, bribing 1,036,249 hostile staff.</span><br>
<br>Distracted: <span class="friendly">179,408 enemies distracted.</span> <br>Disabled: <span class="friendly">4,789,178 enemies disabled.</span> <br>Died: <span class="friendly">15,292,988 enemies dead.</span> <br>Bribed: <span class="friendly">1,036,249 enemies bribed.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 8 ticks, 5,050,001 people from <a href="id_view.php?ID=2461" title="Robocop [2461]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 5,179,385,993<br>Range: <span class='friendly'>162%</span><br>Acres: 10,757<br>Rank: 25 [<span class='hostile'>-8</span>]">Robocop</a> [2461] will arrive to attack you. Mob ETA was modified by +1 from: Attacking at 35-40% attack range. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 6 ticks, 5,050,000 people from <a href="id_view.php?ID=2461" title="Robocop [2461]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 5,179,385,993<br>Range: <span class='friendly'>162%</span><br>Acres: 10,757<br>Rank: 25 [<span class='hostile'>-8</span>]">Robocop</a> [2461] will arrive to attack you. Mob ETA was modified by +1 from: Attacking at 35-40% attack range. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[r/m] 108 allied White Knight attacked, slaying 1,561 hostile staff.</span><br>
<br>Died: <span class="friendly">1,561 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 5,000,000 people from <a href="id_view.php?ID=4353" title="Bawk bawk [4353]{}H/F Title: Nobody<br>Bounty: <span class='hostile'>5%</span><br>Current Score: 3,820,466,048<br>Range: <span class='friendly'>119%</span><br>Acres: 8,303<br>Rank: 28 [<span class='hostile'>-5</span>]">Bawk bawk</a> [4353] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[range] 100 allied White Knight attacked, slaying 1,410 hostile staff.</span><br>
<br>Died: <span class="friendly">1,410 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 18th Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[close] 14,382,643 hostile Vampire attacked, killing 118,314 allied staff.</span><br>
<span class="hostile">[raised] 501 corpses twitched into life, becoming Lesser Vampire.</span><br>
<span class="friendly">[close] 45,650 allied White Wizard zapped 116,464 hostile staff.</span><br>
<span class="hostile">[close] 69 hostile Seed Thief stole 6,899 stored seeds. [572] tree. [1,166] bush. [1,304] flower. [3,857] grass. </span><br>
<span class="hostile">[close] 249,128 hostile Geo-Phys Thief stole 650 land. [186] tree. [402] bush. [32] flower. [30] grass. [0] uncultivated. </span><br>
<br>Died: <span class="friendly">116,464 enemies dead.</span> <span class="hostile">118,314 friendlies dead.</span> <br>Converted: <span class="hostile">501 friendlies converted.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[middle] 14,403,712 hostile RPG Trooper attacked, killing 1,690,250 allied staff.</span><br>
<span class="hostile">[middle] 14,382,643 hostile Vampire attacked, killing 1,198,240 allied staff.</span><br>
<span class="hostile">[raised] 73,250 corpses twitched into life, becoming Lesser Vampire.</span><br>
<br>Died: <span class="hostile">2,888,490 friendlies dead.</span> <br>Converted: <span class="hostile">73,250 friendlies converted.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 15,000,000 hostile RPG Trooper attacked, killing 7,458,203 allied staff.</span><br>
<span class="friendly">[range] 804,389 allied Striker attacked, killing 59,909 hostile staff.</span><br>
<span class="hostile">[range] 14,970,986 hostile Vampire attacked, killing 27,617,732 allied staff.</span><br>
<span class="hostile">[raised] 1,057,998 corpses twitched into life, becoming Lesser Vampire.</span><br>
<span class="friendly">[range] 515,106 allied Apache Longbow attacked, killing 8,069,239 hostile staff.</span><br>
<span class="friendly">[range] 453,577 allied Marine attacked, killing 669,999 hostile staff.</span><br>
<br>Died: <span class="friendly">8,799,147 enemies dead.</span> <span class="hostile">35,075,935 friendlies dead.</span> <br>Converted: <span class="hostile">1,057,998 friendlies converted.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 5,478,149 people from <a href="id_view.php?ID=7821" title="My username finally makes sense [7821]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 3,193,058,242<br>Range: <span class='friendly'>100%</span><br>Acres: 5,949<br>Rank: 33 [<span class='friendly'>+0</span>]<br><b>ID Played By:</b> Antisback">My username finally makes sense</a> [7821] will arrive to defend you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 8,050,000 people from <a href="id_view.php?ID=9615" title="Chimples [9615]{}H/F Title: <span class='hostile'>Unsavoury</span><br>Bounty: <span class='hostile'>20%</span><br>Current Score: 5,487,201,885<br>Range: <span class='friendly'>171%</span><br>Acres: 7,678<br>Rank: 22 [<span class='hostile'>-11</span>]">Chimples</a> [9615] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 8,050,000 people from <a href="id_view.php?ID=1509" title="eye of the storm [1509]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 9,049,184,407<br>Range: <span class='friendly'>283%</span><br>Acres: 10,304<br>Rank: 9 [<span class='hostile'>-24</span>]">eye of the storm</a> [1509] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 10,100,000 people from <a href="id_view.php?ID=1509" title="eye of the storm [1509]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 9,049,184,407<br>Range: <span class='friendly'>283%</span><br>Acres: 10,304<br>Rank: 9 [<span class='hostile'>-24</span>]">eye of the storm</a> [1509] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 6,050,000 people from <a href="id_view.php?ID=1509" title="eye of the storm [1509]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 9,049,184,407<br>Range: <span class='friendly'>283%</span><br>Acres: 10,304<br>Rank: 9 [<span class='hostile'>-24</span>]">eye of the storm</a> [1509] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 4 ticks, 1 person from <a href="id_view.php?ID=7821" title="My username finally makes sense [7821]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 3,193,058,242<br>Range: <span class='friendly'>100%</span><br>Acres: 5,949<br>Rank: 33 [<span class='friendly'>+0</span>]<br><b>ID Played By:</b> Antisback">My username finally makes sense</a> [7821] will arrive to defend you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 17th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 10,250,000 people from <a href="id_view.php?ID=9387" title="The Broken Shards of Azzer's Dream [9387]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 5,230,300,338<br>Range: <span class='friendly'>163%</span><br>Acres: 15,574<br>Rank: 24 [<span class='hostile'>-9</span>]">The Broken Shards of Azzer's Dream</a> [9387] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 16th Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 16th Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 16th Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 55,125,069 people from <a href="id_view.php?ID=4840" title="LittleToyTom [4840]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 7,166,245,245<br>Range: <span class='friendly'>224%</span><br>Acres: 13,674<br>Rank: 17 [<span class='hostile'>-16</span>]<br><b>ID Played By:</b> LittleToyTom">LittleToyTom</a> [4840] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 16th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 6 ticks, 40,125,000 people from <a href="id_view.php?ID=1243" title="'O_o .l. [1243]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 9,625,187,359<br>Range: <span class='friendly'>301%</span> [-1 eta rush]<br>Acres: 13,897<br>Rank: 8 [<span class='hostile'>-25</span>]">'O_o .l.</a> [1243] will arrive to attack you. Mob ETA was modified by +1 from: Attacking at 35-40% attack range. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 16th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 14th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 14th Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 13th Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 13th Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 12th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 12th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking [<i>Player deleted from game</i>]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking [<i>Player deleted from game</i>]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 28,809,916 hostile SAS completely totally and utterly killed 8,560,575 allied staff.</span><br>
<span class="hostile">[range] 3,495,445 hostile Political Mastermind attacked, distracting 1,397,164 allied staff.</span><br>
<span class="friendly">[range] 3,548,247 allied Striker attacked, killing 205,218 hostile staff.</span><br>
<span class="friendly">[range] 1,481,265 allied Apache Longbow attacked, killing 19,871,995 hostile staff.</span><br>
<span class="hostile">[range] 6,130,544 hostile Hypnotist mesmerised 1,307,287 allied staff.</span><br>
<span class="friendly">[range] 2,125,962 allied Marine attacked, killing 1,414,521 hostile staff.</span><br>
<span class="hostile">[range] 3,154 hostile Jeep attacked, killing 227 allied staff.</span><br>
<br>Distracted: <span class="hostile">1,397,164 friendlies distracted.</span> <br>Died: <span class="hostile">8,560,802 friendlies dead.</span> <span class="friendly">21,491,734 enemies dead.</span> <br>Bribed: <span class="hostile">1,307,287 friendlies bribed.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 11th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 8,586,795 employees to attack [<i>Player deleted from game</i>], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 10th Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 10th Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=1138" title="Quacker [1138]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,833,006,631<br>Range: 57%<br>Acres: 6,000<br>Rank: 51 [<span class='friendly'>+18</span>]">Quacker</a> [1138]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=1138" title="Quacker [1138]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,833,006,631<br>Range: 57%<br>Acres: 6,000<br>Rank: 51 [<span class='friendly'>+18</span>]">Quacker</a> [1138]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[close] 1,263,462 hostile Bunker attacked, killing 426,284 allied staff.</span><br>
<span class="hostile">[close] 1,669,685 hostile Sentry Turret attacked, killing 1,284,799 allied staff.</span><br>
<span class="hostile">[close] 13,386,127 hostile Sleeping Gas Trap attacked, disabling 2,774,580 allied staff.</span><br>
<span class="friendly">[close] 5,547,276 allied Striker attacked, killing 2,298,340 hostile staff.</span><br>
<span class="hostile">[close] 3,357 hostile Secret Agent attacked, killing 534 allied staff.</span><br>
<span class="hostile">[close] 64 hostile Assassin attacked, killing 12 allied staff.</span><br>
<span class="hostile">[close] 30,899 hostile Small Droid made some funny beeps and disabled 1,371 allied staff.</span><br>
<span class="friendly">[close] 1,576,018 allied Apache Longbow attacked, killing 403,149 hostile staff.</span><br>
<span class="hostile">[close] 67,784 hostile White Wizard zapped 4,689 allied staff.</span><br>
<span class="friendly">[close] 4,400,547 allied Marine attacked, killing 1,911,784 hostile staff.</span><br>
<br>Disabled: <span class="hostile">2,775,951 friendlies disabled.</span> <br>Died: <span class="hostile">1,716,318 friendlies dead.</span> <span class="friendly">4,613,273 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 10th Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=1138" title="Quacker [1138]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,833,006,631<br>Range: 57%<br>Acres: 6,000<br>Rank: 51 [<span class='friendly'>+18</span>]">Quacker</a> [1138]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=1138" title="Quacker [1138]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,833,006,631<br>Range: 57%<br>Acres: 6,000<br>Rank: 51 [<span class='friendly'>+18</span>]">Quacker</a> [1138]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[middle] 2,759,796 hostile Bunker attacked, killing 868,533 allied staff.</span><br>
<span class="hostile">[middle] 2,556,220 hostile Sentry Turret attacked, killing 2,172,782 allied staff.</span><br>
<span class="friendly">[middle] 6,537,145 allied Striker attacked, killing 2,150,711 hostile staff.</span><br>
<span class="hostile">[middle] 13,095 hostile Secret Agent attacked, killing 4,740 allied staff.</span><br>
<span class="hostile">[middle] 734 hostile Assassin attacked, killing 145 allied staff.</span><br>
<span class="hostile">[middle] 2,788,075 hostile Ninja attacked, killing 605,079 allied staff.</span><br>
<span class="friendly">[middle] 1,746,345 allied Apache Longbow attacked, killing 2,363,660 hostile staff.</span><br>
<span class="friendly">[middle] 7,774,594 allied Marine attacked, killing 4,128,183 hostile staff.</span><br>
<br>Died: <span class="hostile">3,651,279 friendlies dead.</span> <span class="friendly">8,642,554 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 10th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=1138" title="Quacker [1138]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,833,006,631<br>Range: 57%<br>Acres: 6,000<br>Rank: 51 [<span class='friendly'>+18</span>]">Quacker</a> [1138]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=1138" title="Quacker [1138]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,833,006,631<br>Range: 57%<br>Acres: 6,000<br>Rank: 51 [<span class='friendly'>+18</span>]">Quacker</a> [1138]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 4,000,000 hostile Bunker attacked, killing 1,275,353 allied staff.</span><br>
<span class="hostile">[range] 3,200,000 hostile Sentry Turret attacked, killing 3,407,608 allied staff.</span><br>
<span class="friendly">[range] 7,241,481 allied Striker attacked, killing 1,928,838 hostile staff.</span><br>
<span class="hostile">[range] 23,351 hostile Secret Agent attacked, killing 9,158 allied staff.</span><br>
<span class="hostile">[range] 1,643 hostile Assassin attacked, killing 309 allied staff.</span><br>
<span class="hostile">[range] 8,621,101 hostile Ninja attacked, killing 1,952,293 allied staff.</span><br>
<span class="friendly">[range] 1,861,762 allied Apache Longbow attacked, killing 4,278,234 hostile staff.</span><br>
<span class="friendly">[range] 10,679,214 allied Marine attacked, killing 14,366,968 hostile staff.</span><br>
<br>Died: <span class="hostile">6,644,721 friendlies dead.</span> <span class="friendly">20,574,040 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 10th Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 9th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 9th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,310,000 employees to attack <a href="id_view.php?ID=1138" title="Quacker [1138]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,833,006,631<br>Range: 57%<br>Acres: 6,000<br>Rank: 51 [<span class='friendly'>+18</span>]">Quacker</a> [1138], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 9th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=110" title="Arniekiller [110]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,711,683,790<br>Range: <span class='friendly'>84%</span><br>Acres: 2,887<br>Rank: 40 [<span class='friendly'>+7</span>]">Arniekiller</a> [110]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=110" title="Arniekiller [110]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,711,683,790<br>Range: <span class='friendly'>84%</span><br>Acres: 2,887<br>Rank: 40 [<span class='friendly'>+7</span>]">Arniekiller</a> [110]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 4,000,674 hostile Bunker attacked, killing 7,101,366 allied staff.</span><br>
<span class="hostile">[range] 3,507,951 hostile Sentry Turret attacked, killing 3,898,634 allied staff.</span><br>
<br>Died: <span class="hostile">11,000,000 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 8th Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 11,000,000 employees to attack <a href="id_view.php?ID=110" title="Arniekiller [110]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,711,683,790<br>Range: <span class='friendly'>84%</span><br>Acres: 2,887<br>Rank: 40 [<span class='friendly'>+7</span>]">Arniekiller</a> [110], they are set to arrive in 2 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 8th Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=110" title="Arniekiller [110]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,711,683,790<br>Range: <span class='friendly'>84%</span><br>Acres: 2,887<br>Rank: 40 [<span class='friendly'>+7</span>]">Arniekiller</a> [110]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=110" title="Arniekiller [110]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,711,683,790<br>Range: <span class='friendly'>84%</span><br>Acres: 2,887<br>Rank: 40 [<span class='friendly'>+7</span>]">Arniekiller</a> [110]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 4,000,674 hostile Bunker attacked, killing 7,739,434 allied staff.</span><br>
<span class="hostile">[range] 3,507,951 hostile Sentry Turret attacked, killing 2,260,566 allied staff.</span><br>
<br>Died: <span class="hostile">10,000,000 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 8th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,000,000 employees to attack <a href="id_view.php?ID=110" title="Arniekiller [110]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,711,683,790<br>Range: <span class='friendly'>84%</span><br>Acres: 2,887<br>Rank: 40 [<span class='friendly'>+7</span>]">Arniekiller</a> [110], they are set to arrive in 2 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 8th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=110" title="Arniekiller [110]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,711,683,790<br>Range: <span class='friendly'>84%</span><br>Acres: 2,887<br>Rank: 40 [<span class='friendly'>+7</span>]">Arniekiller</a> [110]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=110" title="Arniekiller [110]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,711,683,790<br>Range: <span class='friendly'>84%</span><br>Acres: 2,887<br>Rank: 40 [<span class='friendly'>+7</span>]">Arniekiller</a> [110]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 4,000,674 hostile Bunker attacked, killing 5,000,000 allied staff.</span><br>
<br>Died: <span class="hostile">5,000,000 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 7th Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 5,000,000 employees to attack <a href="id_view.php?ID=110" title="Arniekiller [110]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,711,683,790<br>Range: <span class='friendly'>84%</span><br>Acres: 2,887<br>Rank: 40 [<span class='friendly'>+7</span>]">Arniekiller</a> [110], they are set to arrive in 2 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 6th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 6th Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 1 employees to attack <a href="id_view.php?ID=1243" title="'O_o .l. [1243]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 9,625,187,359<br>Range: <span class='friendly'>301%</span> [-1 eta rush]<br>Acres: 13,897<br>Rank: 8 [<span class='hostile'>-25</span>]">'O_o .l.</a> [1243], they are set to arrive in 1 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 6th Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=1385" title="dead slowly rises [1385]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,824,876,578<br>Range: 57%<br>Acres: 5,926<br>Rank: 52 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Deloitte<br><b>Notes:</b> Dellie - Striker">dead slowly rises</a> [1385]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[range] 175,848 allied Grenadier attacked, killing 1 hostile staff.</span><br>
<br>Died: <span class="friendly">1 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 5th Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 1 ticks, 1 person from <a href="id_view.php?ID=1243" title="'O_o .l. [1243]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 9,625,187,359<br>Range: <span class='friendly'>301%</span> [-1 eta rush]<br>Acres: 13,897<br>Rank: 8 [<span class='hostile'>-25</span>]">'O_o .l.</a> [1243] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 5th Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 5th Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 4th Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 4th Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 240,000,000 people from <a href="id_view.php?ID=5058" title="Twigley [5058]{}H/F Title: <span class='hostile'>Criminal</span><br>Bounty: <span class='hostile'>30%</span><br>Current Score: 7,385,445,904<br>Range: <span class='friendly'>231%</span><br>Acres: 10,647<br>Rank: 16 [<span class='hostile'>-17</span>]<br><b>ID Played By:</b> Twigley">Twigley</a> [5058] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 4th Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 4th Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 4th Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 4th Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=4771" title="facebook told me to [4771]{}H/F Title: <span class='hostile'>Ignoble</span><br>Bounty: <span class='hostile'>37%</span><br>Current Score: 21,103,674,954<br>Range: <span class='friendly'>660%</span> [-1 eta rush]<br>Acres: 22,647<br>Rank: 1 [<span class='hostile'>-32</span>]<br><b>ID Played By:</b> Elderveld">facebook told me to</a> [4771], they are set to arrive in 3 ticks. Mob ETA was modified by -1 from: Adrenaline rush boost. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 4th Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 4th Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 3rd Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=5743" title="COVID-eo Killed the Radio Star [5743]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 4,750,568,904<br>Range: <span class='friendly'>148%</span><br>Acres: 6,161<br>Rank: 26 [<span class='hostile'>-7</span>]<br><b>ID Played By:</b> Stevey">COVID-eo Killed the Radio Star</a> [5743], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 3rd Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 3rd Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=1243" title="'O_o .l. [1243]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 9,625,187,359<br>Range: <span class='friendly'>301%</span> [-1 eta rush]<br>Acres: 13,897<br>Rank: 8 [<span class='hostile'>-25</span>]">'O_o .l.</a> [1243], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 11,740,255 employees to attack <a href="id_view.php?ID=4771" title="facebook told me to [4771]{}H/F Title: <span class='hostile'>Ignoble</span><br>Bounty: <span class='hostile'>37%</span><br>Current Score: 21,103,674,954<br>Range: <span class='friendly'>660%</span> [-1 eta rush]<br>Acres: 22,647<br>Rank: 1 [<span class='hostile'>-32</span>]<br><b>ID Played By:</b> Elderveld">facebook told me to</a> [4771], they are set to arrive in 3 ticks. Mob ETA was modified by -1 from: Adrenaline rush boost. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=9387" title="The Broken Shards of Azzer's Dream [9387]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 5,230,300,338<br>Range: <span class='friendly'>163%</span><br>Acres: 15,574<br>Rank: 24 [<span class='hostile'>-9</span>]">The Broken Shards of Azzer's Dream</a> [9387], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 3 ticks, 113,488,763 people from <a href="id_view.php?ID=6596" title="Business Continuity [6596]{}H/F Title: <span class='hostile'>Malicious</span><br>Bounty: <span class='hostile'>42%</span><br>Current Score: 6,429,229,764<br>Range: <span class='friendly'>201%</span><br>Acres: 8,431<br>Rank: 20 [<span class='hostile'>-13</span>]<br><b>ID Played By:</b> Steve_God">Business Continuity</a> [6596] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=7342" title="ddxdd [7342]{}H/F Title: <span class='hostile'>Notorious</span><br>Bounty: <span class='hostile'>16%</span><br>Current Score: 8,383,851,838<br>Range: <span class='friendly'>262%</span><br>Acres: 10,885<br>Rank: 10 [<span class='hostile'>-23</span>]">ddxdd</a> [7342], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=4746" title="Regrets Uncovered [4746]{}H/F Title: <span class='hostile'>Criminal</span><br>Bounty: <span class='hostile'>30%</span><br>Current Score: 7,410,281,776<br>Range: <span class='friendly'>232%</span><br>Acres: 9,748<br>Rank: 15 [<span class='hostile'>-18</span>]<br><b>ID Played By:</b> icy">Regrets Uncovered</a> [4746], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=7342" title="ddxdd [7342]{}H/F Title: <span class='hostile'>Notorious</span><br>Bounty: <span class='hostile'>16%</span><br>Current Score: 8,383,851,838<br>Range: <span class='friendly'>262%</span><br>Acres: 10,885<br>Rank: 10 [<span class='hostile'>-23</span>]">ddxdd</a> [7342], they are set to arrive in 2 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=2461" title="Robocop [2461]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 5,179,385,993<br>Range: <span class='friendly'>162%</span><br>Acres: 10,757<br>Rank: 25 [<span class='hostile'>-8</span>]">Robocop</a> [2461], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 2nd Sep, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=9387" title="The Broken Shards of Azzer's Dream [9387]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 5,230,300,338<br>Range: <span class='friendly'>163%</span><br>Acres: 15,574<br>Rank: 24 [<span class='hostile'>-9</span>]">The Broken Shards of Azzer's Dream</a> [9387], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=4746" title="Regrets Uncovered [4746]{}H/F Title: <span class='hostile'>Criminal</span><br>Bounty: <span class='hostile'>30%</span><br>Current Score: 7,410,281,776<br>Range: <span class='friendly'>232%</span><br>Acres: 9,748<br>Rank: 15 [<span class='hostile'>-18</span>]<br><b>ID Played By:</b> icy">Regrets Uncovered</a> [4746], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=7342" title="ddxdd [7342]{}H/F Title: <span class='hostile'>Notorious</span><br>Bounty: <span class='hostile'>16%</span><br>Current Score: 8,383,851,838<br>Range: <span class='friendly'>262%</span><br>Acres: 10,885<br>Rank: 10 [<span class='hostile'>-23</span>]">ddxdd</a> [7342], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=2461" title="Robocop [2461]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 5,179,385,993<br>Range: <span class='friendly'>162%</span><br>Acres: 10,757<br>Rank: 25 [<span class='hostile'>-8</span>]">Robocop</a> [2461], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=9387" title="The Broken Shards of Azzer's Dream [9387]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 5,230,300,338<br>Range: <span class='friendly'>163%</span><br>Acres: 15,574<br>Rank: 24 [<span class='hostile'>-9</span>]">The Broken Shards of Azzer's Dream</a> [9387], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=7342" title="ddxdd [7342]{}H/F Title: <span class='hostile'>Notorious</span><br>Bounty: <span class='hostile'>16%</span><br>Current Score: 8,383,851,838<br>Range: <span class='friendly'>262%</span><br>Acres: 10,885<br>Rank: 10 [<span class='hostile'>-23</span>]">ddxdd</a> [7342], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=4746" title="Regrets Uncovered [4746]{}H/F Title: <span class='hostile'>Criminal</span><br>Bounty: <span class='hostile'>30%</span><br>Current Score: 7,410,281,776<br>Range: <span class='friendly'>232%</span><br>Acres: 9,748<br>Rank: 15 [<span class='hostile'>-18</span>]<br><b>ID Played By:</b> icy">Regrets Uncovered</a> [4746], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=9387" title="The Broken Shards of Azzer's Dream [9387]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 5,230,300,338<br>Range: <span class='friendly'>163%</span><br>Acres: 15,574<br>Rank: 24 [<span class='hostile'>-9</span>]">The Broken Shards of Azzer's Dream</a> [9387], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 1st Sep, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,740,255 employees to attack <a href="id_view.php?ID=9387" title="The Broken Shards of Azzer's Dream [9387]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 5,230,300,338<br>Range: <span class='friendly'>163%</span><br>Acres: 15,574<br>Rank: 24 [<span class='hostile'>-9</span>]">The Broken Shards of Azzer's Dream</a> [9387], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 31st Aug, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 31st Aug, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 20th Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 20th Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 9th Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 8th Aug, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 17th Jul, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 15th Jul, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 29th Jun, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Hamster Departure!</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
The tiny, demonic Hamster from Hell gave one final jab of its pitchfork, set fire to a few peoples trousers and then left via the small tunnel it came by, sealing it shut in the process. We thought we could hear the noise of thousands of screaming voices just before the tunnel sealed...</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 27th Jun, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 23rd Jun, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Hamster Hole!</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
A small tunnel leading in to the pit of Hell itself appeared outside our company, and from it emerged an evil, malicious Hamster from Hell, complete with tiny little devils horns and a miniature pitchfork. It opened its tiny mouth, from which came the noise of... what was almost like... small children... singing... 'La la la la laaaa laaaa'... but in the most incredibly sinister way imaginable.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 23rd Jun, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 23rd Jun, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 20th Jun, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 19th Jun, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 19th Jun, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 4 ticks, 4,771 people from <a href="id_view.php?ID=6544" title="llll llll ll llllll llll lll [6544]{}H/F Title: <span class='friendly'>Admirable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,371,890,730<br>Range: 42%<br>Acres: 5,687<br>Rank: 76 [<span class='friendly'>+43</span>]<br><b>Notes:</b> FFX - PoM">llll llll ll llllll llll lll</a> [6544] will arrive to defend you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 19th Jun, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 18th Jun, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 18th Jun, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 18th Jun, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 17th Jun, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 17th Jun, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 7 ticks, 257,960,206 people from <a href="id_view.php?ID=4771" title="facebook told me to [4771]{}H/F Title: <span class='hostile'>Ignoble</span><br>Bounty: <span class='hostile'>37%</span><br>Current Score: 21,103,674,954<br>Range: <span class='friendly'>660%</span> [-1 eta rush]<br>Acres: 22,647<br>Rank: 1 [<span class='hostile'>-32</span>]<br><b>ID Played By:</b> Elderveld">facebook told me to</a> [4771] will arrive to attack you. Mob ETA was modified by +2 from: Attacking at 30-35% attack range. </td>
</tr>
<tr>
<td colspan="2" width="100%" align="right">
<a href="#Top">(Back To Top)</a>
</td>
</tr>
</tbody></table>
<br>
</div>
<form method="POST" action="actions/intelligence_2.php" name="orderform">
<table width="100%" align="center">
<tbody><tr>
<td colspan="4" class="header" width="100%" align="center">
Purchase Intelligence:
</td>
</tr>
<tr>
<td class="header" width="30%" align="center">
Source
</td>
<td class="header" width="30%" align="center">
Cost
</td>
<td class="header" width="30%" align="center">
In Stock
</td>
<td class="header" width="10%" nowrap="" align="center">
Amount
</td>
</tr>
<tr class="nonebackground">
<td align="center">
Drive-By
</td>
<td align="center">
<input type="hidden" name="IntelValue_1" value="2500">
<input type="hidden" name="have_1" value="83">
£2,500
</td>
<td align="center">
83</td>
<td width="2%" align="center">
<input name="drive_by" type="text" onblur="CalcCosts(this.form)">
</td>
</tr>
<tr class="lightbackground">
<td align="center">
Fly-Over
</td>
<td align="center">
<input type="hidden" name="IntelValue_2" value="15000">
<input type="hidden" name="have_2" value="25">
£15,000
</td>
<td align="center">
25</td>
<td width="2%" align="center">
<input name="fly_over" type="text" onblur="CalcCosts(this.form)">
</td>
</tr>
<tr class="nonebackground">
<td align="center">
Hax0r
</td>
<td align="center">
<input type="hidden" name="IntelValue_3" value="1000000">
<input type="hidden" name="have_3" value="25">
£1,000,000
</td>
<td align="center">
25</td>
<td width="2%" align="center">
<input name="haxor" type="text" onblur="CalcCosts(this.form)">
</td>
</tr>
<tr class="lightbackground">
<td align="center">
Spy
</td>
<td align="center">
<input type="hidden" name="IntelValue_4" value="10000000">
<input type="hidden" name="have_4" value="50">
£10,000,000
</td>
<td align="center">
50</td>
<td width="2%" align="center">
<input name="spy" type="text" onblur="CalcCosts(this.form)">
</td>
</tr>
<tr>
<td colspan="2">
</td>
<td colspan="2" nowrap="" align="right">
£<input type="text" name="TotalValue" value="" maxlength="30">
</td>
</tr><tr>
<td colspan="3">
</td>
<td align="center">
<input type="submit" value="Order" tabindex="9">
</td>
</tr>
</tbody></table>
</form>
<script type="text/javascript">
function Push() {
 document.subform.Submit.disabled = true;
 document.subform.Submit.value = "Please Wait";
 document.subform.submit();
}
function CalcCosts(form) {
 var sThisProcess = "";
 var iPWant = 0;
 var intelwant = 0;
 var curnumber = 0;
 var curvalue = 0;
 var totalcost = 0;

 sThisProcess = (form.drive_by.value) + "";
 sThisProcess = sThisProcess.replace(/to/, "~");
 sThisProcess = sThisProcess.replace(/h/, "00");
 sThisProcess = sThisProcess.replace(/t/, "000");
 sThisProcess = sThisProcess.replace(/k/, "000");
 sThisProcess = sThisProcess.replace(/m/, "000000");
 sThisProcess = sThisProcess.replace(/b/, "000000000");
 if (sThisProcess.substr(0, 1) == "~") {
  iPWant = (sThisProcess.substr(1) * 1);
  if (iPWant > (form.have_1.value * 1)) {
   intelwant = Math.floor(iPWant - (form.have_1.value * 1));
  } else {
   intelwant = 0;
  }
 } else {
  intelwant = (sThisProcess * 1 );
 }
 if (intelwant == "") { intelwant = 0; }
 curnumber = (form.IntelValue_1.value) * 1;
 totalcost = totalcost + (intelwant * curnumber);
 sThisProcess = (form.fly_over.value) + "";
 sThisProcess = sThisProcess.replace(/to/, "~");
 sThisProcess = sThisProcess.replace(/h/, "00");
 sThisProcess = sThisProcess.replace(/t/, "000");
 sThisProcess = sThisProcess.replace(/k/, "000");
 sThisProcess = sThisProcess.replace(/m/, "000000");
 sThisProcess = sThisProcess.replace(/b/, "000000000");
 if (sThisProcess.substr(0, 1) == "~") {
  iPWant = (sThisProcess.substr(1) * 1);
  if (iPWant > (form.have_2.value * 1)) {
   intelwant = Math.floor(iPWant - (form.have_2.value * 1));
  } else {
   intelwant = 0;
  }
 } else {
  intelwant = (sThisProcess * 1 );
 }
 if (intelwant == "") { intelwant = 0; }
 curnumber = (form.IntelValue_2.value) * 1;
 totalcost = totalcost + (intelwant * curnumber);
 sThisProcess = (form.haxor.value) + "";
 sThisProcess = sThisProcess.replace(/to/, "~");
 sThisProcess = sThisProcess.replace(/h/, "00");
 sThisProcess = sThisProcess.replace(/t/, "000");
 sThisProcess = sThisProcess.replace(/k/, "000");
 sThisProcess = sThisProcess.replace(/m/, "000000");
 sThisProcess = sThisProcess.replace(/b/, "000000000");
 if (sThisProcess.substr(0, 1) == "~") {
  iPWant = (sThisProcess.substr(1) * 1);
  if (iPWant > (form.have_3.value * 1)) {
   intelwant = Math.floor(iPWant - (form.have_3.value * 1));
  } else {
   intelwant = 0;
  }
 } else {
  intelwant = (sThisProcess * 1 );
 }
 if (intelwant == "") { intelwant = 0; }
 curnumber = (form.IntelValue_3.value) * 1;
 totalcost = totalcost + (intelwant * curnumber);
 sThisProcess = (form.spy.value) + "";
 sThisProcess = sThisProcess.replace(/to/, "~");
 sThisProcess = sThisProcess.replace(/h/, "00");
 sThisProcess = sThisProcess.replace(/t/, "000");
 sThisProcess = sThisProcess.replace(/k/, "000");
 sThisProcess = sThisProcess.replace(/m/, "000000");
 sThisProcess = sThisProcess.replace(/b/, "000000000");
 if (sThisProcess.substr(0, 1) == "~") {
  iPWant = (sThisProcess.substr(1) * 1);
  if (iPWant > (form.have_4.value * 1)) {
   intelwant = Math.floor(iPWant - (form.have_4.value * 1));
  } else {
   intelwant = 0;
  }
 } else {
  intelwant = (sThisProcess * 1 );
 }
 if (intelwant == "") { intelwant = 0; }
 curnumber = (form.IntelValue_4.value) * 1;
 totalcost = totalcost + (intelwant * curnumber);
 totalcost = Math.floor(totalcost);
 document.orderform.TotalValue.value = outputComma(totalcost);
}

function outputComma(number) {
 number = '' + number;
 if (number.length > 3) {
  var mod = number.length%3;
  var output = (mod > 0 ? (number.substring(0,mod)) : '');
  for (i=0 ; i < Math.floor(number.length/3) ; i++) {
   if ((mod ==0) && (i ==0)) {
    output+= number.substring(mod+3*i,mod+3*i+3);
   } else {
    output+= ',' + number.substring(mod+3*i,mod+3*i+3);
   }
  }
  return (output);
 } else {
  return number;
 }
}
</script>
<!-- Footer file starts here -->
</div>`;

let content2 = `
<div id="logo" title="Bushtarion">
<a href="overview.php"><img src="images/bush_logo.png" title="Bushtarion" alt="Bushtarion" border="0"></a>
</div>
<div id="main-menu">
<ul>
 <li>
<a class="menu-header">Main Options:</a><ul id="menu-main-options" style="display:block">
   <li><a href="overview.php">Overview</a></li>
   <li><a href="news.php">News</a></li>
   <li><a href="messages.php?Opt=I">Messages</a></li>
   <li><a href="journal.php?Opt=I">Journal</a></li>
  </ul>
 </li>
 <li>
<a class="menu-header">Staff &amp; Tech:</a><ul id="menu-tech-staff" style="display:block">
   <li><a href="hiring.php"><span id="tut-step-2">Hiring</span></a></li>
   <li><a href="development.php">Development</a></li>
  </ul>
 </li>
 <li>
<a class="menu-header">Land &amp; Resources:</a><ul id="menu-land-resources" style="display:block">
   <li><a href="maintenance.php"><span id="tut-step-4">Maintenance</span></a></li>
   <li><a href="supplies.php"><span id="tut-step-7">Supply Depot</span></a></li>
   <li><a href="land_management.php"><span id="tut-step-0">Land Management</span></a></li>
  </ul>
 </li>
 <li>
<a class="menu-header">Intel &amp; Combat:</a><ul id="menu-intel-combat" style="display:block">
   <li><a href="intelligence.php">Intelligence</a></li>
   <li><a href="military.php">Military</a></li>
  </ul>
 </li>
 <li>
<a class="menu-header">Player Data:</a><ul id="menu-player-data" style="display:block">
   <li><a href="world_rank.php">World Rankings</a></li>
   <li><a href="world_tables.php">World Tables</a></li>
   <li><a href="world_view.php">World View</a></li>
   <li><a href="alliance_list.php">Alliances</a></li>
   <li><a href="search.php?IDs=4933%2C+5246%2C+6357%2C+7904%2C+9414%2C+177%2C+874%2C+1231%2C+2147%2C+3004%2C+5383%2C+5999%2C+6823%2C+7613%2C+9030%2C+6162%2C+1368&amp;OB=V&amp;AD=A">Search</a></li>
   <li><a href="statistics.php?Opt=P">Statistics</a></li>
   <li><a href="enemies_personal.php">Combat Stats</a></li>
  </ul>
 </li>
 <li>
<a class="menu-header">Your Account/ID:</a><ul id="menu-your-account" style="display:block">
   <li><a href="preferences.php">ID Settings</a></li>
   <li><a href="schemes.php">Colour Schemes</a></li>
   <li><a href="portal/portal_id_select.php">ID Selection</a></li>
   <li><a href="portal/portal_account_details.php">Account Portal</a></li>
   <li><a href="portal/portal_purchase.php">Purchase/Use Credits</a></li>
   <li><a href="login_scripts/logout.php">Logout</a></li>
  </ul>
 </li>
 <li>
<a class="menu-header">Other:</a><ul id="menu-other" style="display:block">
   <li><a href="#Chat" onclick="window.open('http://wbe002.mibbit.com/?server=netgamers.webvictim.net&amp;channel=%23bushtarion&amp;noServerTab=false&amp;forcePrompt=true&amp;nick=Antisback','','width=999,height=555')">Live Chat</a></li>
<li><a href="dofgames.php">DOFG Vote</a></li>
   <li><a href="manual/" target="_blank">Manual</a></li>
   <li><a href="forums/" target="_blank">Forums</a></li>
  </ul>
 </li>
 <li>
  <a class="menu-header">Share:</a>
  <ul id="menu-share" style="display:block">
   <li>
<a href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.bushtarion.com%2F%3FRF%3DAntisback" target="_BLANK"><img src="share_fb_16.png" title="Share on Facebook" width="16" height="16" border="0">&nbsp;</a>
<a href="https://twitter.com/intent/tweet?text=Join%20me%20on%20Bushtarion%20-%20free%20browser%20game!&amp;source=bushtarioncom&amp;url=http://bushtarion.com/?RF=Antisback&amp;related=bushtarion" target="_BLANK"><img src="share_tw_16.png" width="16px" height="16px" border="0">&nbsp;</a>
<a href="https://plus.google.com/share?url=http%3A%2F%2Fwww.bushtarion.com%2F%3FRF%3DAntisback&amp;hl=en-US" target="_BLANK"><img src="share_gp_16.png" width="16px" height="16px" border="0">&nbsp;</a>
   </li>
  </ul>
 </li>

</ul>
</div>
<div id="main-page-content">
<div id="game-info-top">
 <span id="game-info-server-time" title="Page loaded at: 10:09:14">Time: 10:09:28 GMT</span>
 <span id="game-info-company"><a href="id_view.php?ID=7821" title="My username finally makes sense [7821]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 3,213,923,784<br>Range: <span class='friendly'>100%</span><br>Acres: 5,949<br>Rank: 33 [<span class='friendly'>+0</span>]<br><b>ID Played By:</b> Antisback">My username finally makes sense [7821]</a></span>
 <span id="game-info-next-tick" title="Next tick is due"><span id="tut-step-6">Tick: 10:10:00 GMT</span></span>
</div>
<div id="game-info-bottom">
 <span id="game-info-funds">Funds: £199,342,815<button title="Income{}
        Per tick: £1,733,280,207</br>
        Per hour: £10,399,681,242</br>
        Per day: £249,592,349,808</br>
    " style="background: rgb(102, 102, 204) none repeat scroll 0% 0%; border: 1px solid rgb(16, 16, 16); color: rgb(240, 240, 240); padding: 0px; border-radius: 50%; width: 14px; text-align: center; font-size: 8px; margin: 0px 5px; vertical-align: middle; height: 14px; font-weight: bold; position: absolute;">i</button></span>
 <span id="game-info-rank-score"><a href="world_rank.php">Score: 3,213,923,784 [33]</a><button title="Breakdown{}
        Staff: 2,528,961,262 <span class=&quot;friendly&quot;>[78.69%]</span></br>
        Land: 353,906,010 <span class=&quot;friendly&quot;>[11.01%]</span></br>
        Planted plants: 606,615 <span class=&quot;friendly&quot;>[0.02%]</span></br>
        Stocked plants: 99,174 <span class=&quot;friendly&quot;>[0.00%]</span></br>
        Stocked seeds: 68,800,332 <span class=&quot;friendly&quot;>[2.14%]</span></br>
        Developments: 259,600,000 <span class=&quot;friendly&quot;>[8.08%]</span>
    " style="background: rgb(102, 102, 204) none repeat scroll 0% 0%; border: 1px solid rgb(16, 16, 16); color: rgb(240, 240, 240); padding: 0px; border-radius: 50%; width: 14px; text-align: center; font-size: 8px; margin: 0px 5px; vertical-align: middle; height: 14px; font-weight: bold; position: absolute;">i</button></span>
 <span id="game-info-game-date">Tue 22nd Aug, year 3. <span title="Day time">Noon</span></span>
</div>
<div id="game-info-live">
 <span id="live-links">
 </span>
 <span id="live-weather">
  <img src="images/day_clear_1.gif" title="Summer: A clear blue sky" alt="A clear blue sky" width="47" height="50" border="0"><br>
 </span>
</div>

<div id="game-info-live-season">
 <span id="live-season">
  Summer </span>
</div>
<div id="HelpText" style="display:none">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Help For This Page
</td>
</tr>
<tr>
<td class="nonebackground" align="left">
</td>
</tr>
<tr>
<td>
&nbsp;
</td>
</tr>
</tbody></table>
</div>
<noscript>
<div class="div-header">
JavaScript Disabled?
</div>
<div class="div-body">
You currently have JavaScript disabled. Many of the game pages have features that require JavaScript to work. Please ensure you either enable JavaScript fully, or at least enable JavaScript for this
website. Note that "JavaScript" is not the same as "Java" - you do not need Java anywhere on the Bushtarion website.
</div><br>
</noscript>

<div id="main-page-data">


<!-- Header file ends here --><form name="subform" method="POST" action="intelligence.php">
<input type="hidden" name="CK" value="80dca3836999d326d7406214106b307d">
<table width="100%" border="0">
<tbody><tr>
<td colspan="3" class="header" width="100%" align="center">
Gather Intelligence:
</td>
</tr>
<tr>
<td width="33%">
</td>
<td width="34%" align="center">
Target ID(s):
</td>
<td width="33%">
</td>
</tr>
<tr>
<td align="right">
<select name="IntelType">
<option value="Drive">Drive-By</option>
<option value="Fly">Fly-Over</option>
<option value="Hax">Hax0r</option>
<option value="Spy" selected="">Spy</option>
</select>
</td>
<td align="center">
<input type="text" name="Target" size="10" maxlength="75" value="8557">
</td>
<td align="left">
<input onclick="Push();" name="Submit" type="button" value="Send">
</td>
</tr>
</tbody></table>
</form>
<div align="center">
<table width="100%" align="center">
<tbody><tr>
<td colspan="2" width="100%" align="center">
<span class="friendly">Spy report on <span title="Shheet [8557]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 4,726,328,234<br>Range: <span class='friendly'>147%</span><br>Acres: 11,956<br>Rank: 25 [<span class='hostile'>-8</span>]<br><b>ID Played By:</b> Kc_dvs"><a href="id_view.php?ID=8557">Shheet</a> [8557]</span> successful:</span></td>
</tr>
</tbody></table>
<table width="100%" align="center">
<tbody><tr class="header">
<td colspan="2" width="100%" align="center">
<a name="Top">Reported News</a></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 22nd Aug, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 4 ticks, 1,500,000 people from <a href="id_view.php?ID=7821" title="">My username finally makes sense</a> [7821] will arrive to defend you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 22nd Aug, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 22nd Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 22nd Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2208" title="Life as we knew it [2208]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,657,259,567<br>Range: 51%<br>Acres: 4,771<br>Rank: 59 [<span class='friendly'>+26</span>]">Life as we knew it</a> [2208]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2208" title="Life as we knew it [2208]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,657,259,567<br>Range: 51%<br>Acres: 4,771<br>Rank: 59 [<span class='friendly'>+26</span>]">Life as we knew it</a> [2208]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 3,050,000 hostile Striker attacked, killing 532,537 allied staff.</span><br>
<span class="friendly">[range] 3,786,390 allied Iron Golem attacked, killing 14,587,284 hostile staff.</span><br>
<span class="friendly">[range] 5,789,194 allied Sorcerer attacked, killing 14,634,722 hostile staff.</span><br>
<span class="friendly">[range] 5,877,093 allied Dragon breathed fire on and melted 3,550,245 hostile staff.</span><br>
<span class="hostile">[range] 2,389,179 hostile Apache Longbow attacked, killing 34,130,497 allied staff.</span><br>
<span class="hostile">[range] 102,738 hostile Heavy Weapons attacked, killing 229,478 allied staff.</span><br>
<br>Died: <span class="hostile">34,892,512 friendlies dead.</span> <span class="friendly">32,772,251 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 22nd Aug, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 22nd Aug, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 250,500,000 people from <a href="id_view.php?ID=9720" title="Distinct odor of GSC [9720]{}H/F Title: Prominent<br>Bounty: <span class='hostile'>5%</span><br>Current Score: 12,273,495,438<br>Range: <span class='friendly'>381%</span> [-1 eta rush]<br>Acres: 18,026<br>Rank: 3 [<span class='hostile'>-30</span>]">Distinct odor of GSC</a> [9720] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 22nd Aug, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 21st Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 56,185,214 employees to attack <a href="id_view.php?ID=2208" title="Life as we knew it [2208]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,657,259,567<br>Range: 51%<br>Acres: 4,771<br>Rank: 59 [<span class='friendly'>+26</span>]">Life as we knew it</a> [2208], they are set to arrive in 6 ticks. Mob ETA was modified by +1 from: Attacking at 35-40% attack range. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 20th Aug, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Government Recall</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
The Government recalled a defensive mob when it was decided they were no longer required.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 20th Aug, year 3. <span title="Day time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 23,639,424 employees to defend <a href="id_view.php?ID=7821" title="My username finally makes sense [7821]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 3,213,923,784<br>Range: <span class='friendly'>100%</span><br>Acres: 5,949<br>Rank: 33 [<span class='friendly'>+0</span>]<br><b>ID Played By:</b> Antisback">My username finally makes sense</a> [7821], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Government incoming defences</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Helicopters flew in overhead, dropping lines down around our land. Figures dressed in black, faces covered with balaclavas, dropped down the lines, assault rifles strapped to their backs. We couldn't be sure how many SAS there were.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 23,939,216 employees to defend <a href="id_view.php?ID=7821" title="My username finally makes sense [7821]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 3,213,923,784<br>Range: <span class='friendly'>100%</span><br>Acres: 5,949<br>Rank: 33 [<span class='friendly'>+0</span>]<br><b>ID Played By:</b> Antisback">My username finally makes sense</a> [7821], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 10,100,000 people from <a href="id_view.php?ID=1509" title="eye of the storm [1509]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 8,909,860,983<br>Range: <span class='friendly'>277%</span><br>Acres: 10,304<br>Rank: 8 [<span class='hostile'>-25</span>]">eye of the storm</a> [1509] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Aug, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 18th Aug, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 18th Aug, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 18th Aug, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 7 ticks, 15,100,001 people from <a href="id_view.php?ID=1243" title="'O_o .l. [1243]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 8,220,185,741<br>Range: <span class='friendly'>255%</span><br>Acres: 13,058<br>Rank: 9 [<span class='hostile'>-24</span>]">'O_o .l.</a> [1243] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 18th Aug, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 18th Aug, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 261,699,142 people from <a href="id_view.php?ID=9720" title="Distinct odor of GSC [9720]{}H/F Title: Prominent<br>Bounty: <span class='hostile'>5%</span><br>Current Score: 12,273,495,438<br>Range: <span class='friendly'>381%</span> [-1 eta rush]<br>Acres: 18,026<br>Rank: 3 [<span class='hostile'>-30</span>]">Distinct odor of GSC</a> [9720] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 18th Aug, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 18th Aug, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 17th Aug, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 17th Aug, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 1,337 employees to attack <a href="id_view.php?ID=5094" title="Virus [5094]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 2,953,592,224<br>Range: <span class='friendly'>91%</span><br>Acres: 6,176<br>Rank: 36 [<span class='friendly'>+3</span>]<br><b>Notes:</b> Steven - SA">Virus</a> [5094], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 17th Aug, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 16th Aug, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 12th Aug, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 8th Aug, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 8th Aug, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 8th Aug, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2642" title="">Bring Back Pure Solo or Was it Han</a> [2642]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[close] 1,377,091 hostile Hippy attacked, distracting 1,202,582 allied staff.</span><br>
<span class="hostile">[close] 1 hostile Crazed Droid attacked, killing 6 allied staff.</span><br>
<span class="hostile">[close] 579,892 hostile Arsonist attacked, disabling 839,436 allied staff.</span><br>
<span class="hostile">[close] 41,206 hostile Political Mastermind attacked, distracting 714 allied staff.</span><br>
<br>Distracted: <span class="hostile">1,203,296 friendlies distracted.</span> <br>Disabled: <span class="hostile">839,436 friendlies disabled.</span> <br>Died: <span class="hostile">6 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 8th Aug, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2642" title="">Bring Back Pure Solo or Was it Han</a> [2642]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[middle] 579,892 hostile Arsonist attacked, disabling 1,596,613 allied staff.</span><br>
<span class="hostile">[middle] 41,206 hostile Political Mastermind attacked, distracting 442,464 allied staff.</span><br>
<span class="hostile">[middle] 955 hostile Hooligan attacked, disabling 694 allied staff.</span><br>
<span class="hostile">[middle] 3,010 hostile Hippy Van attacked, distracting 2,967 allied staff.</span><br>
<span class="hostile">[middle] 369,559 hostile Sniper attacked, killing 53,755 allied staff.</span><br>
<br>Distracted: <span class="hostile">445,431 friendlies distracted.</span> <br>Disabled: <span class="hostile">1,597,307 friendlies disabled.</span> <br>Died: <span class="hostile">53,755 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 8th Aug, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 579,892 hostile Arsonist attacked, disabling 1,655,611 allied staff.</span><br>
<span class="hostile">[range] 41,206 hostile Political Mastermind attacked, distracting 436,848 allied staff.</span><br>
<span class="hostile">[range] 955 hostile Hooligan attacked, disabling 719 allied staff.</span><br>
<span class="hostile">[range] 3,010 hostile Hippy Van attacked, distracting 3,025 allied staff.</span><br>
<span class="hostile">[range] 369,559 hostile Sniper attacked, killing 2,606,201 allied staff.</span><br>
<span class="hostile">[range] 200 hostile Cybernetic Warrior attacked, killing 1,405 allied staff.</span><br>
<span class="hostile">[range] 113 hostile Loudspeaker Protestor shouted in the ears of and distracted 290 allied staff.</span><br>
<span class="hostile">[range] 11,087 hostile Apache Longbow attacked, killing 125,274 allied staff.</span><br>
<span class="hostile">[range] 533,301 hostile Shock Trooper attacked, killing 237,793 allied staff.</span><br>
<br>Distracted: <span class="hostile">440,163 friendlies distracted.</span> <br>Disabled: <span class="hostile">1,656,330 friendlies disabled.</span> <br>Died: <span class="hostile">2,970,673 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 7th Aug, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 5,067,166 employees to attack <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 7th Aug, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=8557" title="Shheet [8557]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 4,726,328,234<br>Range: <span class='friendly'>147%</span><br>Acres: 11,956<br>Rank: 25 [<span class='hostile'>-8</span>]<br><b>ID Played By:</b> Kc_dvs">Shheet</a> [8557]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=8557" title="Shheet [8557]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 4,726,328,234<br>Range: <span class='friendly'>147%</span><br>Acres: 11,956<br>Rank: 25 [<span class='hostile'>-8</span>]<br><b>ID Played By:</b> Kc_dvs">Shheet</a> [8557]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 50,000 hostile Vampire attacked, killing 108,370 allied staff.</span><br>
<span class="hostile">[raised] 5,229 corpses twitched into life, becoming Lesser Vampire.</span><br>
<span class="friendly">[range] 9,985,991 allied Iron Golem attacked, killing 50,000 hostile staff.</span><br>
<br>Died: <span class="friendly">50,000 enemies dead.</span> <span class="hostile">108,370 friendlies dead.</span> <br>Converted: <span class="hostile">5,229 friendlies converted.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 7th Aug, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 7th Aug, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 7th Aug, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 5,067,194 employees to attack <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 7th Aug, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 7th Aug, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 6th Aug, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Stealth detected</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
A stealth mob has been detected, ETA now 2 ticks, 50,000 currently visible. Mob sent from <a href="id_view.php?ID=1243" title="'O_o .l. [1243]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 8,220,185,741<br>Range: <span class='friendly'>255%</span><br>Acres: 13,058<br>Rank: 9 [<span class='hostile'>-24</span>]">'O_o .l.</a> [1243] to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 6th Aug, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=8557" title="Shheet [8557]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 4,726,328,234<br>Range: <span class='friendly'>147%</span><br>Acres: 11,956<br>Rank: 25 [<span class='hostile'>-8</span>]<br><b>ID Played By:</b> Kc_dvs">Shheet</a> [8557]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=8557" title="Shheet [8557]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 4,726,328,234<br>Range: <span class='friendly'>147%</span><br>Acres: 11,956<br>Rank: 25 [<span class='hostile'>-8</span>]<br><b>ID Played By:</b> Kc_dvs">Shheet</a> [8557]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 100,000 hostile Vampire attacked, killing 218,261 allied staff.</span><br>
<span class="hostile">[raised] 9,863 corpses twitched into life, becoming Lesser Vampire.</span><br>
<span class="friendly">[range] 9,990,508 allied Iron Golem attacked, killing 100,000 hostile staff.</span><br>
<br>Died: <span class="friendly">100,000 enemies dead.</span> <span class="hostile">218,261 friendlies dead.</span> <br>Converted: <span class="hostile">9,863 friendlies converted.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 5th Aug, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 5th Aug, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Stealth detected</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
A stealth mob has been detected, ETA now 2 ticks, 100,000 currently visible. Mob sent from <a href="id_view.php?ID=1243" title="'O_o .l. [1243]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 8,220,185,741<br>Range: <span class='friendly'>255%</span><br>Acres: 13,058<br>Rank: 9 [<span class='hostile'>-24</span>]">'O_o .l.</a> [1243] to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 5th Aug, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 5th Aug, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 31st Jul, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=9994" title="His Every Right Obliterated [9994]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 1,455,055,545<br>Range: 45%<br>Acres: 2,772<br>Rank: 68 [<span class='friendly'>+35</span>]<br><b>ID Played By:</b> Hero">His Every Right Obliterated</a> [9994]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=9994" title="His Every Right Obliterated [9994]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 1,455,055,545<br>Range: 45%<br>Acres: 2,772<br>Rank: 68 [<span class='friendly'>+35</span>]<br><b>ID Played By:</b> Hero">His Every Right Obliterated</a> [9994]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[close] 4,079 hostile Hippy attacked, distracting 3,869 allied staff.</span><br>
<span class="hostile">[close] 2,486,034 hostile Harrier attacked, killing 5,213,287 allied staff.</span><br>
<span class="hostile">[close] 47,029 hostile Yob attacked, disabling 75,384 allied staff.</span><br>
<span class="hostile">[close] 526,612 hostile Paratrooper attacked, killing 325,334 allied staff.</span><br>
<span class="friendly">[close] 134,384 allied Geo-Phys Thief stole 398 land. [107] tree. [244] bush. [24] flower. [23] grass. [0] uncultivated. </span><br>
<br>Distracted: <span class="hostile">3,869 friendlies distracted.</span> <br>Disabled: <span class="hostile">75,384 friendlies disabled.</span> <br>Died: <span class="hostile">5,538,621 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 31st Jul, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=9994" title="His Every Right Obliterated [9994]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 1,455,055,545<br>Range: 45%<br>Acres: 2,772<br>Rank: 68 [<span class='friendly'>+35</span>]<br><b>ID Played By:</b> Hero">His Every Right Obliterated</a> [9994]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=9994" title="His Every Right Obliterated [9994]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 1,455,055,545<br>Range: 45%<br>Acres: 2,772<br>Rank: 68 [<span class='friendly'>+35</span>]<br><b>ID Played By:</b> Hero">His Every Right Obliterated</a> [9994]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[middle] 2,486,034 hostile Harrier attacked, killing 5,744,952 allied staff.</span><br>
<span class="hostile">[middle] 2,332,377 hostile Ranger attacked, killing 618,601 allied staff.</span><br>
<span class="hostile">[middle] 526,612 hostile Paratrooper attacked, killing 306,660 allied staff.</span><br>
<br>Died: <span class="hostile">6,670,213 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 31st Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=9994" title="His Every Right Obliterated [9994]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 1,455,055,545<br>Range: 45%<br>Acres: 2,772<br>Rank: 68 [<span class='friendly'>+35</span>]<br><b>ID Played By:</b> Hero">His Every Right Obliterated</a> [9994]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=9994" title="His Every Right Obliterated [9994]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 1,455,055,545<br>Range: 45%<br>Acres: 2,772<br>Rank: 68 [<span class='friendly'>+35</span>]<br><b>ID Played By:</b> Hero">His Every Right Obliterated</a> [9994]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 4,019,587 hostile Harrier attacked, killing 9,310,588 allied staff.</span><br>
<span class="friendly">[range] 4,838,131 allied Dragon breathed fire on and melted 44,533,741 hostile staff.</span><br>
<span class="hostile">[range] 2,332,377 hostile Ranger attacked, killing 3,034,489 allied staff.</span><br>
<span class="hostile">[range] 526,612 hostile Paratrooper attacked, killing 404,916 allied staff.</span><br>
<br>Died: <span class="hostile">12,749,993 friendlies dead.</span> <span class="friendly">44,533,741 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 30th Jul, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 30th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 36,238,747 employees to attack <a href="id_view.php?ID=9994" title="His Every Right Obliterated [9994]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 1,455,055,545<br>Range: 45%<br>Acres: 2,772<br>Rank: 68 [<span class='friendly'>+35</span>]<br><b>ID Played By:</b> Hero">His Every Right Obliterated</a> [9994], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 28th Jul, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 28th Jul, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 28th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 28th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=7613" title="was it a car or cat i saw [7613]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,221,001,056<br>Range: 37% [+1 eta]<br>Acres: 2,415<br>Rank: 86 [<span class='friendly'>+53</span>]">was it a car or cat i saw</a> [7613]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=7613" title="was it a car or cat i saw [7613]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,221,001,056<br>Range: 37% [+1 eta]<br>Acres: 2,415<br>Rank: 86 [<span class='friendly'>+53</span>]">was it a car or cat i saw</a> [7613]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[m/c] 1,337 hostile Striker attacked, killing 153 allied staff.</span><br>
<span class="friendly">[middle] 19,999,972 allied Secret Agent attacked, killing 5,457 hostile staff.</span><br>
<span class="friendly">[close] 1,000,000 allied Seed Thief stole 99,999,998 stored seeds. [7,099,794] tree. [47,634,979] bush. [17,987,664] flower. [27,277,561] grass. </span><br>
<span class="friendly">[close] 192,127 allied Geo-Phys Thief stole 354 land. [106] tree. [222] bush. [13] flower. [13] grass. [0] uncultivated. </span><br>
<br>Died: <span class="hostile">153 friendlies dead.</span> <span class="friendly">5,457 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 28th Jul, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 28th Jul, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 28th Jul, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=7613" title="was it a car or cat i saw [7613]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,221,001,056<br>Range: 37% [+1 eta]<br>Acres: 2,415<br>Rank: 86 [<span class='friendly'>+53</span>]">was it a car or cat i saw</a> [7613]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=7613" title="was it a car or cat i saw [7613]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,221,001,056<br>Range: 37% [+1 eta]<br>Acres: 2,415<br>Rank: 86 [<span class='friendly'>+53</span>]">was it a car or cat i saw</a> [7613]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[middle] 5,000,000 allied RPG Trooper attacked, killing 111,415 hostile staff.</span><br>
<br>Died: <span class="friendly">111,415 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 28th Jul, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=7613" title="was it a car or cat i saw [7613]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,221,001,056<br>Range: 37% [+1 eta]<br>Acres: 2,415<br>Rank: 86 [<span class='friendly'>+53</span>]">was it a car or cat i saw</a> [7613]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=7613" title="was it a car or cat i saw [7613]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,221,001,056<br>Range: 37% [+1 eta]<br>Acres: 2,415<br>Rank: 86 [<span class='friendly'>+53</span>]">was it a car or cat i saw</a> [7613]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[range] 5,000,000 allied RPG Trooper attacked, killing 42,558 hostile staff.</span><br>
<br>Died: <span class="friendly">42,558 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 27th Jul, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 27th Jul, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 27th Jul, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 27th Jul, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 59,878,055 employees to attack <a href="id_view.php?ID=7613" title="was it a car or cat i saw [7613]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,221,001,056<br>Range: 37% [+1 eta]<br>Acres: 2,415<br>Rank: 86 [<span class='friendly'>+53</span>]">was it a car or cat i saw</a> [7613], they are set to arrive in 6 ticks. Mob ETA was modified by +1 from: Attacking at 35-40% attack range. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 26th Jul, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 25th Jul, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Hamster Departure!</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
The tiny, demonic Hamster from Hell gave one final jab of its pitchfork, set fire to a few peoples trousers and then left via the small tunnel it came by, sealing it shut in the process. We thought we could hear the noise of thousands of screaming voices just before the tunnel sealed...</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 25th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 19,374,873 employees to defend <a href="id_view.php?ID=7821" title="My username finally makes sense [7821]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 3,213,923,784<br>Range: <span class='friendly'>100%</span><br>Acres: 5,949<br>Rank: 33 [<span class='friendly'>+0</span>]<br><b>ID Played By:</b> Antisback">My username finally makes sense</a> [7821], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 23rd Jul, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Hamster Hole!</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
A small tunnel leading in to the pit of Hell itself appeared outside our company, and from it emerged an evil, malicious Hamster from Hell, complete with tiny little devils horns and a miniature pitchfork. It opened its tiny mouth, from which came the noise of... what was almost like... small children... singing... 'La la la la laaaa laaaa'... but in the most incredibly sinister way imaginable.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 17th Jul, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 11th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 11th Jul, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 10th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 10th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 10th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=6839" title="you [6839]{}H/F Title: <span class='friendly'>Admirable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,234,961,991<br>Range: 38% [+1 eta]<br>Acres: 3,925<br>Rank: 84 [<span class='friendly'>+51</span>]">you</a> [6839]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=6839" title="you [6839]{}H/F Title: <span class='friendly'>Admirable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,234,961,991<br>Range: 38% [+1 eta]<br>Acres: 3,925<br>Rank: 84 [<span class='friendly'>+51</span>]">you</a> [6839]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 490 hostile Siren sang out, freezing in place 255 allied staff.</span><br>
<span class="friendly">[range] 8,373,155 allied Iron Golem attacked, killing 2,203,179 hostile staff.</span><br>
<span class="friendly">[range] 3,999,954 allied Sorcerer attacked, killing 1,051,408 hostile staff.</span><br>
<br>Stunned: <span class="hostile">255 friendlies stunned.</span> <br>Died: <span class="friendly">3,254,587 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 10th Jul, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 10th Jul, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 9th Jul, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 9th Jul, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=7361" title="Couch Potato [7361]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,852,584,161<br>Range: <span class='friendly'>88%</span><br>Acres: 6,102<br>Rank: 37 [<span class='friendly'>+4</span>]">Couch Potato</a> [7361]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=7361" title="Couch Potato [7361]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,852,584,161<br>Range: <span class='friendly'>88%</span><br>Acres: 6,102<br>Rank: 37 [<span class='friendly'>+4</span>]">Couch Potato</a> [7361]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[middle] 69 hostile Mummy attacked, killing 77 allied staff.</span><br>
<span class="hostile">[middle] 1,000,000 hostile Striker attacked, killing 132,450 allied staff.</span><br>
<span class="hostile">[middle] 10,100,000 hostile Vampire attacked, killing 41,621,273 allied staff.</span><br>
<span class="hostile">[raised] 432,890 corpses twitched into life, becoming Lesser Vampire.</span><br>
<span class="hostile">[middle] 1,500,000 hostile Harrier attacked, killing 3,031,908 allied staff.</span><br>
<span class="hostile">[middle] 2,000,000 hostile Gargoyle attacked, killing 5,764,091 allied staff.</span><br>
<span class="hostile">[middle] 1,000,000 hostile Werewolf attacked, killing 2,023,305 allied staff.</span><br>
<span class="hostile">[raised] 10,996 victims were infected, howling, as they became werewolves.</span><br>
<span class="hostile">[middle] 1,500,000 hostile Apache Longbow attacked, killing 191,311 allied staff.</span><br>
<br>Died: <span class="hostile">52,764,415 friendlies dead.</span> <br>Converted: <span class="hostile">443,886 friendlies converted.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 9th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 9th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 44,423,212 employees to attack <a href="id_view.php?ID=6839" title="you [6839]{}H/F Title: <span class='friendly'>Admirable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,234,961,991<br>Range: 38% [+1 eta]<br>Acres: 3,925<br>Rank: 84 [<span class='friendly'>+51</span>]">you</a> [6839], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 9th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=7361" title="Couch Potato [7361]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,852,584,161<br>Range: <span class='friendly'>88%</span><br>Acres: 6,102<br>Rank: 37 [<span class='friendly'>+4</span>]">Couch Potato</a> [7361]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=7361" title="Couch Potato [7361]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,852,584,161<br>Range: <span class='friendly'>88%</span><br>Acres: 6,102<br>Rank: 37 [<span class='friendly'>+4</span>]">Couch Potato</a> [7361]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 100,000 hostile Vampire attacked, killing 435,585 allied staff.</span><br>
<span class="hostile">[raised] 2,888 corpses twitched into life, becoming Lesser Vampire.</span><br>
<span class="friendly">[range] 2,968,322 allied Siren sang out, freezing in place 100,138 hostile staff.</span><br>
<br>Stunned: <span class="friendly">100,138 enemies stunned.</span> <br>Died: <span class="hostile">435,585 friendlies dead.</span> <br>Converted: <span class="hostile">2,888 friendlies converted.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 9th Jul, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 8th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 8th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 53,200,000 employees to attack <a href="id_view.php?ID=7361" title="Couch Potato [7361]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,852,584,161<br>Range: <span class='friendly'>88%</span><br>Acres: 6,102<br>Rank: 37 [<span class='friendly'>+4</span>]">Couch Potato</a> [7361], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 7th Jul, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 7th Jul, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 6th Jul, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 6th Jul, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 6th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 6th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 6th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 6th Jul, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 78,573,212 employees to attack <a href="id_view.php?ID=6839" title="you [6839]{}H/F Title: <span class='friendly'>Admirable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,234,961,991<br>Range: 38% [+1 eta]<br>Acres: 3,925<br>Rank: 84 [<span class='friendly'>+51</span>]">you</a> [6839], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 5th Jul, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 5th Jul, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 4th Jul, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=7152" title="Quentin Quarantino [7152]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 1,292,536,076<br>Range: 40%<br>Acres: 7,123<br>Rank: 77 [<span class='friendly'>+44</span>]">Quentin Quarantino</a> [7152]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=7152" title="Quentin Quarantino [7152]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 1,292,536,076<br>Range: 40%<br>Acres: 7,123<br>Rank: 77 [<span class='friendly'>+44</span>]">Quentin Quarantino</a> [7152]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[close] 45,014 hostile Hippy attacked, distracting 41,477 allied staff.</span><br>
<span class="hostile">[close] 539,988 hostile Sleeping Gas Trap attacked, disabling 3,165,647 allied staff.</span><br>
<span class="hostile">[close] 1,876,985 hostile Secret Agent attacked, killing 2,537,722 allied staff.</span><br>
<span class="hostile">[close] 212,598 hostile Assassin attacked, killing 102,844 allied staff.</span><br>
<span class="friendly">[close] 2,722,620 allied Witch attacked, killing 2,273,690 hostile staff.</span><br>
<span class="hostile">[close] 193 hostile Iron Golem attacked, killing 166 allied staff.</span><br>
<span class="friendly">[close] 3,346,238 allied Iron Golem attacked, killing 885,086 hostile staff.</span><br>
<span class="friendly">[close] 4,757,350 allied Dragon breathed fire on and melted 100,382 hostile staff.</span><br>
<span class="friendly">[close] 162,717 allied Geo-Phys Thief stole 1,257 land. [350] tree. [758] bush. [76] flower. [73] grass. [0] uncultivated. </span><br>
<br>Distracted: <span class="hostile">41,477 friendlies distracted.</span> <br>Disabled: <span class="hostile">3,165,647 friendlies disabled.</span> <br>Died: <span class="hostile">2,640,732 friendlies dead.</span> <span class="friendly">3,259,158 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 4th Jul, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=7152" title="Quentin Quarantino [7152]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 1,292,536,076<br>Range: 40%<br>Acres: 7,123<br>Rank: 77 [<span class='friendly'>+44</span>]">Quentin Quarantino</a> [7152]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=7152" title="Quentin Quarantino [7152]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 1,292,536,076<br>Range: 40%<br>Acres: 7,123<br>Rank: 77 [<span class='friendly'>+44</span>]">Quentin Quarantino</a> [7152]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[middle] 3,992,815 hostile Secret Agent attacked, killing 15,295,088 allied staff.</span><br>
<span class="hostile">[middle] 98,492 hostile Siren sang out, freezing in place 51,355 allied staff.</span><br>
<span class="hostile">[middle] 642,669 hostile Assassin attacked, killing 477,304 allied staff.</span><br>
<span class="friendly">[middle] 3,034,828 allied Witch attacked, killing 2,523,328 hostile staff.</span><br>
<span class="hostile">[middle] 253 hostile Iron Golem attacked, killing 523 allied staff.</span><br>
<span class="friendly">[middle] 3,530,419 allied Iron Golem attacked, killing 1,293,735 hostile staff.</span><br>
<span class="hostile">[middle] 4,316 hostile Ninja attacked, killing 9,733 allied staff.</span><br>
<br>Stunned: <span class="hostile">51,355 friendlies stunned.</span> <br>Died: <span class="hostile">15,782,648 friendlies dead.</span> <span class="friendly">3,817,063 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 4th Jul, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=7152" title="Quentin Quarantino [7152]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 1,292,536,076<br>Range: 40%<br>Acres: 7,123<br>Rank: 77 [<span class='friendly'>+44</span>]">Quentin Quarantino</a> [7152]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=7152" title="Quentin Quarantino [7152]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 1,292,536,076<br>Range: 40%<br>Acres: 7,123<br>Rank: 77 [<span class='friendly'>+44</span>]">Quentin Quarantino</a> [7152]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 9,000,000 hostile Secret Agent attacked, killing 39,420,950 allied staff.</span><br>
<span class="hostile">[range] 244,486 hostile Siren sang out, freezing in place 130,217 allied staff.</span><br>
<span class="hostile">[range] 3,127,563 hostile Assassin attacked, killing 3,340,046 allied staff.</span><br>
<span class="hostile">[range] 446 hostile Iron Golem attacked, killing 1,358 allied staff.</span><br>
<span class="friendly">[range] 3,880,770 allied Iron Golem attacked, killing 15,685,595 hostile staff.</span><br>
<span class="friendly">[range] 5,218,000 allied Dragon breathed fire on and melted 43,519,081 hostile staff.</span><br>
<span class="hostile">[range] 21,983 hostile Ninja attacked, killing 55,423 allied staff.</span><br>
<br>Stunned: <span class="hostile">130,217 friendlies stunned.</span> <br>Died: <span class="hostile">42,817,777 friendlies dead.</span> <span class="friendly">59,204,676 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 3rd Jul, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 3rd Jul, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 3rd Jul, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 3rd Jul, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 3rd Jul, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 75,977,440 employees to attack <a href="id_view.php?ID=7152" title="Quentin Quarantino [7152]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 1,292,536,076<br>Range: 40%<br>Acres: 7,123<br>Rank: 77 [<span class='friendly'>+44</span>]">Quentin Quarantino</a> [7152], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 3rd Jul, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 3rd Jul, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 75,977,440 employees to attack <a href="id_view.php?ID=5743" title="COVID-eo Killed the Radio Star [5743]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 2,583,503,904<br>Range: <span class='friendly'>80%</span><br>Acres: 6,161<br>Rank: 43 [<span class='friendly'>+10</span>]<br><b>ID Played By:</b> Stevey">COVID-eo Killed the Radio Star</a> [5743], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 2nd Jul, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 2nd Jul, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 87,977,440 employees to attack <a href="id_view.php?ID=5743" title="COVID-eo Killed the Radio Star [5743]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 2,583,503,904<br>Range: <span class='friendly'>80%</span><br>Acres: 6,161<br>Rank: 43 [<span class='friendly'>+10</span>]<br><b>ID Played By:</b> Stevey">COVID-eo Killed the Radio Star</a> [5743], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 2nd Jul, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 2nd Jul, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 10,000,000 employees to defend <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207], they are set to arrive in 3 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 24th Jun, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 23rd Jun, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 21st Jun, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 20th Jun, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 20th Jun, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
Instead of hanging around doing nothing, we got some target practise and pelted stones at the windows.</td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 19th Jun, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
If only we'd bought a football... there was nothing else to do around here.</td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 19th Jun, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 19th Jun, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 19th Jun, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 4,435,914 employees to defend <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 16th Jun, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 14th Jun, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[close] 1,921,911 hostile Hippy attacked, distracting 1,023,454 allied staff.</span><br>
<span class="hostile">[close] 685,705 hostile Arsonist attacked, disabling 82,418 allied staff.</span><br>
<br>Distracted: <span class="hostile">1,023,454 friendlies distracted.</span> <br>Disabled: <span class="hostile">82,418 friendlies disabled.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 14th Jun, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[middle] 685,705 hostile Arsonist attacked, disabling 1,036,503 allied staff.</span><br>
<span class="hostile">[middle] 44,613 hostile Political Mastermind attacked, distracting 69,369 allied staff.</span><br>
<span class="hostile">[middle] 7,000,000 hostile Secret Agent attacked, killing 39,005 allied staff.</span><br>
<br>Distracted: <span class="hostile">69,369 friendlies distracted.</span> <br>Disabled: <span class="hostile">1,036,503 friendlies disabled.</span> <br>Died: <span class="hostile">39,005 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 14th Jun, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 685,705 hostile Arsonist attacked, disabling 1,040,630 allied staff.</span><br>
<span class="hostile">[range] 44,613 hostile Political Mastermind attacked, distracting 71,622 allied staff.</span><br>
<span class="hostile">[range] 1,076 hostile Hooligan attacked, disabling 114 allied staff.</span><br>
<span class="hostile">[range] 3,129 hostile Hippy Van attacked, distracting 519 allied staff.</span><br>
<span class="hostile">[range] 231 hostile Cybernetic Warrior attacked, killing 274 allied staff.</span><br>
<span class="hostile">[range] 137 hostile Loudspeaker Protestor shouted in the ears of and distracted 55 allied staff.</span><br>
<span class="hostile">[range] 12,636 hostile Apache Longbow attacked, killing 25,150 allied staff.</span><br>
<span class="hostile">[range] 168 hostile White Knight attacked, slaying 397 allied staff.</span><br>
<br>Distracted: <span class="hostile">72,196 friendlies distracted.</span> <br>Disabled: <span class="hostile">1,040,744 friendlies disabled.</span> <br>Died: <span class="hostile">25,821 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 13th Jun, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 13th Jun, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 1,170,698 employees to attack <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 12th Jun, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 12th Jun, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 12th Jun, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 1,170,698 employees to attack <a href="id_view.php?ID=2642" title="Bring Back Pure Solo or Was it Han [2642]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,583,769,175<br>Range: <span class='friendly'>80%</span><br>Acres: 2,100<br>Rank: 42 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Quitus - RPG">Bring Back Pure Solo or Was it Han</a> [2642], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 12th Jun, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=84" title="DonaldZen [84]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,512,645,236<br>Range: 47%<br>Acres: 777<br>Rank: 64 [<span class='friendly'>+31</span>]">DonaldZen</a> [84]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=84" title="DonaldZen [84]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,512,645,236<br>Range: 47%<br>Acres: 777<br>Rank: 64 [<span class='friendly'>+31</span>]">DonaldZen</a> [84]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[close] 600 hostile Hippy attacked, distracting 639 allied staff.</span><br>
<span class="friendly">[close] 962,206 allied Political Mastermind attacked, distracting 7,255,449 hostile staff.</span><br>
<span class="hostile">[close] 1,636,012 hostile Witch attacked, killing 1,688,916 allied staff.</span><br>
<span class="hostile">[close] 5,130,895 hostile Iron Golem attacked, killing 16,616,044 allied staff.</span><br>
<span class="hostile">[close] 159 hostile Yob attacked, disabling 237 allied staff.</span><br>
<span class="friendly">[close] 1,706,220 allied Yob attacked, disabling 662 hostile staff.</span><br>
<span class="hostile">[close] 507,313 hostile White Knight attacked, slaying 7,241,311 allied staff.</span><br>
<span class="friendly">[close] 1,438,629 allied Cloner attacked, bribing 1,359,895 hostile staff.</span><br>
<span class="friendly">[close] 173,996 allied Recruitment Officer recruited 169,718 hostile staff.</span><br>
<br>Distracted: <span class="hostile">639 friendlies distracted.</span> <span class="friendly">7,255,449 enemies distracted.</span> <br>Disabled: <span class="hostile">237 friendlies disabled.</span> <span class="friendly">662 enemies disabled.</span> <br>Died: <span class="hostile">25,546,271 friendlies dead.</span> <br>Bribed: <span class="friendly">1,529,613 enemies bribed.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 12th Jun, year 3. <span title="Day time">Dawn</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=84" title="DonaldZen [84]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,512,645,236<br>Range: 47%<br>Acres: 777<br>Rank: 64 [<span class='friendly'>+31</span>]">DonaldZen</a> [84]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=84" title="DonaldZen [84]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,512,645,236<br>Range: 47%<br>Acres: 777<br>Rank: 64 [<span class='friendly'>+31</span>]">DonaldZen</a> [84]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[middle] 7,929,595 allied RPG Trooper attacked, killing 2,023,210 hostile staff.</span><br>
<span class="friendly">[middle] 979,738 allied Political Mastermind attacked, distracting 10,312,279 hostile staff.</span><br>
<span class="hostile">[middle] 7,357,759 hostile Siren sang out, freezing in place 9,822,553 allied staff.</span><br>
<span class="friendly">[middle] 2,310,833 allied Siren sang out, freezing in place 4,992,179 hostile staff.</span><br>
<span class="hostile">[middle] 1,482,771 hostile Witch attacked, killing 1,855,864 allied staff.</span><br>
<span class="hostile">[middle] 2,537,718 hostile Iron Golem attacked, killing 8,498,370 allied staff.</span><br>
<span class="hostile">[middle] 1,209,769 hostile Sorcerer attacked, killing 4,553,896 allied staff.</span><br>
<span class="friendly">[middle] 2,471,360 allied Hypnotist mesmerised 3,062,383 hostile staff.</span><br>
<span class="hostile">[middle] 183,904 hostile White Knight attacked, slaying 2,858,738 allied staff.</span><br>
<span class="friendly">[middle] 18,314 allied Recruitment Officer recruited 47,312 hostile staff.</span><br>
<br>Stunned: <span class="hostile">9,822,553 friendlies stunned.</span> <span class="friendly">4,992,179 enemies stunned.</span> <br>Distracted: <span class="friendly">10,312,279 enemies distracted.</span> <br>Died: <span class="hostile">17,766,868 friendlies dead.</span> <span class="friendly">2,023,210 enemies dead.</span> <br>Bribed: <span class="friendly">3,109,695 enemies bribed.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 12th Jun, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=84" title="DonaldZen [84]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,512,645,236<br>Range: 47%<br>Acres: 777<br>Rank: 64 [<span class='friendly'>+31</span>]">DonaldZen</a> [84]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=84" title="DonaldZen [84]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,512,645,236<br>Range: 47%<br>Acres: 777<br>Rank: 64 [<span class='friendly'>+31</span>]">DonaldZen</a> [84]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[range] 8,145,504 allied RPG Trooper attacked, killing 2,161,334 hostile staff.</span><br>
<span class="friendly">[range] 1,000,000 allied Political Mastermind attacked, distracting 11,251,546 hostile staff.</span><br>
<span class="hostile">[range] 8,688,820 hostile Siren sang out, freezing in place 11,651,533 allied staff.</span><br>
<span class="friendly">[range] 2,405,140 allied Siren sang out, freezing in place 5,372,133 hostile staff.</span><br>
<span class="hostile">[range] 4,420,390 hostile Iron Golem attacked, killing 16,517,571 allied staff.</span><br>
<span class="hostile">[range] 1,799,577 hostile Sorcerer attacked, killing 7,020,695 allied staff.</span><br>
<span class="friendly">[range] 2,393,046 allied Hypnotist mesmerised 3,415,350 hostile staff.</span><br>
<span class="hostile">[range] 258,064 hostile White Knight attacked, slaying 3,713,693 allied staff.</span><br>
<br>Stunned: <span class="hostile">11,651,533 friendlies stunned.</span> <span class="friendly">5,372,133 enemies stunned.</span> <br>Distracted: <span class="friendly">11,251,546 enemies distracted.</span> <br>Died: <span class="hostile">27,251,959 friendlies dead.</span> <span class="friendly">2,161,334 enemies dead.</span> <br>Bribed: <span class="friendly">3,415,350 enemies bribed.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 11th Jun, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 11th Jun, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 11th Jun, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 8,009,120 employees to attack <a href="id_view.php?ID=84" title="DonaldZen [84]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,512,645,236<br>Range: 47%<br>Acres: 777<br>Rank: 64 [<span class='friendly'>+31</span>]">DonaldZen</a> [84], they are set to arrive in 3 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 10th Jun, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 10th Jun, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[middle] 5,837,570 allied RPG Trooper attacked, killing 2,244,716 hostile staff.</span><br>
<span class="friendly">[middle] 296,576 allied Terrorist attacked, killing 1,879,127 hostile staff.</span><br>
<span class="friendly">[middle] 10,000,000 allied Iron Golem attacked, killing 51,615,599 hostile staff.</span><br>
<span class="friendly">[middle] 165,753 allied Sniper attacked, killing 1,079,309 hostile staff.</span><br>
<span class="friendly">[middle] 147,788 allied Petrol Bomber lobbed Molotov Cocktails and killed 1,055,069 hostile staff.</span><br>
<span class="friendly">[middle] 6,732,668 allied Hypnotist mesmerised 40,555,130 hostile staff.</span><br>
<span class="friendly">[middle] 159,618 allied Shock Trooper attacked, killing 60,265 hostile staff.</span><br>
<br>Died: <span class="friendly">57,934,085 enemies dead.</span> <br>Bribed: <span class="friendly">40,555,130 enemies bribed.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 10th Jun, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[range] 5,837,570 allied RPG Trooper attacked, killing 2,184,214 hostile staff.</span><br>
<span class="friendly">[range] 1,331,350 allied Arsonist attacked, disabling 4,197,122 hostile staff.</span><br>
<span class="friendly">[range] 3,964,852 allied Political Mastermind attacked, distracting 38,514,921 hostile staff.</span><br>
<span class="friendly">[range] 296,576 allied Terrorist attacked, killing 1,661,564 hostile staff.</span><br>
<span class="friendly">[range] 168,866 allied Secret Agent attacked, killing 1,000,037 hostile staff.</span><br>
<span class="friendly">[range] 2,148,147 allied Terrorist Leader attacked, killing 6,352,172 hostile staff.</span><br>
<span class="friendly">[range] 10,000,000 allied Iron Golem attacked, killing 47,550,252 hostile staff.</span><br>
<span class="friendly">[range] 165,753 allied Sniper attacked, killing 1,185,999 hostile staff.</span><br>
<span class="friendly">[range] 147,788 allied Petrol Bomber lobbed Molotov Cocktails and killed 1,012,783 hostile staff.</span><br>
<span class="friendly">[range] 6,309,615 allied Hypnotist mesmerised 59,165,772 hostile staff.</span><br>
<span class="friendly">[range] 159,618 allied Shock Trooper attacked, killing 1,277,255 hostile staff.</span><br>
<span class="friendly">[range] 108,393 allied Jeep attacked, killing 99,948 hostile staff.</span><br>
<span class="friendly">[range] 2,934 allied Humvee attacked, killing 1,598 hostile staff.</span><br>
<span class="friendly">[range] 2,005,677 allied White Knight attacked, slaying 30,105,670 hostile staff.</span><br>
<span class="friendly">[range] 6,968 allied Officer attacked, killing 13,521 hostile staff.</span><br>
<br>Distracted: <span class="friendly">38,514,921 enemies distracted.</span> <br>Disabled: <span class="friendly">4,197,122 enemies disabled.</span> <br>Died: <span class="friendly">92,445,013 enemies dead.</span> <br>Bribed: <span class="friendly">59,165,772 enemies bribed.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 10th Jun, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 16,303,646 employees to defend <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207], they are set to arrive in 3 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 9th Jun, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 9th Jun, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 9th Jun, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 9th Jun, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 13,109,120 employees to attack <a href="id_view.php?ID=5422" title="Yes Yes Fella [5422]{}H/F Title: <span class='hostile'>Villainous</span><br>Bounty: <span class='hostile'>60%</span><br>Current Score: 1,778,620,096<br>Range: 55%<br>Acres: 5,102<br>Rank: 56 [<span class='friendly'>+23</span>]">Yes Yes Fella</a> [5422], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 8th Jun, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 5th Jun, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 5th Jun, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 31st May, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 31st May, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
After we found out there was nothing to fight, we got a bit upset. We had a bake-off instead, and now have a wonderful selection of cookies and cakes.</td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 31st May, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
Seeing as there seemed to be nobody else around, we decided to have a few rounds of poker. Unfortunately we only had half a deck of cards.</td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 30th May, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[range] 6,965,446 allied RPG Trooper attacked, killing 2,434,626 hostile staff.</span><br>
<span class="friendly">[range] 1,344,506 allied Arsonist attacked, disabling 2,159,210 hostile staff.</span><br>
<span class="friendly">[range] 6,021,401 allied Political Mastermind attacked, distracting 40,259,875 hostile staff.</span><br>
<span class="hostile">[range] 3,550,062 hostile Biker attacked, killing 2,181,348 allied staff.</span><br>
<span class="hostile">[range] 1,227,687 hostile Terrorist attacked, killing 7,509,404 allied staff.</span><br>
<span class="friendly">[range] 197,665 allied Secret Agent attacked, killing 280,506 hostile staff.</span><br>
<span class="friendly">[range] 3,973,963 allied Siren sang out, freezing in place 5,460,001 hostile staff.</span><br>
<span class="friendly">[range] 97,213 allied Terrorist Leader attacked, killing 163,759 hostile staff.</span><br>
<span class="hostile">[range] 6,266,185 hostile Terrorist Leader attacked, killing 4,934,471 allied staff.</span><br>
<span class="friendly">[range] 177,108 allied Sniper attacked, killing 351,387 hostile staff.</span><br>
<span class="hostile">[range] 49,155 hostile Petrol Bomber lobbed Molotov Cocktails and killed 31,271 allied staff.</span><br>
<span class="friendly">[range] 4,512,525 allied Hypnotist mesmerised 3,706,952 hostile staff.</span><br>
<span class="friendly">[range] 165,162 allied Shock Trooper attacked, killing 111,671 hostile staff.</span><br>
<span class="hostile">[range] 2,191,217 hostile Jeep attacked, killing 473,812 allied staff.</span><br>
<span class="friendly">[range] 2,934 allied Humvee attacked, killing 517 hostile staff.</span><br>
<span class="friendly">[range] 569,286 allied White Knight attacked, slaying 373,766 hostile staff.</span><br>
<span class="friendly">[range] 6,968 allied Officer attacked, killing 3,401 hostile staff.</span><br>
<br>Stunned: <span class="friendly">5,460,001 enemies stunned.</span> <br>Distracted: <span class="friendly">40,259,875 enemies distracted.</span> <br>Disabled: <span class="friendly">2,159,210 enemies disabled.</span> <br>Died: <span class="friendly">3,719,633 enemies dead.</span> <span class="hostile">15,130,306 friendlies dead.</span> <br>Bribed: <span class="friendly">3,706,952 enemies bribed.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 30th May, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2208" title="Life as we knew it [2208]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,657,259,567<br>Range: 51%<br>Acres: 4,771<br>Rank: 59 [<span class='friendly'>+26</span>]">Life as we knew it</a> [2208]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2208" title="Life as we knew it [2208]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,657,259,567<br>Range: 51%<br>Acres: 4,771<br>Rank: 59 [<span class='friendly'>+26</span>]">Life as we knew it</a> [2208]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 1,690,000 hostile Apache Longbow attacked, killing 3,005,021 allied staff.</span><br>
<span class="hostile">[range] 1,295,561 hostile White Knight attacked, slaying 22,736 allied staff.</span><br>
<br>Died: <span class="hostile">3,027,757 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 30th May, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 30th May, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 4,000,000 employees to defend <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,760,871,401<br>Range: <span class='friendly'>85%</span><br>Acres: 10,267<br>Rank: 39 [<span class='friendly'>+6</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207], they are set to arrive in 3 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 30th May, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 29th May, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 3,027,757 employees to attack <a href="id_view.php?ID=2208" title="Life as we knew it [2208]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,657,259,567<br>Range: 51%<br>Acres: 4,771<br>Rank: 59 [<span class='friendly'>+26</span>]">Life as we knew it</a> [2208], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 29th May, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 29th May, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 29th May, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 96,000,000 people from <a href="id_view.php?ID=5058" title="Twigley [5058]{}H/F Title: <span class='hostile'>Criminal</span><br>Bounty: <span class='hostile'>30%</span><br>Current Score: 6,656,590,390<br>Range: <span class='friendly'>207%</span><br>Acres: 9,797<br>Rank: 16 [<span class='hostile'>-17</span>]<br><b>ID Played By:</b> Twigley">Twigley</a> [5058] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 28th May, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 27th May, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 27th May, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 27th May, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=84" title="DonaldZen [84]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,512,645,236<br>Range: 47%<br>Acres: 777<br>Rank: 64 [<span class='friendly'>+31</span>]">DonaldZen</a> [84]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=84" title="DonaldZen [84]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,512,645,236<br>Range: 47%<br>Acres: 777<br>Rank: 64 [<span class='friendly'>+31</span>]">DonaldZen</a> [84]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
Since there was nothing going on, we started to bluetooth each other funny pictures. It was going great until Azzer sent us a photo of himself.</td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 26th May, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 24,000,000 employees to attack <a href="id_view.php?ID=84" title="DonaldZen [84]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,512,645,236<br>Range: 47%<br>Acres: 777<br>Rank: 64 [<span class='friendly'>+31</span>]">DonaldZen</a> [84], they are set to arrive in 3 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 26th May, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 26th May, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 24th May, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 24th May, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 24th May, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 24th May, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 24th May, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Defending <a href="id_view.php?ID=8557" title="Shheet [8557]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 4,726,328,234<br>Range: <span class='friendly'>147%</span><br>Acres: 11,956<br>Rank: 25 [<span class='hostile'>-8</span>]<br><b>ID Played By:</b> Kc_dvs">Shheet</a> [8557]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Defending <a href="id_view.php?ID=8557" title="Shheet [8557]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 4,726,328,234<br>Range: <span class='friendly'>147%</span><br>Acres: 11,956<br>Rank: 25 [<span class='hostile'>-8</span>]<br><b>ID Played By:</b> Kc_dvs">Shheet</a> [8557]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
It took 10 minutes and half of us here to realise that Gary can in fact lick his own elbow.</td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Government Recall</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
The Government recalled a defensive mob when it was decided they were no longer required.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Government incoming defences</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Helicopters flew in overhead, dropping lines down around our land. Figures dressed in black, faces covered with balaclavas, dropped down the lines, assault rifles strapped to their backs. We couldn't be sure how many SAS there were, but we could see the 21,484,953 Police and Riot Police that also arrived.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Stealth detected</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
A stealth mob has been detected, ETA now 2 ticks, 1,337 currently visible. Mob sent from <a href="id_view.php?ID=7821" title="My username finally makes sense [7821]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 3,213,923,784<br>Range: <span class='friendly'>100%</span><br>Acres: 5,949<br>Rank: 33 [<span class='friendly'>+0</span>]<br><b>ID Played By:</b> Antisback">My username finally makes sense</a> [7821] to defend you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 23rd May, year 3. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 22nd May, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 161,202,591 people from <a href="id_view.php?ID=5058" title="Twigley [5058]{}H/F Title: <span class='hostile'>Criminal</span><br>Bounty: <span class='hostile'>30%</span><br>Current Score: 6,656,590,390<br>Range: <span class='friendly'>207%</span><br>Acres: 9,797<br>Rank: 16 [<span class='hostile'>-17</span>]<br><b>ID Played By:</b> Twigley">Twigley</a> [5058] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 22nd May, year 3. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 22nd May, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 21st May, year 3. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 20th May, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 20th May, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 19th May, year 3. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 19th May, year 3. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="right">
<a href="#Top">(Back To Top)</a>
</td>
</tr>
</tbody></table>
<br>
</div>
<form method="POST" action="actions/intelligence_2.php" name="orderform">
<table width="100%" align="center">
<tbody><tr>
<td colspan="4" class="header" width="100%" align="center">
Purchase Intelligence:
</td>
</tr>
<tr>
<td class="header" width="30%" align="center">
Source
</td>
<td class="header" width="30%" align="center">
Cost
</td>
<td class="header" width="30%" align="center">
In Stock
</td>
<td class="header" width="10%" nowrap="" align="center">
Amount
</td>
</tr>
<tr class="nonebackground">
<td align="center">
Drive-By
</td>
<td align="center">
<input type="hidden" name="IntelValue_1" value="2500">
<input type="hidden" name="have_1" value="83">
£2,500
</td>
<td align="center">
83</td>
<td width="2%" align="center">
<input name="drive_by" type="text" onblur="CalcCosts(this.form)">
</td>
</tr>
<tr class="lightbackground">
<td align="center">
Fly-Over
</td>
<td align="center">
<input type="hidden" name="IntelValue_2" value="15000">
<input type="hidden" name="have_2" value="43">
£15,000
</td>
<td align="center">
43</td>
<td width="2%" align="center">
<input name="fly_over" type="text" onblur="CalcCosts(this.form)">
</td>
</tr>
<tr class="nonebackground">
<td align="center">
Hax0r
</td>
<td align="center">
<input type="hidden" name="IntelValue_3" value="1000000">
<input type="hidden" name="have_3" value="44">
£1,000,000
</td>
<td align="center">
44</td>
<td width="2%" align="center">
<input name="haxor" type="text" onblur="CalcCosts(this.form)">
</td>
</tr>
<tr class="lightbackground">
<td align="center">
Spy
</td>
<td align="center">
<input type="hidden" name="IntelValue_4" value="10000000">
<input type="hidden" name="have_4" value="71">
£10,000,000
</td>
<td align="center">
71</td>
<td width="2%" align="center">
<input name="spy" type="text" onblur="CalcCosts(this.form)">
</td>
</tr>
<tr>
<td colspan="2">
</td>
<td colspan="2" nowrap="" align="right">
£<input type="text" name="TotalValue" value="" maxlength="30">
</td>
</tr><tr>
<td colspan="3">
</td>
<td align="center">
<input type="submit" value="Order" tabindex="9">
</td>
</tr>
</tbody></table>
</form>
<!-- Footer file starts here -->
</div>
`;

function getDoc(): HTMLElement {
    const ele = document.createElement('div');

    ele.innerHTML = content;

    return ele;
}