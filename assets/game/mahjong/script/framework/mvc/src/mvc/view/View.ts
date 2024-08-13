import { AIOBridge } from "../../../../share-tools";
import { Controller } from "../controller/Controller";
import { Model } from "../model/Model";

import { ValuesType } from 'utility-types';
import {
    GetErrorInfo,
    ServerSendAction,
    ServerSendActionEventMap,
    isSeverError
} from "../../connection/connector/receive/SeverAction";
import {
    AbstractExchangePanel,
    CommandEventName,
    ExchangePanelEventName,
    IfAlertPanel,
    IfCostume,
    ToolBarEventName
} from "../../interface";


export interface IfCasinoView {
    alertPanel?: IfAlertPanel;
    exchangePanel?: AbstractExchangePanel;
    costume?: IfCostume;

}



export abstract class View implements IfCasinoView {

    public alertPanel?: IfAlertPanel;
    public exchangePanel?: AbstractExchangePanel;
    public costume?: IfCostume;


    constructor(
        protected model: Model,
        protected controller: Controller
    ) {
        this.configCommandEvent();
        this.configToolbarEvent();
        this.configReceiveEvent();

    }

    protected initCostume(): void {
        //@TODO 遊戲
    }

    protected alert(dict_key: string, id?: string) {
        console.error(`[View::alert]`, dict_key, id);
    }

    protected hideHTMLUI(): void {

    }

    protected updateProgress(progress: number): void {

    }





    protected configCommandEvent(): void {

        const command = this.costume?.command;

        if (command) {

            const { controller } = this;
            command.event.on(CommandEventName.SPIN, controller.beginGame.bind(controller));
            command.event.on(CommandEventName.MAX_BET, controller.maxBet.bind(controller));
            command.event.on(CommandEventName.LINE_BET, controller.addLine.bind(controller));
            command.event.on(CommandEventName.LINE_BET_MINUS, controller.minusLine.bind(controller));
            command.event.on(CommandEventName.LINE, controller.addLine.bind(controller));
            command.event.on(CommandEventName.LINE_MINUS, controller.minusLine.bind(controller));
            command.event.on(CommandEventName.DOUBLE, controller.double.bind(controller));
            command.event.on(CommandEventName.UPDATE_LINEBET, controller.setLineBet.bind(controller));
            command.event.on(CommandEventName.UPDATE_LINE, controller.setLine.bind(controller));
            command.event.on(CommandEventName.CHANGE_RATIO, controller.fastExchange.bind(controller));

            //開分事件另外處理
            command.event.on(CommandEventName.EXCHANGE, this.openCreditExchangePanel.bind(this));
        }
    }


    protected configToolbarEvent(): void {
        if (this.costume?.toolbar) {
            const { toolbar } = this.costume;
            const { controller } = this;
            //簡單邏輯 , 就不再透過 switch case 來處理了
            toolbar.event.on(ToolBarEventName.MUSIC, controller.backgroundMusic.bind(this.controller));
            toolbar.event.on(ToolBarEventName.MUTE, controller.mute.bind(this.controller));
            toolbar.event.on(ToolBarEventName.EXIT, controller.exit.bind(this.controller));
            toolbar.event.on(ToolBarEventName.HELP, controller.help.bind(this.controller));
            toolbar.event.on(ToolBarEventName.HISTORY, controller.history.bind(this.controller));
            toolbar.event.on(ToolBarEventName.DEPOSIT, controller.deposit.bind(this.controller));
            toolbar.event.on(ToolBarEventName.GAMEINFO, controller.gameInfo.bind(this.controller));
            //開分事件另外處理
            toolbar.event.on(ToolBarEventName.ONEXCHANGE, this.openCreditExchangePanel.bind(this));
        }
    }


    //監聽 server websocket 接收的事件
    protected configReceiveEvent(): void {

        const { connection } = this.model;

        [
            ServerSendAction.Ready,
            ServerSendAction.UpdateJP,
            ServerSendAction.FullMachine,
            ServerSendAction.LoadInfo,
            ServerSendAction.GetMachineDetail,
            ServerSendAction.CreditExchange,
            ServerSendAction.BalanceExchange,
        ].forEach((action) => {

            connection.event.on(action, this.handelConnectionEvent.bind(this));
        });



    }



    protected handelConnectionEvent(evt: ValuesType<ServerSendActionEventMap>[0]) {

        //@TODO 這邊還沒處理 error event 相關事宜

        if (this.isServerError(evt)) return;
        switch (evt.action) {
            case ServerSendAction.Ready:
                AIOBridge.onLoaded();
                break;
            case ServerSendAction.UpdateJP:
                this.updateJackpot();
                break;
            case ServerSendAction.FullMachine:
                this.showWaiting();
                break;
            case ServerSendAction.LoadInfo:
                this.setupCostume();
                break;
            case ServerSendAction.GetMachineDetail:
                this.updateMachineInfo();
                break;
            case ServerSendAction.CreditExchange:
                this.updateCreditExchangeInfo();
                break;
            case ServerSendAction.BalanceExchange:
                this.updateBalanceExchangeInfo();
                break;
            default:
                break;
        }

    }
    protected isServerError(evt: any): boolean {
        if (isSeverError(evt)) {

            const error_info = GetErrorInfo(evt);
            this.alert(error_info.key, error_info.id);

            return true;
        }
        return false;
    }


    protected handleProgress(): void {
        const { connection } = this?.model;
        if (connection) {
            connection.socket.once("open", this.updateProgress.bind(this, 91)); //91
            connection.receiver.once(ServerSendAction.Ready, this.updateProgress.bind(this, 92)); //92
            connection.receiver.once(ServerSendAction.Login, this.updateProgress.bind(this, 93)); //93
            connection.receiver.once(ServerSendAction.TakeMachine, this.updateProgress.bind(this, 94));//94
            connection.receiver.once(ServerSendAction.LoadInfo, this.updateProgress.bind(this, 95));//95
        }
    }


    protected updateJackpot() {
        if (this.model.dataModel?.jpValue) {
            this.costume?.updateJackpot?.(this.model.dataModel.jpValue);
        }
    }

    protected updateMarquee() {
        if (this.model.dataModel?.marquee) {
            this.costume?.updateMarquee?.(this.model.dataModel.marquee);
        }
    }

    protected showWaiting(): void {
        this.alert("FULLY_OCCUPIED");
    }

    protected setupCostume(): void {

    }


    protected updateMachineInfo(): void {
        if (this.exchangePanel) {
            const { credit, balance, betBase, base } = this.model.dataModel;
            this.exchangePanel.update({ credit, balance, betBase, base });
        }
    }

    protected updateCreditExchangeInfo(): void {
        if (this.exchangePanel) {
            const { credit, balance, betBase, base } = this.model.dataModel;
            this.exchangePanel.update({ credit, balance, betBase, base });
        }

    }

    protected updateBalanceExchangeInfo(): void {
        if (this.exchangePanel) {
            const { credit, balance, betBase, base, washInfo } = this.model.dataModel;
            this.exchangePanel.update({ credit, balance, betBase, base, washInfo });
        }
    }
    /**
     * 處理換分面板事件 與 controller 之間的溝通
     */
    protected handleExchangePanelEvent() {

        const { exchangePanel } = this;
        if (exchangePanel) {

            const { controller } = this;
            exchangePanel.event.on(ExchangePanelEventName.CREDIT_EXCHANGE, (data) => {
                controller.creditExchange(data.betBase, data.amount);
            });
            exchangePanel.event.on(ExchangePanelEventName.BALANCE_EXCHANGE, controller.balanceExchange.bind(controller));
            exchangePanel.event.on(ExchangePanelEventName.CHANGE_RATIO, (data) => {
                controller.fastExchange(data.ratio);
            });
            exchangePanel.event.on(ExchangePanelEventName.LEAVE_GAME, controller.leaveMachine.bind(controller));
        }
    }


    protected async openCreditExchangePanel() {
        await this.controller.getMachineDetail();

        if (this.exchangePanel) {
            const { credit, balance, betBase, base } = this.model.dataModel;
            this.exchangePanel.show();
            this.exchangePanel.update({ credit, balance, betBase, base });
        }
    }

}




export class CasinoView extends View {

}
