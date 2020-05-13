import { genericAdditions } from './generic';
import { overviewAdditions } from './overview';

export async function age5(): Promise<void> {
    try {
        await genericAdditions();
        await overviewAdditions();
    } catch (e) {
        console.error(e);
    }
}
