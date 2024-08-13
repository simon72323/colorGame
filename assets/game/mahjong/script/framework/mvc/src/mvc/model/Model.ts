import { URLParameter } from "../../../../share-tools";
import { ValuesType } from 'utility-types';
import { ServerSendAction, ServerSendActionEventMap, isSeverError, BaseSeverEventMap } from "../../connection/connector/receive/SeverAction";
import { Connector } from '../../connection/connector/Connector';
import {
    onBalanceExchange, onBeginGame, onCreditExchange,
    onGetMachineDetail, JPType, onHitJackpot, onLogin,
    onLoadInfo, onTakeMachine, updateJP
} from '../../connection/connector/data/Receive';

import { DataModel } from "./DataModel";
import { Emitter, EventMap } from "strict-event-emitter";
import { BaseSendActionParams, ClientSendActionParams } from "../../connection/connector/send/ClientAction";

export class Model<ServerEventMap extends EventMap = ServerSendActionEventMap, ClientSendMap extends BaseSendActionParams = ClientSendActionParams> {

    dataModel: DataModel;

    connection: Connector<ServerEventMap, ClientSendMap>;

    /**
     * 要監聽的sever 事件名稱 array
     */
    protected receiverEvents: ServerSendAction[] = [
        ServerSendAction.Ready,
        ServerSendAction.UpdateJP,
        ServerSendAction.UpdateMarquee,
        ServerSendAction.Login,
        ServerSendAction.TakeMachine,
        ServerSendAction.LoadInfo,
        ServerSendAction.GetMachineDetail,
        ServerSendAction.BalanceExchange,
        ServerSendAction.CreditExchange,
        ServerSendAction.BeginGame,
        ServerSendAction.HitJackpot,
        ServerSendAction.DoubleGame,
        ServerSendAction.EndGame,
        ServerSendAction.KeepMachineStatus,
    ];

    constructor() {
        this.connection = this.initConnection();
        this.dataModel = this.initDataModel();
    }

    protected initDataModel() { return new DataModel(); }

    protected initConnection(): any { return new Connector(); }


    protected configReceiveEvent() {
        if (this.connection) {
            const { receiver } = this.connection;
            this.receiverEvents.forEach((action: ServerSendAction) => {
                receiver.on(action, this.handleReceiveEvent.bind(this));
            });

        }
    }

    protected handleReceiveEvent(...datas: ValuesType<ServerSendActionEventMap>) {

        const message = datas[0];
        const { action, result } = message;

        if (isSeverError(message)) {
            //錯誤的事件不需要將資料更新到model
            return;
        }
        else {
            switch (action) {
                case ServerSendAction.UpdateJP:
                    this.updateJP(result);
                    break;
                case ServerSendAction.UpdateMarquee:
                    this.updateMarquee(result);
                    break;
                case ServerSendAction.Login:
                    result.event && this.onLogin(result.data);
                    break;
                case ServerSendAction.TakeMachine:
                    result.event && this.onTakeMachine(result.data);
                    break;
                case ServerSendAction.LoadInfo:
                    result.event && this.onLoadInfo(result.data);
                    break;
                case ServerSendAction.GetMachineDetail:
                    result.event && this.onGetMachineDetail(result.data);
                    break;
                case ServerSendAction.BalanceExchange:
                    result.event && this.onBalanceExchange(result.data);
                    break;
                case ServerSendAction.CreditExchange:
                    result.event && this.onCreditExchange(result.data);
                    break;
                case ServerSendAction.BeginGame:
                    result.event && this.onBeginGame(result.data);
                    break;
                case ServerSendAction.HitJackpot:
                    result.event && this.onHitJackpot(result.data);
                    break;
                case ServerSendAction.DoubleGame:
                    result.event && this.onDoubleGame(result.data);
                    break;
                case ServerSendAction.EndGame:
                    result.event && this.onEndGame(result.data);
                    break;
                case ServerSendAction.KeepMachineStatus:
                    result.event && this.onKeepMachineStatus(result.data);
                    break;
            }
        }
    }




    protected onReady(): void {

    }
    protected updateJP(result: updateJP): void {
        this.dataModel.jpValue = result;
    }
    protected updateMarquee(result: string) {
        this.dataModel.marquee = result;
    }

    protected onLogin(data: onLogin): void {

        if (data && data.UserID != null) {
            this.dataModel.userId = String(data.UserID);
        }

    }
    protected onTakeMachine(data: onTakeMachine): void {
        if (data && data.gameCode != null || data.gameCode == 0) {
            this.dataModel.gameCode = String(data.gameCode);
        }

    }

    protected onLoadInfo(data: onLoadInfo): void {

        if (data) {
            const { dataModel } = this;
            dataModel.isCash = data.isCash;
            dataModel.loginName = data.LoginName;
            if (data.UserID != null) dataModel.userId = String(data.UserID);
            if (data.Credit != null) dataModel.credit = this.getNumber(data.Credit);
            if (data.Balance != null) dataModel.balance = this.getNumber(data.Balance);
            dataModel.base = data.Base;
            dataModel.betBase = data.BetBase;
            dataModel.defaultBase = data.DefaultBase;


            if (data.BetCreditList) {
                //所見即所得版本

                const { BetCreditList } = data;

                if (BetCreditList) {
                    dataModel.creditList = BetCreditList.map((item) => { return this.getNumber(item); });
                    dataModel.maxLineBet = dataModel.creditList[dataModel.creditList.length - 1];
                }


                let { DefaultBetCredit } = data;
                if (DefaultBetCredit != null) {
                    DefaultBetCredit = this.getNumber(DefaultBetCredit);
                    dataModel.bet = DefaultBetCredit;
                    dataModel.lineBet = DefaultBetCredit;
                    dataModel.defaultBetCredit = DefaultBetCredit;
                }


            }


            if (data.UserName != null) {

                dataModel.loginName = data.UserName;
                //go+ 唯一額度 , 故把 balance 設為 credit
                dataModel.credit = this.getNumber(data.Balance);
                dataModel.betBase = data.DefaultBase;

            }
            dataModel.currency = data.Currency;
            dataModel.noExchange = !!data.noExchange;

        }
    }



    protected onGetMachineDetail(data: onGetMachineDetail): void {


        if (data) {
            const { dataModel } = this;
            dataModel.balance = this.getNumber(data.Balance);
            dataModel.credit = this.getNumber(data.Credit);
            dataModel.base = data.Base;
            dataModel.betBase = data.BetBase;
        }



    }
    protected onCreditExchange(data: onCreditExchange): void {


        if (data) {
            const { dataModel } = this;
            dataModel.credit = this.getNumber(data.Credit);
            dataModel.balance = this.getNumber(data.Balance);
            dataModel.betBase = data.BetBase;
        }


    }
    protected onBalanceExchange(data: onBalanceExchange): void {

        if (data) {
            const { dataModel } = this;
            dataModel.washInfo = {
                transCredit: this.getNumber(data.TransCredit),
                amount: this.getNumber(data.Amount),
            };

            dataModel.balance = this.getNumber(data.Balance);
            dataModel.credit = 0;
            dataModel.betBase = data.BetBase;

        }


    }
    protected onHitJackpot(data: onHitJackpot): void {



        if (data) {
            const { dataModel } = this;
            dataModel.winJPType = this.getNumber(data.JPType);
            dataModel.winJPAmount = this.getNumber(data.JPAmount);
        }

    }
    protected onBeginGame(data: onBeginGame): void {

    }
    protected onDoubleGame(data: any) { }
    protected onEndGame(data: any) { }
    protected onKeepMachineStatus(data: any) { }


    async connect(path?: string): Promise<boolean> {
        if (!path) {
            await URLParameter.init();
            path = await this.getConnectPath();
        }
        if (path) {
            this.configReceiveEvent();
            return this.connection.connect(path);
        }
        return Promise.resolve(false);
    }


    protected async getConnectPath() {
        return Promise.resolve(URLParameter.serverHost);
    }

    protected getNumber(data: string | number): number {
        return (typeof data == 'number') ? data : (typeof data == 'string') ? parseFloat(data) : 0;
    }


    protected init(): void {
        const { dataModel } = this;

        dataModel.payoff = 0;
        dataModel.cards = [];
        dataModel.lines = "";
        dataModel.scatter = "";
        dataModel.bonus = "";

        dataModel.winJPType = JPType.None;
        dataModel.winJPAmount = 0;

        if (dataModel.freeTimes == 0) {
            // dataModel.be
            const { line, lineBet } = dataModel;

            if (line && lineBet) {
                dataModel.bet = line * lineBet;
            }
        }

    }


}
