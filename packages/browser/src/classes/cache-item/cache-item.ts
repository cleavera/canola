export class CacheItem {
    public value!: any;
    public updated!: number;

    private _timeout: number | null = null;
    private readonly _expiryFunction: () => void;
    private readonly _cacheLifespan: number;

    constructor(value: any, expiryFunction: () => void, cacheLifespan: number) {
        this._expiryFunction = expiryFunction;
        this._cacheLifespan = cacheLifespan;

        this.refresh(value);
    }

    public refresh(value: any): void {
        this.value = value;
        this.updated = Date.now();
        this._removeTimeout();

        this._timeout = window.setTimeout(this._expiryFunction, this._cacheLifespan);
    }

    public onDestroy(): void {
        this._removeTimeout();
    }

    private _removeTimeout(): void {
        if (this._timeout !== null) {
            window.clearTimeout(this._timeout);
        }
    }
}
