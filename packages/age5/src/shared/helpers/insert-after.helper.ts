import { throwIt } from './throw.helper';

export function insertAfter(newElement: HTMLElement, referenceElement: HTMLElement): void {
    (referenceElement.parentElement ?? throwIt('No parent')).insertBefore(newElement, referenceElement.nextElementSibling);
}
