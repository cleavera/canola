import { incomeFeature } from './features/income.feature';

export async function genericAdditions(): Promise<void> {
    await incomeFeature();
}
