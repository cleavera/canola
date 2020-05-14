export function PositiveTextComponentFactory(text: string): HTMLSpanElement {
    const span: HTMLSpanElement = document.createElement('span');

    span.textContent = text;
    span.classList.add('friendly');

    return span;
}
