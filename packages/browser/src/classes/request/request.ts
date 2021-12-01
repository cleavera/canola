import { CACHE, ICache, IDomElement, INJECTOR, IRequest } from '@canola/core';

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
        return this._parseResponse(await this._cachedFetch(url));
    }

    public async post(url: string, params: Record<string, string>): Promise<IDomElement> {
        const body: string = new URLSearchParams(params).toString();

        return this._parseResponse(await this._fetch(url, body));
    }

    private _parseResponse(response: string): IDomElement {
        const templateElement: HTMLTemplateElement = document.createElement('template');

        templateElement.innerHTML = response.replace(/<script ([A-z0-9="/\s.]+)>[\s\S]+?<\/script>/g, '');

        return templateElement.content as any;
    }

    private async _cachedFetch(url: string): Promise<string> {
        if (this._cache.has(url)) {
            return this._cache.get(url);
        }

        const request: Promise<string> = this._fetch(url);

        this._cache.set(url, request);

        return request;
    }

    private async _fetch(url: string, body: string | null = null): Promise<string> {
        const headers: Headers = new Headers();

        if (body !== null) {
            headers.append('Content-Type', 'application/x-www-form-urlencoded');
        }

        const response: Response = await fetch(this._getURL(url), {
            method: body === null ? 'GET' : 'POST',
            credentials: 'include',
            headers,
            body
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return response.text();
    }

    private _getURL(path: string): string {
        if ((/^http(s?):\/\//).test(path)) {
            return path;
        }

        if (path.startsWith('/')) {
            return `${this._baseURL}${path}`;
        }

        return `${this._baseURL}/${path}`;
    }
}
