import { TextComponentFactory } from './text.component';

export function NoInfoComponentFactory(text: string, title: string | null = null): HTMLSpanElement {
    const span: HTMLSpanElement = TextComponentFactory(text, title);
    const container: HTMLDivElement = document.createElement('div');

    container.appendChild(span);
    container.style.textAlign = 'center';
    container.style.fontStyle = 'italic';

    return container;
}
