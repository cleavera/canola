import { Funds, Outgoings, OutgoingsRepository, Score } from '@actoolkit/domain';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { OverlayComponentFactory, throwIt } from '../../shared';

export async function outgoingValueFeature(): Promise<void> {
    const mainPageElement: HTMLElement = document.getElementById('main-page-data') ?? throwIt('No staff information found');
    const outgoingElements: ArrayLike<HTMLElement> = mainPageElement.querySelectorAll('#Outgoing div');
    const outgoings: Maybe<Outgoings> = await new OutgoingsRepository().get();

    if (isNull(outgoingElements) || isNull(outgoings)) {
        return;
    }

    for (let i = 0; i < outgoingElements.length; i++) {
        const value: Maybe<Funds> = outgoings.outgoings[i].value();

        if (isNull(value)) {
            continue;
        }

        outgoingElements[i].appendChild(OverlayComponentFactory('Value', `
            Cost: ${value.toString()}</br>
            Score: ${Score.ForFunds(value).toString()}
        `));
    }
}
