import { CropType } from '@actoolkit/domain';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { throwIt } from '../../shared';

export class LandSeedPlantsModel {
    private readonly _table: HTMLElement;

    constructor(table: HTMLElement) {
        this._table = table;
    }

    public getLand(type: Maybe<CropType> = null): HTMLTableCellElement {
        const row: HTMLTableRowElement = this._getRow(type);

        return row.querySelectorAll('td')[1];
    }

    public getPlants(type: Maybe<CropType> = null): HTMLTableCellElement {
        const row: HTMLTableRowElement = this._getRow(type);

        return row.querySelectorAll('td')[3];
    }

    public getSeeds(type: Maybe<CropType> = null): HTMLTableCellElement {
        const row: HTMLTableRowElement = this._getRow(type);

        return row.querySelectorAll('td')[4];
    }

    private _getRow(type: Maybe<CropType>): HTMLTableRowElement {
        const rows: ArrayLike<HTMLTableRowElement> = this._table.querySelectorAll('tr');

        if (isNull(type)) {
            return rows[0];
        }

        throw new Error('Not implemented yet');
    }

    public static ForCurrentPage(): LandSeedPlantsModel {
        const landPlantsTable: HTMLElement = document.getElementById('LandPlants') ?? throwIt('Could not find land plants table');

        return new LandSeedPlantsModel(landPlantsTable);
    }
}
