import { IRequest } from '@actoolkit/core';

export class BrowserRequest implements IRequest {
    public async get(url: string): Promise<string> {
        const response: Response = await fetch(this.getURL(url));

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return response.text();
    }

    public async post(): Promise<string> {
        throw new Error('Method not implemented.');
    }

    private getURL(path: string): string {
        if (path.startsWith('http://')) {
            return path;
        }

        if (path.startsWith('/')) {
            return `http://www.bushtarion.com${path}`;
        }

        return `http://www.bushtarion.com/${path}`;
    }
}
