import { IDomElement, IRequest } from '@actoolkit/core';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';
import { CropType } from '..';

import { Plants } from '../classes/plants';
import { Seeds } from '../classes/seeds';
import { Stocks } from '../classes/stocks';
import { getRequestService } from '../helpers/get-request-service.helper';
import { ICropTypeMap } from '../interfaces/crop-type-map.interface';

export class StocksRepository {
    private static readonly PLANTING_SEEDS_REGEXP: ICropTypeMap<RegExp> = {
        [CropType.TREE]: /([0-9,]+) Tree Plants/,
        [CropType.BUSH]: /([0-9,]+) Bush Plants/,
        [CropType.FLOWER]: /([0-9,]+) Flower Plants/,
        [CropType.GRASS]: /([0-9,]+) Grass Plants/
    };

    private static readonly GROWING_SEEDS_REGEXP: ICropTypeMap<RegExp> = {
        [CropType.TREE]: /([0-9,]+) Tree Seeds/,
        [CropType.BUSH]: /([0-9,]+) Bush Seeds/,
        [CropType.FLOWER]: /([0-9,]+) Flower Seeds/,
        [CropType.GRASS]: /([0-9,]+) Grass Seeds/
    };

    public async getOwn(): Promise<Stocks> {
        const request: IRequest = getRequestService();
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

    public async getOwnProcessingStocks(): Promise<Stocks> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/maintenance.php');
        const plantingRow: IDomElement = response.querySelector('#main-page-data form > table tr:nth-child(25)');
        const growingRow: IDomElement = response.querySelector('#main-page-data form > table tr:nth-child(26)');

        return new Stocks(this._parseGrowingRow(growingRow), this._parsePlantingRow(plantingRow));
    }

    private _parseGrowingRow(growingRow: IDomElement): Seeds {
        const growingString: string = growingRow.textContent ?? this._throwPlantingRowIsNotATextElement();

        return new Seeds(
            this._getProcessingForType(growingString, StocksRepository.GROWING_SEEDS_REGEXP[CropType.TREE]),
            this._getProcessingForType(growingString, StocksRepository.GROWING_SEEDS_REGEXP[CropType.BUSH]),
            this._getProcessingForType(growingString, StocksRepository.GROWING_SEEDS_REGEXP[CropType.FLOWER]),
            this._getProcessingForType(growingString, StocksRepository.GROWING_SEEDS_REGEXP[CropType.GRASS])
        );
    }

    private _parsePlantingRow(plantingRow: IDomElement): Plants {
        const plantingString: string = plantingRow.textContent ?? this._throwPlantingRowIsNotATextElement();

        return new Plants(
            this._getProcessingForType(plantingString, StocksRepository.PLANTING_SEEDS_REGEXP[CropType.TREE]),
            this._getProcessingForType(plantingString, StocksRepository.PLANTING_SEEDS_REGEXP[CropType.BUSH]),
            this._getProcessingForType(plantingString, StocksRepository.PLANTING_SEEDS_REGEXP[CropType.FLOWER]),
            this._getProcessingForType(plantingString, StocksRepository.PLANTING_SEEDS_REGEXP[CropType.GRASS])
        );
    }

    private _getProcessingForType(processingString: string, regexp: RegExp): number {
        const match: Maybe<RegExpExecArray> = regexp.exec(processingString);

        if (isNull(match) || isNull(match[1] ?? null)) {
            return 0;
        }

        return this._parseValue(match[0]);
    }

    private _getSeedsForRow(row: IDomElement): number {
        const cells: ArrayLike<IDomElement> = row.querySelectorAll('td');

        return this._parseCellValue(cells[4]);
    }

    private _getPlantsForRow(row: IDomElement): number {
        const cells: ArrayLike<IDomElement> = row.querySelectorAll('td');

        return this._parseCellValue(cells[3]);
    }

    private _parseCellValue(cell: IDomElement): number {
        const text: string = cell.textContent ?? this._throwNoStockInformationFound();
        const match: RegExpExecArray = (/\[([0-9,]+) (?:seeds|plants) in stock]/).exec(text) ?? this._throwNoStockInformationFound();

        return this._parseValue(match[1]);
    }

    private _parseValue(value: string): number {
        return parseInt(value.replace(/,/g, ''), 10);
    }

    private _throwPlantingRowIsNotATextElement(): never {
        throw new Error('Could not read the text content of the planting row');
    }

    private _throwNoStockInformationFound(): never {
        throw new Error('Could not find stock information');
    }
}
