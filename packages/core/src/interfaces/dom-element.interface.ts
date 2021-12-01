export interface IDomElement {
    querySelectorAll(selector: string): ArrayLike<IDomElement>;
    querySelector(selector: string): IDomElement;
    getAttribute(attributeName: string): string | null;
    textContent: string | null;
}
