import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

import { Acres } from '../classes/acres';
import { Land } from '../classes/land';

export class LandRepository {
    public async get(): Promise<Land> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const landPlantsTableElement: IDomElement = response.querySelector('#LandPlants') ?? this._throwNoLandInformationFound();
        const rows: ArrayLike<IDomElement> = landPlantsTableElement.querySelectorAll('tr');
        const tree: Acres = this._parseRow(rows[1]);
        const bush: Acres = this._parseRow(rows[2]);
        const flower: Acres = this._parseRow(rows[3]);
        const grass: Acres = this._parseRow(rows[4]);
        const uncultivated: number = this._getUncultivated(rows[5]);

        return new Land(tree, bush, flower, grass, uncultivated);
    }

    private _getUncultivated(row: IDomElement): number {
        const cells: ArrayLike<IDomElement> = row.querySelectorAll('td');

        return this._parseValue(cells[1]);
    }

    private _parseRow(row: IDomElement): Acres {
        const cells: ArrayLike<IDomElement> = row.querySelectorAll('td');

        return new Acres(this._parseValue(cells[1]), this._parseValue(cells[2]));
    }

    private _parseValue(cell: IDomElement): number {
        const text: string = cell.textContent ?? this._throwNoLandInformationFound();
        const match: RegExpExecArray = (/\[([0-9,]+) (?:acres|planted)]/).exec(text) ?? this._throwNoLandInformationFound();

        return parseInt(match[1].replace(/,/g, ''), 10);
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoLandInformationFound(): never {
        throw new Error('Could not find land information');
    }
}
