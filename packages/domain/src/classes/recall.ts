import { CompanyName } from './company-name';

export class Recall {
    public sender: CompanyName | null;

    constructor(sender: CompanyName | null = null) {
        this.sender = sender;
    }
}
