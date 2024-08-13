// import { LZMA } from "../../lzma/LZMA";
import { js } from "cc";
import { URLParameter } from "../url/URLParameter";

type DictObject = Record<string, string>;


export class DictImpl {
    
    private static PreferredLang: string = "us";

    set lang(value: string) {
        this._lang = value;
    }

    set origin(value: string) {
        this._origin = value;
    }

    private _origin: string;
    private _lang: string;

    private _isLoaded: boolean = false;

    private dict: Record<string, string> = {};

    public get isLoaded () { return this._isLoaded; };

    constructor(origin: string, lang: string) {
        this._origin = origin;
        this._lang = lang;
    }
    async load() {
        if (!this._lang || !this._origin) return;
        const url = `${this._origin}/ipl/app/flash/pig/game/common/dict/${this._lang}.json`;
        let res = fetch(url)
            .then(res => {
                if (res.ok) {
                    this._isLoaded = true;
                    return res.json();
                }
            })
            .then((json: DictObject) => {
                this.dict = json;
            });
        return res;
    }
    get(key: string) {
        const result = this.dict?.[key];
        return result ?? key;
    }

    has(key: string) {
        return !!this.dict?.[key];
    }
    async start() {
        return await this.load().catch(() => {
            this._lang = DictImpl.PreferredLang;
            this.load();
        });
    }

}

export const Dict = new DictImpl(location.origin, URLParameter.iplLang);