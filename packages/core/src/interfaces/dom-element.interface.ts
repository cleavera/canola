import { Maybe } from '@cleavera/types';

export interface IDomElement {
    querySelectorAll(selector: string): ArrayLike<IDomElement>;
    querySelector(selector: string): IDomElement;
    getAttribute(attributeName: string): Maybe<string>;
    textContent: Maybe<string>;
    innerHTML: string;
}
