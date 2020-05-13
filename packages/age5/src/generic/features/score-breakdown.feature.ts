import { Land, LandRepository, Score, ScoreRepository, Stocks, StocksRepository, Workforce, WorkforceRepository } from '@actoolkit/domain';

import { OverlayComponentFactory, throwIt } from '../../shared';

function toPercentage(value: number, total: number): string {
    return `<span class="friendly">[${((value / total) * 100).toFixed(2)}%]</span>`;
}

export async function scoreBreakdownFeature(): Promise<void> {
    const scoreElement: HTMLElement = document.getElementById('game-info-rank-score') ?? throwIt('Could not find score information on the page');

    const { score }: Score = await new ScoreRepository().get();
    const land: Land = await new LandRepository().get();
    const stocks: Stocks = await new StocksRepository().get();
    const workforce: Workforce = await new WorkforceRepository().get();

    const acresScore: number = land.acres.score;
    const plantedPlantsScore: number = land.plantedPlants.sold().score;
    const stockedPlantsScore: number = stocks.plants.sold().score;
    const stockedSeedsScore: number = stocks.seeds.sold().score;
    const staffScore: number = workforce.value().score;

    scoreElement.appendChild(OverlayComponentFactory('Breakdown', `
        Staff: ${staffScore.toLocaleString('en')} ${toPercentage(staffScore, score)}</br>
        Land: ${acresScore.toLocaleString('en')} ${toPercentage(acresScore, score)}</br>
        Planted plants: ${plantedPlantsScore.toLocaleString('en')} ${toPercentage(plantedPlantsScore, score)}</br>
        Stocked plants: ${stockedPlantsScore.toLocaleString('en')} ${toPercentage(stockedPlantsScore, score)}</br>
        Stocked seeds: ${stockedSeedsScore.toLocaleString('en')} ${toPercentage(stockedSeedsScore, score)}
    `));
}
