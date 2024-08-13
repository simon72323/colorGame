import { onBalanceExchange } from "../../connection/connector/data/Receive";
import { onCreditExchange } from "../../connection/connector/data/Receive";
import { onGetMachineDetail } from "../../connection/connector/data/Receive";
import { ServerSendAction } from "../../connection/connector/receive/SeverAction";
import { ClientSendAction } from "../../connection/connector/send/ClientAction";
import { DataModel } from "../model/DataModel";
import { Model } from "../model/Model";

export interface IfController {

    setLine(line: number): void;
    setLineBet(lineBet: number): void;

    addLine(): void;
    minusLine(): void;

    addLineBet(): void;
    minusLineBet(): void;

    maxBet(): void;


    mute(): void;
    backgroundMusic(): void;


    history(): void;
    help(): void;
    deposit(): void;
    gameInfo(): void;


    exit(): void;

    //以下是連線相關事件
    beginGame(): void;
    end(): void;
    double(): void;
    free(): void;
    leaveMachine(): void;
    getMachineDetail(): void;
    creditExchange(betBase: string, credit: number): void;
    balanceExchange(): void;

}

export class Controller {

    get sender() { return this.model?.connection?.sender; }
    get receiver() { return this.model?.connection?.receiver; }

    constructor(public model: Model) {

    }

    setLine(line: number): void {
        this.model.dataModel.line = line;
    }

    setLineBet(lineBet: number): void {
        this.model.dataModel.lineBet = lineBet;
    }

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

    public mute(): void { }

    public backgroundMusic(): void { }


    history(): void { }
    help(): void { }
    deposit(): void {

    }
    gameInfo(): void {

    }


    exit(): void {
    }

    //以下是連線相關事件
    beginGame(opts?: any): void {
        console.log("連線伺服器");
        this.sender.callServer(ClientSendAction.BeginGame4, opts);
    }
    endGame(): void {
        const { wagersID, sid } = this.model.dataModel;
        if (wagersID && sid) {
            this.sender.callServer(ClientSendAction.EndGame, {
                wagersID,
                sid
            });
        }
    }
    double(): void {
        this.sender.callServer(ClientSendAction.DoubleGame);
    }

    hitFree(): void {
        this.sender.callServer(ClientSendAction.HitFree);
    }
    leaveMachine(): void {
        this.sender.callServer(ClientSendAction.LeaveMachine);
    }

    async getMachineDetail() {
        return new Promise((resolve, reject) => {
            this.sender.callServer(ClientSendAction.GetMachineDetail);
            this.receiver.once(ServerSendAction.GetMachineDetail, data => { (data.result.event ? resolve : reject)(data); });
        });
    }
    async creditExchange(betBase: string, credit: number) {
        return new Promise((resolve, reject) => {
            this.sender.callServer(ClientSendAction.CreditExchange, {
                rate: betBase,
                credit: String(credit)
            });
            this.receiver.once(ServerSendAction.CreditExchange, data => { (data.result.event ? resolve : reject)(data); });
        });
    }
    async balanceExchange() {
        return new Promise((resolve, reject) => {
            this.sender.callServer(ClientSendAction.BalanceExchange);
            this.receiver.once(ServerSendAction.BalanceExchange, data => { (data.result.event ? resolve : reject)(data); });
        });
    }

    async fastExchange(betBase: string) {

        //@TODO async function reject case handle, view層相關事件解耦

        if (this.model.dataModel.credit && this.model.dataModel.betBase) {

            const onBalanceExchangeData = <onBalanceExchange>(await this.balanceExchange());

            const onGatMachineDetail = <onGetMachineDetail>(await this.getMachineDetail());


            if (this.model.dataModel.washInfo) {

                const amount = Math.min(this.model.dataModel.balance, this.model.dataModel.washInfo.amount);

                const new_credit = Math.floor(amount * DataModel.BaseToRatio(betBase));

                const onCreditExchangeData = <onCreditExchange>(await this.creditExchange(betBase, new_credit));

            }

        }
    }

}