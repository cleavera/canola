import { TextComponentFactory } from './text.component';

export function PositiveTextComponentFactory(text: string, title: string | null = null): HTMLSpanElement {
    const span: HTMLSpanElement = TextComponentFactory(text, title);

    span.classList.add('friendly');

    return span;
}
