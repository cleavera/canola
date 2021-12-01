import { BaseTech } from './base-tech';

export class BaseTechnologies {
    public readonly list: ReadonlyArray<BaseTech>;

    constructor(techs: Array<BaseTech>) {
        this.list = techs;
    }

    public getByName(name: string): BaseTech | null {
        return this.list.find((unit: BaseTech): boolean => {
            return unit.name === name;
        }) ?? null;
    }
}
