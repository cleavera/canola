import { CompanyName, CompanyNameRepository, CurrentPointInTimeRepository, NewsReport, NewsRepository, PointInTime, Ticks } from '@canola/domain';

import { OverlayComponentFactory, PositiveTextComponentFactory, throwIt } from '../../shared';

function getDifferenceDateTimeString(targetDateTime: Date): string {
    const currentDateTime: Date = new Date(Date.now());
    const isInFuture: boolean = currentDateTime.getTime() < targetDateTime.getTime();
    const difference: number = Math.abs(currentDateTime.getTime() - targetDateTime.getTime());

    const totalMinutes: number = Math.floor(difference / (1000 * 60));
    const totalHours: number = Math.floor(difference / (1000 * 60 * 60));
    const days: number = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours: number = totalHours - (days * 24);
    const minutes: number = totalMinutes - (totalHours * 60);

    let dateString: string = `${minutes.toLocaleString()} minutes`;

    if (hours > 0 || days > 0) {
        dateString = `${hours.toLocaleString()} hours ${dateString}`;
    }

    if (days > 0) {
        dateString = `${days.toLocaleString()} days ${dateString}`;
    }

    if (isInFuture) {
        return `In ${dateString}`;
    }

    return `${dateString} ago`;
}

function getAbsoluteDateTimeString(targetDateTime: Date): string {
    return `${targetDateTime.toLocaleDateString()} ${targetDateTime.toLocaleTimeString()}`;
}

export async function ticksSinceFeature(): Promise<void> {
    const mainPageElement: HTMLElement = document.getElementById('main-page-data') ?? throwIt('No news information found');
    const newsRows: ArrayLike<HTMLElement> = mainPageElement.querySelectorAll('table:nth-of-type(2) > tbody > tr') ?? throwIt('No news information found');
    const currentPointInTime: PointInTime = await new CurrentPointInTimeRepository().get();
    const newsRepository: NewsRepository = new NewsRepository();
    const currentCompany: CompanyName = await new CompanyNameRepository().getOwn();

    for (let x = 2; x < newsRows.length - 2; x += 2) {
        const report: NewsReport = newsRepository.parseNewsReport(currentCompany, newsRows[x], newsRows[x + 1], currentPointInTime);
        const tickDifference: Ticks = PointInTime.Subtract(currentPointInTime, report.time);
        const dateTime: Date = PointInTime.ToDateTime(report.time, currentPointInTime);
        const timeOfDayCell: ChildNode = newsRows[x].firstElementChild ?? throwIt('Invalid date cell');
        let output: string = `${tickDifference.ticks.toLocaleString('en')} ticks ago.`;

        if (tickDifference.ticks === 0) {
            output = 'This tick.';
        } else if (tickDifference.ticks === 1) {
            output = 'Last tick.';
        }

        timeOfDayCell.appendChild(PositiveTextComponentFactory(output));
        timeOfDayCell.appendChild(OverlayComponentFactory('Time since', `
            <div>${getDifferenceDateTimeString(dateTime)}</div>
            <div>${getAbsoluteDateTimeString(dateTime)}</div>
        `));
    }
}
