import { MobDirection, MobNews, MobType } from '@actoolkit/domain';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { throwIt } from '../helpers/throw.helper';
import { CompanyNameComponentFactory } from './company-name.component';
import { NegativeTextComponentFactory } from './negative-text.component';
import { PositiveTextComponentFactory } from './positive-text.component';
import { TextComponentFactory } from './text.component';

function getSecondPart(mob: MobNews): string {
    if (isNull(mob.mob)) {
        throwIt('Cannot display expired mobs');
    }

    const ticks: string = mob.mob.eta.ticks.toLocaleString('en');

    if (mob.mob.direction === MobDirection.THERE) {
        if (mob.mob.type === MobType.DEFENDING) {
            return ` defending for ${ticks}`;
        }

        return ` attacking for ${ticks}`;
    }

    if (mob.mob.direction === MobDirection.RETURNING) {
        return ` eta ${ticks}`;
    }

    if (mob.mob.type === MobType.DEFENDING) {
        return ` eta ${ticks}. Defending.`;
    }

    return ` eta ${ticks}. Attacking.`;
}

function getFirstPart(mob: MobNews): string {
    if (isNull(mob.mob)) {
        throwIt('Cannot display expired mobs');
    }

    if (mob.mob.direction === MobDirection.RETURNING) {
        return `${mob.count.toLocaleString('en')} staff returning from `;
    }

    if (mob.isOutgoing) {
        return `${mob.count.toLocaleString('en')} staff approaching `;
    }

    return `${mob.count.toLocaleString('en')} staff incoming from `;
}

export function MobComponentFactory(mob: MobNews): HTMLDivElement {
    if (isNull(mob.mob)) {
        throwIt('Cannot display expired mobs');
    }

    const container: HTMLDivElement = document.createElement('div');
    const companyName: HTMLSpanElement = CompanyNameComponentFactory(mob.isOutgoing ? mob.mob.target : mob.mob.sender);

    let partElements: Maybe<[HTMLSpanElement, HTMLSpanElement]> = null;

    if (mob.mob.direction === MobDirection.RETURNING) {
        partElements = [
            TextComponentFactory(getFirstPart(mob)),
            TextComponentFactory(getSecondPart(mob))
        ];
    } else if (mob.mob.type === MobType.DEFENDING) {
        partElements = [
            PositiveTextComponentFactory(getFirstPart(mob)),
            PositiveTextComponentFactory(getSecondPart(mob))
        ];
    } else {
        partElements = [
            NegativeTextComponentFactory(getFirstPart(mob)),
            NegativeTextComponentFactory(getSecondPart(mob))
        ];
    }

    container.appendChild(partElements[0]);
    container.appendChild(companyName);
    container.appendChild(partElements[1]);

    return container;
}
