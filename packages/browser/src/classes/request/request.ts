import { CACHE, ICache, IDomElement, INJECTOR, IRequest } from '@actoolkit/core';

export class BrowserRequest implements IRequest {
    private readonly _baseURL: string;
    private readonly _cache: ICache;

    constructor(baseUrl: string) {
        this._baseURL = baseUrl;
        this._cache = INJECTOR.get<ICache>(CACHE) ?? ((): never => {
            throw new Error('Cannot get cache');
        })();
    }

    public async get(url: string): Promise<IDomElement> {
        const response: string = await this._cachedFetch(url);

        const div: HTMLElement = document.createElement('div');

        div.innerHTML = response.replace(/<script ([A-z0-9="/\s.]+)>[\s\S]+?<\/script>/g, '');

        return div;
    }

    public async post(): Promise<string> {
        throw new Error('Method not implemented.');
    }

    private async _cachedFetch(url: string): Promise<string> {
        if (this._cache.has(url)) {
            return this._cache.get(url);
        }

        const request: Promise<string> = this._fetch(url);

        this._cache.set(url, request);

        return request;
    }

    private async _fetch(url: string): Promise<string> {
        const response: Response = await fetch(this._getURL(url), {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return response.text();
    }

    private _getURL(path: string): string {
        if (path.startsWith('http://')) {
            return path;
        }

        if (path.startsWith('/')) {
            return `${this._baseURL}${path}`;
        }

        return `${this._baseURL}/${path}`;
    }
}
