import { IDomElement, IRequest } from '@actoolkit/core';

export class BrowserRequest implements IRequest {
    private readonly _baseURL: string;

    constructor(baseUrl: string) {
        this._baseURL = baseUrl;
    }

    public async get(url: string): Promise<IDomElement> {
        const response: Response = await fetch(this.getURL(url));

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const div: HTMLElement = document.createElement('div');

        div.innerHTML = await response.text();

        return div;
    }

    public async post(): Promise<string> {
        throw new Error('Method not implemented.');
    }

    private getURL(path: string): string {
        if (path.startsWith('http://')) {
            return path;
        }

        if (path.startsWith('/')) {
            return `${this._baseURL}${path}`;
        }

        return `${this._baseURL}/${path}`;
    }
}
