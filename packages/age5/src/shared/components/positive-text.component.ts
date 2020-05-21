import { Maybe } from '@cleavera/types';

import { TextComponentFactory } from './text.component';

export function PositiveTextComponentFactory(text: string, title: Maybe<string> = null): HTMLSpanElement {
    const span: HTMLSpanElement = TextComponentFactory(text, title);

    span.classList.add('friendly');

    return span;
}
