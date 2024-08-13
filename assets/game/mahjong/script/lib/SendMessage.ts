export type BaseSendActionParams = Record<string, any>;

/**
 * 事件定義操作資料內容
 */
export interface ClientSenderActionParams extends BaseSendActionParams {
    [ClientSendAction.Login]: SendMessage.Login,
    [ClientSendAction.LoadInfo]: SendMessage.OnLoadInfo,
    [ClientSendAction.GetMachineDetail]: SendMessage.GetMachineDetail,
    [ClientSendAction.CreditExchange]: SendMessage.CreditExchange,
    [ClientSendAction.BalanceExchange]: SendMessage.BalanceExchange,
    [ClientSendAction.BeginGame]: SendMessage.BeginGame,
    [ClientSendAction.JoinGame]: SendMessage.JoinGame,
    [ClientSendAction.LeaveGame]: SendMessage.LeaveGame,
    [ClientSendAction.Exit]: SendMessage.Exit,
    [ClientSendAction.SaveUserAutoExchange]: SendMessage.SaveUserAutoExchange,
    [ClientSendAction.UpdateUserAnalysis]: SendMessage.UpdateUserAnalysis
}
/**
 * 事件定義操作資料內容
 */
export type ClientSenderMap = {
    [ClientSendAction.Login]: SendMessage.Login,
    [ClientSendAction.LoadInfo]: SendMessage.OnLoadInfo,
    [ClientSendAction.GetMachineDetail]: SendMessage.GetMachineDetail,
    [ClientSendAction.CreditExchange]: SendMessage.CreditExchange,
    [ClientSendAction.BalanceExchange]: SendMessage.BalanceExchange,
    [ClientSendAction.BeginGame]: SendMessage.BeginGame,
    [ClientSendAction.JoinGame]: SendMessage.JoinGame,
    [ClientSendAction.LeaveGame]: SendMessage.LeaveGame,
    [ClientSendAction.Exit]: SendMessage.Exit,
    [ClientSendAction.SaveUserAutoExchange]: SendMessage.SaveUserAutoExchange,
    [ClientSendAction.UpdateUserAnalysis]: SendMessage.UpdateUserAnalysis
}
/**
 * 伺服器操作相關事件
 */
export enum ClientSendAction {
    /** 登入 */
    Login = 'login',
    /** 使用者資訊 */
    LoadInfo = 'onLoadInfo',
    /** 取得機台資訊 */
    GetMachineDetail = 'getMachineDetail',
    /** 進行換分 */
    CreditExchange = 'creditExchange',
    /** 進行洗分 */
    BalanceExchange = 'balanceExchange',
    /** 進行下注 */
    BeginGame = 'beginGame',
    /** 離開機台 */
    Exit = 'exit',
    /** 進入遊戲 */
    JoinGame = 'joinGame',
    /** 離開遊戲 */
    LeaveGame = 'leaveGame',
    /** 紀錄換洗分面板操作 */
    SaveUserAutoExchange = 'saveUserAutoExchange',
    /** 更新按鈕操作記錄資料 */
    UpdateUserAnalysis = 'updateUserAnalysis',
    /** 佔機台 */
    TakeMachine = 'takeMachine'
}
export namespace SendMessage {


    export interface DevInfoInterface {
        /** 作業系統 */
        os: string;
        /** 官網解析度 */
        srs: string;
        /** 渲染解析度 */
        wrs: string;
        /** 渲染倍數 */
        dpr: number;
        /** ppi */
        pi?: string;
        /** 執行平台 */
        pf: string;
        /** 開發語言 */
        pl: string;
        /** 研發單位 */
        rd: string;
        /** 版面 */
        ui?: string;
        /** 是否為aio */
        aio: boolean | string;
        /** IP位址 */
        ip?: string;
        /** 是否為平板 */
        tablet: boolean | string;
        /** 顯示卡 */
        vga: string;
        /** 是否為webview */
        wv: boolean | string;
        /** client TimeStamp */
        cts: number;
        /** 裝置名稱(ex：ipad pro、iphone 6) */
        dtp: string;
        /** 裝置名稱(ex：url Mobile) */
        ua: string;
        /** aio userAgent(ex:"aio:1.1.1,game:2.2.2") */
        mua: string;
        /** 新aio的參數 */
        newaio: string;
        /** UB瀏覽器 */
        ub: string;
        /** 是否pwa */
        pwa: boolean | string;
        /** 寰宇通道加密ip */
        encodeIP?: string
    }
    export interface LoginData { 
        sid: string, 
        lang: string, 
        hallID?: string, 
        dInfo?: DevInfoInterface
    }
    export interface Login { 
        action: ClientSendAction.Login | 'login', 
        gameType: string, 
        data: LoginData
    }
    export interface OnLoadInfo {
        action: ClientSendAction.LoadInfo | 'onLoadInfo',
        gameType: string
    }
    export interface GetMachineDetail {
        action: ClientSendAction.GetMachineDetail | 'getMachineDetail',
        gameType: string
    }
    export interface CreditExchange {
        action: ClientSendAction.CreditExchange | 'creditExchange',
        gameType: string, 
        data: { 
            rate: string, 
            credit: number
        }
    }
    export interface BalanceExchange {
        action: ClientSendAction.BalanceExchange | 'balanceExchange',
        gameType: string
    }
    export interface BeginGame {
        action: ClientSendAction.BeginGame | 'beginGame',
        gameType: string,
        data: {
            betInfo: {
                BetCredit: number
            }
        }
    }
    export interface JoinGame {
        action: ClientSendAction.JoinGame | 'joinGame',
        gameType: string
    }
    export interface LeaveGame {
        action: ClientSendAction.LeaveGame | 'leaveGame',
        gameType: string
    }
    export interface Exit {
        action: ClientSendAction.Exit | 'exit',
        gameType: string
    }
    export interface SaveUserAutoExchange {
        action: ClientSendAction.SaveUserAutoExchange | 'saveUserAutoExchange',
        gameType: string, 
        data: { 
            autoEx: boolean, 
            autoValue: number, 
            autoRate: string, 
            lastInput: number[] 
        }, 
        exchangeRecord?: any
    }
    export interface UpdateUserAnalysis { 
        action: ClientSendAction.UpdateUserAnalysis | 'updateUserAnalysis',
        gameType: string, 
        data: any 
    }
    
}