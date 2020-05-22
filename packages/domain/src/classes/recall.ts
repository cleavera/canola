import { Maybe } from '@cleavera/types';

import { CompanyName } from './company-name';

export class Recall {
    public sender: Maybe<CompanyName>;

    constructor(sender: Maybe<CompanyName> = null) {
        this.sender = sender;
    }
}
