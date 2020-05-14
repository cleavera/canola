import { IDomElement, IRequest } from '@actoolkit/core';

import { Weather } from '../classes/weather';
import { getRequestService } from '../helpers/get-request-service.helper';

export class WeatherRepository {
    public async get(): Promise<Weather> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/overview.php');
        const weatherIconElement: IDomElement = response.querySelector('#live-weather img') ?? this._throwNoWeather();

        return new Weather(weatherIconElement.getAttribute('alt') ?? this._throwNoWeather());
    }

    private _throwNoWeather(): never {
        throw new Error('Could not find date string on overview');
    }
}
