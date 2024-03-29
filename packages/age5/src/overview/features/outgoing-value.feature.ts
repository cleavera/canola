import { ArMod, CompanyName, CompanyNameRepository, Funds, MobType, Outgoing, OutgoingsRepository, Rank, RankRepository, Score } from '@canola/domain';

import { OverlayComponentFactory, throwIt } from '../../shared';

function arModToTrigger(mobScore: Score, targetScore: Score): string {
    const arMod: ArMod | null = ArMod.FromMobRatio(mobScore.score / targetScore.score);

    if (arMod === null) {
        return `<span class='friendly'>This mob cannot trigger on its own</span>`;
    }

    if (arMod.mod === 0) {
        return `<span class='hostile'>This mob will trigger on its own</span>`;
    }

    return `Min AR modifier to trigger: ${arMod.toString()}`;
}

async function individualValue(outgoingElement: HTMLElement, currentCompany: CompanyName): Promise<void> {
    const outgoing: Outgoing = await new OutgoingsRepository().parseOutgoingElement(outgoingElement, currentCompany);
    const value: Funds | null = outgoing.value();

    if (value === null) {
        return;
    }

    const targetRank: Rank = await new RankRepository().getForId(outgoing.mob.target.id);
    const mobScore: Score = Score.ForFunds(value);

    outgoingElement.appendChild(OverlayComponentFactory('Value', `
        Cost: ${value.toString()}</br>
        Score: ${mobScore.toString()}</br>
        ${outgoing.mob.type === MobType.ATTACKING ? arModToTrigger(mobScore, targetRank.score) : ''}
    `));
}

export async function outgoingValueFeature(): Promise<void> {
    const mainPageElement: HTMLElement = document.getElementById('main-page-data') ?? throwIt('No staff information found');
    const outgoingElements: Array<HTMLElement> = Array.from(mainPageElement.querySelectorAll('#Outgoing div'));
    const currentCompany: CompanyName = await new CompanyNameRepository().getOwn();

    if (outgoingElements === null) {
        return;
    }

    await Promise.all(outgoingElements.map(async(outgoing: HTMLElement): Promise<void> => {
        return individualValue(outgoing, currentCompany);
    }));
}
