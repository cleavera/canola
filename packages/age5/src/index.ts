import { OutgoingsRepository } from '@actoolkit/domain';

import { genericAdditions } from './generic';
import { overviewAdditions } from './overview';

export async function age5(): Promise<void> {
    try {
        console.log(await new OutgoingsRepository().get());

        await Promise.all([
            genericAdditions(),
            overviewAdditions()
        ]);
    } catch (e) {
        console.error(e);
    }
}
