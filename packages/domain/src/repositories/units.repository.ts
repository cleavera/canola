import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

import { Funds } from '../classes/funds';
import { UnitStats } from '../classes/unit-stats';
import { Units } from '../classes/units';

export class UnitsRepository {
    public async get(): Promise<Units> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/manual/units.php');
        const mainPageElement: IDomElement = response.querySelector('#main-page-data') ?? this._throwNoUnitStatsFound();
        const unitTable: IDomElement = mainPageElement.querySelector('td table') ?? this._throwNoUnitStatsFound();

        return this._parseUnitTable(unitTable);
    }

    private _parseUnitTable(table: IDomElement): Units {
        const rows: ArrayLike<IDomElement> = table.querySelectorAll('tr') ?? this._throwNoUnitStatsFound();
        const units: Array<UnitStats> = [];

        for (let i = 2; i < rows.length; i++) {
            units.push(this._parseUnitRow(rows[i]));
        }

        return new Units(units);
    }

    private _parseUnitRow(row: IDomElement): UnitStats {
        const cells: ArrayLike<IDomElement> = row.querySelectorAll('td') ?? this._throwNoUnitStatsFound();
        const name: IDomElement = cells[0].querySelector('a') ?? this._throwNoUnitStatsFound();

        return new UnitStats(name.textContent ?? this._throwNoUnitStatsFound(), Funds.FromString(cells[9].textContent ?? this._throwNoUnitStatsFound()));
    }

    private _throwNoUnitStatsFound(): never {
        throw new Error('No unit stats found');
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }
}
