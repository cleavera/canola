import { Maybe } from '@cleavera/types';

import { UnitStats } from './unit-stats';

export class Units {
    public readonly list: ReadonlyArray<UnitStats>;

    constructor(unitList: Array<UnitStats>) {
        this.list = unitList;
    }

    public getByName(name: string): Maybe<UnitStats> {
        return this.list.find((unit: UnitStats): boolean => {
            return unit.name === name;
        }) ?? null;
    }

    public getStealth(): Units {
        return new Units(this.list.filter((unit: UnitStats) => {
            return unit.isStealth;
        }));
    }
}
