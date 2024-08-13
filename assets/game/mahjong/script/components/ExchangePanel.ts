import { AbstractExchangePanel, ExchangeInfo, ExchangePanelEventMap, ExchangePanelEventName, log } from "../include";
import { Button, CCFloat, CCInteger, CCObject, CCString, Component, Label, _decorator, Node, warn, Input, Toggle, CCBoolean } from "cc";
import { Emitter } from "strict-event-emitter";
import { UserAutoExchange } from "../lib/BaseDataModel";
import { Localization, LocalizedStrKeys } from "../lib/Localization";
import { userAnalysis } from "../include";
import { AudioManager } from "./AudioManager";
import { SoundFiles } from "./SoundFiles";
import { UtilsKit } from "../lib/UtilsKit";
import { customButton } from "../../../../common/script/ui/customButton";
const { ccclass, menu, property } = _decorator;

const FORM_GROUP = { name: 'Form', style: 'section' };
const AUTO_EXCHANGE_GROUP = { name: 'AutoExchange', style: 'section', id: '3' };
const QUICK_EXCHANGE_GROUP = { name: 'QuickExchangeToolbar', style: 'section', id: '2' };
const SUBMIT_GROUP = { name: 'Submit Button', style: 'section', id: '4' };
const EXCHANGE_GROUP = { name: 'Exchange', style: 'section', id: '3' };

export const GUIVisible = {
    titleText: function () { return !!this.title; },
    balanceTitle: function () { return !!this.balanceTitle; },
    creditTitle: function () { return !!this.creditTitle; },
    exchangeTitle: function () { return !!this.exchangeTitle; },
    balanceLabel: function () { return !!this.balanceLabel; },
    creditLabel: function () { return !!this.creditLabel; },
    exchangeInvalidFeedback: function () { return !!this.exchangeInvalidFeedback; },
    autoExchangeLabelText: function () { 
        return !!this.autoExchangeLabelOff || !!this.autoExchangeLabelOn; 
    },
    autoExchangeTooltip: function () { return !!this.autoExchangeTooltip; },
    submitButtonLabel: function () { return !!this.submitButtonLabel; } 
}

// 無法繼承IfExchangePanel update 事件衝突
@ccclass('ExchangePanel')
@menu(`Mahjong/ExchangePanel`)
export class CocosExchangePanel extends Component {
    /**
     * @description ExchangePanel emit `display` event from the component function
     */
    protected exchangePanel: ExchangePanel = new ExchangePanel();
    // 用程式碼建立
    protected programCodesInitial: boolean = false;
    
    @property( { type: CCObject, visible: false, tooltip:'介面暫存資訊' } ) 
    protected exchangeInfo: ExchangeInfo = {
        balance: 0,
        base: '1:1',
        betBase: '1:1',
    };

    @property( { type: CCObject, visible: false, tooltip:'介面暫存資訊' } )
    protected dataElements: { userName: string, exchange: number, isAuto: boolean } = { userName: '', exchange: 0, isAuto: false };

    @property( { type:CCString, displayName: "UserName" } )
    public get userName(): string {
        return this.exchangePanel.userName;
    }
    public set userName(value: string) {
        const { dataElements, exchangePanel } = this;
        dataElements.userName = exchangePanel.userName = value;
    }

    @property( { type:CCString, displayName: "BetBase", tooltip:'換分比例' } )
    public get betBase(): string {
        return this.exchangePanel.betBase;
    }
    public set betBase(value: string) {
        const { exchangeInfo, exchangePanel } = this;
        exchangeInfo.betBase = exchangePanel.betBase = value;
    }
    @property( { type:CCString } )
    public get base(): string {
        return this.exchangeInfo.base;
    }
    public set base(value: string) {
        const { exchangeInfo, exchangePanel } = this;
        exchangeInfo.base = value;
        exchangePanel.update(this.exchangeInfo);
        log(`exchangeInfo.base = ${exchangePanel.base}`);
    }
    @property( { type:CCFloat, group: { name: 'washInfo', style: 'section' } } )
    public get transCredit(): number {
        return this.exchangeInfo.washInfo?.transCredit || 0;
    }
    public set transCredit(value: number) {
        const { exchangeInfo } = this;
        if (!exchangeInfo.washInfo) {
            exchangeInfo.washInfo = { transCredit: 0, amount: 0 };
        }
        exchangeInfo.washInfo.transCredit = value;

        const { transCredit, amount } = exchangeInfo.washInfo;

        if (transCredit === 0 && amount === 0) {
            delete exchangeInfo.washInfo;
        }
    }

    @property( { type:CCFloat, group: { name: 'washInfo', style: 'section' } } )
    public get amount(): number {
        return this.exchangeInfo.washInfo?.amount || 0;
    }
    public set amount(value: number) {
        const { exchangeInfo } = this;
        if (!exchangeInfo.washInfo) {
            exchangeInfo.washInfo = { transCredit: 0, amount: 0 };
        }
        exchangeInfo.washInfo.amount = value;

        const { transCredit, amount } = exchangeInfo.washInfo;

        if (transCredit === 0 && amount === 0) {
            delete exchangeInfo.washInfo;
        }
    }
    // 標題
    @property( { type: Label, group: FORM_GROUP, tooltip: '標題' } )
    protected title: Label = null;
    @property( { type: CCString, group: FORM_GROUP, tooltip: "標題: 文字", visible: GUIVisible.titleText } )
    protected get titleText(): string { 
        return (this.title) ? this.title.string : ''; }
    protected set titleText(value: string) {
        if (this.title) this.title.string = value;
    }
    @property( { type: Label, group: FORM_GROUP, tooltip: '可用餘額' } )
    protected balanceTitle: Label = null;
    @property( { type: CCString, tooltip:'可用餘額標題', displayName: 'Balance Text', group: { name: 'Form', style: 'section' }, visible: GUIVisible.balanceTitle } )
    public get balanceTitleText(): string {
        return this.balanceTitle?.string;
    }
    public set balanceTitleText(value: string) {
        if (this.balanceTitle) {
            this.balanceTitle.string = value;
        }
    }
    @property( { type: Label, group: FORM_GROUP, tooltip: '目前分數' } )
    protected creditTitle: Label = null;
    @property( { type: CCString, tooltip:'目前分數標題', displayName: 'Credit Text', group: { name: 'Form', style: 'section' }, visible: GUIVisible.creditTitle } )
    public get creditTitleText(): string {
        return this.creditTitle?.string;
    }
    public set creditTitleText(value: string) {
        if (this.creditTitle) {
            this.creditTitle.string = value;
        }
    }
    @property( { type: Label, group: FORM_GROUP, tooltip: '對換分數' } )
    protected exchangeTitle: Label = null;
    @property( { type: CCString, tooltip:'對換分數標題', displayName: 'Excahnge Text', group: { name: 'Form', style: 'section' }, visible: GUIVisible.exchangeTitle } )
    public get exchangeTitleText(): string {
        return this.exchangeTitle?.string;
    }
    public set exchangeTitleText(value: string) {
        if (this.exchangeTitle) {
            this.exchangeTitle.string = value;
        }
    }
    // 餘額
    @property( { type: Label, group: FORM_GROUP } )
    protected balanceLabel: Label = null;
    @property( { type:CCFloat, tooltip:'可用餘額', displayName: 'Balance Value', group: { name: 'Form', style: 'section' }, visible: GUIVisible.balanceLabel } )
    public get balance(): number {
        return this.exchangeInfo.balance;
    }
    public set balance(value: number) {
        const { exchangeInfo, exchangePanel } = this;
        exchangePanel.balance = value;
    }
    // 分數
    @property( { type: Label, group: FORM_GROUP } )
    protected creditLabel: Label = null;
    @property( { type:CCFloat, tooltip:'目前分數', displayName: 'Credit Value', group: FORM_GROUP, visible: GUIVisible.creditLabel } )
    public get credit(): number {
        return this.exchangePanel.credit;
    }
    public set credit(value: number) {
        const { exchangeInfo, exchangePanel } = this;
        exchangePanel.credit = value;
    }
    // 兌換分數
    @property( { type: Label, group: EXCHANGE_GROUP } )
    protected exchangeLabel: Label = null;
    @property( { type:CCInteger, tooltip:'兌換分數', displayName: 'Exchange Value', group: EXCHANGE_GROUP, visible: GUIVisible.creditLabel } )
    public get exchange(): number {
        return this.exchangePanel.exchange;
    }
    public set exchange(value: number) {
        const { dataElements, exchangePanel, resetButton, exchangeInvalidFeedback, exchangeLabel } = this;
        exchangePanel.exchange = value;
        if (exchangeLabel) exchangeLabel.string = String(value.toLocaleString());
        let isValid: boolean = (exchangePanel.exchange > 0);
        if (resetButton != null) {
            resetButton.node.active = isValid;
        }
        
        if (exchangeInvalidFeedback && isValid) {
            exchangeInvalidFeedback.node.parent.active = false;
        }
    }
    @property( { type: Button, tooltip: '重製按鈕', group: EXCHANGE_GROUP } )
    protected resetButton: Button = null;

    @property( { type: Label, displayName: 'Invalid Feedback', tooltip: "換分提示", group: EXCHANGE_GROUP } )
    protected exchangeInvalidFeedback: Label = null;

    @property( { type: CCString, displayName: 'Invalid Text',tooltip: '自動換分提示框:說明文字', group: EXCHANGE_GROUP, visible: GUIVisible.exchangeInvalidFeedback } )
    protected get exchangeInvalidFeedbackText() {
        return this.exchangeInvalidFeedback.string;
    }
    protected set exchangeInvalidFeedbackText(value: string) {
        this.exchangeInvalidFeedback.string = value; 
    }

    @property( { type: Node, displayName: "Button Group", tooltip: '快速換分按鈕列', group: QUICK_EXCHANGE_GROUP } )
    protected quickExBar: Node[] = [];
    
    @property( { type: CCString, displayName: "Value List", group: QUICK_EXCHANGE_GROUP })
    protected quickExBarValues: string[] = ['100', '500', '-1'];
    
    protected quickExBarLabels: Label[] = [];

    @property( { type: Toggle, tooltip: '自動換分切換按鈕', group: AUTO_EXCHANGE_GROUP } )
    protected autoExchangeToggle: Toggle = null;

    @property( { type: CCBoolean, tooltip: '是否開啟自動換分', group: AUTO_EXCHANGE_GROUP } )
    public get isAutoExchange(): boolean {
        return this.dataElements.isAuto;
    }
    public set isAutoExchange(value: boolean) {
        if (this.autoExchangeToggle && value != this.dataElements.isAuto) {
            this.autoExchangeToggle.isChecked = value;
        }
        this.dataElements.isAuto = value;
    }

    @property( { type: Node, tooltip: '提示按鈕', group: AUTO_EXCHANGE_GROUP } )
    protected autoTipButton: Node = null;

    @property( { type: Label, tooltip: '自動換分', group: AUTO_EXCHANGE_GROUP } )
    protected autoExchangeLabelOn: Label = null;
    
    @property( { type: Label, tooltip: '自動換分', group: AUTO_EXCHANGE_GROUP } )
    protected autoExchangeLabelOff: Label = null;
    
    @property( { type: CCString, tooltip: '自動換分標題文字', group: AUTO_EXCHANGE_GROUP, visible: GUIVisible.autoExchangeLabelText } )
    public get autoExchangeLabelText(): string {
        if (this.autoExchangeLabelOff) {
            return this.autoExchangeLabelOff.string;
        } else if (this.autoExchangeLabelOn) {
            return this.autoExchangeLabelOn.string;
        } else {
            return '';
        }
    }
    public set autoExchangeLabelText(value: string) {
        const { autoExchangeLabelOff, autoExchangeLabelOn } = this;
        if (autoExchangeLabelOff) {
            autoExchangeLabelOff.string = value;
        }
        if (autoExchangeLabelOn) {
            autoExchangeLabelOn.string = value;
        }
    }
    
    @property( { type: Label, displayName: 'Tooltip', tooltip: '自動換分提示框:物件', group: AUTO_EXCHANGE_GROUP } )
    protected autoExchangeTooltip: Label = null;
    
    @property( { type: CCString, displayName: 'Tooltip Text',tooltip: '自動換分提示框:說明文字', group: AUTO_EXCHANGE_GROUP, visible: GUIVisible.autoExchangeTooltip } )
    public get autoExchangeTooltipText() {
        return this.autoExchangeTooltip.string;
    }
    public set autoExchangeTooltipText(value: string) {
        this.autoExchangeTooltip.string = value; 
    }

    @property( { type: Button, tooltip: '送出按鈕', group: SUBMIT_GROUP } )
    protected submitButton: Button = null;
   
    @property( { type: Label, tooltip: '送出按鈕文字', group: SUBMIT_GROUP } )
    protected submitButtonLabel: Label = null;

    @property( { type: CCString, group: SUBMIT_GROUP, visible: GUIVisible.submitButtonLabel } )
    protected get submitButtonText(): string {
        if (this.submitButtonLabel) {
            return this.submitButtonLabel.string;
        }
    };
    protected set submitButtonText(value: string) { 
        if (this.submitButtonLabel) {
            this.submitButtonLabel.string = value;
        }
    };

    protected backdrop: Node = null;

    public get isShow(): boolean { return this.exchangePanel.isShow; }

    public get exBalance(): number { return this.exchangePanel.exBalance; }

    public get nowMaxChange(): number { return this.exchangePanel.nowMaxChange; }

    public get event(): Emitter<ExchangePanelEventMap> {
        return this.exchangePanel.event;
    }

    constructor() {
        super();
        
        this.exchangePanel.event.on('display', () => this.updateDisplay());
    }
    protected create():void {
        const { quickExBar, exchangeInvalidFeedback, backdrop, submitButton, submitButtonLabel } = this;

        if (!backdrop) {
            this.backdrop = this.node.getChildByName('black');
        }

        if (submitButton && !submitButtonLabel) {
            this.submitButtonLabel = submitButton.node.getChildByName('label')?.getComponent(Label);
        }

        // create attributes 
        const { programCodesInitial } = this;
        // 用程式建立
        if (!programCodesInitial) return;
        if (quickExBar.length === 0) {
            let tabBar: Node = this.node.getChildByName('selectBtns');
            tabBar.children.forEach((item: Node) => {
                quickExBar.push(item);
            });
        }
    }
    protected onLoad(): void {
        this.create();
        this.localized();
        //this.title = this.node.getChildByName('title').getComponent(Label);
        log(`this.quickExBarValues: ${this.quickExBarValues}`);

        const { quickExBar, submitButton, exchangeInvalidFeedback, backdrop, autoExchangeTooltip, autoExchangeToggle, autoTipButton, resetButton } = this;

        if (resetButton) {
            resetButton.node.on(Button.EventType.CLICK, () => {
                AudioManager.getInstance().play(SoundFiles.ButtonClick);
                this.exchange = 0;
                userAnalysis.addCounter('exchange_reset');
            });
        }
        if (quickExBar) {
            quickExBar.forEach((button: Node, index) => {
                let label: Label = button.getChildByName('label').getComponent(Label);
                this.quickExBarLabels.push(label)
                
                if (this.quickExBarValues[index] == '-1') {
                    label.string = Localization.getInstance().get(LocalizedStrKeys.EXCHANGE_FILLED)
                } else {
                    label.string = UtilsKit.FormatNumber(Number(this.quickExBarValues[index]));
                }
                button.on(Button.EventType.CLICK, () => {
                    AudioManager.getInstance().play(SoundFiles.ButtonClick);
                    const { exchangePanel } = this;
                    let value: number = 0;
                    if (this.quickExBarValues[index] == '-1') {
                        value = this.exchangePanel.nowMaxChange;
                        this.addExchange(value)
                        this.exchange = exchangePanel.exchange;
                        userAnalysis.addCounter(`exchange_quick_full`);
                        userAnalysis.exchangeData.push({default: true, value: this.exchange });
                    } else {
                        value = +this.quickExBarValues[index];
                        this.addExchange(value)
                        this.exchange = exchangePanel.exchange;
                        userAnalysis.addCounter(`exchange_quick_${this.quickExBarValues[index]}`);
                        userAnalysis.exchangeData.push({default: true, value: this.exchange });
                    }
                    log(`
quickExBar.balance: ${exchangePanel.balance}
${exchangePanel.exchange} + ${(value)} = ${exchangePanel.exchange + value}`);
                });
            })
        }
        if (submitButton) {
            submitButton.node.on(Button.EventType.CLICK, () => this.creditExchange());
        }
        if (exchangeInvalidFeedback) {
            exchangeInvalidFeedback.node.parent.active = false;
        }
        
        if (backdrop) {
            backdrop.on(Input.EventType.TOUCH_END, () => {
                if (autoExchangeTooltip) autoExchangeTooltip.node.parent.active = false;
                
            });
        }
        log(`toggling`, autoExchangeToggle);
        if (autoExchangeToggle) {
            autoExchangeToggle.node.on(Toggle.EventType.CLICK, () => {
                setTimeout(()=>{
                    AudioManager.getInstance().play(SoundFiles.ButtonClick);
                    if (autoExchangeTooltip) autoExchangeTooltip.node.parent.active = false;
                    if ((this.exchange + this.credit) === 0 && autoExchangeToggle.isChecked) {
                        autoExchangeToggle.isChecked = false;
                        return exchangeInvalidFeedback.node.parent.active = true;
                    }
                    exchangeInvalidFeedback.node.parent.active = false;
                    this.dataElements.isAuto = autoExchangeToggle.isChecked;
                }, 0)
            })
        }
        if (autoTipButton) {
            autoTipButton.on(Button.EventType.CLICK, () => {
                AudioManager.getInstance().play(SoundFiles.ButtonClick);
                if (autoExchangeTooltip) autoExchangeTooltip.node.parent.active = !autoExchangeTooltip.node.parent.active;
            })
        }
        
        this.node.on(Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED, () => {
            log(`ACTIVE_IN_HIERARCHY_CHANGED`, this.node.active);
            if (this.node.active) {
                this.exchangePanel.show();
                this.setup();
            } else {
                this.clear();
                this.exchangePanel.close();
            }
        });

    }
    protected localized(): void {
        const localized = Localization.getInstance();
        this.titleText = localized.get(LocalizedStrKeys.GAME_EXCHANGE);
        this.balanceTitleText = localized.get(LocalizedStrKeys.CREDIT);
        this.creditTitleText = localized.get(LocalizedStrKeys.GAME_CURRENT_SCORE);
        this.exchangeTitleText = `${localized.get(LocalizedStrKeys.SCORE_EXCHANGE)}(1:1)`;
        this.exchangeInvalidFeedbackText = localized.get(LocalizedStrKeys.EXCHANGE_SCORE_NOT_EMPTY);
        this.autoExchangeLabelText = localized.get(LocalizedStrKeys.NOT_ENOUGH_AUTO_EXCHANGE);
        this.autoExchangeTooltipText = localized.get(LocalizedStrKeys.NOT_ENOUGH_AUTO_EXCHANGE_TOOLTIP);
        this.submitButtonText = localized.get(LocalizedStrKeys.START_GAME);
        
    }
    protected setup(): void {
        // 設定初始化參數

    }
    protected clear(): void {
        // 清除參數
        this.exchange = 0;
        
    }
    protected start(): void {
        const { exchangeInfo, exchangePanel } = this;
        exchangePanel.update(exchangeInfo);
        // 這邊是將介面設定暫存值寫到物件
        this.updateDisplay();
    }
    /** 換分？ */
    public getChangeCredit(credit: number, fromBase: string, toBase: string): number {
        return this.exchangePanel.getChangeCredit(credit, fromBase, toBase);
    }
    /** 更新資訊 */
    public dataUpdate(info: ExchangeInfo) {
        log(`dataUpdate`, info);
        
        this.exchangePanel.update(info);
    }
    public updateDisplay(): void {
        // TODO: should draw be need display
        const { exchangePanel, exchangeInfo, dataElements } = this;
        
        console.debug(`Before update exchangePanel data >
  balance: ${exchangePanel.balance} > ${exchangeInfo.balance}
  credit: ${exchangePanel.credit} > ${exchangeInfo.credit}
  exchange: ${exchangePanel.exchange} > ${dataElements.exchange}`);
        dataElements.exchange   = exchangePanel.exchange;
        exchangeInfo.balance    = exchangePanel.balance;
        exchangeInfo.credit     = exchangePanel.credit;
        this.balanceLabel.string    = String(exchangeInfo.balance.toLocaleString());
        this.creditLabel.string     = String(exchangeInfo.credit.toLocaleString());
        this.exchangeLabel.string   = String(dataElements.exchange.toLocaleString());
        if (!this.submitButton.enabled) {
            this.submitButton.enabled = true;
            this.close();
            this.node.emit('SettingViewClose');
        }

        this.autoExchangeTooltip.node.parent.active = true;
        
        this.quickBarLargestInTheRange();
    }
    
    public addExchange(value: number) {
        this.exchangePanel.addExchange(value);
    }
    /**
     * 最大值換分
     */
    public maxChange() {
        this.exchangePanel.maxChange();
    }

    public show() {
        this.node.active = true;
    }
    // auto 事件觸發
    public close() {
        this.node.active = false;
        this.clear();
    }

    /** Submit: 按鈕事件 */
    public creditExchange(): void {
        AudioManager.getInstance().play(SoundFiles.ButtonClick);
        const { betBase, exchange, credit } = this.exchangePanel;
        log(`Submited: { betBase: ${ betBase }, amount: ${ exchange } }`);
        let ratio: string = betBase;
        let amount: number = exchange;
        this.exchangePanel.creditExchange(ratio, amount);
        if (this.submitButton) {
            this.submitButton.enabled = false;
        }
        userAnalysis.exchange(userAnalysis.exchangeData);
        
        if (amount === 0) this.updateDisplay();
    }
    /** 按鈕事件 */
    public balanceExchange(): void {
        this.exchangePanel.balanceExchange();
    }
    /** 按鈕事件 */
    public changeRatio(ratio: string): void {
        this.exchangePanel.changeRatio(ratio);
    }
    /** 按鈕事件 */
    public leaveGame(): void {
        this.exchangePanel.leaveGame();
    }
    /** 更新: 自動換洗分狀態 */
    public updateUserAutoExchange(data: UserAutoExchange): void {
        if (data) this.isAutoExchange = data.IsAuto;
    }
    /** 更新快速換分按鈕 */
    public updateQuickExchangeBar(values: string[]) {
        const { quickExBar } = this;

        if (quickExBar) {
            quickExBar.forEach((button: Node, index) => {
                this.quickExBarValues[index] = values[index] || "0";
                if (this.quickExBarLabels.length > index) {
                    if (this.quickExBarValues[index] == '-1') {
                        this.quickExBarLabels[index].string = Localization.getInstance().get(LocalizedStrKeys.EXCHANGE_FILLED)
                    } else {
                        this.quickExBarLabels[index].string = UtilsKit.FormatNumber(Number(this.quickExBarValues[index]));
                    }
                }
            })
        }
    }
    // 
    public quickBarLargestInTheRange(): void {
        const { quickExBar, exchangeInfo } = this;
        if (!quickExBar) return;
        quickExBar.forEach((button: Node, index) => {
            let btn: customButton = button.getComponent(customButton);
            let value = +(this.quickExBarValues[index]);
            if (value == -1) return; //value = Math.floor(this.balance);
            if (this.credit + this.exchange + value > this.balance) {
                btn.interactable = false;
            } else {
                btn.interactable = true;
            }
        });
    }
}

export class ExchangePanel extends AbstractExchangePanel {
    protected _betBase: string = "1:1";
    protected _userName: string = "****";
    set userName(value: string) {
        this._userName = value;
    }
    get userName(): string {
        return this._userName;
    }
    protected updateDisplay(): void {
        this.event.emit('display');
    }
    public creditExchange(ratio: string, amount: number): void {
        super.creditExchange(ratio, amount);
    }
    public balanceExchange(): void {
        super.balanceExchange();
    }
    public changeRatio(ratio: string): void {
        super.changeRatio(ratio);
    }
    public leaveGame(): void {
        super.leaveGame();
    }
}