import { IDomElement, IRequest } from '@canola/core';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { BaseTech } from '../classes/base-tech';
import { BaseTechnologies } from '../classes/base-technologies';
import { Development } from '../classes/development';
import { Funds } from '../classes/funds';
import { Tech } from '../classes/tech';
import { Ticks } from '../classes/ticks';
import { getRequestService } from '../helpers/get-request-service.helper';
import { BaseTechnologiesRepository } from './base-technologies.repository';

export class TechRepository {
    private static readonly PROGRESS_REGEX: RegExp = / complete, ETA ([0-9,]+)\./;

    private readonly _techsRepository: BaseTechnologiesRepository;
    private _techs: Maybe<BaseTechnologies>;

    constructor() {
        this._techsRepository = new BaseTechnologiesRepository();
        this._techs = null;
    }

    public async getOwn(): Promise<Tech> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/development.php');
        const mainPageElement: IDomElement = response.querySelector('#main-page-data') ?? this._throwNoDevelopmentInformationFound();
        const developmentTable: IDomElement = mainPageElement.querySelector('table') ?? this._throwNoDevelopmentInformationFound();

        return this._parseDevelopmentsTable(developmentTable);
    }

    private async _parseDevelopmentsTable(developmentTable: IDomElement): Promise<Tech> {
        const rows: ArrayLike<IDomElement> = developmentTable.querySelectorAll('tr');
        const developments: Array<Development> = [];

        for (let x = 2; x < rows.length; x += 2) {
            const cells: ArrayLike<IDomElement> = rows[x].querySelectorAll('td');

            if (cells.length === 1) {
                continue;
            }

            const name: string = (cells[0].textContent ?? this._throwInvalidDevelopmentName()).trim();
            const ticks: Ticks = Ticks.FromString(cells[1].textContent ?? this._throwInvalidDevelopment(name));
            const base: BaseTech = await this._getBaseTech(name);

            developments.push(new Development(
                name,
                ticks,
                Funds.FromString(cells[3].textContent ?? this._throwInvalidDevelopment(name)),
                base,
                this._getProgress(cells[4].textContent ?? this._throwInvalidDevelopment(name), ticks)
            ));
        }

        return new Tech(developments);
    }

    private _getProgress(progressString: string, totalTicks: Ticks): Maybe<Ticks> {
        if (progressString.trim() === 'Complete') {
            return totalTicks;
        }

        const match: Maybe<RegExpExecArray> = TechRepository.PROGRESS_REGEX.exec(progressString);

        if (isNull(match)) {
            return null;
        }

        const remaining: Ticks = Ticks.FromString(match[1]);

        return Ticks.Subtract(totalTicks, remaining);
    }

    private async _getBaseTech(name: string): Promise<BaseTech> {
        if (isNull(this._techs)) {
            this._techs = await this._techsRepository.get();
        }

        return this._techs.getByName(name) ?? this._throwNotValidTech(name);
    }

    private _throwNoDevelopmentInformationFound(): never {
        throw new Error('Could not find funds information');
    }

    private _throwInvalidDevelopment(name: string): never {
        throw new Error(`Could not parse development named ${name}`);
    }

    private _throwNotValidTech(techName: string): never {
        throw new Error(`Could not get tech details for staff with name ${techName}`);
    }

    private _throwInvalidDevelopmentName(): never {
        throw new Error('Could not parse development name');
    }
}
