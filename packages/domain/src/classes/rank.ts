import { Score } from './score';

export class Rank {
    public score: Score;
    public rank: number;

    constructor(score: Score, rank: number) {
        this.score = score;
        this.rank = rank;
    }
}
