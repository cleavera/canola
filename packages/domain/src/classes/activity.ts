import { PointInTime } from './point-in-time';

export class Activity {
    public items: Array<PointInTime>;

    constructor(items: Array<PointInTime>) {
        this.items = items;
    }

    public groupByHours(currentPointInTime: PointInTime): Array<number> {
        const grouped: Array<number> = this._createBlankActivityGroup();

        this.items.forEach((item: PointInTime) => {
            grouped[PointInTime.ToDateTime(item, currentPointInTime).getUTCHours()]++;
        });

        return grouped;
    }

    private _createBlankActivityGroup(): Array<number> {
        return new Array<number>(24).fill(0);
    }
}
