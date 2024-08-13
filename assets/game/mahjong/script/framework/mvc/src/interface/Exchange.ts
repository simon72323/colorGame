import Decimal from 'decimal.js';
import { Emitter, EventMap } from 'strict-event-emitter';

export enum ExchangePanelEventName {
    CREDIT_EXCHANGE = "creditExchange",
    BALANCE_EXCHANGE = "balanceExchange",
    CHANGE_RATIO = "changeRatio",
    LEAVE_GAME = "leaveGame",
    AUTO_EXCHANGE = "autoExchange",
    SAVE_RECORD = "saveRecord",
    FULL_EXCHANGE = "fullExchange",
}


export interface ExchangePanelEventMap extends EventMap {
    [ExchangePanelEventName.CREDIT_EXCHANGE]: [{ betBase: string, amount: number; }];
    [ExchangePanelEventName.BALANCE_EXCHANGE]: [];
    [ExchangePanelEventName.CHANGE_RATIO]: [{ ratio: string; }];
    [ExchangePanelEventName.LEAVE_GAME]: [];
    [ExchangePanelEventName.AUTO_EXCHANGE]: [];
    [ExchangePanelEventName.SAVE_RECORD]: [record: string[]];
    [ExchangePanelEventName.FULL_EXCHANGE]: [];
};

export type ExchangeInfo = {
    credit?: number;
    balance?: number;
    betBase?: string;
    base?: string;
    washInfo?: {
        transCredit: number;
        amount: number;
    };
};
export class ExchangePanelEventDispatcher extends Emitter<ExchangePanelEventMap>{

}
export interface IfExchangePanel {

    readonly event: ExchangePanelEventDispatcher;
    readonly isShow: boolean;

    update(info: ExchangeInfo): void;
    show(): void;
    close(): void;

}


/**
 * 開洗分面板抽象類別  
 * 定義相關事件, 屬性 ,基本方法  
 * 後續開洗分面板需繼承此類別繼續實作顯示相關邏輯  
 */
export abstract class AbstractExchangePanel implements IfExchangePanel, Readonly<ExchangeInfo>  {
    protected _event: Emitter<ExchangePanelEventMap> = new Emitter();
    get event(): Emitter<ExchangePanelEventMap> { return this._event; }

    private _isShow: boolean = false;
    get isShow(): boolean { return this._isShow; }

    protected _balance: number = 0;
    protected _credit: number = 0;
    protected _exchange: number = 0;
    protected _betBase: string = '';
    protected _base: string = '';
    protected _washInfo?: { transCredit: number; amount: number; };
    protected _theMachChange = 50000000;
    protected _userName: string = "";

    get balance() { return this._balance; }
    get credit() { return this._credit; }
    get exchange() { return this._exchange; }

    set balance(value: number) {
        if (isNaN(value)) return;
        if (typeof value != 'number') return;
        this._balance = value;
        this.updateDisplay();
    }

    set credit(value: number) {
        if (isNaN(value)) return;
        if (typeof value != 'number') return;
        this._credit = value;
        this.updateDisplay();
    }
    set exchange(value: number) {
        if (isNaN(value)) return;
        if (typeof value != 'number') return;
        if (this.nowMaxChange < value) return;
        if (value == this._exchange) return;
        if (value < 0) return;
        this._exchange = value;
        this.updateDisplay();
    }

    set userName(value: string) {
        this._userName = value;
        this.updateDisplay();
    }

    set betBase(value: string) {
        this._betBase = value;
        this.updateDisplay();
    }


    get betBase() { return this._betBase; }
    get base() { return this._base; }
    get washInfo(): { transCredit: number; amount: number; } | undefined { return this._washInfo; }


    get ratio() {
        let ary = this.betBase.split(':').map(v => new Decimal(v.replace("K", "000")));
        return ary[0].div(ary[1]);
    }


    get exBalance() {
        const ary = this._betBase.split(':').map(v => new Decimal(v.replace("K", "000")));
        return new Decimal(this._balance).minus(new Decimal(this._exchange).times(ary[0]).div(ary[1])).toNumber();
    }

    get nowMaxChange() {

        const canChange = new Decimal(this._balance).div(this.ratio);

        const maxChange = new Decimal(this._theMachChange).minus(this._credit);

        if (canChange.greaterThan(maxChange)) return maxChange.toNumber();

        return canChange.toNumber();
    }

    constructor() {
        this.close();
    }

    getChangeCredit(credit: number, fromBase: string, toBase: string) {
        const ary = fromBase.split(':').map(v => new Decimal(v.replace("K", "000")));
        const fromCredit = new Decimal(credit).times(ary[0]).div(ary[1]);
        const toAry = toBase.split(':').map(v => new Decimal(v.replace("K", "000")));
        const toCredit = fromCredit.times(toAry[1]).div(toAry[0]);
        return toCredit.toNumber();
    }

    update(info: ExchangeInfo): void {
        if (info) {
            if (info.credit != null) this._credit = info.credit;
            if (info.balance != null) this._balance = info.balance;
            if (info.betBase != null) this._betBase = info.betBase;
            if (info.base != null) this._base = info.base;
            if (info.washInfo != null) this._washInfo = info.washInfo;
        }
        this.updateDisplay();
    }

    show() { this._isShow = true; }
    close(): void { this._isShow = false; }

    addExchange(value: number) {
        if (typeof value != 'number') return;
        this._exchange = Math.floor(Math.min(new Decimal(this._exchange).plus(value).toNumber(), this.nowMaxChange));
        this.updateDisplay();
    }

    maxChange() {
        this._exchange = Math.floor(this.nowMaxChange);
        this.updateDisplay();
    }
    protected updateDisplay(): void {

    }

    protected creditExchange(ratio: string, amount: number): void {
        this.event.emit(ExchangePanelEventName.CREDIT_EXCHANGE, { betBase: ratio, amount });
    }
    protected balanceExchange(): void {
        this.event.emit(ExchangePanelEventName.BALANCE_EXCHANGE);
    }
    protected changeRatio(ratio: string): void {
        this.event.emit(ExchangePanelEventName.CHANGE_RATIO, { ratio });
    }
    protected leaveGame(): void {
        this.event.emit(ExchangePanelEventName.LEAVE_GAME);
    }

}