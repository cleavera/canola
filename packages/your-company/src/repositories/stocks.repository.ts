import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';
import { Crop } from '../classes/crop';
import { Stocks } from '../classes/stocks';

export class StocksRepository {
    public async get(): Promise<Stocks> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const landPlantsTableElement: IDomElement = response.querySelector('#LandPlants') ?? this._throwNoStockInformationFound();
        const rows: ArrayLike<IDomElement> = landPlantsTableElement.querySelectorAll('tr');
        const tree: Crop = this._parseRow(rows[1]);
        const bush: Crop = this._parseRow(rows[2]);
        const flower: Crop = this._parseRow(rows[3]);
        const grass: Crop = this._parseRow(rows[4]);

        return new Stocks(tree, bush, flower, grass);
    }

    private _parseRow(row: IDomElement): Crop {
        const cells: ArrayLike<IDomElement> = row.querySelectorAll('td');

        return new Crop(this._parseValue(cells[3]), this._parseValue(cells[4]));
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
