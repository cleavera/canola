import { IDomElement, IRequest } from '@actoolkit/core';

import { Acres } from '../classes/acres';
import { Land } from '../classes/land';
import { Plants } from '../classes/plants';
import { getRequestService } from '../helpers/get-request-service.helper';

export class LandRepository {
    public async getOwn(): Promise<Land> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/overview.php');
        const landPlantsTableElement: IDomElement = response.querySelector('#LandPlants') ?? this._throwNoLandInformationFound();
        const [, tree, bush, flower, grass, uncultivated]: Array<IDomElement> = Array.from(landPlantsTableElement.querySelectorAll('tr'));

        const acres: Acres = new Acres(
            this._getLandForRow(tree),
            this._getLandForRow(bush),
            this._getLandForRow(flower),
            this._getLandForRow(grass),
            this._getLandForRow(uncultivated)
        );

        const plants: Plants = new Plants(
            this._getPlantsForRow(tree),
            this._getPlantsForRow(bush),
            this._getPlantsForRow(flower),
            this._getPlantsForRow(grass)
        );

        return new Land(acres, plants);
    }

    private _getLandForRow(row: IDomElement): number {
        const cells: ArrayLike<IDomElement> = row.querySelectorAll('td');

        return this._parseValue(cells[1]);
    }

    private _getPlantsForRow(row: IDomElement): number {
        const cells: ArrayLike<IDomElement> = row.querySelectorAll('td');

        return this._parseValue(cells[2]);
    }

    private _parseValue(cell: IDomElement): number {
        const text: string = cell.textContent ?? this._throwNoLandInformationFound();
        const match: RegExpExecArray = (/\[([0-9,]+) (?:acres|planted)]/).exec(text) ?? this._throwNoLandInformationFound();

        return parseInt(match[1].replace(/,/g, ''), 10);
    }

    private _throwNoLandInformationFound(): never {
        throw new Error('Could not find land information');
    }
}
