import { IDomElement } from '@actoolkit/core';

import { NewsReport } from '../classes/news-report';
import { PointInTime } from '../classes/point-in-time';

export class NewsRepository {
    public parseNewsReport(headerRow: IDomElement, _contentRow: IDomElement): NewsReport {
        const timeOfDayElement: IDomElement = headerRow.querySelector('td:first-child > span') ?? this._throwInvalidPointInTime();
        const pointInTime: PointInTime = PointInTime.FromDateString(timeOfDayElement.textContent ?? this._throwInvalidPointInTime());

        return new NewsReport(pointInTime, null);
    }

    private _throwNoNewsInformationFound(): never {
        throw new Error('No news information found');
    }

    private _throwInvalidPointInTime(): never {
        throw new Error('Invalid point in time');
    }
}
