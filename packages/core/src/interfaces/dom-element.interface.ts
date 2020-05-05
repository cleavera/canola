import { Maybe } from '@cleavera/types';

export interface IDomElement {
    querySelectorAll(selector: string): ArrayLike<IDomElement>;
    querySelector(selector: string): IDomElement;
    textContent: Maybe<string>;
    innerHTML: string;
}
