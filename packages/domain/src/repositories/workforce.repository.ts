import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { Staff } from '../classes/staff';
import { UnitStats } from '../classes/unit-stats';
import { Units } from '../classes/units';
import { Workforce } from '../classes/workforce';
import { UnitsRepository } from './units.repository';

export class WorkforceRepository {
    private readonly _unitsRepository: UnitsRepository;
    private _units: Maybe<Units>;

    constructor() {
        this._unitsRepository = new UnitsRepository();
        this._units = null;
    }

    public async getOwn(): Promise<Workforce> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/military.php');
        const mainPageElement: IDomElement = response.querySelector('#main-page-data') ?? this._throwNoStaffFound();
        const workforceTable: IDomElement = mainPageElement.querySelector('form table') ?? this._throwNoStaffFound();

        return this._parseWorkforceTable(workforceTable);
    }

    private async _parseWorkforceTable(workforceTable: IDomElement): Promise<Workforce> {
        const rows: ArrayLike<IDomElement> = workforceTable.querySelectorAll('tr');
        const staffPromises: Array<Promise<Staff>> = [];

        for (let x = 2; x < rows.length - 4; x++) {
            staffPromises.push(this._parseStaffRow(rows[x]));
        }

        const staff: Array<Staff> = await Promise.all(staffPromises);

        return new Workforce(staff);
    }

    private async _parseStaffRow(staffRow: IDomElement): Promise<Staff> {
        const [nameCell, , countCell]: Array<IDomElement> = Array.from(staffRow.querySelectorAll('td'));
        const name: string = (nameCell.textContent ?? this._throwNoStaffName()).replace(/\[[A-z]+]/g, '').trim();
        const count: number = parseInt((countCell.textContent ?? this._throwNoStaffCount(name)).replace(/,/g, ''), 10);
        const unit: UnitStats = await this._getStaffStats(name);

        return new Staff(name, count, unit);
    }

    private async _getStaffStats(name: string): Promise<UnitStats> {
        if (isNull(this._units)) {
            this._units = await this._unitsRepository.get();
        }

        return this._units.getByName(name) ?? this._throwNotValidStaff(name);
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoStaffName(): never {
        throw new Error('Could not get staff name');
    }

    private _throwNoStaffCount(name: string): never {
        throw new Error(`Could not get staff count for ${name}`);
    }

    private _throwNotValidStaff(staffName: string): never {
        throw new Error(`Could not get staff details for staff with name ${staffName}`);
    }

    private _throwNoStaffFound(): never {
        throw new Error('Could not get workforce');
    }
}
