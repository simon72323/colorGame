import { Model, ExchangeInfo, DeviceInfo, Device, URLParameter, onLogin, onTakeMachine, onLoadInfo, onGetMachineDetail, onCreditExchange, onBalanceExchange, onHitJackpot, log, userAnalysis } from "../include";
import { ClientRecvAction, RecvMessage, RecvEventMassage, ClientRecvEventMap } from "./RecvMessage";
import { ClientSenderActionParams } from "./SendMessage";
import { BaseDataModel } from "./BaseDataModel";

/**
 * 資料Model模型
 */
export class BaseModel extends Model<ClientRecvEventMap, ClientSenderActionParams> {

    public url: string;
    // 機台代碼
    public get gameCode(): string {
        return this.data.gameCode || "";
    }
    // 取資料
    public get data(): BaseDataModel {
        return this.dataModel as BaseDataModel;
    }
    public get deviceInfo(): DeviceInfo {
        return Device.deviceInfo();
    }
    
    constructor() {
        super();
        this.configReceiveEvent();
    }
    // 初始化資料
    protected initDataModel(): BaseDataModel {
        return new BaseDataModel();
    }
    // 設定接收事件
    protected configReceiveEvent() {
        if (this.connection) {
            const { receiver, socket } = this.connection;
            Object.values(ClientRecvAction).forEach((action) => {
                receiver.on(action as any, this.handleReceiveEvent.bind(this));
            });
            socket.on('open', () => receiver.emit('open', { event: true } as any));
            socket.on(ClientRecvAction.WSClose, () => receiver.emit(ClientRecvAction.WSClose, { event: true, action: ClientRecvAction.WSClose }));
        }
    }
    // 事件對應方法
    protected handleReceiveEvent(message: RecvEventMassage<keyof ClientRecvEventMap>): void {
        const { action, event, error } = message;

        if (!event && error) this.onErrorMessage(message);

        switch (action) {
            case ClientRecvAction.Ready:
                this.isReady(message.data);
                break;
            case ClientRecvAction.UpdateMarquee:
                this.updateMarquee(message.data);
                break;
            case ClientRecvAction.Login:
                this.onLogin(message.data);
                break;
            case ClientRecvAction.TakeMachine:
                this.onTakeMachine(message.data);
                break;
            case ClientRecvAction.LoadInfo:
                this.onLoadInfo(message.data);
                break;
            case ClientRecvAction.GetMachineDetail:
                this.onGetMachineDetail(message.data);
                break;
            case ClientRecvAction.CreditExchange:
                this.onCreditExchange(message.data);
                break;
            case ClientRecvAction.BalanceExchange:
                this.onBalanceExchange(message.data);
                break;
            case ClientRecvAction.BeginGame:
                this.onBeginGame(message.data);
                break;
            case ClientRecvAction.HitJackpot:
                this.onHitJackpot(message.data);
                break;
            case ClientRecvAction.MachineLeave:
            case ClientRecvAction.Exit:
                this.onMachineLeave(message.data);
                break; 
            case ClientRecvAction.JoinGame:
                this.onJoinGame(message);
                break;  
            case ClientRecvAction.LeaveGame:
                this.onLeaveGame(message);
                break;
            case ClientRecvAction.WSClose:
                this.clear();
                break;
            
        }
    }
    protected isReady(data: RecvMessage.ReadyData):void {
        const { Ready } = ClientRecvAction;
        const { version, ts } = data;
        log(`isReady version: ${version} ServerTime:${new Date(ts)}`);
    }
    // Event: 更新跑馬燈 資料
    protected updateMarquee(str: string): void {
        super.updateMarquee(str);
    }
    /**
     * Event: 登入資料
     * @description dataModel.userId is the user
     * @param data 
     */
    protected async onLogin(data: onLogin): Promise<void> {
        super.onLogin(data);
        log(`onLogin`, data);
        this.data.userId = String(data.UserID);
        this.data.startTime = Date.now();

        this.data.uuid = await this.generate(this.data.userId);
        // this.dataModel.sid = data.Sid;
        // this.dataModel.gameID = data.GameID;
        // this.dataModel.test = data.Test;
        // this.dataModel.exchangeRate = data.ExchangeRate;
    }
    public async generate(key: string): Promise<string> {
        if (!crypto || !crypto.subtle || !crypto.subtle.digest) return '';
        let hash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(String(key)));
        const hashArray = Array.from(new Uint8Array(hash))
        const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
        return hashHex;
    }
    // Event: 佔機台
    protected onTakeMachine(data: onTakeMachine): void {
        log(`onTakeMachine`, data);
        super.onTakeMachine(data);
        if (data && data.GameCode || data.GameCode == 0) {
            this.data.gameCode = String(data.GameCode);
        }
    }
    // Event: 遊戲資訊
    protected onLoadInfo(data: onLoadInfo): void {
        if (data && data["UserAutoExchange"]) this.data.userAutoExchange = data["UserAutoExchange"];

        if (data && data["Currency"]) {
            switch (data["Currency"]) {
                case 'GBP':
                case 'SGD':
                case 'EUR':
                case 'MYR':
                case 'USD':
                case 'USDT':
                case 'AUD':
                    this.data.quickExBarValues[0] = '10';
                    this.data.quickExBarValues[1] = '50';
                    break;
                case 'KRW':
                case 'JPY':
                case 'INR':
                case 'PKR':
                    this.data.quickExBarValues[0] = '1000';
                    this.data.quickExBarValues[1] = '5000';
                    break;
                case 'CNY':
                case 'TWD':
                case 'HKD':
                case 'THB':
                case 'PHP':
                case 'KIDR':
                case 'KVND':
                case 'BRL':
                    this.data.quickExBarValues[0] = '100';
                    this.data.quickExBarValues[1] = '500';
                    break;
                case 'MMK':
                case 'KHR':
                    this.data.quickExBarValues[0] = '10000';
                    this.data.quickExBarValues[1] = '50000';
                    break;
                case 'IDR':
                case 'VND':
                    this.data.quickExBarValues[0] = '100000';
                    this.data.quickExBarValues[1] = '500000';
                    break;
                default:
                    this.data.quickExBarValues[0] = '100';
                    this.data.quickExBarValues[1] = '500';
                    break;
            }
        }
        if (data && data.GameCode || data.GameCode == 0) {
            this.data.gameCode = String(data.GameCode);
        }

        super.onLoadInfo(data);
    }
    // Event: 機台資訊
    protected onGetMachineDetail(data: onGetMachineDetail): void {
        super.onGetMachineDetail(data);
    }
    // Event: 換分
    protected onCreditExchange(data: onCreditExchange): void {
        super.onCreditExchange(data);
    }
    // Event: 洗分
    protected onBalanceExchange(data: onBalanceExchange): void {
        super.onBalanceExchange(data);
    }
    // Event: 開始遊戲
    protected onBeginGame(_data: any): void {
        const data = (_data as RecvMessage.MahjongBeginGameData);
        if (data) {
            this.data.credit = data.Credit;
            this.data.creditEnd = data.Credit_End;
        }
    }
    // Event: 中彩池
    protected onHitJackpot(data: onHitJackpot<RecvMessage.IBeginGameData>): void {
        super.onHitJackpot(data);
    }
    // Event: 離開機台
    protected onMachineLeave(data: RecvMessage.MachineLeaveData): void {
        if (data.event) {
            this.data.gameCode = "";
        }
    }
    // Event: 進入遊戲
    protected onJoinGame(data: RecvMessage.JoinGameMessage): void {
        if (data.event) this.data.isJoinGame = true;
    }
    // Event: 離開遊戲
    protected onLeaveGame(data: RecvMessage.LeaveGameMessage): void {
        if (data.event) this.data.isJoinGame = false;
    }
    public getExchangeInfo(): ExchangeInfo {
        const { balance, base, washInfo, betBase, defaultBase, credit } = this.data;

        return {
            credit,
            betBase: (betBase ? betBase : defaultBase),
            balance,
            base,
            washInfo
         };
    }
    // Event: 錯誤事件
    protected onErrorMessage(message: RecvMessage.ErrorMessage):void {
        const { action, error, errCode, event } = message; 
        log(`action: ${action} = ${event} error: ${error} errcode: ${errCode}`);
    }
    // 進行Websocket連線
    public async connect(path?: string): Promise<boolean>{
        const { data } = this;
        if (!path) {
            await URLParameter.init();
            if (parent['Site'] == 'XC')
                path = '34.102.224.66'
            else
                path = await this.getConnectPath();
            const { gameType, sid, isTLS } = URLParameter;

            this.url = `${isTLS ? 'wss' : 'ws' }://${path}/fxCasino/fxLB?gameType=${gameType}`;
            if (this.data.demo) {
                log(`Connect Demo: ${this.data.demo}}`);
                this.data.sid = this.data.sessionID;
            } else {
                this.data.sid = sid;
            }
            this.data.gameType = gameType;
            
        } else {
            this.url = path;
        }
        return new Promise((resolve, reject) => {
            this.connection.receiver.once(ClientRecvAction.Ready as any, () => resolve(data.connected = true));
            
            this.connection.connect(this.url, true, parent['Site'] == "XC" ? 'OTNlODQ0YTkzNGQ3MWU4ODY3Yjg3NWI4NjVkN2U0ODcuODMwMGU1YjQ5MTdjMjhmNw' : '').catch(() => {
                reject(data.connected = false)
            });
        });
    }
    public disconnect(): Promise<void> {
        return new Promise((resolve) => {
            if (this.connection.socket.ws.readyState > 1) {
                return resolve();
            }
            this.connection?.socket?.once(ClientRecvAction.WSClose, () => resolve);
            this.connection?.socket?.close();
            this.data.connected = false;
        })
        
    }
    public clear():void {
        // 必須清除資料:重新連線需要檢查
        this.data.gameCode = "";
        this.data.connected = false;
        userAnalysis.enable = false;
    }
    public callServer<T extends keyof ClientSenderActionParams>(action: T, data: ClientSenderActionParams[T]) {
        const { sender } = this.connection;
        data.requestId = this.data.requestId;
        sender.callServer(action, data);
    }
    // 送出事件並回應
    public send<T extends keyof ClientSenderActionParams>(action: T, data: ClientSenderActionParams[T]): Promise<any> {
        return new Promise((resolve, reject) => {
            const { sender, receiver } = this.connection;
            data.requestId = this.data.requestId;
            sender.callServer(action as any, data);
            receiver.once(action, (result) => this.onRecv(result, resolve, reject));
        });
    };
    // 回傳事件
    protected onRecv(result: any, resolve: any, reject: any):void {
        if (result.event) {
            resolve(result.data || result);
        } else{
            reject(result);
        }
    }
}