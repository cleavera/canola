export function TextComponentFactory(text: string, title: string | null = null): HTMLSpanElement {
    const span: HTMLSpanElement = document.createElement('span');

    span.textContent = text;

    if (title !== null) {
        span.title = title;
    }

    return span;
}
