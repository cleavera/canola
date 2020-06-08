export function OverlayComponentFactory(title: string, description: string): HTMLButtonElement {
    const button: HTMLButtonElement = document.createElement('button');

    button.type = 'button';
    button.textContent = 'i';
    button.title = `${title}{}${description}`;
    button.style.cssText = `
        background: #66c;
        border: 1px solid #101010;
        color: #f0f0f0;
        padding: 0px;
        border-radius: 50%;
        width: 14px;
        text-align: center;
        font-size: 8px;
        margin: 0 5px;
        vertical-align: middle;
        height: 14px;
        font-weight: bold;
        position: absolute;
    `;

    return button;
}
