import { UnitsRepository } from '@actoolkit/domain';

import { genericAdditions } from './generic';
import { overviewAdditions } from './overview';

export async function age5(): Promise<void> {
    console.log(await new UnitsRepository().get()); // eslint-disable-line no-console

    try {
        await genericAdditions();
        await overviewAdditions();
    } catch (e) {
        console.error(e);
    }
}
