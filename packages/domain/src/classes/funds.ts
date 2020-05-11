export class Funds {
    public funds: number;

    constructor(funds: number) {
        this.funds = funds;
    }

    public toString(): string {
        return `£${this.funds.toLocaleString('en')}`;
    }

    public static Scale(funds: Funds, scalar: number): Funds {
        return new Funds(funds.funds * scalar);
    }

    public static Sum(...funds: Array<Funds>): Funds {
        return new Funds(funds.reduce((total: number, fund: Funds) => {
            return total + fund.funds;
        }, 0));
    }

    public static FromString(fundString: string): Funds {
        return new Funds(parseInt(fundString.replace(/[£,]/g, ''), 10));
    }
}
