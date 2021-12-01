import { TextComponentFactory } from './text.component';

export function NegativeTextComponentFactory(text: string, title: string | null = null): HTMLSpanElement {
    const span: HTMLSpanElement = TextComponentFactory(text, title);

    span.classList.add('hostile');

    return span;
}
