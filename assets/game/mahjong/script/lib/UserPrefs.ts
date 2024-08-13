import { IndexedDBManager } from '@casino-mono/share-tools'

export interface IUserPrefs {
    // 讀取
    load(name: string): void;
    // 取得資料
    get(name: string): any;
    // 設定資料
    set(name: string, value: any);
    // 刪除資料
    delete(name: string);
    // 清除
    clear();
    // 移除
    release();
    // 初始化: 需要使用DataStore使用
    init();
    // 讀取使用者資料
    load(name: string): void;
    // 儲存使用者資料
    save():void;
    
}

export interface GameSettings {
    // 靜音
    isMuted: boolean;
    // 快速SPINE
    doSpeedUp: boolean;
    // 下注金額
    points: number;
}
/**
 * 用戶偏好設定
 */
export class UserPrefs implements IUserPrefs {

    private static singleton: UserPrefs = null;

    private _isSingleton: boolean = false;

    get isSingleton(): boolean { return this._isSingleton; };

    private db: IndexedDBManager = new IndexedDBManager();

    private storeName: string = 'game_player_settings';

    private _gameSettings: GameSettings = {
        isMuted: false,
        doSpeedUp: false,
        points: 0
    };
    
    public gameSettings: GameSettings;

    private uuid: string = '';

    private dataStoreEnabled: boolean = false;

    get isReady(): boolean {
        if (this.dataStoreEnabled) {
            return this.db.isReady;
        } else {
            return true;
        }
    }

    constructor() {
        this.gameSettings = this.setupObserverGameSettings();
    }
    protected setupObserverGameSettings():GameSettings {
        const handler: ProxyHandler<GameSettings> = {
            get: (target, property, receiver) => {
                return Reflect.get(target, property, receiver);
            },
            set: (target, property, value, receiver) => {
                // Allow setting other properties
                let bool: boolean = true;
                if (target[property] !== value) {
                    bool = Reflect.set(target, property, value, receiver);
                    this.save();
                }

                return bool;
            }
        }
        const { proxy, revoke } = Proxy.revocable(this._gameSettings, handler);
        
        return proxy;
    }
    /** 初始化IndexedDB */
    async init() {
        if (this.db.isReady) return this;
        const { db, storeName } = this;
        await db.init({ storeName });
        this.dataStoreEnabled = true;
        return this;
    }
    /**
     * 讀取設定檔案
     * @param uuid 
     * @returns 
     */
    async load(uuid: string) {
        this.uuid = uuid;
        if (!this.db.isReady) await this.init();
        let gameSettings = await this.get(uuid);
        if (gameSettings) {
            Object.keys(gameSettings).forEach((key:string) => {
                this._gameSettings[key] = gameSettings[key];
            });
        }
        return this.gameSettings;
    }
    /** 儲存設定檔案 */
    async save() {
        const { dataStoreEnabled, uuid, _gameSettings } = this;
        if (dataStoreEnabled && uuid) {
            await this.set(uuid, _gameSettings);
        }
    }
    /**
     * 自定義資料:寫入
     * @param key 
     * @param value 
     * @returns 
     */
    set(key: string, value: any) {
        const { db } = this;
        return db.setItem(key, value);
    }
    /**
     * 自定義資料:讀取
     * @param key 
     * @returns 
     */
    get(key: string) {
        const { db } = this;
        return db.getItem(key);
    }
    /**
     * 自定義資料:刪除
     * @param key 
     * @returns 
     */
    delete(key: string) {
        const { db } = this;
        return db.deleteItem(key);
    }
    /**
     * 刪除所有資料
     */
    clear() {
        if (this.db) {
            return this.db.clear();
        }
    }
    /** 移除物件 */
    release() {
        this.db = null;
        if (this.isSingleton) UserPrefs.singleton = null;
        this.dataStoreEnabled = false;
    }
    public static getInstance() {
        if (!UserPrefs.singleton) {
            UserPrefs.singleton = new UserPrefs();
            UserPrefs.singleton._isSingleton = true;
        } 
        return UserPrefs.singleton;
    }
}