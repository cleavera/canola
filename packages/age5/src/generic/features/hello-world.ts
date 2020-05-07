import { OverlayComponentFactory } from '../../shared';

export function throwIt(test: string): never {
    throw new Error(test);
}

export async function helloWorld(): Promise<void> {
    const fundsElement: HTMLElement = document.getElementById('game-info-funds') ?? throwIt('oops');

    fundsElement.appendChild(OverlayComponentFactory('Hello world', '<span class="hostile">Hello to the world out there</span>'));
}
