import { IDomElement, IRequest } from '@canola/core';

import { Injuries } from '../classes/injuries';
import { Injury } from '../classes/injury';
import { Staff } from '../classes/staff';
import { Ticks } from '../classes/ticks';
import { UnitStats } from '../classes/unit-stats';
import { Units } from '../classes/units';
import { getRequestService } from '../helpers/get-request-service.helper';
import { UnitsRepository } from './units.repository';

export class InjuriesRepository {
    private static readonly PARSE_COUNT_REGEX: RegExp = /\[([0-9,]+)]/;
    private readonly _unitsRepository: UnitsRepository;
    private _units: Units | null;

    constructor() {
        this._unitsRepository = new UnitsRepository();
        this._units = null;
    }

    public async getOwn(): Promise<Injuries | null> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/overview.php');
        const injuriesElement: IDomElement | null = response.querySelector('#Injuries');

        if (injuriesElement === null) {
            return null;
        }

        return new Injuries(await this._parseInjuriesTable(injuriesElement));
    }

    private async _parseInjuriesTable(injuriesTable: IDomElement): Promise<Array<Injury>> {
        const cells: ArrayLike<IDomElement> = injuriesTable.querySelectorAll('td');
        const injuries: Array<Promise<Injury>> = [];

        // Skip the headers by starting on the 6th cell, skip the last cell if its just a placeholder cell
        for (let x = 6; x < cells.length - 2; x += 3) {
            injuries.push(this._parseInjuryRow(cells[x], cells[x + 1], cells[x + 2]));
        }

        return Promise.all(injuries);
    }

    private async _parseInjuryRow(nameCell: IDomElement, countCell: IDomElement, etaCell: IDomElement): Promise<Injury> {
        const name: string = (nameCell.textContent ?? this._throwNoStaffName()).trim();
        const [, countString]: RegExpExecArray = InjuriesRepository.PARSE_COUNT_REGEX.exec((countCell.textContent ?? this._throwNoInjuryCount(name))) ?? this._throwNoInjuryCount(name);
        const count: number = parseInt(countString.replace(/,/g, ''), 10);
        const unit: UnitStats = await this._getStaffStats(name);

        return new Injury(new Staff(name, count, unit), Ticks.FromString(etaCell.textContent ?? this._throwNoEta(name)));
    }

    private async _getStaffStats(name: string): Promise<UnitStats> {
        if (this._units === null) {
            this._units = await this._unitsRepository.get();
        }

        return this._units.getByName(name) ?? this._throwNotValidStaff(name);
    }

    private _throwNoStaffName(): never {
        throw new Error('Could not get staff name');
    }

    private _throwNotValidStaff(staffName: string): never {
        throw new Error(`Could not get staff details for staff with name ${staffName}`);
    }

    private _throwNoInjuryCount(name: string): never {
        throw new Error(`Could not get count of injured staff: ${name}`);
    }

    private _throwNoEta(name: string): never {
        throw new Error(`Could not get eta of injured staff: ${name}`);
    }
}
