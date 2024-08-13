import { onBalanceExchange, onGetMachineDetail, onHitJackpot, onLoadInfo, onTakeMachine } from "../include";
export type BaseSeverEventMap = Record<string, any>;

export interface ClientRecvEventMap extends BaseSeverEventMap {
    [ClientRecvAction.Ready]: [RecvMessage.Ready]
    [ClientRecvAction.Login]: [RecvMessage.LoginMessage],
    [ClientRecvAction.UpdateMarquee]: [RecvMessage.UpdateMarqueeMessage],
    [ClientRecvAction.TakeMachine]: [RecvMessage.TakeMachineMessage],
    [ClientRecvAction.LoadInfo]: [RecvMessage.LoadInfoMessage],
    [ClientRecvAction.GetMachineDetail]: [RecvMessage.GetMachineDetailMessage],
    [ClientRecvAction.BalanceExchange]: [RecvMessage.BalanceExchangeMessage],
    [ClientRecvAction.CreditExchange]: [RecvMessage.CreditExchangeMessage],
    [ClientRecvAction.BeginGame]: [RecvMessage.BeginGameMessage],
    [ClientRecvAction.HitJackpot]: [RecvMessage.HitJackpotMessage],
    [ClientRecvAction.MachineLeave]: [RecvMessage.MachineLeaveMessage],
    [ClientRecvAction.Exit]: [RecvMessage.ExitMessage],
    [ClientRecvAction.Error]: [RecvMessage.ErrorMessage]
}
/**
 * 泛型: 定義Recvice資料內容
 * 預設參數 { action: T, event: boolean, gameType?:string }
 */ 
export type RecvEventMassage<T extends keyof ClientRecvEventMap> = { action: T, event: boolean, gameType?: string } & (ClientRecvEventMap[T] extends Record<string, any> ? ClientRecvEventMap[T] : {}) | null;

export enum ClientRecvAction {
    WSOpen              = 'open',
    WSClose             = 'close',
    WSError             = 'error',
    Ready               = 'ready',
    Login               = 'login',
    UpdateJP            = 'updateJP',
    UpdateMarquee       = 'updateMarquee',
    TakeMachine         = 'takeMachine',
    LoadInfo            = 'onLoadInfo',
    GetMachineDetail    = 'getMachineDetail',
    CreditExchange      = 'creditExchange',
    BalanceExchange     = 'balanceExchange',
    HitJackpot          = 'onHitJackpot',
    BeginGame           = 'beginGame',
    JoinGame            = 'joinGame',
    LeaveGame           = 'leaveGame',
    MachineLeave        = 'machineLeave',
    Exit                = 'exit',
    Error               = 'error',
    SaveUserAutoExchange = 'saveUserAutoExchange',
    UpdateUserAnalysis = 'updateUserAnalysis',
}

export namespace RecvMessage {
    export interface WSOpen {
        event: boolean;
    }
    export interface WSClose {
        event: boolean;
        data: {
            code: number;
            reason: string;
        }
    }
    export interface WSError {
        event: boolean;
        data: {
            code: number;
            reason: string;
        }
    }
    export interface Ready {
        action: ClientRecvAction.Ready | 'ready';
        data: ReadyData
    }
    export interface ReadyData {
        /** 伺服器timestamp */
        ts: number;
        /** 服務版本 */
        version: string;
    }
    /** 錯誤訊息 */
    export interface ErrorMessage {
        action: string;
        event: boolean;
        error?: string;
        errCode?: number;
        /** 舊版API會回傳這個 */
        ErrorID?: string;
        data: ErrorMessageData;
    }
    export interface ErrorMessageData {
        error?: string;
        errCode?: number;
        /** 舊版API會回傳這個 */
        ErrorID?: string;
        event: boolean;
        result: string;
    }
    export interface LoginData {
        UserID: number,
        Sid: string,
        HallID: string,
        GameID: number,
        COID: number,
        Test: number,
        ExchangeRate: number,
        IP: string
    };
    export interface LoginMessage {
        action: ClientRecvAction.Login | 'login';
        event: boolean;
        gameType: string;
        data: LoginData;
    }
    export interface UpdateJPMessage {
        action: ClientRecvAction.UpdateJP | 'updateJP';
        data: number[]
    }
    export interface UpdateMarqueeMessage {
        action: ClientRecvAction.UpdateMarquee | 'updateMarquee';
        data: string;
    }
    export interface TakeMachineData {
        event: boolean;
        GameCode: number;
    }
    export interface TakeMachineMessage {
        action: ClientRecvAction.TakeMachine | 'takeMachine';
        event: boolean;
        gameType: string;
        data: TakeMachineData
    }
    export interface LoadInfoData {
        event: boolean;
        Currency?: string;
        UserID?: number;
        Balance: number;
        Base: string;
        DefaultBase: string;
        AxisCards?: string[];
        AxisLocation?: string;
        ExchangeRate?: number;
        LoginName: string;
        HallID?: number;
        AutoExchange?: boolean;
        Test?: boolean;
        Credit: number;
        BetBase: string;
        WagersID: number;
        noExchange?: boolean;
        BetCreditList?: number[];
        DefaultBetCredit?: number | string;
        LevelList?: number[];
        BetEachLevel?: number;
        isCash?: boolean;
        userSetting?: any;
        SingleBet: number;
        UserName?: string;
    }
    export interface LoadInfoMessage {
        action: ClientRecvAction.LoadInfo | 'onLoadInfo';
        event: boolean;
        gameType: string;
        data: LoadInfoData;
    }
    export interface GetMachineDetailData {
        event: boolean,
        Balance: number,
        Base: string,
        BetBase: "",
        Credit: 0,
        Currency: string,
        DefaultBase: string,
        ExchangeRate: number,
        HallID: number,
        LoginName: string,
        Test: boolean,
        UserID: number,
        WagersID: number,
    }
    export interface GetMachineDetailMessage {
        action: ClientRecvAction.GetMachineDetail | 'getMachineDetail';
        event: boolean;
        gameType: string;
        data: GetMachineDetailData
    }
    export type CreditExchangeData = {
        Balance: number,
        BetBase: string,
        Credit: number,
        event: boolean
    }
    export interface CreditExchangeMessage {
        action: ClientRecvAction.CreditExchange | 'creditExchange';
        event: boolean;
        gameType: string;
        data: CreditExchangeData;
    }
    export type BalanceExchangeData = {
        event: boolean,
        Amount: number,
        Balance: number,
        BetBase: string,
        ErrorID?: number,
        TransCredit: number
    };
    export interface BalanceExchangeMessage {
        action: ClientRecvAction.BalanceExchange | 'balanceExchange';
        event: boolean;
        gameType: string;
        data: BalanceExchangeData
    }
    export interface HitJackpotData extends onHitJackpot {
        TicketNo: string;
        beginGameResult: BeginGameData
    }
    export interface HitJackpotMessage {
        action: ClientRecvAction.HitJackpot | 'onHitJackpot';
        event: boolean;
        gameType: string;
        data: HitJackpotData
    }
    export interface BeginGameMessage {
        action: ClientRecvAction.BeginGame | 'beginGame';
        event: boolean;
        gameType: string;
        data: BeginGameData
    }
    export type BeginGameData = MahjongBeginGameData | IBeginGameData;
    // 一定會有的參數
    export interface IBeginGameData {
        event: boolean;
        WagersID: number;
        BetInfo: any;
        Credit: number;
        Credit_End: string;
        BetTotal: number;
        PayTotal: number;
        BBJackpot: {
            Pools: any[] | null
        } | null
    }
    export interface MahjongPhaseLine { 
        ElementID: number, 
        GridNum: number, 
        Grids: string, 
        Payoff: number 
    }
    export interface MahjongFreeGame {
        HitFree: boolean;
        ElementID: number;
        GridNum: number;
        FreeGameTime: number;
        Round: number;
        Grids: number[];
    }
    // 每層彩池資料
    export type BBJackpotPool = {
        PoolID: string,
        JPTypeID: number,
        PoolAmount: number,
        timestamp?: number
    }
    // 中獎彩池資料
    export type BBJackpotData = {
        JPEnable: boolean,
        JPTypeID: number,
        Payoff: number,
        JPWin: boolean,
        //福祿壽系例小遊戲參數
        JPGame?: string,
        //彩池
        Pools: BBJackpotPool[]
    }
    // 結算資料
    export interface PayTypeData { 
        Type?: number[],
        TailNum: number[],
        EyeCard: number,
        TotalTai: number,
        WinCard?: number
    };

    export interface MahjongFreeGameSpin {
        FreeGameTime: number,
        WagersID: number
        FreeGamePayoffTotal: number
    }
    /** 碰碰胡遊戲資料 */
    export interface MahjongBeginGameData {
        PayTotal: number;
        // 每局Lines Phase
        Lines: MahjongPhaseLine[][];
        // 每一列Card SymbolId
        Cards: number[][];
        // 結算資料
        PayType: PayTypeData;
        // 免費遊戲次數
        FreeGameSpin: MahjongFreeGameSpin;
        // 免費遊戲Scatter
        FreeGame: MahjongFreeGame[];
        // skip
        AxisLocation: string;
        // 彩池
        BBJackpot?: BBJackpotData;
        // 局號
        WagersID: number;
        // skip
        Status: number;
        // skip
        HitWagersID: number;
        Credit: number;
        Credit_End: number;
        BetTotal: number;
    }

    export interface JoinGameMessage {
        action: ClientRecvAction.JoinGame | 'joinGame';
        event: boolean;
        messsage: string;
    }
    export interface LeaveGameMessage {
        action: ClientRecvAction.LeaveGame | 'leaveGame';
        event: boolean;
        messsage: string;
    }
    export interface MachineLeaveData {
        event: boolean
    }
    export interface MachineLeaveMessage {
        action: ClientRecvAction.MachineLeave | 'machineLeave';
        event: boolean;
        gameType: string;
        data: MachineLeaveData;
    }
    export interface ExitMessage {
        action: ClientRecvAction.Exit | 'exit';
        event: boolean;
        gameType: string;
        data: {
            event: boolean
        };
    }
}