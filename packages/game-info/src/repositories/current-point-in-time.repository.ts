import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

import { PointInTime } from '../classes/point-in-time';

export class CurrentPointInTimeRepository {
    public async get(): Promise<PointInTime> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const companyElement: IDomElement = response.querySelector('#game-info-game-date') ?? this._throwNoDateString();

        return PointInTime.FromDateString(companyElement.textContent ?? this._throwNoDateString());
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoDateString(): never {
        throw new Error('Could not find date string on overview');
    }
}
