import localforage from 'localforage';


export class IndexedDBManager {

    private store: LocalForage | null = null;

    private _error: boolean = null;

    public isReady: boolean = false;

    public storeName: string = null;

    async init(config?: {
        storeName: string,
    }) {
        if (!config) config = { storeName: this.storeName };
        //已經初始化過且有錯誤
        if (this._error) return;
        
        if (!this.store) {
            this.store = localforage.createInstance({
                driver: localforage.INDEXEDDB,
                name: 'casino_frontend',
                storeName: config?.storeName,
            });
        }
        this.isReady = !(await this.store.ready().catch((err) => {
            // console.error(`[Index] :: init error`, err);
            this._error = true;
            return false;
        }) === false);
    }

    async setItem<T>(key: string, value: T) {
        if (!this.store) { await this.init(); }
        if (this._error) return null;
        return this.store?.setItem(key, value);
    }

    async getItem<T>(key: string): Promise<T | null | undefined> {
        if (!this.store) { await this.init(); }
        if (this._error) return null;
        return this.store?.getItem<T>(key);
    }

    async deleteItem(key: string) {
        if (!this.store) { await this.init(); }
        if (this._error) return null;
        return this.store?.removeItem(key);
    }

    async clear() {
        if (!this.store) { await this.init(); }
        if (this._error) return null;
        return this.store?.clear();
    }

}


