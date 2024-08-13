
export enum ClientSendAction {
    Login = 'loginBySid',
    LoadInfo = 'onLoadInfo2',
    GetMachineDetail = 'getMachineDetail',
    CreditExchange = 'creditExchange',
    BalanceExchange = 'balanceExchange',

    BeginGame = 'beginGame',
    BeginGame2 = 'beginGame2',
    BeginGame3 = 'beginGame3',
    BeginGame4 = 'beginGame4',

    EndGame = 'endGame',

    DoubleGame = 'doubleGame',

    HitFree = 'hitFree',

    LeaveMachine = 'leaveMachine',
    UpdateUserAnalysis = 'updateUserAnalysis',
    SaveUserAutoExchange = 'saveUserAutoExchange',
}

export type BaseSendActionParams = Record<string, any>;

export interface ClientSendActionParams extends BaseSendActionParams {
    [ClientSendAction.Login]: {
        sid: string,
        gtype: string;
        lang: string;
        dInfo: any;
        HallID?: number;
        UserID?: number;
    },
    [ClientSendAction.LoadInfo]: never,
    [ClientSendAction.GetMachineDetail]: never,
    [ClientSendAction.CreditExchange]: { rate: string, credit: string; },
    [ClientSendAction.BalanceExchange]: never;
    [ClientSendAction.BeginGame]: {
        sid: string,
        betBase: string,
        line: string,
        lineBet: number,
        lang: string,
    },
    [ClientSendAction.BeginGame2]: {

        line: number,
        lineBet: number,
    },
    [ClientSendAction.BeginGame3]: {
        betInfo: any;
    },
    [ClientSendAction.BeginGame4]: {
        betInfo: any;
    },
    [ClientSendAction.DoubleGame]: {
        wagersID: string;
    },
    [ClientSendAction.EndGame]: {
        wagersID: string;
        sid: string;
    };
    [ClientSendAction.HitFree]: {
        sid: string;
        warpersID: string;
        itemID?: number;
    },
    [ClientSendAction.LeaveMachine]: never;
    [ClientSendAction.UpdateUserAnalysis]: { data: any; },
    [ClientSendAction.SaveUserAutoExchange]: {
        rec: any;
    };
}

