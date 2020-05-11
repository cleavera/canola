import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';

import { Plants } from '../classes/plants';
import { Seeds } from '../classes/seeds';
import { Stocks } from '../classes/stocks';

export class StocksRepository {
    public async get(): Promise<Stocks> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const landPlantsTableElement: IDomElement = response.querySelector('#LandPlants') ?? this._throwNoStockInformationFound();
        const [, tree, bush, flower, grass]: Array<IDomElement> = Array.from(landPlantsTableElement.querySelectorAll('tr'));

        const seeds: Seeds = new Seeds(
            this._getSeedsForRow(tree),
            this._getSeedsForRow(bush),
            this._getSeedsForRow(flower),
            this._getSeedsForRow(grass)
        );

        const plants: Plants = new Plants(
            this._getPlantsForRow(tree),
            this._getPlantsForRow(bush),
            this._getPlantsForRow(flower),
            this._getPlantsForRow(grass)
        );

        return new Stocks(seeds, plants);
    }

    private _getSeedsForRow(row: IDomElement): number {
        const cells: ArrayLike<IDomElement> = row.querySelectorAll('td');

        return this._parseValue(cells[4]);
    }

    private _getPlantsForRow(row: IDomElement): number {
        const cells: ArrayLike<IDomElement> = row.querySelectorAll('td');

        return this._parseValue(cells[3]);
    }

    private _parseValue(cell: IDomElement): number {
        const text: string = cell.textContent ?? this._throwNoStockInformationFound();
        const match: RegExpExecArray = (/\[([0-9,]+) (?:seeds|plants) in stock]/).exec(text) ?? this._throwNoStockInformationFound();

        return parseInt(match[1].replace(/,/g, ''), 10);
    }

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwNoStockInformationFound(): never {
        throw new Error('Could not find stock information');
    }
}
