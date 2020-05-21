import { IDomElement } from '@actoolkit/core';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { Staff } from '../classes/staff';
import { UnitStats } from '../classes/unit-stats';
import { Units } from '../classes/units';
import { Workforce } from '../classes/workforce';
import { UnitsRepository } from './units.repository';

export class IntelRepository {
    private readonly _unitsRepository: UnitsRepository;
    private _units: Maybe<Units>;

    constructor() {
        this._unitsRepository = new UnitsRepository();
        this._units = null;
    }

    public async parseHackReport(hackReportTable: IDomElement): Promise<Workforce> {
        const staff: Array<Promise<Staff>> = [];

        const rows: ArrayLike<IDomElement> = hackReportTable.querySelectorAll('tr');

        for (let x = 2; x < rows.length; x++) {
            const cells: ArrayLike<IDomElement> = rows[x].querySelectorAll('td');

            for (let y = 0; y < cells.length - 1; y += 2) { // Skip last cell if there is an odd number of cells
                staff.push(this._getStaff(cells[y], cells[y + 1]));
            }
        }

        return new Workforce(await Promise.all(staff));
    }

    private async _getStaff(nameCell: IDomElement, countCell: IDomElement): Promise<Staff> {
        const name: string = (nameCell.textContent ?? this.throwNotValidIntelPage()).trim();
        const countString: string = countCell.textContent ?? this.throwNotValidStaffCount(name);
        const count: number = parseInt(countString.replace(/[,[\]]/g, ''), 10);
        const staffStats: UnitStats = await this._getStaffStats(name);

        return new Staff(name, count, staffStats);
    }

    private async _getStaffStats(name: string): Promise<UnitStats> {
        if (isNull(this._units)) {
            this._units = await this._unitsRepository.get();
        }

        return this._units.getByName(name) ?? this._throwNotValidStaff(name);
    }

    private throwNotValidIntelPage(): never {
        throw new Error('Not a valid intel page');
    }

    private _throwNotValidStaff(staffName: string): never {
        throw new Error(`Not valid staff '${staffName}'`);
    }

    private throwNotValidStaffCount(staffName: string): never {
        throw new Error(`Could not parse count for staff '${staffName}'`);
    }
}
