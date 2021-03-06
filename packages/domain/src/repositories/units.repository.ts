import { ICache, IDomElement, IRequest } from '@canola/core';

import { Funds } from '../classes/funds';
import { UnitAction } from '../classes/unit-action';
import { UnitStats } from '../classes/unit-stats';
import { Units } from '../classes/units';
import { ActionType } from '../constants/action-type.constant';
import { getCacheService } from '../helpers/get-cache-service.helper';
import { getRequestService } from '../helpers/get-request-service.helper';

export class UnitsRepository {
    private static readonly UNITS_CACHE_KEY: symbol = Symbol('Base technologies cache key');

    private readonly _cache: ICache;

    constructor() {
        this._cache = getCacheService();
    }

    public async get(): Promise<Units> {
        if (!this._cache.has(UnitsRepository.UNITS_CACHE_KEY)) {
            this._cache.set(UnitsRepository.UNITS_CACHE_KEY, this._cachedGet(), 10000);
        }

        return this._cache.get(UnitsRepository.UNITS_CACHE_KEY);
    }

    private async _cachedGet(): Promise<Units> {
        const request: IRequest = getRequestService();
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

        units.push(UnitStats.HamsterFromHell());

        return new Units(units);
    }

    private _parseUnitRow(row: IDomElement): UnitStats {
        const cells: ArrayLike<IDomElement> = row.querySelectorAll('td') ?? this._throwNoUnitStatsFound();
        const name: IDomElement = cells[0].querySelector('a') ?? this._throwNoUnitStatsFound();
        const isStealth: boolean = (cells[10].textContent ?? this._throwNoUnitStatsFound()).includes('S');

        return new UnitStats(
            name.textContent ?? this._throwNoUnitStatsFound(),
            Funds.FromString(cells[9].textContent ?? this._throwNoUnitStatsFound()),
            this._parseUnitAction(cells[2], cells[13]),
            isStealth
        );
    }

    private _parseUnitAction(actionTypeCell: IDomElement, actionAmountCell: IDomElement): UnitAction {
        const actionTypeString: string = (actionTypeCell.textContent ?? this._throwNoUnitStatsFound()).trim();
        const actionAmount: number = parseFloat((actionAmountCell.textContent ?? this._throwNoUnitStatsFound()).replace(/[^0-9.]/g, ''));

        if (this._isActionTypeINN(actionTypeString)) {
            return new UnitAction(actionTypeString, actionAmount);
        }

        return new UnitAction(actionTypeString as ActionType);
    }

    private _isActionTypeINN(actionTypeString: string): actionTypeString is ActionType {
        return actionTypeString === ActionType.GARDENS
            || actionTypeString === ActionType.HARVESTS
            || ([ActionType.STEALS_LAND, ActionType.STEALS_SEEDS, ActionType.STEALS_PLANTS, ActionType.DESTROYS_FUNDS, ActionType.STEALS_FLAGS]).some((actionType: ActionType) => {
                return actionTypeString.startsWith(actionType);
            });
    }

    private _throwNoUnitStatsFound(): never {
        throw new Error('No unit stats found');
    }
}
