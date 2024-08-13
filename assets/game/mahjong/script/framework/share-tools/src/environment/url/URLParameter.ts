import { CDNImpl } from "./CDN";
import urlJoin from "./URLJoin";

export enum VendorTypes {
    XC = "3"
}
export interface ICasinoURLParameter {

    readonly sid: string;
    readonly gameType: string;
    readonly lang: string;

    readonly iplLang: string;
    readonly rdaLang: string;

    readonly platform: string;

    readonly mua: string;
    readonly dtp: string;

    readonly rootPath: string;
    readonly serverHost: string;

    readonly betHistoryUrl: string;
    readonly ruleUrl: string;
    readonly helpUrl: string;

    readonly shareFileUrl: string;
    /** 平台環境 */
    readonly vendor: string; // "1" | "2" | "3"
    readonly demo: string;
    readonly special: string | null;

    readonly loadingPicUrl: string;
    
    readonly isTLS: boolean;

    gotoBankerPage(): void;
}

export class URLParameterClass implements ICasinoURLParameter {

    private url: URL;

    get local() {
        return this.url.host.includes('localhost') ||
            this.url.host.includes('127.0.0.1') ||
            this.url.host.includes('192.168.');
    }
    get sid(): string | null { return this.url.searchParams.get('sid'); }
    get gameType(): string { return this.url.searchParams.get('GameType'); }
    /** 網址上的語系 */
    get lang(): string { return this.url.searchParams.get('lang'); }
    get platform(): string | null { return this.url.searchParams.get('platform'); }

    get mua(): string { return this.url.searchParams.get('mua'); }
    get dtp(): string { return this.url.searchParams.get('dtp'); }
    /** 平台環境 */
    get vendor(): string { return this.url.searchParams.get('vendor'); }

    get demo(): string | null { return this.url.searchParams.get('demo'); }
    get special(): string | null { return this.url.searchParams.get('special'); }


    get iplLang() { return this.mapingIPLLang(); }
    get rdaLang() { return this.mapingRdaLang(); }

    get rootPath() { return this._rootPath; }
    get serverHost() { return this._serverHost; }
    
    get isTLS() { return this.url.protocol === 'https:'; }

    get betHistoryUrl() {
        const url = new URL(this.url.origin);
        url.pathname = '/ipl/portal.php/game/betrecord_search/kind5';
        url.searchParams.set('GameCode', '1');
        url.searchParams.set('GameType', this.gameType);;
        url.searchParams.set('sid', this.sid);
        url.searchParams.set('lang', this.lang);
        url.searchParams.set('rnd', Date.now().toString());
        return url.href;
    }

    get ruleUrl() {
        const url = new URL(this.url.origin);
        url.pathname = '/ipl/app/help.php';
        url.searchParams.set('GameType', this.gameType);;
        url.searchParams.set('lang', this.lang);
        url.searchParams.set('rnd', Date.now().toString());
        return url.href;
    }

    get helpUrl() {
        const url = new URL(location.origin);
        url.pathname = '/ipl/portal.php/game/httpredirect';
        url.searchParams.set('type', 'casinoruleinfo');;
        url.searchParams.set('gametype', this.gameType);
        url.searchParams.set('lang', this.lang);
        return url.href;
    }

    get loadingPicUrl() {
        return ``;
    }

    get shareFileUrl() {
        if (this.rootPath.includes('casinoH5')) {
            return this.rootPath.split('casinoH5/')[0] + "casinoH5/ShareFile/";
        }
        else {
            return '/ipl/app/flash/pig/game/casinoH5/ShareFile/';
        }
    }


    private _cdn: CDNImpl;
    private _rootPath: string;
    private _serverHost: string;



    GET(key: string) {
        return this.url.searchParams.get(key);
    }

    getResourceURL(path: string) {
        return urlJoin(this.rootPath, path);
    }

    set href(href: string) {
        this._href = href;
        this.init();
    }

    private _href: string = window.location.href;

    constructor(href: string = window.location.href) {
        this._href = href;
        this.init(false);
    }

    gotoBankerPage() {
        if (typeof parent['DepositUrl'] === "function") {
            parent['DepositUrl']({
                sid: this.sid,
                lang: this.rdaLang,
                vnd: Date.now().toString(),
            });
        }
    }


    async init(fetch: boolean = true) {
        this.url = new URL(this._href);
        this._cdn = new CDNImpl(this._href);
        this._rootPath = this._cdn.originUrl;
        this._serverHost = this.url.host;
        if (!fetch) return;
        this._rootPath = await this._cdn.getRootPath();
        this._serverHost = (this.local) ? this.url.host : await this.getServerHost();
    }

    async getServerHost(origin: string = this.url.origin) {
        const url = new URL(origin);
        url.pathname = '/ipl/app/flash/pig/game/casinoH5/GameAPI/FxDataApi.php';
        url.searchParams.set('gtype', this.gameType);
        url.searchParams.set('dm', location.host);
        return await fetch(url.href).then(res => res.json()).then(res => res.link).catch(err => location.host);
    }

    private mapingIPLLang() {
        const str = this.lang;

        if (str == 'th' || str == 'id' || str == 'es')
            return str;
        else if (str == 'vi' || str == 'vn')
            return 'vi';
        else if (str == 'zh-tw' || str == 'tw')
            return 'tw';
        else if (str == 'zh-cn' || str == 'ug' || str == 'cn')
            return 'cn';
        else if (str == 'ja' || str == 'jp')
            return 'ja';
        else if (str == 'ko' || str == 'kr')
            return 'kr';
        else
            return 'us';

    }

    private mapingRdaLang() {
        const str = this.lang;

        if (str == 'vi' || str == 'th' || str == 'id' || str == 'ja' || str == 'es')
            return str;
        else if (str == 'zh-tw' || str == 'tw')
            return 'zh-tw';
        else if (str == 'zh-cn' || str == 'ug' || str == 'cn')
            return 'zh-cn';
        else if (str == 'kr' || str == 'ko')
            return 'ko';
        else
            return 'en';
    }
}


export const URLParameter = new URLParameterClass();

