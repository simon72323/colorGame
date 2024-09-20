
/**
 * 伺服器發送動作枚舉
 * 定義了伺服器可能發送給客戶端的各種動作類型
 */
export enum ServerSendAction {
    Ready = 'ready', // 準備就緒
    Login = 'onLogin', // 登入
    UpdateJP = 'updateJP', // 更新獎金池
    UpdateMarquee = 'updateMarquee', // 更新跑馬燈
    TakeMachine = 'onTakeMachine', // 佔用機器
    LoadInfo = 'onOnLoadInfo2', // 載入訊息
    FullMachine = 'onGetMachineList', // 取得完整機器列表
    GetMachineDetail = 'onGetMachineDetail', // 取得機器詳情
    CreditExchange = 'onCreditExchange', // 信用點兌換
    BalanceExchange = 'onBalanceExchange', // 餘額兌換
    HitJackpot = 'onHitJackpot', // 中大獎
    BeginGame = 'onBeginGame', // 開始遊戲
    DoubleGame = 'onDoubleGame', // 雙倍遊戲
    EndGame = 'onEndGame', // 結束遊戲
    KeepMachineStatus = 'onKeepMachineStatus', // 保持機器狀態
    MachineLeave = 'onMachineLeave', // 離開機器
}

/**
 * 定義伺服器訊息的類型
 * @template Action 動作類型
 * @template Data 資料類型
 */
export type Message<Action, Data> = {
    action: Action; // 服務器執行的動作
    result: {
        event: true; // 表示操作成功
        data: Data; // 成功時傳回的數據
    } | {
        event: false; // 表示操作失敗
        error?: string; // 可選的錯誤訊息
    };
};

// /**
//  * 判斷伺服器訊息是否為錯誤
//  * @param message 伺服器訊息
//  * @returns 如果是錯誤則回傳true，否則回傳false
//  */
// export function isSeverError(message: any): boolean {
//     // 檢查是否有event字段
//     if (message.result?.event === false)
//         return true;
//     // 檢查result中是否存在faultCode字段
//     else if (message.result?.faultCode != null)
//         return true;
//     else
//         return false;//無錯誤
// }

// /**
//  * 取得錯誤訊息
//  * @param message 伺服器訊息
//  * @returns 包含錯誤鍵和ID的對象
//  */
// export function GetErrorInfo(message: any) {
//     let key: string = "";
//     let id: string = "";
//     if (isSeverError(message)) {
//         // 根據不同的錯誤格式提取錯誤訊息
//         if (message.result?.error) {
//             key = message.result?.error;
//             id = message.result?.error_code;
//         }
//         else if (message.result?.errCode) {
//             key = message.result?.errCode;
//             id = message.result?.ErrorID;
//         }
//         else if (message.result?.faultCode) {
//             key = message.result?.faultCode;
//             id = message.result?.faultString;
//         }
//     }
//     return { key, id };
// }

// /**
//  * 基於事件的訊息類型
//  * 如果Data類型為never，則傳回只包含action的物件數組
//  * 否則返回完整的Message類型
//  */
// export type CasinoSeverMessage<Action extends string = string, Data extends any = any> =
//     [Data] extends [never] ? [{ action: Action; }] : Message<Action, Data>;

// /**
//  * 原始的賭場伺服器訊息類型
//  * 適用於result中沒有event欄位的訊息
//  */
// export type RawCasinoSeverMessage<Action extends string = string, Data extends any = any> = { action: Action, result: Data; };

// /**
//  * 基礎伺服器事件映射類型
//  * 定義了一個可以儲存任意字串鍵和任意值的記錄類型
//  */
// export type BaseSeverEventMap = Record<string, any>;

/**
 * 針對伺服器發送的訊息轉換後的事件映射
 * 定義了各種伺服器動作對應的訊息類型
 */
// export interface ServerSendActionEventMap extends BaseSeverEventMap {
//     [ServerSendAction.Ready]: [RawCasinoSeverMessage<ServerSendAction.Ready, never>]; // 準備就緒
//     [ServerSendAction.Login]: [CasinoSeverMessage<ServerSendAction.Login, ReceiveData.onLogin>]; // 登入
//     [ServerSendAction.UpdateJP]: [RawCasinoSeverMessage<ServerSendAction.UpdateJP, ReceiveData.updateJP>]; // 更新獎池
//     [ServerSendAction.UpdateMarquee]: [RawCasinoSeverMessage<ServerSendAction.UpdateMarquee, string>]; // 更新跑馬燈
//     [ServerSendAction.TakeMachine]: [CasinoSeverMessage<ServerSendAction.TakeMachine, ReceiveData.onTakeMachine>]; // 佔用機器
//     [ServerSendAction.LoadInfo]: [CasinoSeverMessage<ServerSendAction.LoadInfo, ReceiveData.onLoadInfo>]; // 載入訊息
//     [ServerSendAction.FullMachine]: [CasinoSeverMessage<ServerSendAction.FullMachine, any>]; // 取得完整機器列表
//     [ServerSendAction.GetMachineDetail]: [CasinoSeverMessage<ServerSendAction.GetMachineDetail, ReceiveData.onGetMachineDetail>]; // 取得機器詳情
//     [ServerSendAction.CreditExchange]: [CasinoSeverMessage<ServerSendAction.CreditExchange, ReceiveData.onCreditExchange>]; // 信用點兌換
//     [ServerSendAction.BalanceExchange]: [CasinoSeverMessage<ServerSendAction.BalanceExchange, ReceiveData.onBalanceExchange>]; // 餘額兌換
//     [ServerSendAction.HitJackpot]: [CasinoSeverMessage<ServerSendAction.HitJackpot, ReceiveData.onHitJackpot>]; // 中大獎
//     [ServerSendAction.BeginGame]: [CasinoSeverMessage<ServerSendAction.BeginGame, ReceiveData.onBeginGame>]; // 開始遊戲
//     [ServerSendAction.DoubleGame]: [CasinoSeverMessage<ServerSendAction.DoubleGame, any>]; // 雙倍遊戲
//     [ServerSendAction.EndGame]: [CasinoSeverMessage<ServerSendAction.EndGame, any>]; // 結束遊戲
//     [ServerSendAction.KeepMachineStatus]: [CasinoSeverMessage<ServerSendAction.KeepMachineStatus, any>]; // 保持機器狀態
//     [ServerSendAction.MachineLeave]: [CasinoSeverMessage<ServerSendAction.MachineLeave, any>]; // 離開機器
//    };