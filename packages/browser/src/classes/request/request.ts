import { IDomElement, IRequest } from '@actoolkit/core';

import { Cache } from '../cache/cache';

export class BrowserRequest implements IRequest {
    private readonly _baseURL: string;
    private readonly _cache: Cache;

    constructor(baseUrl: string) {
        this._baseURL = baseUrl;
        this._cache = new Cache(60000); // One minute
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
        const response: Response = await fetch(this._getURL(url));

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
