/*
 * @Author: penguin_jan 
 * @Date: 2020-11-30 11:37:03 
 * @Last Modified by: penguin_jan
 * @Last Modified time: 2022-12-22 17:32:22
 * 
 * function.js 的定義檔案
 */


interface Window {
    /** 研三提供給廳主自訂的離開用function */
    leaveFunction(): void

    /** 回到大廳頁面 */
    gobacklobby(obj: { /** 機率:5 視訊:3  捕魚:30*/gamekind: number }): void

    /** webgl 檢查頁面 */
    checkWebGL(): void

    /** 存款頁面 */
    DepositUrl(obj: { sid: string, lang: string, /** timestamp string*/vnd: string }): void

    SessionID: string;

    FxAdr: string;

    /** go+ 橫版loading 圖 url */
    LogoUrlPC?: string;

    /** go+ 直版loading 圖 url */
    LogoUrlMobile?: string;

    ExitOption?: 0 | 1 | 2 | 3;
}


