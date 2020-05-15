import { ArMod, ArModRepository, Funds, Rank, RankRepository, Score } from '@actoolkit/domain';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { OverlayComponentFactory } from '../../shared';

export async function arModFeature(): Promise<void> {
    const arModCell: Maybe<HTMLElement> = document.querySelector('#Misc tr:nth-of-type(4) td:nth-of-type(1)') ?? null;
    const arMod: Maybe<ArMod> = await new ArModRepository().getOwn();

    if (isNull(arModCell) || isNull(arMod)) {
        return;
    }

    const rank: Rank = await new RankRepository().getOwn();
    const value: Funds = arMod.triggerValue(rank.score);

    arModCell.appendChild(OverlayComponentFactory('Amount to trigger', `
        Cost: ${value.toString()}</br>
        Score: ${Score.ForFunds(value).toString()}
    `));
}
