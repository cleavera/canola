import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

export class CacheItem {
    public value!: Promise<string>;
    public updated!: number;

    private _timeout: Maybe<number> = null;
    private readonly _expiryFunction: () => void;
    private readonly _cacheLifespan: number;

    constructor(value: Promise<string>, expiryFunction: () => void, cacheLifespan: number) {
        this._expiryFunction = expiryFunction;
        this._cacheLifespan = cacheLifespan;

        this.refresh(value);
    }

    public refresh(value: Promise<string>): void {
        this.value = value;
        this.updated = Date.now();
        this._removeTimeout();

        this._timeout = window.setTimeout(this._expiryFunction, this._cacheLifespan);
    }

    public onDestroy(): void {
        this._removeTimeout();
    }

    private _removeTimeout(): void {
        if (!isNull(this._timeout)) {
            window.clearTimeout(this._timeout);
        }
    }
}
