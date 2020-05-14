import { CurrentPointInTimeRepository, PointInTime, Ticks } from '@actoolkit/domain';
import { PositiveTextComponentFactory, throwIt } from '../../shared';

export async function ticksSinceFeature(): Promise<void> {
    const mainPageElement: HTMLElement = document.getElementById('main-page-data') ?? throwIt('No news information found');
    const newReportsTable: HTMLElement = mainPageElement.querySelector('table:nth-of-type(2)') ?? throwIt('No news information found');
    const newsHeaderRows: Array<HTMLTableRowElement> = Array.from(newReportsTable.querySelectorAll('tr + tr:nth-child(odd)')); // The headers are the odd rows, skip the first row
    const currentPointInTime: PointInTime = await new CurrentPointInTimeRepository().get();

    for (const row of newsHeaderRows) {
        const timeOfDayElement: HTMLElement = row.querySelector('td:first-child > span') ?? throwIt('Invalid date row');
        const pointInTime: PointInTime = PointInTime.FromDateString(timeOfDayElement.textContent ?? throwIt('Invalid date cell'));
        const tickDifference: Ticks = PointInTime.Subtract(currentPointInTime, pointInTime);
        const timeOfDayCell: HTMLElement = timeOfDayElement.parentElement ?? throwIt('Invalid date cell');

        timeOfDayCell.appendChild(PositiveTextComponentFactory(`${tickDifference.ticks.toLocaleString('en')} ticks ago.`));
    }
}
