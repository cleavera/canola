import { ArMod, ArModRepository, Rank, RankRepository } from '@canola/domain';

import { ArModComponentFactory } from '../../shared';

export async function arModFeature(): Promise<void> {
    const arModCell: HTMLElement | null = document.querySelector('#Misc tr:nth-of-type(4) td:nth-of-type(1)') ?? null;
    const arMod: ArMod | null = await new ArModRepository().getOwn();

    if (arModCell === null || arMod === null) {
        return;
    }

    const rank: Rank = await new RankRepository().getOwn();

    arModCell.appendChild(ArModComponentFactory(arMod, rank.score));
}
