import { incomeFeature } from './features/income.feature';
import { scoreBreakdownFeature } from './features/score-breakdown.feature';

export async function genericAdditions(): Promise<void> {
    await Promise.all([
        incomeFeature(),
        scoreBreakdownFeature()
    ]);
}
