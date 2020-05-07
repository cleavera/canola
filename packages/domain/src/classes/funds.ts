export class Funds {
    public funds: number;

    constructor(funds: number) {
        this.funds = funds;
    }

    public static FromString(fundString: string): Funds {
        return new Funds(parseInt(fundString.replace(/[£,]/g, ''), 10));
    }
}
