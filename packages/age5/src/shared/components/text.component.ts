import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

export function TextComponentFactory(text: string, title: Maybe<string> = null): HTMLSpanElement {
    const span: HTMLSpanElement = document.createElement('span');

    span.textContent = text;

    if (!isNull(title)) {
        span.title = title;
    }

    return span;
}
