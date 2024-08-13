import { AssetManager, Node, Sprite, SpriteFrame, assetManager, director } from "cc";
import { BaseLanguageFilesDirectory, LanguageFiles, LanguageFilesDirectory } from "./LanguageFiles";
import { URLParameter, log } from "./include";

export interface ILanguageManager {
    // 設置遊戲語系
    setLang();
    // 讀取定義設定檔案
    loadDirectory(directory: BaseLanguageFilesDirectory);
    // 讀取boundle
    loadBundleFile(filePath: string);
}

export class LanguageManager implements ILanguageManager {
    
    private static singleton: LanguageManager = null;
    
    protected _isSingleton: boolean = false;

    protected bundleName: string;

    protected bundle: AssetManager.Bundle = null;

    protected _node: Node;

    get node(): Node { return this._node };

    protected _lang: string;

    get lang(): string { return this._lang };

    public sourcesList: SpriteFrame[] = new Array<SpriteFrame>();

    private sourcesMap: Map<string, SpriteFrame> = new Map();
    // 記錄檔案名稱
    protected directory: LanguageFilesDirectory;

    protected initialSpriteFrameMap: Map<string, Sprite> = new Map();

    get isSingleton(): boolean { return this._isSingleton; }

    constructor() {
        this.setLang();
        this.init();
    }

    setLang(): void {
        switch (URLParameter.iplLang) {
            case "tw":
                this._lang = "tw";
                break;
            case "cn":
                this._lang = "cn";
                break;
            case "vi":
                this._lang = "vi";
                break;
            default:
                this._lang = "en";
                break;
        }
        this.bundleName = this._lang;
    }

    // 初始化
    protected async init(): Promise<void> {
        const node: Node = new Node("LanguageManager");
        this._node = node;
        director.addPersistRootNode(node);
        LanguageManager.singleton = this;

        this.loadDirectory(LanguageFiles);
        await this.loadBundleFile(this.bundleName);
        this._node.emit("completed");

        for (let [key, sprite] of this.initialSpriteFrameMap) {
            sprite.spriteFrame = this.getSource(key);
            this.initialSpriteFrameMap.delete(key);
        }
        this.initialSpriteFrameMap = null;
    }
    // Promise:讀取Boundle設定檔案
    protected loadBundle(name: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(name, (err, boundle) => {
                if (err) return reject(err);
                resolve(boundle);
            });
        });
    }
    // Promise:讀語系圖檔
    protected loadFile(filePath: string): Promise<SpriteFrame> {
        const { bundle } = this;
        return new Promise((resolve, reject) => {
            bundle.load(filePath, SpriteFrame, (err, spriteFrame) => {
                if (err) return reject(err);
                return resolve(spriteFrame);
            });
        });
    }
    // Promise:讀取檔案
    public async loadBundleFile(boundleName: string) {
        log(`Loading LanguageManager bundle`);
        let bundle = await this.loadBundle(boundleName).catch((err) => null);
        if (!bundle) return console.error(`LanguageManager Bundle not found: ${boundleName}`);

        this.bundle = bundle;

        let keys = Object.keys(this.directory);
        for (let i: number = 0; i < keys.length; i++) {
            const key: string = keys[i];
            const filePath = this.directory[key];
            let spriteFrame = await this.loadFile(filePath);
            if (spriteFrame) this.addSource(filePath, spriteFrame);
        }
        log(`Language load completed.`);
        
    }
    // 讀取定義設定檔案
    public loadDirectory(directory: LanguageFilesDirectory) {
        this.directory = directory;
    }
    addSource<T extends keyof LanguageFilesDirectory & string>(name: T, spriteFrame: SpriteFrame):boolean {
        const { sourcesList, sourcesMap } = this;
        if (!sourcesMap.has(name)) {
            sourcesList.push(spriteFrame);
            sourcesMap.set(name, spriteFrame);
            return true;
        }
        return false;
    }
    hasSource(name: string): boolean {
        const { sourcesMap } = this;
        return sourcesMap.has(name);
    }
    protected getSource<T extends keyof LanguageFilesDirectory & string>(name: T):SpriteFrame {
        return this.sourcesMap.get(name);
    }
    setSpriteFrame<T extends keyof LanguageFilesDirectory & string>(sprite: Sprite ,name: T) {
        if (this.hasSource(name)) {
            sprite.spriteFrame = this.getSource(name);
        } else {
            this.initialSpriteFrameMap?.set(name, sprite);
        }
    }
    release() {
        if (this.isSingleton) {
            LanguageManager.singleton = null;
        }
    }
    public static getInstance(): LanguageManager {
        if (!LanguageManager.singleton) {
            LanguageManager.singleton = new LanguageManager();
            LanguageManager.singleton._isSingleton = true;
        } 
        return LanguageManager.singleton;
    }
}