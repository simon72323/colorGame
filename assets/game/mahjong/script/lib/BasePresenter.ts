import { log, userAnalysis } from "../include";
import { AIOBridge, URLParameter } from '@casino-mono/share-tools';
import { BaseModel } from "./BaseModel";
import { BaseView } from "./BaseView";
import { ClientRecvAction, RecvMessage } from "./RecvMessage";
import { ClientSendAction } from "./SendMessage";
import { DataModel, ExchangeInfo, IfController, onBalanceExchange, onCreditExchange, onGetMachineDetail } from "@casino-mono/mvc";
import { UserAutoExchange } from "./BaseDataModel";
import { GAManager } from "./analytics/UserAnalysis";
/**
 * Presenter interface
 */
export class BasePresenter implements IfController {
    /** 遊戲事件觸發對應事件 */
    protected TriggerConnectionTypes: any[] = [
        ClientRecvAction.Ready,
        ClientRecvAction.UpdateJP,
        ClientRecvAction.TakeMachine,
        ClientRecvAction.LoadInfo,
        ClientRecvAction.GetMachineDetail,
        ClientRecvAction.CreditExchange,
        ClientRecvAction.BalanceExchange,
        ClientRecvAction.UpdateMarquee,
        ClientRecvAction.BeginGame,
        ClientRecvAction.WSClose
    ];
    /** 遊戲連線處理百分比 */
    protected TriggerConnectionProgression: any[][] = [
        [ClientRecvAction.WSOpen, 91],
        [ClientRecvAction.Ready, 92],
        [ClientRecvAction.Login, 93],
        [ClientRecvAction.TakeMachine, 94],
        [ClientRecvAction.LoadInfo, 95]
    ];
    /** 負責檢索 Model 取得資料 */
    protected model: BaseModel;
    /** @protected main View Interface */
    protected view: BaseView;
    get sender() { return this.model?.connection.sender; }
    get receiver() { return this.model?.connection.receiver; }

    /** 覺得event應該是放在這裡 */
    get event() {
        return this.model?.connection.event;
    }

    get gameCode(): string {
        return this.model.dataModel.gameCode;
    }
    set gameType(value: string) {
        this.model.dataModel.gameType = value;
    }
    get gameType() {
        return this.model.dataModel.gameType;
    }
    set sid(value: string) {
        this.model.dataModel.sid = value;
    }
    get sid() {
        return this.model.dataModel.sid;
    }
    get isJoinGame(): boolean {
        return this.model.data.isJoinGame;
    }
    get creditList() {
        return this.model.dataModel.creditList;
    }
    get defaultBetCredit() {
        return this.model.dataModel.defaultBetCredit;
    }
    get credit() {
        return this.model.dataModel.credit;
    }
    get balance() {
        return this.model.dataModel.balance;
    }
    get bet() {
        return this.model.dataModel.bet;
    }
    get userId() {
        return this.model.dataModel.userId;
    }
    async uuid() { 
        if (this.userId) this.model.data.uuid = await this.model.generate(this.userId);
        return this.model.data.uuid;
     }
    
    public get connected(): boolean {
        return this.model?.data?.connected || false;
    }
    get quickExBarValues(): string[] {
        return this.model.data.quickExBarValues;
    }
    constructor(model: BaseModel, view: BaseView) {
        this.model = model;
        this.view = view;
        this.model.data.sid = "";
        this.model.data.gameType = "";

        this.model.dataModel.line = 1;
        this.model.dataModel.lineBet = 1;
        this.model.dataModel.bet = this.model.dataModel.line * this.model.dataModel.lineBet;

        if (URLParameter.lang)
            this.model.data.lang = URLParameter.lang;
    }
    addLineBet(): void {
        throw new Error("Method not implemented.");
    }
    minusLineBet(): void {
        throw new Error("Method not implemented.");
    }
    end(): void {
        throw new Error("Method not implemented.");
    }
    double(): void {
        throw new Error("Method not implemented.");
    }
    free(): void {
        throw new Error("Method not implemented.");
    }
    leaveMachine(): void {
        throw new Error("Method not implemented.");
    }
    /** 
     * 連線
     * @Method 
     * @name Connector#connect
     *  */
    connect(address?: string): Promise<boolean> {
        return this.model.connect(address);
    }
    /**
     * 斷線
     * @method
     * @name Connector#diconnect
    */
    disconnect(): Promise<void> {
        return this.model.disconnect();
    }
    /**
     * 連線遊戲
     * @param line 
     */
    setLine(line: number): void {
        this.model.dataModel.line = line;
        this.model.dataModel.bet = this.model.dataModel.line * this.model.dataModel.lineBet;
        this.view.updateBet();
    }
    /**
     * 連線遊戲
     * @param lineBet 
     */
    setLineBet(lineBet: number): void {
        this.model.dataModel.lineBet = lineBet;
        this.model.dataModel.bet = this.model.dataModel.line * this.model.dataModel.lineBet;
        this.view.updateBet();
    }
    /**
     * 連線遊戲
     * @param loop 
     */
    addLine(loop?: boolean): void {

        const { line, maxLine } = this.model.dataModel;

        if (line != null) {
            let newLine = line + 1;
            if (maxLine && newLine > maxLine) {
                if (loop) newLine = 1;
                else newLine = maxLine;
            }
            this.setLine(newLine);
        }
    }
    /**
     * 連線遊戲
     * @param loop 
     */
    minusLine(loop: boolean = true) {
        const { line, maxLine } = this.model.dataModel;
        if (line != null) {
            let newLine = line - 1;
            if (maxLine && newLine < 1) {
                if (loop) newLine = maxLine;
                else newLine = 1;
            }
            this.setLine(newLine);
        }
    }

    maxBet(): void {
        const { maxLineBet, lineBet } = this.model.dataModel;
        if (maxLineBet != null && lineBet != null) {
            this.setLineBet(maxLineBet);
        }

        const { maxLine, line } = this.model.dataModel;
        if (maxLine != null && line != null) {
            this.setLine(maxLine);
        }
    }
    // 分析紀錄事件
    public mute(...args): void { }
    // 分析紀錄事件
    public backgroundMusic(...args): void { }
    // 分析紀錄事件
    public history(): void { }
    // 分析紀錄事件
    public help(): void { }

    public deposit(): void { }
    // 分析紀錄事件
    public gameInfo(...args): void {  }

    /**
     * 登入
     * @api {WebSocket} 
     * @returns
     */
    async login() {
        const { receiver, model } = this;
        const { gameType, sid, lang } = model.data;
        return new Promise((resolve, reject) => {
            model.callServer( ClientSendAction.Login as any, { 
                action: ClientSendAction.Login, 
                gameType, 
                data: {
                    lang,
                    sid,
                    dInfo: model.deviceInfo
                }
            });
            
            receiver.once(ClientRecvAction.Login, (result) => {
                (result.event ? resolve : reject)(result);
            });
        });

    }
    /**
     * 佔機台預設在login會呼叫一次
     * @param sendAgain 重試
     * @returns 
     */
    async takeMachine(sendAgain: boolean = false):Promise<string> {
        const { sender, receiver, model } = this;
        return new Promise((resolve, reject) => {
            const { gameType } = model.dataModel;
            const { TakeMachine } = ClientSendAction;
            if (model.gameCode != "") resolve(model.gameCode);
            if (sendAgain) model.callServer( TakeMachine, { action: TakeMachine, gameType });
            receiver.once( ClientRecvAction.TakeMachine as any, (result) => {
                (result.error ? reject(result) : resolve(model.gameCode));
            });
        });
    }
    /**
     * 取得機台資訊
     * @api {WebSocket}
     * @returns 
     */
    async getMachineDetail() {
        return new Promise((resolve, reject) => {
            const { sender, receiver, model } = this;
            const { gameType } = model.dataModel;
            const { GetMachineDetail } = ClientSendAction;
            model.callServer( GetMachineDetail as any, { action: GetMachineDetail, gameType});
            receiver.once( ClientRecvAction.GetMachineDetail, (result) => { 
                (result.event && result.data.event ? resolve : reject)(result);
            });
        });
    }
    /**
     * 取得遊戲資訊
     * @api {WebSocket}
     * @returns 
     */
    async onLoadInfo() {
        const { sender, receiver, model } = this;
        const { gameType } = model.dataModel;
        return model.send(ClientSendAction.LoadInfo, { action: ClientSendAction.LoadInfo, gameType});
    }
    /**
     * 開始遊戲
     * @api {WebSocket}
     * @param opts 下注參數betInfo
     * @description { BetCredit: number }
     * @returns RecvMessage.MahjongBeginGameData 碰碰胡遊戲結果
     */
    async beginGame(betInfo?: object | number): Promise<RecvMessage.MahjongBeginGameData> {
        const { sender, receiver, model } = this;
        const { gameType } = model.dataModel;
        const type = (typeof betInfo);

        if (type == "number") {
            betInfo = { BetCredit: betInfo };
        } else if (Array.isArray(betInfo)) {
            return Promise.reject({ event: false, message: `beginGame: Invalid betInfo value for ${betInfo}`});
        }

        return new Promise((resolve, reject) => {
            model.callServer(ClientSendAction.BeginGame as any, { 
                action: ClientSendAction.BeginGame, 
                gameType, 
                data: { betInfo } 
            });
            receiver.once(ClientRecvAction.BeginGame, (result) => {
                (result.event ? resolve : reject)(result);
            });
        });
    }
    /**
     * 結束當局遊戲
     */
    endGame(): void {
        this.model.dataModel.credit = this.model.dataModel.creditEnd;
        this.view.end();
    }
    /**
     * 洗分
     * @api {WebSocket}
     * @param betBase 
     * @param credit 
     * @returns 
     */
    async creditExchange(betBase: string, credit: number): Promise<ExchangeInfo> {
        const { model } = this;
        const { gameType } = model.data;
        await model.send(ClientSendAction.CreditExchange, { 
            action: ClientSendAction.CreditExchange,
            gameType,
            data: { rate: betBase, credit }
         } as any);
         return this.model.getExchangeInfo();
    }
    /**
     * 加入遊戲
     * @api {WebSocket}
     * @returns 
     */
    async joinGame(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const { sender, receiver, model } = this;
            const { gameType } = model.dataModel;
            const { JoinGame } = ClientSendAction;
            model.callServer( JoinGame as any, { action: JoinGame, gameType});
            receiver.once( ClientRecvAction.JoinGame as any, (result) => {
                (result.event ? resolve : reject)(result.event);
            });
        });
    }
    /** 
     * 離開遊戲
     * @api {WebSocket}
     * @returns
     */
    async leaveGame(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const { sender, receiver, model } = this;
            const { gameType } = model.dataModel;
            const { LeaveGame } = ClientSendAction;
            model.callServer( LeaveGame as any, { action: LeaveGame, gameType});
            receiver.once( ClientRecvAction.LeaveGame as any, (result) => { 
                (result.event ? resolve : reject)(result.event);
            });
        });
    }
    // 儲存自動換分資訊
    saveUserAutoExchange(data: { autoEx: boolean, autoValue: number, autoRate: string, lastInput: number[] }, exchangeRecord?: any): Promise<{event:boolean, error: string}> {
        const { sender, receiver, model } = this;
        const { gameType } = model.dataModel;
        return new Promise((resolve, reject) => {
            model.callServer(ClientSendAction.SaveUserAutoExchange, { 
                action: ClientSendAction.SaveUserAutoExchange, 
                gameType, 
                data, 
                exchangeRecord
            });
            receiver.once( ClientRecvAction.SaveUserAutoExchange, (result) => {
                if (result.event) {
                    this.model.data.userAutoExchange.IsAuto = data.autoEx;
                    this.model.data.userAutoExchange.Credit = data.autoValue;
                    this.model.data.userAutoExchange.BetBase = data.autoRate;
                    this.model.data.userAutoExchange.Record = data.lastInput;
                }
                (result.event ? resolve : reject)(result);
            });
        });
    }
    /**
     * 更新分析資料: 系統記錄
     * @api {WebSocket}
     * @returns 
     */
    public updateUserAnalysis(data?: any): Promise<any> {
        const { sender, receiver, model } = this;
        const { gameType } = model.dataModel;
        return new Promise((resolve, reject) => {
            model.callServer(ClientSendAction.UpdateUserAnalysis, { 
                action: ClientSendAction.UpdateUserAnalysis, 
                gameType, 
                data
            });
            receiver.once( ClientRecvAction.UpdateUserAnalysis, (result) => {
                (result.event ? resolve : reject)(result);
            });
        });
    }
    // 綁定事件
    protected handelConneciontEvent(evt: any): void {
        const { view, model } = this;
        const { action, event } = evt;
        const { credit, balance, betBase, base, washInfo } = model.dataModel;

        if (this.isServerError(evt) || model.data.isExit) return;

        switch (action) {
            case ClientRecvAction.Ready:
                AIOBridge.onLoaded();
                break;
            case ClientRecvAction.UpdateJP:
                view?.updateJackpot(model.dataModel.jpValue);
                break;
            case ClientRecvAction.LoadInfo:
                view?.setupGameManager();
                break;
            case ClientRecvAction.GetMachineDetail:
                view?.updateMachineInfo({ credit, balance, betBase, base });
                break;
            case ClientRecvAction.CreditExchange:
                view?.updateCreditExchangeInfo({ credit, balance, betBase, base });
                break;
            case ClientRecvAction.BalanceExchange:
                view?.updateBalanceExhchangeInfo({ credit, balance, betBase, base, washInfo });
                break;
            case ClientRecvAction.UpdateMarquee:
                view?.updateMarquee(evt.data);
                break;
            case ClientRecvAction.WSClose:
                view?.errorHandlingForServerActions(ClientRecvAction.WSClose);
                model.data.stopTime = Date.now();
                let time: number = model.data.timePlayed;
                if (time > 0) GAManager.CustumEvent('timePlayed', { time });
                break;
        }
    }
    // 註冊 server websocket 接收的事件
    public registerRecvEvents(): void {
        const { event } = this;
        this.TriggerConnectionTypes.forEach((action) => {
            event.on(action, this.handelConneciontEvent.bind(this));
        });
        userAnalysis.on('update', (data: object) => {
            if (this.connected) this.updateUserAnalysis(data);
        });
    }
    // 連線觸發百分比事件
    public registerHandleProgressEvents(): void {
        const { view } = this;
        const { event } = this;
        if (view) {
            this.TriggerConnectionProgression.forEach(([action, value]) => {
                event.once(action, view.updateProgress.bind(this, value));
            });
        }
    }
    /**
     * 進行開啟換分頁面
     * @description [1] 執行MachineDatial
     * @description [2] 更新ExchangePanel
     * @description [3] 顯示SettingPanel並開始ExchangePanel面板
     */
    public async openCreditExchangePanel() {
        const { view, model } = this;

        if (parent['Site'] == 'XC') {
            
        } else {
            log('[Presenter::openCreditExchangePanel]');
            await this.getMachineDetail();
            if (view) {
                view.updateExchangePanel(this.getExchangeInfo());
            }
        }
        if (view) {
            view.showExchangePanel();
        }
        
    }

    protected isServerError(evt: any): boolean {
        const { action, event, data } = evt;
        if (!event) {
            switch (action) {
                case ClientRecvAction.TakeMachine:
                case ClientRecvAction.LoadInfo:
                case ClientRecvAction.GetMachineDetail:
                case ClientRecvAction.CreditExchange:
                case ClientRecvAction.BalanceExchange:
                case ClientRecvAction.BalanceExchange:
                case ClientRecvAction.BeginGame: 
                    this.view.errorHandlingForServerActions(action, data);
                    break;
            }
        }
        return !evt.event;
    }
    public getUserAutoExchange(): UserAutoExchange {
        return this.model.data.userAutoExchange;
    }
    /**
     * 取得換分資訊
     * @returns { ExchangeInfo }
     */
    public getExchangeInfo(): ExchangeInfo {
        return this.model.getExchangeInfo();
    }
    /** 
     * 連線服務:換分 
     * @api {WebSocket}
     * @returns
     **/ 
    public async balanceExchange(): Promise<any> {
        const { model } = this;
        const { gameType } = model.dataModel;
        return await model.send(ClientSendAction.BalanceExchange, { 
            action: ClientSendAction.BalanceExchange
         } as any);
    }
    /**
     * 連線服務:離開
     * @api {WebSocket} 
     */
    public async exit(): Promise<void> {
        const { model, view } = this;
        const { gameType } = model.dataModel;
        const data = { action: ClientSendAction.Exit, gameType };
        await model.send(ClientSendAction.Exit as any, data);
        model.data.isExit = true;
        model.data.stopTime = Date.now();
        let time: number = model.data.timePlayed;
        if (time > 0) GAManager.CustumEvent('timePlayed', { time });
    }
    
    public async fastExchange(betBase: string) {

        //@TODO async function reject case handle, view層相關事件解耦

        if (this.model.dataModel.credit && this.model.dataModel.betBase) {

            const onBalanceExchangeData = <RecvMessage.BalanceExchangeData>(await this.balanceExchange());

            const onGetMachineDetail = <onGetMachineDetail>(await this.getMachineDetail());


            if (this.model.dataModel.washInfo) {

                const amount = Math.min(this.model.dataModel.balance, this.model.dataModel.washInfo.amount);

                const new_credit = Math.floor(amount * DataModel.BaseToRatio(betBase));

                const exchangeInfo = <ExchangeInfo>(await this.creditExchange(betBase, new_credit));

            }

        }

        return this.model.getExchangeInfo();
    }

}