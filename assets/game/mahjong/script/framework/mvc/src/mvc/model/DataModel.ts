import { URLParameter } from "../../../../share-tools";
import { JPType, WinJPType, updateJP } from "../../connection/connector/data/Receive";

export interface IfDataModel {

    credit: number;
    creditEnd: number;
    balance: number;

    line?: number;
    maxLine?: number;

    lineBet?: number;
    maxLineBet?: number;

    bet?: number;

    gameType: string;
    /** 機台編號 */
    gameCode?: string;
    userId?: string;

    /** 支援的比例列表 */
    base?: string;
    /** 目前的比例 */
    betBase?: string;
    /** 預設的比例 */
    defaultBase?: string;


    wagersID?: string;
    payoff?: number;
    cards?: any;
    lines?: any;
    scatter?: any;
    bonus?: any;
    freeGame?: any;
    freeTimes?: number;
    /** 目前四層彩金的數值 */
    jpValue?: updateJP;

    /** 可下注的金額列表 */
    creditList?: number[];
    /** 預設下注金額 */
    defaultBetCredit?: number;


    /** 泰國廳 專用tag 自動會在onOnLoadInfo 換好分數 , 後續不給換分 */
    noExchange?: boolean;
    /** server 預設自動換分 */
    autoExchange?: boolean;
    /** 使用的幣別 */
    currency: string;

    marquee?: string;

    washInfo?: {
        transCredit: number;
        amount: number;
    };




}


export class DataModel implements IfDataModel {

    static BaseToRatio(base: string): number {
        return base.split(':')
            .map((s) => {
                return s.includes('K') ? parseFloat(s.replace('K', '')) * 1000 : parseFloat(s);
            })
            .reduce((numerator, denominator) => numerator / denominator);
    }
    credit: number = 0;
    creditEnd: number = 0;
    balance: number = 0;

    line?: number;
    maxLine?: number;

    lineBet?: number;
    maxLineBet?: number;

    bet?: number;

    gameType: string;
    /** 機台編號 */
    gameCode?: string;
    userId?: string;

    /** 支援的比例列表 */
    base?: string;
    /** 目前的比例 */
    betBase?: string;
    /** 預設的比例 */
    defaultBase?: string;


    wagersID?: string;
    payoff?: number;
    cards?: any;
    lines?: any;
    scatter?: any;
    bonus?: any;
    freeGame?: any;
    freeTimes?: number;
    /** 目前四層彩金的數值 */
    jpValue?: updateJP;

    /** 可下注的金額列表 */
    creditList?: number[];
    /** 預設下注金額 */
    defaultBetCredit?: number;


    /** 泰國廳 專用tag 自動會在onOnLoadInfo 換好分數 , 後續不給換分 */
    noExchange?: boolean;
    /** server 預設自動換分 */
    autoExchange?: boolean;
    /** 使用的幣別 */
    currency: string = "";

    isCash: boolean = false;
    loginName: string = "";

    sid: string = "";

    winJPType: WinJPType = JPType.None;
    winJPAmount: number = 0;

    washInfo?: {
        transCredit: number;
        amount: number;
    };

    marquee?: string;

    constructor() {
        this.sid = URLParameter.sid ?? this.sid;
        this.gameType = URLParameter.gameType;
    }

}