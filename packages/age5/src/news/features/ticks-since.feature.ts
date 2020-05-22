import { CurrentPointInTimeRepository, NewsRepository, NewsReport, PointInTime, Ticks } from '@actoolkit/domain';

import { PositiveTextComponentFactory, throwIt } from '../../shared';

export async function ticksSinceFeature(): Promise<void> {
    const mainPageElement: HTMLElement = document.getElementById('main-page-data') ?? throwIt('No news information found');
    const newsRows: ArrayLike<HTMLElement> = mainPageElement.querySelectorAll('table:nth-of-type(2) > tbody > tr') ?? throwIt('No news information found');
    const currentPointInTime: PointInTime = await new CurrentPointInTimeRepository().get();
    const newsRepository: NewsRepository = await new NewsRepository();

    for (let x = 2; x < newsRows.length; x += 2) {
        const report: NewsReport = newsRepository.parseNewsReport(newsRows[x], newsRows[x + 1]);
        const tickDifference: Ticks = PointInTime.Subtract(currentPointInTime, report.time);
        const timeOfDayCell: ChildNode = newsRows[x].firstElementChild ?? throwIt('Invalid date cell');
        let output: string = `${tickDifference.ticks.toLocaleString('en')} ticks ago.`;

        if (tickDifference.ticks === 0) {
            output = 'This tick.';
        } else if (tickDifference.ticks === 1) {
            output = 'Last tick.';
        }

        timeOfDayCell.appendChild(PositiveTextComponentFactory(output));
    }
}
