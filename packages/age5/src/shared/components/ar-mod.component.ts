import { ArMod, Funds, Score } from '@actoolkit/domain';

import { OverlayComponentFactory } from './overlay.component';

export function ArModComponentFactory(arMod: ArMod, score: Score): HTMLButtonElement {
    const value: Funds = arMod.triggerValue(score);

    return OverlayComponentFactory('Amount to trigger', `
        Cost: ${value.toString()}</br>
        Score: ${Score.ForFunds(value).toString()}
    `);
}
