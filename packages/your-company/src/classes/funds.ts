export class Funds {
    private static readonly PARSER_REGEX: RegExp = /Funds: £([0-9,]+)/;

    public funds: number;

    constructor(funds: number) {
        this.funds = funds;
    }

    public static FromString(str: string): Funds {
        const [, fundString]: RegExpExecArray = this.PARSER_REGEX.exec(str) ?? this._throwInvalidFundsString(str); // eslint-disable-line array-element-newline

        const funds = parseInt(fundString.replace(/,/g, ''), 10);

        return new Funds(funds);
    }

    private static _throwInvalidFundsString(str: string): never {
        throw new Error(`Invalid funds string '${str}'`);
    }
}
