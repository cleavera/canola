export class Acres {
    public readonly count: number;
    public readonly plants: number;

    constructor(count: number, plants: number) {
        this.count = count;
        this.plants = plants;
    }

    public static Total(...acresToSum: Array<Acres>): Acres {
        let count: number = 0;
        let plants: number = 0;

        acresToSum.forEach((acres: Acres) => {
            count += acres.count;
            plants += acres.plants;
        });

        return new Acres(count, plants);
    }
}
