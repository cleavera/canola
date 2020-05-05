export class CompanyName {
    private static readonly PARSER_REGEX: RegExp = /([A-z0-9\s]+) \[([0-9]{1,4})]/;

    public id: string;
    public name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    public static FromString(str: string): CompanyName {
        const [, name, id]: RegExpExecArray = this.PARSER_REGEX.exec(str) ?? this._throwInvalidIdString(str); // eslint-disable-line array-element-newline

        return new CompanyName(id, name);
    }

    private static _throwInvalidIdString(str: string): never {
        throw new Error(`Invalid id string '${str}'`);
    }
}
