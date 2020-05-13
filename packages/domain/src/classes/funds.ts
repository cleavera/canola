import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

export class Funds {
    public readonly funds: number;
    public readonly score: number;

    constructor(funds: number, score: Maybe<number> = null) {
        this.funds = funds;

        if (isNull(score)) {
            score = funds / 500;
        }

        this.score = score;
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
