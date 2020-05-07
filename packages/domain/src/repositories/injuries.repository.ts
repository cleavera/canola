import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { Injury } from '../classes/injury';
import { Staff } from '../classes/staff';
import { Ticks } from '../classes/ticks';

export class InjuriesRepository {
    private static readonly PARSE_COUNT_REGEX: RegExp = /\[([0-9,]+)]/;

    public async get(): Promise<Maybe<Array<Injury>>> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const injuriesElement: Maybe<IDomElement> = response.querySelector('#Injuries');

        if (isNull(injuriesElement)) {
            return null;
        }

        return this._parseInjuriesTable(injuriesElement);
    }

    private _parseInjuriesTable(injuriesTable: IDomElement): Array<Injury> {
        const cells: ArrayLike<IDomElement> = injuriesTable.querySelectorAll('td');
        const injuries: Array<Injury> = [];

        // Skip the headers by starting on the 6th cell, skip the last cell if its just a placeholder cell
        for (let x = 6; x < cells.length - 2; x += 3) {
            injuries.push(this._parseInjuryRow(cells[x], cells[x + 1], cells[x + 2]));
        }

        return injuries;
    }

    private _parseInjuryRow(nameCell: IDomElement, countCell: IDomElement, etaCell: IDomElement): Injury {
        const name: string = (nameCell.textContent ?? this._throwNoStaffName()).trim();
        const [, countString]: RegExpExecArray = InjuriesRepository.PARSE_COUNT_REGEX.exec((countCell.textContent ?? this._throwNoInjuryCount(name))) ?? this._throwNoInjuryCount(name);
        const count: number = parseInt(countString.replace(/,/g, ''), 10);

        return new Injury(new Staff(name, count), Ticks.FromString(etaCell.textContent ?? this._throwNoEta(name)));
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoStaffName(): never {
        throw new Error('Could not get staff name');
    }

    private _throwNoInjuryCount(name: string): never {
        throw new Error(`Could not get count of injured staff: ${name}`);
    }

    private _throwNoEta(name: string): never {
        throw new Error(`Could not get eta of injured staff: ${name}`);
    }
}
