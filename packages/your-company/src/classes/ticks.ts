export class Ticks {
    public ticks: number;

    constructor(ticks: number) {
        this.ticks = ticks;
    }

    public static FromString(ticksString: string): Ticks {
        return new Ticks(parseInt(ticksString.replace(/[,]/g, ''), 10));
    }

    public static Subtract(ticks1: Ticks, ticks2: Ticks): Ticks {
        return new Ticks(ticks1.ticks - ticks2.ticks);
    }
}
