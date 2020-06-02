export class Ticks {
    public ticks: number;

    constructor(ticks: number) {
        this.ticks = ticks;
    }

    public static FromString(ticksString: string): Ticks {
        return new Ticks(parseInt(ticksString.replace(/[,]/g, ''), 10));
    }

    public static Add(ticks1: Ticks, ticks2: Ticks): Ticks {
        return new Ticks(ticks1.ticks + ticks2.ticks);
    }

    public static Subtract(ticks1: Ticks, ticks2: Ticks): Ticks {
        return new Ticks(ticks1.ticks - ticks2.ticks);
    }

    public static Hour(): Ticks {
        return new Ticks(6);
    }

    public static Day(): Ticks {
        return new Ticks(144);
    }
}
