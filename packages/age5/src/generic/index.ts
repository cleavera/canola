import { incomeFeature } from './features/income';

export async function genericAdditions(): Promise<void> {
    await incomeFeature();
}
