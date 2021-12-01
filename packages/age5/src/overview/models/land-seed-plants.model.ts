import { CropType } from '@canola/domain';

import { throwIt } from '../../shared';

export class LandSeedPlantsModel {
    private readonly _table: HTMLElement;

    constructor(table: HTMLElement) {
        this._table = table;
    }

    public getLand(type: CropType | null = null): HTMLTableCellElement {
        const row: HTMLTableRowElement = this._getRow(type);

        return row.querySelectorAll('td')[1];
    }

    public getPlants(type: CropType | null = null): HTMLTableCellElement {
        const row: HTMLTableRowElement = this._getRow(type);

        return row.querySelectorAll('td')[3];
    }

    public getSeeds(type: CropType | null = null): HTMLTableCellElement {
        const row: HTMLTableRowElement = this._getRow(type);

        return row.querySelectorAll('td')[4];
    }

    private _getRow(type: CropType | null): HTMLTableRowElement {
        const rows: ArrayLike<HTMLTableRowElement> = this._table.querySelectorAll('tr');

        if (type === null) {
            return rows[0];
        }

        throw new Error('Not implemented yet');
    }

    public static ForCurrentPage(): LandSeedPlantsModel {
        const landPlantsTable: HTMLElement = document.getElementById('LandPlants') ?? throwIt('Could not find land plants table');

        return new LandSeedPlantsModel(landPlantsTable);
    }
}
