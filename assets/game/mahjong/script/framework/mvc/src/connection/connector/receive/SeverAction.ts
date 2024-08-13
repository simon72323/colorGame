import { updateJP } from '../data/Receive/updateJP';
import * as ReceiveData from "../data/Receive";

export enum ServerSendAction {
    Ready = 'ready',
    Login = 'onLogin',
    UpdateJP = 'updateJP',
    UpdateMarquee = 'updateMarquee',
    TakeMachine = 'onTakeMachine',
    LoadInfo = 'onOnLoadInfo2',
    FullMachine = 'onGetMachineList',
    GetMachineDetail = 'onGetMachineDetail',
    CreditExchange = 'onCreditExchange',
    BalanceExchange = 'onBalanceExchange',
    HitJackpot = 'onHitJackpot',
    BeginGame = 'onBeginGame',
    DoubleGame = 'onDoubleGame',
    EndGame = 'onEndGame',
    KeepMachineStatus = 'onKeepMachineStatus',
    MachineLeave = 'onMachineLeave',
}

export type Message<Action, Data> = {
    action: Action;
    result: {
        event: true;
        data: Data;
    } | {
        event: false;
        error?: string;
    };

};

export function isSeverError(message: any): boolean {
    //has event in result

    if (message.result?.event === false) {
        return true;
    }
    else if (message.result?.faultCode != null) {
        return true;
    }
    else {
        return false;
    }
}

export function GetErrorInfo(message: any) {


    let key: string = "";
    let id: string = "";
    if (isSeverError(message)) {


        if (message.result?.error) {
            key = message.result?.error;
            id = message.result?.error_code;
        }
        else if (message.result?.errCode) {
            key = message.result?.errCode;
            id = message.result?.ErrorID;
        }
        else if (message.result?.faultCode) {
            key = message.result?.faultCode;
            id = message.result?.faultString;
        }

    }
    return { key, id };
}


/**
 * event base 的 message
 */
export type CasinoSeverMessage<Action extends string = string, Data extends any = any> =
    [Data] extends [never] ? [{ action: Action; }] : Message<Action, Data>;
/**
 * result 沒有 event 的 message
 */
export type RawCasinoSeverMessage<Action extends string = string, Data extends any = any> = { action: Action, result: Data; };


export type BaseSeverEventMap = Record<string, any>;


/**
 * 針對 sever 送的訊息 轉換後的事件
 */
export interface ServerSendActionEventMap extends BaseSeverEventMap {
    [ServerSendAction.Ready]: [RawCasinoSeverMessage<ServerSendAction.Ready, never>];
    [ServerSendAction.Login]: [CasinoSeverMessage<ServerSendAction.Login, ReceiveData.onLogin>];
    [ServerSendAction.UpdateJP]: [RawCasinoSeverMessage<ServerSendAction.UpdateJP, ReceiveData.updateJP>];
    [ServerSendAction.UpdateMarquee]: [RawCasinoSeverMessage<ServerSendAction.UpdateMarquee, string>];
    [ServerSendAction.TakeMachine]: [CasinoSeverMessage<ServerSendAction.TakeMachine, ReceiveData.onTakeMachine>];
    [ServerSendAction.LoadInfo]: [CasinoSeverMessage<ServerSendAction.LoadInfo, ReceiveData.onLoadInfo>];
    [ServerSendAction.FullMachine]: [CasinoSeverMessage<ServerSendAction.FullMachine, any>];
    [ServerSendAction.GetMachineDetail]: [CasinoSeverMessage<ServerSendAction.GetMachineDetail, ReceiveData.onGetMachineDetail>];
    [ServerSendAction.CreditExchange]: [CasinoSeverMessage<ServerSendAction.CreditExchange, ReceiveData.onCreditExchange>];
    [ServerSendAction.BalanceExchange]: [CasinoSeverMessage<ServerSendAction.BalanceExchange, ReceiveData.onBalanceExchange>];
    [ServerSendAction.HitJackpot]: [CasinoSeverMessage<ServerSendAction.HitJackpot, ReceiveData.onHitJackpot>];
    [ServerSendAction.BeginGame]: [CasinoSeverMessage<ServerSendAction.BeginGame, ReceiveData.onBeginGame>];
    [ServerSendAction.DoubleGame]: [CasinoSeverMessage<ServerSendAction.DoubleGame, any>];
    [ServerSendAction.EndGame]: [CasinoSeverMessage<ServerSendAction.EndGame, any>];
    [ServerSendAction.KeepMachineStatus]: [CasinoSeverMessage<ServerSendAction.KeepMachineStatus, any>];
    [ServerSendAction.MachineLeave]: [CasinoSeverMessage<ServerSendAction.MachineLeave, any>];
};