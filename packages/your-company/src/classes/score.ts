export class Score {
    private static readonly PARSER_REGEX: RegExp = /Score: ([0-9,]+) \[([0-9]+)]/;

    public score: number;
    public rank: number;

    constructor(score: number, rank: number) {
        this.score = score;
        this.rank = rank;
    }

    public static FromString(str: string): Score {
        const [, scoreString, rankString]: RegExpExecArray = this.PARSER_REGEX.exec(str) ?? this._throwInvalidScoreString(str); // eslint-disable-line array-element-newline

        const score = parseInt(scoreString.replace(/,/g, ''), 10);
        const rank = parseInt(rankString, 10);

        return new Score(score, rank);
    }

    private static _throwInvalidScoreString(str: string): never {
        throw new Error(`Invalid score string '${str}'`);
    }
}
