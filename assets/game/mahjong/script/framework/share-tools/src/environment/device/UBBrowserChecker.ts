/**
 * ## 如何判斷是否為客製化瀏覽器
  - 若 User-Agent 中包含 CustomBrowserAndroid 為客製化瀏覽器 Android 版
        > 範例：<br/>
        > Android：Mozilla/5.0 (Linux; Android 7.0; vivo Y69A Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 UBiOS/28.0.51.37 UBAndroid/28.0.51.37 Mobile Safari/537.36 CustomBrowserAndroid/dt3epsvgem
  	
  - 目前客製化瀏覽器僅提供 Android 版，尚無桌面版或 iOS 版本。
 */

/**
 # 寰宇瀏覽器簡易判斷方式 v1.0 (2018.07.19)

## 如何判斷是否為寰宇瀏覽器
  - 若 User-Agent 中包含 UB/\*.\*.\*.\* 或 UBiOS/\*.\*.\*.\* 為寰宇瀏覽器
  - 若 User-Agent 中包含 UB/\*.\*.\*.\* 與 Chrome/\*.\*.\*.\* 為寰宇瀏覽器桌面版
  - 若 User-Agent 中包含 UBiOS/\*.\*.\*.\* 為寰宇瀏覽器行動版
        - 若 User-Agent 中包含 UBiOS/\*.\*.\*.\* 與 Chrome/\*.\*.\*.\* 為寰宇瀏覽器 android 版
        - 若 User-Agent 只包含 UBiOS/\*.\*.\*.\* 為寰宇瀏覽器 iOS 版

## 特性部分
  - 桌面版與 android 版, 瀏覽器對於網頁支援度與 User-Agent 中 Chrome/\*.\*.\*.\* 版本大致上相同
  - iOS 版, 瀏覽器對於網頁支援度與 iOS 自帶的 Safari 版本大致上相同

====================================
     寰宇瀏監器判斷 User - Agent 的方式

      寰宇：參考文件 連結

若 User - Agent 中包含 UB / * . * . * . * 與 Chrome / * . * . * . * 為寰宇瀏覽器桌面版

      Platform = 0 (PC)

      Portal = 6 or 7，遊戲商須加判為 PC 版頁面或行動裝置網頁版頁面，再帶入正確的 Portal 參數

若 User - Agent 中包含 UBiOS / * . * . * . * 與 Chrome / * . * . * . * 為寰宇瀏覽器 android 版

      Platform = 3 (Android手機)

      Portal = 6 or 7，遊戲商須加判為 PC 版頁面或行動裝置網頁版頁面，再帶入正確的 Portal 參數

若 User - Agent 只包含 UBiOS / * . * . * . * 為寰宇瀏覽器 iOS 版

      Platform = 2 (iOS手機)

      Portal = 6 or 7，遊戲商須加判為 PC 版頁面或行動裝置網頁版頁面，再帶入正確的 Portal 參數

寰宇客製化：參考文件 連結

若 User - Agent 中包含 CustomBrowserAndroid 為客製化瀏覽器 Android 版

      Platform = 3 (Android手機)

      Portal = 8 or 9，遊戲商須加判為 PC 版頁面或行動裝置網頁版頁面，再帶入正確的 Portal 參數

非 AIO 且非 UB 的其他情況：

遊戲商自行判斷 Portal 為 PC 版頁面或行動裝置網頁版頁面或 PWA 以及使用的 Platform 為何

PWA 判斷方式：連結



https://vgjira.atlassian.net/wiki/spaces/SR/pages/36438275/Portal+Client+Platform
 */


export class UBBrowserChecker {

    private userAgent: string;

    constructor(userAgent: string = window.navigator.userAgent) {
        this.userAgent = userAgent;
    }

    private getApplicationVersion(applicationName: string) {
        // 檢查 User-Agent 是否帶有 {applictaionName}/*.*.*.* 字樣
        const matchExpression = new RegExp(applicationName + '\/(([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+))', 'i');
        return this.userAgent.match(matchExpression);
    }

    private generateBrowserDetail(applicationName: string) {
        var applicationVersion = this.getApplicationVersion(applicationName);

        if (!applicationVersion) {
            return undefined;
        }
        return {
            queryName: applicationName,
            version: {
                full: applicationVersion[1],
                major: applicationVersion[2],
                minor: applicationVersion[3],
                patch: applicationVersion[4],
                build: applicationVersion[5]
            }
        };

    }

    get ubInfo() { return this.generateBrowserDetail('ub'); }
    get ubMobileInfo() { return this.generateBrowserDetail('ubios'); }
    get chromeInfo() { return this.generateBrowserDetail('chrome'); }

    get customBrowserInfo() {
        const pattern: RegExp = /CustomBrowserAndroid\/(\w+)/;
        const match = pattern.exec(this.userAgent);
        if (match) {
            return match[1];
        } else {
            return undefined;
        }

    }


    get UniverseBrowser() {
        // 若 User-Agent 中包含 UB/\*.\*.\*.\* 或 UBiOS/\*.\*.\*.\* 為寰宇瀏覽器
        if (this.ubInfo || this.ubMobileInfo) {
            return true;
        }
        return false;
    }
    get baseOnChrome() {
        // 若 User-Agent 中包含 Chrome/\*.\*.\*.\* 表示是特性與此版本的 Chrome 雷同
        if (this.chromeInfo) {
            return true;
        }
        return false;
    }

    get UniverseBrowserMobileVersion() {
        if (this.UniverseBrowser && this.ubMobileInfo) {
            return true;
        }
        return false;
    }

    get universeBrowserPlatform() {
        if (!this.UniverseBrowser) {
            return undefined;
        }

        if (this.chromeInfo && !this.ubMobileInfo) {
            return 'Desktop';
        }

        if (this.chromeInfo && this.ubMobileInfo) {
            return 'Android';
        }

        return "iOS";
    }
}