import { Land, LandRepository, Rank, RankRepository, Score, Stocks, StocksRepository, Tech, TechRepository, Workforce, WorkforceRepository } from '@actoolkit/domain';

import { OverlayComponentFactory, throwIt } from '../../shared';

function toPercentage(value: number, total: number): string {
    return `<span class="friendly">[${((value / total) * 100).toFixed(2)}%]</span>`;
}

function getString(score: Score, total: Score): string {
    return `${score} ${toPercentage(score.score, total.score)}`;
}

export async function scoreBreakdownFeature(): Promise<void> {
    const scoreElement: HTMLElement = document.getElementById('game-info-rank-score') ?? throwIt('Could not find score information on the page');

    const { score }: Rank = await new RankRepository().get();
    const land: Land = await new LandRepository().get();
    const stocks: Stocks = await new StocksRepository().get();
    const workforce: Workforce = await new WorkforceRepository().get();
    const tech: Tech = await new TechRepository().get();

    const acresScore: Score = Score.ForLand(land.acres);
    const plantedPlantsScore: Score = Score.ForFunds(land.plantedPlants.sold());
    const stockedPlantsScore: Score = Score.ForFunds(stocks.plants.sold());
    const stockedSeedsScore: Score = Score.ForFunds(stocks.seeds.sold());
    const staffScore: Score = Score.ForFunds(workforce.value());
    const techScore: Score = Score.ForDevelopment(tech.value());

    scoreElement.appendChild(OverlayComponentFactory('Breakdown', `
        Staff: ${getString(staffScore, score)}</br>
        Land: ${getString(acresScore, score)}</br>
        Planted plants: ${getString(plantedPlantsScore, score)}</br>
        Stocked plants: ${getString(stockedPlantsScore, score)}</br>
        Stocked seeds: ${getString(stockedSeedsScore, score)}</br>
        Developments: ${getString(techScore, score)}
    `));
}
