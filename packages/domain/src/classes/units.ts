import { UnitStats } from './unit-stats';

export class Units {
    public list: Array<UnitStats>;

    constructor(unitList: Array<UnitStats>) {
        this.list = unitList;
    }
}
