import { ArMod, Funds, Outgoing, Outgoings, OutgoingsRepository, Rank, RankRepository, Score } from '@actoolkit/domain';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { OverlayComponentFactory, throwIt } from '../../shared';

function arModToTrigger(mobScore: Score, targetScore: Score): string {
    const arMod: Maybe<ArMod> = ArMod.FromMobRatio(mobScore.score / targetScore.score);

    if (isNull(arMod)) {
        return `<span class='friendly'>This mob cannot trigger on its own</span>`;
    }

    if (arMod.mod === 0) {
        return `<span class='hostile'>This mob will trigger on its own</span>`;
    }

    return `Min AR modifier to trigger: ${arMod.toString()}`;
}

async function individualValue(outgoing: Outgoing, outgoingElement: HTMLElement): Promise<void> {
    const value: Maybe<Funds> = outgoing.value();

    if (isNull(value)) {
        return;
    }

    const targetRank: Rank = await new RankRepository().getForId(outgoing.mob.target.id);
    const mobScore: Score = Score.ForFunds(value);

    outgoingElement.appendChild(OverlayComponentFactory('Value', `
        Cost: ${value.toString()}</br>
        Score: ${mobScore.toString()}</br>
        ${arModToTrigger(mobScore, targetRank.score)}
    `));
}

export async function outgoingValueFeature(): Promise<void> {
    const mainPageElement: HTMLElement = document.getElementById('main-page-data') ?? throwIt('No staff information found');
    const outgoingElements: ArrayLike<HTMLElement> = mainPageElement.querySelectorAll('#Outgoing div');
    const outgoings: Maybe<Outgoings> = await new OutgoingsRepository().getOwn();

    if (isNull(outgoingElements) || isNull(outgoings)) {
        return;
    }

    await Promise.all(outgoings.outgoings.map((outgoing: Outgoing, index: number) => {
        return individualValue(outgoing, outgoingElements[index]);
    }));
}
