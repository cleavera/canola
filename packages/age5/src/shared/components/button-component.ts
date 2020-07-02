export function ButtonComponentFactory(text: string, title: string, action: () => void): HTMLButtonElement {
    const button: HTMLButtonElement = document.createElement('button');

    button.title = title;
    button.textContent = text;
    button.type = 'button';
    button.addEventListener('click', action);

    return button;
}
