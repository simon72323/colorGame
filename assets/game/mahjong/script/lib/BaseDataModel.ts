import { DataModel } from "../include";
import { nanoid } from "nanoid";

export type UserAutoExchange = {
    // 是否打開自動換分
    IsAuto: boolean,
    // 自換分分數
    Credit: number,
    // 自動換分比例
    BetBase: string,
    // 手動輸入歷史紀錄
    Record: number[]
}

export class BaseDataModel extends DataModel {
    public reqCounter: number = 0;
    // 進入遊戲
    public isJoinGame: boolean = false;

    public uuid: string = '';

    public lang: string = "";
    /** 使用者自動換分資訊 */
    public userAutoExchange: UserAutoExchange = null;
    /** 更新快速換分按鈕 */
    public quickExBarValues: string[] = ['100', '500', '-1'];

    get requestId(): string { 
        // return `${this.uuid}/${nanoid(12)}`;
        return `${this.uuid}/${++this.reqCounter}`;
     }

    public connected: boolean = false;

    public isExit:boolean = false;
    
    public demo: boolean;

    public playtime: number;

    public sessionID: string;

    public startTime: number = 0;
    
    public stopTime: number = 0;

    get timePlayed(): number {
        if (this.startTime === 0) return 0;
        return this.stopTime - this.startTime;
    }

    public secret: string = '';

    constructor() {
        super();

        this.demo = (parent["Demo"] == true);

        this.playtime = (typeof parent["playtime"] == "string") ? Number(parent["playtime"]) : 0;

        this.sessionID = (parent['SessionID'] ? parent['SessionID'] : '');

    }
}

export interface AnalysisMetricData {
    // 自動點擊次數
    autoTimes?: Record<number, number>;
    // 每局下注行為
    beginGameCount?: Record<number, number>;
    // 換分
    exchange?: number[];
    // 押注“＋”
    betPlus?: number;
    // 押注“-”
    betMinus?: number;
    // 押注選單
    betOption?: number;
    //快速旋轉， 0:未設定， 1:沒跳 <-- 手動設定turbo， 2:跳了按確定， 3:跳了按取消， 4:跳了沒按
    turboOption?: number;
    // 遊戲功能”?”
    uiHelp?: number;
    // 內層漢堡JP按鈕
    innerJP?: number;
    // 外層JP按鈕
    outterJP?: number;
    // 外層換分按鈕
    innerEx?: number;
    // 內層漢堡換分按鈕
    outterEx?: number;
    // 漢堡展開按鈕
    burgerMenu?: number;
    // 下注紀錄按鈕
    betRecordBtn?: number;
    // 規則說明按鈕
    ruleBtn?: number;
    // 設定頁面按鈕
    settingBtn?: number;
    // 靜音按鈕（只記錄一次）
    muteBtn?: number;
    // 音樂按鈕（只記錄一次）
    musicBtn?: number;
    // 離開按鈕
    exitBtn?: number;

    //踩地雷專用 ，自動模式 止盈 止損統計
    advancedSettings_confirm?: {
        //止損
        stopLoss: number,
        //止盈
        takeProfit: number,
        //自動次數
        autoTimes: number;
    }[];
}