import { Acres } from './acres';
import { Funds } from './funds';

export class Score {
    public score: number;

    constructor(score: number) {
        this.score = score;
    }

    public toString(): string {
        return this.score.toLocaleString('en');
    }

    public toFunds(): Funds {
        return new Funds(this.score * 500);
    }

    public static ForDevelopment(developmentCost: Funds): Score {
        return new Score(Math.floor(developmentCost.funds / 2500));
    }

    public static ForFunds(funds: Funds): Score {
        return new Score(Math.floor(funds.funds / 500));
    }

    public static ForLand(acres: Acres): Score {
        return new Score(acres.total * acres.total * 10);
    }
}
