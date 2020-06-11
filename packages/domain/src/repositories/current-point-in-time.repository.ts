import { IDomElement, IRequest } from '@canola/core';

import { PointInTime } from '../classes/point-in-time';
import { getRequestService } from '../helpers/get-request-service.helper';

export class CurrentPointInTimeRepository {
    public async get(): Promise<PointInTime> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/overview.php');
        const companyElement: IDomElement = response.querySelector('#game-info-game-date') ?? this._throwNoDateString();

        return PointInTime.FromDateString(companyElement.textContent ?? this._throwNoDateString());
    }

    private _throwNoDateString(): never {
        throw new Error('Could not find date string on overview');
    }
}
