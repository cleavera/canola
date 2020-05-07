import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

import { Weather } from '../classes/weather';

export class WeatherRepository {
    public async get(): Promise<Weather> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const weatherIconElement: IDomElement = response.querySelector('#live-weather img') ?? this._throwNoWeather();

        return new Weather(weatherIconElement.getAttribute('alt') ?? this._throwNoWeather());
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoWeather(): never {
        throw new Error('Could not find date string on overview');
    }
}
