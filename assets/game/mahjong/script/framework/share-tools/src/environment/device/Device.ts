import UAParser from 'ua-parser-js';
import { URLParameter } from '../url/URLParameter';
import { UBBrowserChecker } from './UBBrowserChecker';

export type DeviceInfo = {
    rd: string,
    os: string,         // os版本
    ua: string,         // navigator.userAgent
    // rs: { w: number, h: number },//---解析度
    srs: string,        // 螢幕的解析度
    wrs: string,        // window的寬高
    dpr: number,        // devicePiexlRatio
    pl: string,         // 程式語言
    pf: string,         // 瀏覽器版本
    wv: string,         // 是否使用webview
    aio: boolean,       // 是否由AIO進來
    vga: string,        // 顯卡資訊
    tablet: boolean,    // 是否為平板
    cts: number,
    mua: string,        // aio版本 ex:aio:1.0.8,phone:true
    dtp: string,        // aio檢測裝置名稱  ex:LYA-AL00
    newaio: string,     // 新aio參數
    ub: string,         // UB資訊
    pwa: boolean;        // 是否為PWA
    encodeIP?: string;    // Client IP 加密
};
export interface IDevice {
    ua_parser: UAParser.IResult;
    readonly mobile: boolean;
    readonly iOS: boolean;
    readonly android: boolean;
    readonly windows: boolean;
    readonly mac: boolean;
    readonly linux: boolean;
    readonly windowsPhone: boolean;
    readonly windowsTablet: boolean;

    readonly opera: boolean;
    readonly firefox: boolean;
    readonly safari: boolean;
    readonly ie: boolean;
    readonly edge: boolean;
    readonly chrome: boolean;

    readonly aio: boolean;
    readonly screenResolution: string;
    readonly windowResolution: string;
    readonly gpuInfo: string;
}

function uaSlashObject(ua: string) {
    const keyValuePairs = ua?.split(' ').map((pair) => pair.split('/'));
    const userAgentObject: Record<string, string> = {};

    for (const [key, value] of keyValuePairs) {
        userAgentObject[key] = value;
    }
    return userAgentObject;

}


export class DeviceClass implements IDevice {

    ua_parser: UAParser.IResult;

    ubBrowser: UBBrowserChecker;

    uaSlashObject: Record<string, string>;


    constructor(ua: string = window.navigator.userAgent) {
        this.ua = ua;
    }

    set ua(ua: string) {
        this.ua_parser = new UAParser(ua).getResult();
        this.ubBrowser = new UBBrowserChecker(ua);
        this.uaSlashObject = uaSlashObject(ua);
    }


    get mobile() { return this.ua_parser.device.type != undefined; }
    get tablet() { return this.ua_parser.device.type === 'tablet'; }
    get iOS() { return this.ua_parser.os.name === 'iOS'; }
    get android() { return this.ua_parser.os.name === 'Android'; }
    get windows() { return this.ua_parser.os.name === 'Windows'; }
    get mac() { return this.ua_parser.os.name === 'Mac OS'; }
    get linux() { return this.ua_parser.os.name === 'Linux'; }
    get windowsPhone() { return this.ua_parser.os.name === 'Windows Phone'; }
    get windowsTablet() { return this.ua_parser.os.name === 'Windows Tablet'; }
    get deviceType() {
        if (this.iOS) { return 'iOS'; }
        if (this.android) { return 'Android'; }
        if (this.windowsPhone) { return 'WindowsPhone'; }
        if (this.windowsTablet) { return 'WindowsTablet'; }
        return 'Desktop';
    }


    // -----broswer
    get opera() { return this.ua_parser.browser.name === 'Opera'; }
    get firefox() { return this.ua_parser.browser.name === 'Firefox'; }
    get safari() { return this.ua_parser.browser.name === 'Safari'; }
    get ie() { return this.ua_parser.browser.name === 'IE'; }
    get edge() { return this.ua_parser.browser.name === 'Edge'; }
    get chrome() { return this.ua_parser.browser.name === 'Chrome'; }
    //-----------------------  公司內部使用  -----------------------
    get pwa() {
        if ('standalone' in window.navigator && window.navigator['standalone']) {
            return true;
        }
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }
        return false;
    }
    get aio() { return URLParameter.platform == 'aio'; }
    get screenResolution() { return `${window.screen.width}x${window.screen.height}`; }
    get windowResolution() { return `${window.innerWidth}x${window.innerHeight}`; }
    get gpuInfo() {
        let gl = document.createElement('canvas')?.getContext('webgl');
        let debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            return renderer || "";
        }
        return "";
    }
    get encodeIP() {
        return this.uaSlashObject['HTTP_BB_FORWARDED'] || "";
    }
    get webview() {
        if (this.iOS) {
            return /safari/.test(this.ua_parser.ua);
        }
        else if (this.android) {
            return /wv/.test(this.ua_parser.ua);
        }
        return false;
    }
    //--------------------------------------------------------------


    get wvString() {
        if (this.iOS || this.android) {
            const keywordIS = this.webview ? 'is' : 'isnot';
            const keywordDevice = this.iOS ? 'iOS' : 'Android';
            return `${keywordIS}_${keywordDevice}Webview`;
        }
        return 'false';
    }

    get ubInfo() {
        let ub = '';
        if (this.ubBrowser.UniverseBrowser) {
            const keyword = ['Chrome', 'UB', 'CustomBrowser'];
            for (let key in this.uaSlashObject) {
                if (keyword.includes(key)) {
                    const info = `${key}/${this.uaSlashObject[key]}`;
                    if (!ub) {
                        ub = info;
                    } else {
                        ub = `${ub} ${info}`;
                    }
                }
            }
        }
        return ub;
    }
    get newaio() {
        // 檢查 User - Agent 裡是否有 game _ platform 參數，有即為 AIO 開啟
        // User - Agent 範例：
        // Mozilla / 5.0 (iPhone ; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit / 537.36 ( KHTML , like Gecki ) game_portal / 3 game_platform / 2
        // Portal = game_portal
        // 3 (AIO 共用版)
        // 4 (AIO 客製化)
        // Platform = game_platform
        // 2 (iOS 手機)
        // 4 (Android 手機)
        let newaio = '';
        if (this.aio) {
            const game_portal = this.uaSlashObject['game_portal'] || "";
            const game_platform = this.uaSlashObject['game_platform'] || "";
            newaio = `${game_portal} ${game_platform}`;
        }
        return newaio;
    }


    deviceInfo() {
        let o: DeviceInfo = {
            rd: 'fx',
            ua: this.ua_parser.ua,
            os: `${this.ua_parser.os.name} ${this.ua_parser.os.version}`,
            srs: this.screenResolution,
            wrs: this.windowResolution,
            dpr: devicePixelRatio,
            pf: `${this.ua_parser.browser.name} ${this.ua_parser.browser.version}`?.replace(/\"/g, ''),
            pl: 'H5',
            wv: this.wvString,
            aio: this.aio,
            vga: this.gpuInfo || "",
            tablet: this.ua_parser.device.type === 'tablet',
            cts: Date.now(),
            mua: URLParameter.mua,
            dtp: URLParameter.dtp,
            newaio: this.newaio,
            ub: this.ubInfo,
            pwa: this.pwa,
        };

        if (this.encodeIP) o['encodeIP'] = this.encodeIP;

        return o;
    }
}


export const Device = new DeviceClass();