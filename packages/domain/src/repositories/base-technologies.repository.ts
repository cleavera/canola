import { ICache, IDomElement, IRequest } from '@actoolkit/core';

import { BaseTech } from '../classes/base-tech';
import { BaseTechnologies } from '../classes/base-technologies';
import { Funds } from '../classes/funds';
import { Ticks } from '../classes/ticks';
import { DevelopmentType } from '../constants/development-type.constant';
import { getCacheService } from '../helpers/get-cache-service.helper';
import { getRequestService } from '../helpers/get-request-service.helper';

export class BaseTechnologiesRepository {
    private static readonly TECH_TYPES: Array<DevelopmentType> = [
        DevelopmentType.RESEARCH,
        DevelopmentType.CONSTRUCTION,
        DevelopmentType.ALLIANCE
    ];

    private static readonly TECH_CACHE_KEY: symbol = Symbol('Base technologies cache key');

    private readonly _cache: ICache;

    constructor() {
        this._cache = getCacheService();
    }

    public async get(): Promise<BaseTechnologies> {
        if (!this._cache.has(BaseTechnologiesRepository.TECH_CACHE_KEY)) {
            this._cache.set(BaseTechnologiesRepository.TECH_CACHE_KEY, this._cachedGet(), 10000);
        }

        return this._cache.get(BaseTechnologiesRepository.TECH_CACHE_KEY);
    }

    private async _cachedGet(): Promise<BaseTechnologies> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/manual/techs.php');
        const mainPageElement: IDomElement = response.querySelector('#main-page-data') ?? this._throwNoTechInformationFound();
        const techTable: IDomElement = mainPageElement.querySelector('table') ?? this._throwNoTechInformationFound();

        return this._parseTechTable(techTable);
    }

    private _parseTechTable(table: IDomElement): BaseTechnologies {
        const rows: ArrayLike<IDomElement> = table.querySelectorAll('tr') ?? this._throwNoTechInformationFound();
        const techs: Array<BaseTech> = [];

        let typePointer: number = 0;

        for (let i = 6; i < rows.length; i += 3) {
            if ((rows[i].textContent?.trim() ?? '') === '') { // Handle the section dividers
                i++;
                typePointer++;

                continue;
            }

            techs.push(this._parseTechRow(rows[i], BaseTechnologiesRepository.TECH_TYPES[typePointer]));
        }

        return new BaseTechnologies(techs);
    }

    private _parseTechRow(row: IDomElement, type: DevelopmentType): BaseTech {
        const cells: ArrayLike<IDomElement> = row.querySelectorAll('td') ?? this._throwNoTechInformationFound();
        const name: string = cells[0].textContent ?? this._throwNoTechInformationFound();
        const timeString: string = cells[1].textContent ?? this._throwNoTechInformationFound();
        const costString: string = cells[2].textContent ?? this._throwNoTechInformationFound();

        return new BaseTech(name.trim(), Ticks.FromString(timeString), Funds.FromString(costString), type);
    }

    private _throwNoTechInformationFound(): never {
        throw new Error('No tech information found');
    }
}
