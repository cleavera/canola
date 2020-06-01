import { CompanyName, CompanyNameRepository, CurrentPointInTimeRepository, NewsReport, NewsRepository, PointInTime, Ticks } from '@actoolkit/domain';

import { PositiveTextComponentFactory, throwIt } from '../../shared';
import { isSpyReport } from '../helpers/is-spy-report.helper';

export async function spyReportFeature(): Promise<void> {
    getDoc();
    const mainPage: HTMLDivElement = document.querySelector('#main-page-data') ?? throwIt('Cannot find main page data');

    if (!isSpyReport(mainPage)) {
        return;
    }

    const reportRows: ArrayLike<HTMLElement> = document.querySelectorAll('#main-page-data > div > table > tbody > tr') ?? throwIt('No spy reports found'); // Eugh
    const currentPointInTime: PointInTime = await new CurrentPointInTimeRepository().get();
    const newsRepository: NewsRepository = new NewsRepository();
    const currentCompany: CompanyName = await new CompanyNameRepository().getOwn();

    for (let x = 2; x < reportRows.length - 2; x += 2) {
        const report: NewsReport = newsRepository.parseNewsReport(currentCompany, reportRows[x], reportRows[x + 1]);

        const tickDifference: Ticks = PointInTime.Subtract(currentPointInTime, report.time);
        const timeOfDayCell: ChildNode = reportRows[x].firstElementChild ?? throwIt('Invalid date cell');
        let output: string = `${tickDifference.ticks.toLocaleString('en')} ticks ago.`;

        if (tickDifference.ticks === 0) {
            output = 'This tick.';
        } else if (tickDifference.ticks === 1) {
            output = 'Last tick.';
        }

        timeOfDayCell.appendChild(PositiveTextComponentFactory(` ${output}`));
    }
}

function getDoc(): HTMLElement {
    const ele = document.createElement('div');

    ele.innerHTML = `
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
   <li><a href="search.php?ARM=70&amp;ARX=200&amp;OB=V&amp;AD=A">Search</a></li>
   <li><a href="statistics.php?Opt=P">Statistics</a></li>
   <li><a href="enemies_personal.php">Combat Stats</a></li>
  </ul>
 </li>
 <li>
<a class="menu-header">Your Account/ID:</a><ul id="menu-your-account" style="display:block">
   <li><a href="preferences.php">ID Settings</a></li>
   <li><a href="schemes.php">Colour Schemes</a></li>
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
 <span id="game-info-server-time" title="Page loaded at: 10:24:16">Time: 10:24:42 GMT</span>
 <span id="game-info-company"><a href="id_view.php?ID=7821" title="My username finally makes sense [7821]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,694,590,147<br>Range: <span class='friendly'>100%</span><br>Acres: 3,978<br>Rank: 29 [<span class='friendly'>+0</span>]<br><b>ID Played By:</b> Antisback">My username finally makes sense [7821]</a></span>
 <span id="game-info-next-tick" title="Next tick is due"><span id="tut-step-6">Tick: 10:30:00 GMT</span></span>
</div>
<div id="game-info-bottom">
 <span id="game-info-funds">Funds: £5,370,534,114<button title="Income{}
        Per tick: £918,795,850</br>
        Per hour: £5,512,775,100</br>
        Per day: £132,306,602,400</br>
    " style="background: rgb(102, 102, 204) none repeat scroll 0% 0%; border: 1px solid rgb(16, 16, 16); color: rgb(240, 240, 240); padding: 0px; border-radius: 50%; width: 14px; text-align: center; font-size: 8px; margin: 0px 5px; vertical-align: middle; height: 14px; font-weight: bold; position: absolute;">i</button></span>
 <span id="game-info-rank-score"><a href="world_rank.php">Score: 2,694,590,147 [29]</a><button title="Breakdown{}
        Staff: 2,219,139,119 <span class=&quot;friendly&quot;>[82.36%]</span></br>
        Land: 158,244,840 <span class=&quot;friendly&quot;>[5.87%]</span></br>
        Planted plants: 424,238 <span class=&quot;friendly&quot;>[0.02%]</span></br>
        Stocked plants: 0 <span class=&quot;friendly&quot;>[0.00%]</span></br>
        Stocked seeds: 45,181,561 <span class=&quot;friendly&quot;>[1.68%]</span></br>
        Developments: 259,600,000 <span class=&quot;friendly&quot;>[9.63%]</span>
    " style="background: rgb(102, 102, 204) none repeat scroll 0% 0%; border: 1px solid rgb(16, 16, 16); color: rgb(240, 240, 240); padding: 0px; border-radius: 50%; width: 14px; text-align: center; font-size: 8px; margin: 0px 5px; vertical-align: middle; height: 14px; font-weight: bold; position: absolute;">i</button></span>
 <span id="game-info-game-date">Christmas Day, year 2. <span title="Night time">Evening</span></span>
</div>
<div id="game-info-live">
 <span id="live-links">
 </span>
 <span id="live-weather">
  <img src="images/night_snow.gif" title="Winter: Night - Heavy snow" alt="Night - Heavy snow" width="47" height="50" border="0"><br>
 </span>
</div>

<div id="game-info-live-season">
 <span id="live-season">
  Winter </span>
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
<span class="friendly">Spy report on <span title="Shheet [8557]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,772,487,401<br>Range: 65%<br>Acres: 6,852<br>Rank: 48 [<span class='friendly'>+19</span>]<br><b>ID Played By:</b> Kc_dvs"><a href="id_view.php?ID=8557">Shheet</a> [8557]</span> successful:</span></td>
</tr>
</tbody></table>
<table width="100%" align="center">
<tbody><tr class="header">
<td colspan="2" width="100%" align="center">
<a name="Top">Reported News</a></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Christmas Day, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Christmas Eve, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Construction Started</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You started constructing an item.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 23rd Dec, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 23rd Dec, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 22nd Dec, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 22nd Dec, year 2. <span title="Night time">Dusk</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=9117" title="Be My Quaran-tine [9117]{}H/F Title: Prominent<br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,180,389,582<br>Range: 43%<br>Acres: 5,650<br>Rank: 73 [<span class='friendly'>+44</span>]">Be My Quaran-tine</a> [9117]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=9117" title="Be My Quaran-tine [9117]{}H/F Title: Prominent<br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,180,389,582<br>Range: 43%<br>Acres: 5,650<br>Rank: 73 [<span class='friendly'>+44</span>]">Be My Quaran-tine</a> [9117]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[close] 9,897 hostile Hippy attacked, distracting 1,390 allied staff.</span><br>
<span class="hostile">[close] 1,364,466 hostile Striker attacked, killing 184,266 allied staff.</span><br>
<span class="friendly">[close] 2,071,070 allied Witch attacked, killing 188,658 hostile staff.</span><br>
<span class="friendly">[close] 682,050 allied Iron Golem attacked, killing 35,723 hostile staff.</span><br>
<span class="hostile">[close] 566,288 hostile Apache Longbow attacked, killing 1,628,336 allied staff.</span><br>
<br>Distracted: <span class="hostile">1,390 friendlies distracted.</span> <br>Died: <span class="hostile">1,812,602 friendlies dead.</span> <span class="friendly">224,381 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 22nd Dec, year 2. <span title="Night time">Dusk</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2711" title="Snake Eyes [2711]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,218,359,362<br>Range: 45%<br>Acres: 6,083<br>Rank: 70 [<span class='friendly'>+41</span>]">Snake Eyes</a> [2711]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2711" title="Snake Eyes [2711]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,218,359,362<br>Range: 45%<br>Acres: 6,083<br>Rank: 70 [<span class='friendly'>+41</span>]">Snake Eyes</a> [2711]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[close] 14,596 hostile Psychopathic Android attacked, killing 2,762 allied staff.</span><br>
<span class="hostile">[close] 1,337 hostile Hippy attacked, distracting 1,249 allied staff.</span><br>
<span class="hostile">[close] 1,000,000 hostile Cybernetic Warrior attacked, killing 7,127,252 allied staff.</span><br>
<span class="hostile">[close] 1,337 hostile Yob attacked, disabling 2,122 allied staff.</span><br>
<span class="hostile">[close] 969,212 hostile Small Droid made some funny beeps and disabled 2,296,936 allied staff.</span><br>
<span class="hostile">[close] 408,086 hostile White Wizard zapped 159,501 allied staff.</span><br>
<span class="hostile">[close] 1,161,491 hostile White Knight attacked, slaying 28,485 allied staff.</span><br>
<span class="hostile">[close] 1,000,000 hostile Tyrant Drone attacked, killing 195,175 allied staff.</span><br>
<br>Distracted: <span class="hostile">1,249 friendlies distracted.</span> <br>Disabled: <span class="hostile">2,299,058 friendlies disabled.</span> <br>Died: <span class="hostile">7,513,175 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 22nd Dec, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=9117" title="Be My Quaran-tine [9117]{}H/F Title: Prominent<br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,180,389,582<br>Range: 43%<br>Acres: 5,650<br>Rank: 73 [<span class='friendly'>+44</span>]">Be My Quaran-tine</a> [9117]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=9117" title="Be My Quaran-tine [9117]{}H/F Title: Prominent<br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,180,389,582<br>Range: 43%<br>Acres: 5,650<br>Rank: 73 [<span class='friendly'>+44</span>]">Be My Quaran-tine</a> [9117]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[middle] 1,918,019 hostile Striker attacked, killing 307,429 allied staff.</span><br>
<span class="friendly">[middle] 2,480,621 allied Witch attacked, killing 453,392 hostile staff.</span><br>
<span class="friendly">[middle] 1,579,331 allied Iron Golem attacked, killing 228,990 hostile staff.</span><br>
<span class="friendly">[middle] 2,360,807 allied Sorcerer attacked, killing 923,407 hostile staff.</span><br>
<span class="hostile">[middle] 115,761 hostile Grenadier attacked, killing 279,320 allied staff.</span><br>
<span class="hostile">[middle] 591,531 hostile Apache Longbow attacked, killing 5,219,843 allied staff.</span><br>
<br>Died: <span class="hostile">5,806,592 friendlies dead.</span> <span class="friendly">1,605,789 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 22nd Dec, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2711" title="Snake Eyes [2711]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,218,359,362<br>Range: 45%<br>Acres: 6,083<br>Rank: 70 [<span class='friendly'>+41</span>]">Snake Eyes</a> [2711]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2711" title="Snake Eyes [2711]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,218,359,362<br>Range: 45%<br>Acres: 6,083<br>Rank: 70 [<span class='friendly'>+41</span>]">Snake Eyes</a> [2711]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[middle] 14,596 hostile Psychopathic Android attacked, killing 2,695 allied staff.</span><br>
<span class="friendly">[middle] 1,394,132 allied Siren sang out, freezing in place 1,173,946 hostile staff.</span><br>
<span class="hostile">[middle] 110,331 hostile Cybernetic Warrior attacked, killing 928,330 allied staff.</span><br>
<br>Stunned: <span class="friendly">1,173,946 enemies stunned.</span> <br>Died: <span class="hostile">931,025 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 22nd Dec, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=9117" title="Be My Quaran-tine [9117]{}H/F Title: Prominent<br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,180,389,582<br>Range: 43%<br>Acres: 5,650<br>Rank: 73 [<span class='friendly'>+44</span>]">Be My Quaran-tine</a> [9117]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=9117" title="Be My Quaran-tine [9117]{}H/F Title: Prominent<br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,180,389,582<br>Range: 43%<br>Acres: 5,650<br>Rank: 73 [<span class='friendly'>+44</span>]">Be My Quaran-tine</a> [9117]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 2,133,488 hostile Striker attacked, killing 374,593 allied staff.</span><br>
<span class="friendly">[range] 2,814,040 allied Iron Golem attacked, killing 11,144,163 hostile staff.</span><br>
<span class="friendly">[range] 3,851,965 allied Sorcerer attacked, killing 14,979,132 hostile staff.</span><br>
<span class="hostile">[range] 535,362 hostile Grenadier attacked, killing 1,784,034 allied staff.</span><br>
<span class="hostile">[range] 735,772 hostile Apache Longbow attacked, killing 10,993,745 allied staff.</span><br>
<br>Died: <span class="hostile">13,152,372 friendlies dead.</span> <span class="friendly">26,123,295 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 22nd Dec, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2711" title="Snake Eyes [2711]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,218,359,362<br>Range: 45%<br>Acres: 6,083<br>Rank: 70 [<span class='friendly'>+41</span>]">Snake Eyes</a> [2711]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2711" title="Snake Eyes [2711]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,218,359,362<br>Range: 45%<br>Acres: 6,083<br>Rank: 70 [<span class='friendly'>+41</span>]">Snake Eyes</a> [2711]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 14,596 hostile Psychopathic Android attacked, killing 2,737 allied staff.</span><br>
<span class="friendly">[range] 1,497,263 allied Siren sang out, freezing in place 1,171,708 hostile staff.</span><br>
<span class="hostile">[range] 108,272 hostile Cybernetic Warrior attacked, killing 868,412 allied staff.</span><br>
<br>Stunned: <span class="friendly">1,171,708 enemies stunned.</span> <br>Died: <span class="hostile">871,149 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 21st Dec, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 23,415,664 employees to attack <a href="id_view.php?ID=9117" title="Be My Quaran-tine [9117]{}H/F Title: Prominent<br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,180,389,582<br>Range: 43%<br>Acres: 5,650<br>Rank: 73 [<span class='friendly'>+44</span>]">Be My Quaran-tine</a> [9117], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 21st Dec, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 21st Dec, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 23,300,007 employees to attack <a href="id_view.php?ID=9117" title="Be My Quaran-tine [9117]{}H/F Title: Prominent<br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,180,389,582<br>Range: 43%<br>Acres: 5,650<br>Rank: 73 [<span class='friendly'>+44</span>]">Be My Quaran-tine</a> [9117], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 21st Dec, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 11,615,656 employees to attack <a href="id_view.php?ID=2711" title="Snake Eyes [2711]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,218,359,362<br>Range: 45%<br>Acres: 6,083<br>Rank: 70 [<span class='friendly'>+41</span>]">Snake Eyes</a> [2711], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 20th Dec, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 20th Dec, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 20th Dec, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 19th Dec, year 2. <span title="Night time">Dusk</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 17,864,705 employees to attack <a href="id_view.php?ID=9117" title="Be My Quaran-tine [9117]{}H/F Title: Prominent<br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,180,389,582<br>Range: 43%<br>Acres: 5,650<br>Rank: 73 [<span class='friendly'>+44</span>]">Be My Quaran-tine</a> [9117], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 19th Dec, year 2. <span title="Night time">Dusk</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 16,814,174 employees to attack <a href="id_view.php?ID=2711" title="Snake Eyes [2711]{}H/F Title: <span class='friendly'>Reputable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,218,359,362<br>Range: 45%<br>Acres: 6,083<br>Rank: 70 [<span class='friendly'>+41</span>]">Snake Eyes</a> [2711], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 16th Dec, year 2. <span title="Night time">Dusk</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 12th Dec, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 12th Dec, year 2. <span title="Night time">Dusk</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 12th Dec, year 2. <span title="Night time">Dusk</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2785" title="Killer_of_your_units [2785]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 1,021,100,393<br>Range: 37% [+1 eta]<br>Acres: 4,729<br>Rank: 84 [<span class='friendly'>+55</span>]">Killer_of_your_units</a> [2785]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2785" title="Killer_of_your_units [2785]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 1,021,100,393<br>Range: 37% [+1 eta]<br>Acres: 4,729<br>Rank: 84 [<span class='friendly'>+55</span>]">Killer_of_your_units</a> [2785]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 3,163,423 hostile Terrorist Leader attacked, killing 8,669,738 allied staff.</span><br>
<span class="hostile">[range] 176,816 hostile Petrol Bomber lobbed Molotov Cocktails and killed 1,253,860 allied staff.</span><br>
<br>Died: <span class="hostile">9,923,598 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 11th Dec, year 2. <span title="Night time">Dusk</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=8792" title="QuarantineAccount [8792]{}H/F Title: <span class='hostile'>Rude</span><br>Bounty: <span class='hostile'>10%</span><br>Current Score: 998,878,030<br>Range: 37% [+1 eta]<br>Acres: 426<br>Rank: 85 [<span class='friendly'>+56</span>]<br><b>ID Played By:</b> bluehen55">QuarantineAccount</a> [8792]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=8792" title="QuarantineAccount [8792]{}H/F Title: <span class='hostile'>Rude</span><br>Bounty: <span class='hostile'>10%</span><br>Current Score: 998,878,030<br>Range: 37% [+1 eta]<br>Acres: 426<br>Rank: 85 [<span class='friendly'>+56</span>]<br><b>ID Played By:</b> bluehen55">QuarantineAccount</a> [8792]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[close] 50,000 allied Geo-Phys Thief stole 259 land. [67] tree. [140] bush. [28] flower. [24] grass. [0] uncultivated. </span><br>
</td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 11th Dec, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 15,100,000 employees to attack <a href="id_view.php?ID=2785" title="Killer_of_your_units [2785]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 1,021,100,393<br>Range: 37% [+1 eta]<br>Acres: 4,729<br>Rank: 84 [<span class='friendly'>+55</span>]">Killer_of_your_units</a> [2785], they are set to arrive in 6 ticks. Mob ETA was modified by +1 from: Attacking at 35-40% attack range. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 11th Dec, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=8792" title="QuarantineAccount [8792]{}H/F Title: <span class='hostile'>Rude</span><br>Bounty: <span class='hostile'>10%</span><br>Current Score: 998,878,030<br>Range: 37% [+1 eta]<br>Acres: 426<br>Rank: 85 [<span class='friendly'>+56</span>]<br><b>ID Played By:</b> bluehen55">QuarantineAccount</a> [8792]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=8792" title="QuarantineAccount [8792]{}H/F Title: <span class='hostile'>Rude</span><br>Bounty: <span class='hostile'>10%</span><br>Current Score: 998,878,030<br>Range: 37% [+1 eta]<br>Acres: 426<br>Rank: 85 [<span class='friendly'>+56</span>]<br><b>ID Played By:</b> bluehen55">QuarantineAccount</a> [8792]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
Bored, we decided to scare some passers by. The police came and told us all off.</td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 11th Dec, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=8792" title="QuarantineAccount [8792]{}H/F Title: <span class='hostile'>Rude</span><br>Bounty: <span class='hostile'>10%</span><br>Current Score: 998,878,030<br>Range: 37% [+1 eta]<br>Acres: 426<br>Rank: 85 [<span class='friendly'>+56</span>]<br><b>ID Played By:</b> bluehen55">QuarantineAccount</a> [8792]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=8792" title="QuarantineAccount [8792]{}H/F Title: <span class='hostile'>Rude</span><br>Bounty: <span class='hostile'>10%</span><br>Current Score: 998,878,030<br>Range: 37% [+1 eta]<br>Acres: 426<br>Rank: 85 [<span class='friendly'>+56</span>]<br><b>ID Played By:</b> bluehen55">QuarantineAccount</a> [8792]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[close] 10,000 allied Geo-Phys Thief stole 232 land. [60] tree. [126] bush. [25] flower. [21] grass. [0] uncultivated. </span><br>
</td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 10th Dec, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 3,150,000 employees to attack <a href="id_view.php?ID=8792" title="QuarantineAccount [8792]{}H/F Title: <span class='hostile'>Rude</span><br>Bounty: <span class='hostile'>10%</span><br>Current Score: 998,878,030<br>Range: 37% [+1 eta]<br>Acres: 426<br>Rank: 85 [<span class='friendly'>+56</span>]<br><b>ID Played By:</b> bluehen55">QuarantineAccount</a> [8792], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 10th Dec, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2785" title="Killer_of_your_units [2785]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 1,021,100,393<br>Range: 37% [+1 eta]<br>Acres: 4,729<br>Rank: 84 [<span class='friendly'>+55</span>]">Killer_of_your_units</a> [2785]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2785" title="Killer_of_your_units [2785]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 1,021,100,393<br>Range: 37% [+1 eta]<br>Acres: 4,729<br>Rank: 84 [<span class='friendly'>+55</span>]">Killer_of_your_units</a> [2785]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[close] 150,000 hostile Hippy attacked, distracting 125,121 allied staff.</span><br>
<span class="hostile">[close] 171,700 hostile Terrorist attacked, killing 1,052,902 allied staff.</span><br>
<span class="friendly">[close] 1,972,855 allied Witch attacked, killing 181,700 hostile staff.</span><br>
<span class="friendly">[close] 4,970,343 allied Iron Golem attacked, killing 150,000 hostile staff.</span><br>
<span class="friendly">[close] 193,170 allied Geo-Phys Thief stole 752 land. [195] tree. [478] bush. [40] flower. [39] grass. [0] uncultivated. </span><br>
<br>Distracted: <span class="hostile">125,121 friendlies distracted.</span> <br>Died: <span class="hostile">1,052,902 friendlies dead.</span> <span class="friendly">331,700 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 10th Dec, year 2. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 10th Dec, year 2. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2785" title="Killer_of_your_units [2785]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 1,021,100,393<br>Range: 37% [+1 eta]<br>Acres: 4,729<br>Rank: 84 [<span class='friendly'>+55</span>]">Killer_of_your_units</a> [2785]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2785" title="Killer_of_your_units [2785]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 1,021,100,393<br>Range: 37% [+1 eta]<br>Acres: 4,729<br>Rank: 84 [<span class='friendly'>+55</span>]">Killer_of_your_units</a> [2785]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[middle] 172,416 hostile Terrorist attacked, killing 975,537 allied staff.</span><br>
<span class="friendly">[middle] 1,923,326 allied Siren sang out, freezing in place 172,416 hostile staff.</span><br>
<span class="friendly">[middle] 1,976,866 allied Witch attacked, killing 173,753 hostile staff.</span><br>
<br>Stunned: <span class="friendly">172,416 enemies stunned.</span> <br>Died: <span class="hostile">975,537 friendlies dead.</span> <span class="friendly">173,753 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 10th Dec, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=2785" title="Killer_of_your_units [2785]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 1,021,100,393<br>Range: 37% [+1 eta]<br>Acres: 4,729<br>Rank: 84 [<span class='friendly'>+55</span>]">Killer_of_your_units</a> [2785]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=2785" title="Killer_of_your_units [2785]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 1,021,100,393<br>Range: 37% [+1 eta]<br>Acres: 4,729<br>Rank: 84 [<span class='friendly'>+55</span>]">Killer_of_your_units</a> [2785]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 855,321 hostile Terrorist attacked, killing 4,807,269 allied staff.</span><br>
<span class="friendly">[range] 1,925,683 allied Siren sang out, freezing in place 861,968 hostile staff.</span><br>
<span class="friendly">[range] 4,978,845 allied Iron Golem attacked, killing 861,968 hostile staff.</span><br>
<span class="friendly">[range] 5,176,211 allied Sorcerer attacked, killing 2 hostile staff.</span><br>
<br>Stunned: <span class="friendly">861,968 enemies stunned.</span> <br>Died: <span class="hostile">4,807,269 friendlies dead.</span> <span class="friendly">861,970 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 9th Dec, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 9th Dec, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 40,337,152 employees to attack <a href="id_view.php?ID=2785" title="Killer_of_your_units [2785]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 1,021,100,393<br>Range: 37% [+1 eta]<br>Acres: 4,729<br>Rank: 84 [<span class='friendly'>+55</span>]">Killer_of_your_units</a> [2785], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 8th Dec, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 8th Dec, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=8957" title="Warzone [8957]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 620,022,495<br>Range: <span class='hostile'>23%</span><br>Acres: 2,021<br>Rank: 129 [<span class='friendly'>+100</span>]">Warzone</a> [8957]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=8957" title="Warzone [8957]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 620,022,495<br>Range: <span class='hostile'>23%</span><br>Acres: 2,021<br>Rank: 129 [<span class='friendly'>+100</span>]">Warzone</a> [8957]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[middle] 648,560 hostile RPG Trooper attacked, killing 131,412 allied staff.</span><br>
<span class="friendly">[middle] 431,529 allied RPG Trooper attacked, killing 73,209 hostile staff.</span><br>
<span class="friendly">[middle] 1,438,161 allied Siren sang out, freezing in place 2,016,216 hostile staff.</span><br>
<span class="friendly">[middle] 2,278,393 allied Hypnotist mesmerised 749,488 hostile staff.</span><br>
<span class="hostile">[middle] 17,874 hostile Humvee attacked, killing 5,134 allied staff.</span><br>
<br>Stunned: <span class="friendly">2,016,216 enemies stunned.</span> <br>Died: <span class="hostile">136,546 friendlies dead.</span> <span class="friendly">73,209 enemies dead.</span> <br>Bribed: <span class="friendly">749,488 enemies bribed.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 7th Dec, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=8957" title="Warzone [8957]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 620,022,495<br>Range: <span class='hostile'>23%</span><br>Acres: 2,021<br>Rank: 129 [<span class='friendly'>+100</span>]">Warzone</a> [8957]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=8957" title="Warzone [8957]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 620,022,495<br>Range: <span class='hostile'>23%</span><br>Acres: 2,021<br>Rank: 129 [<span class='friendly'>+100</span>]">Warzone</a> [8957]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 936,928 hostile RPG Trooper attacked, killing 195,139 allied staff.</span><br>
<span class="friendly">[range] 436,740 allied RPG Trooper attacked, killing 79,418 hostile staff.</span><br>
<span class="friendly">[range] 1,465,530 allied Siren sang out, freezing in place 3,196,875 hostile staff.</span><br>
<span class="friendly">[range] 2,311,110 allied Hypnotist mesmerised 2,143,820 hostile staff.</span><br>
<span class="hostile">[range] 189 hostile Shock Trooper attacked, killing 569 allied staff.</span><br>
<span class="hostile">[range] 37,303 hostile Humvee attacked, killing 11,437 allied staff.</span><br>
<br>Stunned: <span class="friendly">3,196,875 enemies stunned.</span> <br>Died: <span class="hostile">207,145 friendlies dead.</span> <span class="friendly">79,418 enemies dead.</span> <br>Bribed: <span class="friendly">2,143,820 enemies bribed.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 7th Dec, year 2. <span title="Night time">Dusk</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 7th Dec, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 1,500,000 employees to attack <a href="id_view.php?ID=8957" title="Warzone [8957]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 620,022,495<br>Range: <span class='hostile'>23%</span><br>Acres: 2,021<br>Rank: 129 [<span class='friendly'>+100</span>]">Warzone</a> [8957], they are set to arrive in 4 ticks. Mob ETA was modified by +1 from: Attacking at 35-40% attack range. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 6th Dec, year 2. <span title="Night time">Dusk</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 6th Dec, year 2. <span title="Night time">Dusk</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 1,500,000 employees to attack <a href="id_view.php?ID=8957" title="Warzone [8957]{}H/F Title: <span class='friendly'>Respectable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 620,022,495<br>Range: <span class='hostile'>23%</span><br>Acres: 2,021<br>Rank: 129 [<span class='friendly'>+100</span>]">Warzone</a> [8957], they are set to arrive in 4 ticks. Mob ETA was modified by +1 from: Attacking at 35-40% attack range. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 2nd Dec, year 2. <span title="Night time">Dusk</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 1st Dec, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 40,399,999 employees to attack <a href="id_view.php?ID=2757" title="summer [2757]{}H/F Title: <span class='friendly'>Admirable</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,031,143,995<br>Range: 38% [+1 eta]<br>Acres: 3,965<br>Rank: 83 [<span class='friendly'>+54</span>]<br><b>ID Played By:</b> sovetnik">summer</a> [2757], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 30th Nov, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 29th Nov, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 29th Nov, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 28th Nov, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 28th Nov, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 28th Nov, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 28th Nov, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 4 ticks, 14,257,585 people from <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,243,004,656<br>Range: <span class='friendly'>83%</span><br>Acres: 6,775<br>Rank: 38 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207] will arrive to defend you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 28th Nov, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 28th Nov, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 28th Nov, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 4 ticks, 100,000 people from <a href="id_view.php?ID=7821" title="My username finally makes sense [7821]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,694,590,147<br>Range: <span class='friendly'>100%</span><br>Acres: 3,978<br>Rank: 29 [<span class='friendly'>+0</span>]<br><b>ID Played By:</b> Antisback">My username finally makes sense</a> [7821] will arrive to defend you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 28th Nov, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 68,822,500 people from <a href="id_view.php?ID=9783" title="Only because Dean thought of it [9783]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 3,928,984,862<br>Range: <span class='friendly'>145%</span><br>Acres: 12,261<br>Rank: 20 [<span class='hostile'>-9</span>]">Only because Dean thought of it</a> [9783] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 25th Nov, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 22nd Nov, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Hamster Departure!</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
The tiny, demonic Hamster from Hell gave one final jab of its pitchfork, set fire to a few peoples trousers and then left via the small tunnel it came by, sealing it shut in the process. We thought we could hear the noise of thousands of screaming voices just before the tunnel sealed...</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 21st Nov, year 2. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Hamster Hole!</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
A small tunnel leading in to the pit of Hell itself appeared outside our company, and from it emerged an evil, malicious Hamster from Hell, complete with tiny little devils horns and a miniature pitchfork. It opened its tiny mouth, from which came the noise of... what was almost like... small children... singing... 'La la la la laaaa laaaa'... but in the most incredibly sinister way imaginable.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 19th Nov, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 13th Nov, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 13th Nov, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 12th Nov, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 60,954,011 people from <a href="id_view.php?ID=6999" title="the Umbrella corp. [6999]{}H/F Title: <span class='hostile'>Notorious</span><br>Bounty: <span class='hostile'>16%</span><br>Current Score: 2,600,047,222<br>Range: <span class='friendly'>96%</span><br>Acres: 7,270<br>Rank: 32 [<span class='friendly'>+3</span>]">the Umbrella corp.</a> [6999] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 11th Nov, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 11th Nov, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 11th Nov, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 10th Nov, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 10th Nov, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 10th Nov, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 18,399,999 employees to attack <a href="id_view.php?ID=764" title="EvenPeopleInIsoDontWannaPlay [764]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 11,234,787,329<br>Range: <span class='friendly'>416%</span> [-1 eta rush]<br>Acres: 15,626<br>Rank: 4 [<span class='hostile'>-25</span>]">EvenPeopleInIsoDontWannaPlay</a> [764], they are set to arrive in 3 ticks. Mob ETA was modified by -1 from: Adrenaline rush boost. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 10th Nov, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 19,999,999 employees to attack <a href="id_view.php?ID=9994" title="His Every Right Obliterated [9994]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 14,827,910,335<br>Range: <span class='friendly'>550%</span> [-1 eta rush]<br>Acres: 23,010<br>Rank: 2 [<span class='hostile'>-27</span>]<br><b>ID Played By:</b> Hero">His Every Right Obliterated</a> [9994], they are set to arrive in 1 ticks. Mob ETA was modified by -1 from: Adrenaline rush boost. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 10th Nov, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 10th Nov, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 20,000,000 employees to attack <a href="id_view.php?ID=9994" title="His Every Right Obliterated [9994]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 14,827,910,335<br>Range: <span class='friendly'>550%</span> [-1 eta rush]<br>Acres: 23,010<br>Rank: 2 [<span class='hostile'>-27</span>]<br><b>ID Played By:</b> Hero">His Every Right Obliterated</a> [9994], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 7th Nov, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 7th Nov, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 23,176,554 employees to attack <a href="id_view.php?ID=9994" title="His Every Right Obliterated [9994]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 14,827,910,335<br>Range: <span class='friendly'>550%</span> [-1 eta rush]<br>Acres: 23,010<br>Rank: 2 [<span class='hostile'>-27</span>]<br><b>ID Played By:</b> Hero">His Every Right Obliterated</a> [9994], they are set to arrive in 3 ticks. Mob ETA was modified by -1 from: Adrenaline rush boost. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 7th Nov, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 7th Nov, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 33,336,223 employees to attack <a href="id_view.php?ID=9994" title="His Every Right Obliterated [9994]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 14,827,910,335<br>Range: <span class='friendly'>550%</span> [-1 eta rush]<br>Acres: 23,010<br>Rank: 2 [<span class='hostile'>-27</span>]<br><b>ID Played By:</b> Hero">His Every Right Obliterated</a> [9994], they are set to arrive in 4 ticks. Mob ETA was modified by -1 from: Adrenaline rush boost. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 5th Nov, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 4th Nov, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 4th Nov, year 2. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 1st Nov, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 25th Oct, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 25th Oct, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 25th Oct, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 25th Oct, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Incoming Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
News from your sources is that in 5 ticks, 51,000,000 people from <a href="id_view.php?ID=6137" title="Saigo no Getsuga [6137]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 5,817,435,325<br>Range: <span class='friendly'>215%</span><br>Acres: 11,132<br>Rank: 11 [<span class='hostile'>-18</span>]<br><b>ID Played By:</b> Zer0">Saigo no Getsuga</a> [6137] will arrive to attack you.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 25th Oct, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 25th Oct, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 25th Oct, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 25th Oct, year 2. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 25th Oct, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Friendlies</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 8,622,001 employees to defend <a href="id_view.php?ID=8207" title="Catcher of sleepmoders [8207]{}H/F Title: <span class='friendly'>Proper</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 2,243,004,656<br>Range: <span class='friendly'>83%</span><br>Acres: 6,775<br>Rank: 38 [<span class='friendly'>+9</span>]<br><b>Notes:</b> Maick - Hypno">Catcher of sleepmoders</a> [8207], they are set to arrive in 4 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 23rd Oct, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 23rd Oct, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 22nd Oct, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 19th Oct, year 2. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 19th Oct, year 2. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 18th Oct, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 15th Oct, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 14th Oct, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 14th Oct, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 14th Oct, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 13th Oct, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 13th Oct, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 13th Oct, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=1138" title="Quacker [1138]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,844,450,174<br>Range: 68%<br>Acres: 5,000<br>Rank: 47 [<span class='friendly'>+18</span>]">Quacker</a> [1138]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=1138" title="Quacker [1138]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,844,450,174<br>Range: 68%<br>Acres: 5,000<br>Rank: 47 [<span class='friendly'>+18</span>]">Quacker</a> [1138]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 9,696,454 hostile SAS completely totally and utterly killed 31,848,944 allied staff.</span><br>
<span class="hostile">[range] 1,300,198 hostile Bunker attacked, killing 2,311,120 allied staff.</span><br>
<span class="hostile">[range] 55,734 hostile Secret Agent attacked, killing 304,479 allied staff.</span><br>
<span class="hostile">[range] 5,761 hostile Assassin attacked, killing 6,368 allied staff.</span><br>
<span class="friendly">[range] 130,200 allied Iron Golem attacked, killing 62,621 hostile staff.</span><br>
<span class="friendly">[range] 762,957 allied Sorcerer attacked, killing 1,088,164 hostile staff.</span><br>
<span class="hostile">[range] 1,095,132 hostile Ninja attacked, killing 3,550,479 allied staff.</span><br>
<span class="hostile">[range] 186,328 hostile White Knight attacked, slaying 2,835,156 allied staff.</span><br>
<br>Died: <span class="hostile">40,856,546 friendlies dead.</span> <span class="friendly">1,150,785 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 13th Oct, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 12th Oct, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 48,696,362 employees to attack <a href="id_view.php?ID=1138" title="Quacker [1138]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,844,450,174<br>Range: 68%<br>Acres: 5,000<br>Rank: 47 [<span class='friendly'>+18</span>]">Quacker</a> [1138], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 12th Oct, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 12th Oct, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 28,199,639 employees to attack <a href="id_view.php?ID=1138" title="Quacker [1138]{}H/F Title: <span class='friendly'>Upstanding</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 1,844,450,174<br>Range: 68%<br>Acres: 5,000<br>Rank: 47 [<span class='friendly'>+18</span>]">Quacker</a> [1138], they are set to arrive in 5 ticks.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 11th Oct, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 11th Oct, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Thu 29th Sep, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 28th Sep, year 2. <span title="Night time">Early hours</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 28th Sep, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 28th Sep, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=3364" title="Lockdown [3364]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 16,041,777,622<br>Range: <span class='friendly'>595%</span> [-1 eta rush]<br>Acres: 18,243<br>Rank: 1 [<span class='hostile'>-28</span>]">Lockdown</a> [3364]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=3364" title="Lockdown [3364]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 16,041,777,622<br>Range: <span class='friendly'>595%</span> [-1 eta rush]<br>Acres: 18,243<br>Rank: 1 [<span class='hostile'>-28</span>]">Lockdown</a> [3364]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[range] 18,040,524 allied RPG Trooper attacked, killing 1 hostile staff.</span><br>
<br>Died: <span class="friendly">1 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 27th Sep, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 27th Sep, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 9,133,584 employees to attack <a href="id_view.php?ID=3364" title="Lockdown [3364]{}H/F Title: <span class='hostile'>Vile</span><br>Bounty: <span class='hostile'>49%</span><br>Current Score: 16,041,777,622<br>Range: <span class='friendly'>595%</span> [-1 eta rush]<br>Acres: 18,243<br>Rank: 1 [<span class='hostile'>-28</span>]">Lockdown</a> [3364], they are set to arrive in 3 ticks. Mob ETA was modified by -1 from: Adrenaline rush boost. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 27th Sep, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Tue 27th Sep, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 14,133,584 employees to attack <a href="id_view.php?ID=764" title="EvenPeopleInIsoDontWannaPlay [764]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 11,234,787,329<br>Range: <span class='friendly'>416%</span> [-1 eta rush]<br>Acres: 15,626<br>Rank: 4 [<span class='hostile'>-25</span>]">EvenPeopleInIsoDontWannaPlay</a> [764], they are set to arrive in 3 ticks. Mob ETA was modified by -1 from: Adrenaline rush boost. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 26th Sep, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Mon 26th Sep, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 25th Sep, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
Staff Recalled.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sun 25th Sep, year 2. <span title="Night time">Midnight</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=764" title="EvenPeopleInIsoDontWannaPlay [764]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 11,234,787,329<br>Range: <span class='friendly'>416%</span> [-1 eta rush]<br>Acres: 15,626<br>Rank: 4 [<span class='hostile'>-25</span>]">EvenPeopleInIsoDontWannaPlay</a> [764]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=764" title="EvenPeopleInIsoDontWannaPlay [764]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 11,234,787,329<br>Range: <span class='friendly'>416%</span> [-1 eta rush]<br>Acres: 15,626<br>Rank: 4 [<span class='hostile'>-25</span>]">EvenPeopleInIsoDontWannaPlay</a> [764]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="friendly">[range] 10,000,000 allied RPG Trooper attacked, killing 713,884 hostile staff.</span><br>
<br>Died: <span class="friendly">713,884 enemies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 24th Sep, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 24th Sep, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 24th Sep, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Sat 24th Sep, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Outgoing Hostiles</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
You sent 14,133,584 employees to attack <a href="id_view.php?ID=764" title="EvenPeopleInIsoDontWannaPlay [764]{}H/F Title: <span class='hostile'>Sinister</span><br>Bounty: <span class='hostile'>47%</span><br>Current Score: 11,234,787,329<br>Range: <span class='friendly'>416%</span> [-1 eta rush]<br>Acres: 15,626<br>Rank: 4 [<span class='hostile'>-25</span>]">EvenPeopleInIsoDontWannaPlay</a> [764], they are set to arrive in 3 ticks. Mob ETA was modified by -1 from: Adrenaline rush boost. </td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Fri 23rd Sep, year 2. <span title="Day time">Morning</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Unknown</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
We were unable to get any specific data on this news.</td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 21st Sep, year 2. <span title="Night time">Evening</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=9625" title="TegridyMilitary [9625]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 412,641,275<br>Range: <span class='hostile'>15%</span><br>Acres: 2,004<br>Rank: 161 [<span class='friendly'>+132</span>]">TegridyMilitary</a> [9625]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=9625" title="TegridyMilitary [9625]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 412,641,275<br>Range: <span class='hostile'>15%</span><br>Acres: 2,004<br>Rank: 161 [<span class='friendly'>+132</span>]">TegridyMilitary</a> [9625]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[close] 4,721,186 hostile Hippy attacked, distracting 4,309,113 allied staff.</span><br>
<span class="hostile">[close] 3,517,830 hostile Yob attacked, disabling 3,700,557 allied staff.</span><br>
<span class="hostile">[close] 168 hostile White Knight attacked, slaying 357 allied staff.</span><br>
<span class="friendly">[close] 35,874 allied Geo-Phys Thief stole 222 land. [0] tree. [222] bush. [0] flower. [0] grass. [0] uncultivated. </span><br>
<br>Distracted: <span class="hostile">4,309,113 friendlies distracted.</span> <br>Disabled: <span class="hostile">3,700,557 friendlies disabled.</span> <br>Died: <span class="hostile">357 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 21st Sep, year 2. <span title="Day time">Afternoon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=9625" title="TegridyMilitary [9625]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 412,641,275<br>Range: <span class='hostile'>15%</span><br>Acres: 2,004<br>Rank: 161 [<span class='friendly'>+132</span>]">TegridyMilitary</a> [9625]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=9625" title="TegridyMilitary [9625]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 412,641,275<br>Range: <span class='hostile'>15%</span><br>Acres: 2,004<br>Rank: 161 [<span class='friendly'>+132</span>]">TegridyMilitary</a> [9625]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[middle] 156 hostile White Knight attacked, slaying 2,113 allied staff.</span><br>
<br>Died: <span class="hostile">2,113 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
</tr>
<tr>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Wed 21st Sep, year 2. <span title="Day time">Noon</span></td>
<td class="lightheader" width="50%" valign="top" nowrap="" align="left">
Attacking <a href="id_view.php?ID=9625" title="TegridyMilitary [9625]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 412,641,275<br>Range: <span class='hostile'>15%</span><br>Acres: 2,004<br>Rank: 161 [<span class='friendly'>+132</span>]">TegridyMilitary</a> [9625]</td>
</tr>
<tr>
<td colspan="2" width="100%" align="left">
<table width="100%" border="0" align="center">
<tbody><tr>
<td class="header" align="center">
Battle Report - Attacking <a href="id_view.php?ID=9625" title="TegridyMilitary [9625]{}H/F Title: <span class='friendly'>Fair</span><br>Bounty: <span class='hostile'>5%</span><br>Current Score: 412,641,275<br>Range: <span class='hostile'>15%</span><br>Acres: 2,004<br>Rank: 161 [<span class='friendly'>+132</span>]">TegridyMilitary</a> [9625]
</td>
</tr>
<tr>
<td class="nonebackground fightreport" align="left">
<span class="hostile">[range] 145 hostile White Knight attacked, slaying 1,986 allied staff.</span><br>
<br>Died: <span class="hostile">1,986 friendlies dead.</span> </td>
</tr>
</tbody></table>
<br></td>
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
<input type="hidden" name="have_1" value="94">
£2,500
</td>
<td align="center">
94</td>
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
<input type="hidden" name="have_2" value="95">
£15,000
</td>
<td align="center">
95</td>
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
<input type="hidden" name="have_3" value="38">
£1,000,000
</td>
<td align="center">
38</td>
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
<input type="hidden" name="have_4" value="58">
£10,000,000
</td>
<td align="center">
58</td>
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
<div id="page-footer">Page Generation Time: 0.0276s<br>Page Load Time:<span id="endTime">0.775</span>s.
</div>
</div>
`;

    return ele;
}
