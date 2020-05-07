export class Ticks {
    public ticks: number;

    constructor(ticks: number) {
        this.ticks = ticks;
    }

    public static FromString(ticksString: string): Ticks {
        return new Ticks(parseInt(ticksString.replace(/[,]/g, ''), 10));
    }
}
