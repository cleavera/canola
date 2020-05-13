import { BaseTechnologiesRepository } from '@actoolkit/domain';

import { genericAdditions } from './generic';
import { overviewAdditions } from './overview';

export async function age5(): Promise<void> {
    console.log(await new BaseTechnologiesRepository().get());

    try {
        await Promise.all([
            genericAdditions(),
            overviewAdditions()
        ]);
    } catch (e) {
        console.error(e);
    }
}
