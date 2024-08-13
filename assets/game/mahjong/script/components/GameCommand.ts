import { CommandEventName, log } from "../include"
import { Animation, Button, Component, EventHandler, KeyCode, Label, Node, _decorator, js } from "cc"
import { AutoSetPanel } from "./AutoSetPanel"
import { BetSetPanel } from "./BetSetPanel"
import { AlertPanel, DialogEventTypes, MahjongAlertEvent } from "./AlertPanel";
import { AudioManager } from "./AudioManager";
import { SoundFiles } from "./SoundFiles";
import { userAnalysis } from "../include";
import { Localization, LocalizedStrKeys } from "../lib/Localization";
import { UserPrefs } from "../lib/UserPrefs";
import { UserAnalysis } from "../lib/analytics/UserAnalysis";
const { ccclass, property, menu } = _decorator;

export enum GameCommandMode 
{
    BETTING = "betting", // 可下注狀態
    SPINNING = "spinning", // 等待 BEGIN_GAME_DATA(輪軸旋轉)狀態
    CAN_STOP = "can_stop" // 收到 BEGIN_GAME_DATA(輪軸旋轉)可以停止狀態
}

type SpeedUpAlertStatus = {
    alertHasBeenVisible: boolean;
    buttonHasBeenTriggered: boolean;
    accumulationOfSpin: number;
};

@ccclass('GameCommand')
@menu('Mahjong/GameCommand')
export class GameCommand extends Component {

    @property({ type: Button, tooltip: "spin 按鈕" })
    protected btnSpin: Button = null;

    @property({ type: Button, tooltip: "+ 按鈕" })
    protected btnPlus: Button = null;

    @property({ type: Button, tooltip: "- 按鈕" })
    protected btnMinus: Button = null;

    @property({ type: Button, tooltip: "加速按鈕" })
    protected btnSpeedUp: Button = null;

    @property({ type: Button, tooltip: "取消加速按鈕" })
    protected btnSpeedUpStop: Button = null;

    @property({ type: Button, tooltip: "auto 按鈕" })
    protected btnAuto: Button = null;

    @property({ type: Button, tooltip: "auto stop 按鈕" })
    protected btnAutoStop: Button = null;

    @property({ type: Button, tooltip: "bet 按鈕" })
    protected btnBet: Button = null;

    @property({ type: Button, tooltip: "換分面板 按鈕" })
    protected btnExchange: Button = null;

    @property({ type: Button, tooltip: "設定 按鈕" })
    protected btnSetting: Button = null;

    @property({ type: Node, tooltip: "auto 次數 Node" })
    protected autoSetNode: Node = null;

    @property({ type: AutoSetPanel, tooltip: "auto 次數設定面板" })
    protected autoSetPanel: AutoSetPanel = null;

    @property({ type: BetSetPanel, tooltip: "bet 設定面板" })
    protected betSetPanel: BetSetPanel = null;

    @property({ type: Node, tooltip: "目前 auto 次數 Node" })
    protected currentAutoNumberNode: Node = null;


    protected _gameMode: GameCommandMode; // 遊戲按鈕模式
    protected _isAuto: boolean = false; // 是否為自動狀態
    protected _currentAutoNumber: number = 0; // 目前自動次數
    protected _doSpeedUp: boolean = false; // 是否加速
    protected _speedUpAlertStatus: SpeedUpAlertStatus = // [快速旋轉]提示面板狀態
    {   
        alertHasBeenVisible: false,
        buttonHasBeenTriggered: false, 
        accumulationOfSpin: 0
    };

    get event(): Node {
        return this.node;
    }

    get gameMode(): GameCommandMode {
        return this._gameMode;
    }

    get isAuto(): boolean {
        return this._isAuto;
    }

    set currentAutoNumber(n :number) {
        this._currentAutoNumber = n;

        const lableNode: Node = this.currentAutoNumberNode.getChildByName("label");
        const infinityNode: Node = this.currentAutoNumberNode.getChildByName("infinite");
        if (n >= 0) {
            infinityNode.active = false;
            lableNode.active = true;
            lableNode.getComponent(Label).string = n.toString();
        } else {
            infinityNode.active = true;
            lableNode.active = false;
        }

        if (n == 0) {
            this._isAuto = false;
        } else {
            this._isAuto = true;
        }
        this.btnSpin.node.active = !this._isAuto;
        this.btnAutoStop.node.active = this._isAuto;
        this.currentAutoNumberNode.active = this._isAuto;
    }

    get currentAutoNumber(): number {
        return this._currentAutoNumber;
    }

    get doSpeedUp(): boolean {
        return this._doSpeedUp;
    }

    set arrBet(arr: Array<number>) {
        this.betSetPanel.arrBet = arr;
    }

    set currentBet(n: number) {
        this.betSetPanel.currentBet = n;
    }

    get currentBet(): number {
        return this.betSetPanel.currentBet;
    }

    public onLoad(): void {
        log(`command onload`);

        this.autoSetPanel.autoNumberNode = this.autoSetNode;

        this.btnSpin.node.on(Button.EventType.CLICK, () => { this.handleSpin() });
        this.btnAuto.node.on(Button.EventType.CLICK, () => { this.handleAuto() });
        this.btnAutoStop.node.on(Button.EventType.CLICK, () => { this.handleAutoStop() });
        this.btnPlus.node.on(Button.EventType.CLICK, () => { this.handlePlus() });
        this.btnMinus.node.on(Button.EventType.CLICK, () => { this.handleMinus() });
        this.btnSpeedUp.node.on(Button.EventType.CLICK, () => { this.handleSpeedUp(UserAnalysis.TurboOption.SetTurbo) });
        this.btnSpeedUpStop.node.on(Button.EventType.CLICK, () => { this.handleSpeedUp() });
        this.btnBet.node.on(Button.EventType.CLICK, () => { this.handleBet() });
        this.btnExchange.node.on(Button.EventType.CLICK, () => { this.handleExchange() });
        this.btnSetting.node.on(Button.EventType.CLICK, () => { this.handleSetting() });

        this.autoSetPanel.node.on(CommandEventName.CLOSE, this.handleAuto, this);
        this.betSetPanel.node.on(CommandEventName.CLOSE, () => { this.betSetPanel.node.active = false });
        this.betSetPanel.node.on(CommandEventName.UPDATE_LINEBET, this.handleLineBet, this);
    }

    // public setup(): void {
    //     // Trigger testcase
    //     this.event.emit(CommandEventName.SPIN);
    //     this.event.emit(CommandEventName.MAX_BET);
    //     let loop: boolean = false;
    //     this.event.emit(CommandEventName.LINE_BET, loop);
    //     this.event.emit(CommandEventName.LINE_BET_MINUS, loop);
    //     this.event.emit(CommandEventName.LINE, loop);
    //     this.event.emit(CommandEventName.LINE_MINUS, loop);
    //     this.event.emit(CommandEventName.DOUBLE);
    //     let lineBet = 0;
    //     this.event.emit(CommandEventName.UPDATE_LINEBET, lineBet);
    //     let line = 0;
    //     this.event.emit(CommandEventName.UPDATE_LINE, line);
    //     let betBae: string = '1:1'
    //     this.event.emit(CommandEventName.CHANGE_RATIO, betBae);

    //     this.event.emit(CommandEventName.EXCHANGE);
    // }

    protected async handleSpin(): Promise<void> {
        AudioManager.getInstance().play(SoundFiles.ButtonClick);
        if (this._gameMode == GameCommandMode.CAN_STOP) {
            this.event.emit(CommandEventName.STOP);
        } else {
            if (!this._speedUpAlertStatus.alertHasBeenVisible && !this._speedUpAlertStatus.buttonHasBeenTriggered) {
                // this._speedUpAlertStatus.accumulationOfSpin++;
                if (this._speedUpAlertStatus.accumulationOfSpin >= 3) {
                    this._speedUpAlertStatus.alertHasBeenVisible = true;
                    const localized = Localization.getInstance();
                    let result: MahjongAlertEvent = await AlertPanel.getInstance().alert({
                        message: localized.get(LocalizedStrKeys.OPEN_FASTWHEEL_ALERT),
                        iconButton: true,
                        isTouchBackdrop: false,
                        duration: 8000
                    });
                    if (result.isAccept) {
                        this.handleSpeedUp(UserAnalysis.TurboOption.ConfirmTurbo);
                    } else if (result.state === DialogEventTypes.TIMEOUT) {
                        userAnalysis.setTurboOption(UserAnalysis.TurboOption.TimeoutTurbo);
                    } else if (result.state === DialogEventTypes.CANCEL) {
                        userAnalysis.setTurboOption(UserAnalysis.TurboOption.CancelTurbo);
                    }
                }
            } 

            if (this.autoSetPanel.node.active) {
                this.currentAutoNumber = this.autoSetPanel.currentAutoNumber -1;
                this.autoSetPanel.node.active = false;
                this.autoSetNode.active = false;
            } else {
                this.currentAutoNumber = 0;
            }

            this.betSetPanel.node.active = false;
            this.event.emit(CommandEventName.SPIN);
            userAnalysis.addCounter("betOption");
        }
    }

    protected handleAuto(): void {
        AudioManager.getInstance().play(SoundFiles.ButtonClick);
        this.autoSetPanel.node.active = !this.autoSetPanel.node.active;
        this.autoSetNode.active = this.autoSetPanel.node.active;
        this.betSetPanel.node.active = false;
    }

    protected handleAutoStop(): void {
        AudioManager.getInstance().play(SoundFiles.ButtonClick);
        this.currentAutoNumber = 0;
    }

    protected handleLineBet(bet: number): void {
        if (this._gameMode == GameCommandMode.BETTING) {
            this.btnMinus.interactable = true;
            this.btnPlus.interactable = true;
            if (this.betSetPanel.currentBet == this.betSetPanel.arrBet[0]) {
                this.btnMinus.interactable = false;
            } else if (this.betSetPanel.currentBet == this.betSetPanel.arrBet[this.betSetPanel.arrBet.length - 1]) {
                this.btnPlus.interactable = false;
            }
        }
        this.node.emit(CommandEventName.UPDATE_LINEBET, bet);
        UserPrefs.getInstance().gameSettings.points = this.betSetPanel.currentBet;
    }

    protected handlePlus(): void {
        AudioManager.getInstance().play(SoundFiles.ButtonClick);
        this.betSetPanel.next();
        userAnalysis.addCounter("betPlus");
        UserPrefs.getInstance().gameSettings.points = this.betSetPanel.currentBet;
    }

    protected handleMinus(): void {
        AudioManager.getInstance().play(SoundFiles.ButtonClick);
        this.betSetPanel.previous();
        userAnalysis.addCounter("betMinus");
        UserPrefs.getInstance().gameSettings.points = this.betSetPanel.currentBet;
    }

    protected handleBet(): void {
        AudioManager.getInstance().play(SoundFiles.ButtonClick);
        this.betSetPanel.node.active = !this.betSetPanel.node.active;
        this.autoSetPanel.node.active = false;
        this.autoSetNode.active = false;
    }

    protected handleExchange(): void {
        AudioManager.getInstance().play(SoundFiles.ButtonClick);
        this.betSetPanel.node.active = false;
        this.autoSetPanel.node.active = false;
        this.autoSetNode.active = false;
        this.event.emit(CommandEventName.EXCHANGE);
    }

    protected handleSetting(): void {
        AudioManager.getInstance().play(SoundFiles.ButtonClick);
        this.betSetPanel.node.active = false;
        this.autoSetPanel.node.active = false;
        this.autoSetNode.active = false;
        this.event.emit(CommandEventName.EXCHANGE);
    }

    protected handleSpeedUp(option: UserAnalysis.TurboOption = 0): void {
        AudioManager.getInstance().play(SoundFiles.ButtonClick);
        this.btnSpeedUp.node.active = !this.btnSpeedUp.node.active;
        this.btnSpeedUpStop.node.active = !this.btnSpeedUpStop.node.active;
        this._doSpeedUp = !this.btnSpeedUp.node.active;
        UserPrefs.getInstance().gameSettings.doSpeedUp = this._doSpeedUp;
        this._speedUpAlertStatus.buttonHasBeenTriggered = true;
        if (option !== 0) userAnalysis.setTurboOption(option);
    }

    /**
    * 按鈕模式
    * @param mode 模式
    */
    public mode(gameMode:GameCommandMode):void 
    {
        this._gameMode = gameMode;
        switch (gameMode) 
        {
            case GameCommandMode.BETTING:
                this.bettingMode();
                break;
            case GameCommandMode.SPINNING:
                this.spinningMode();
                break;
            case GameCommandMode.CAN_STOP:
                this.canStopMode();
                break;
        }
    }

    private bettingMode():void 
    {
        this.btnSpin.interactable = true;
        this.btnAuto.interactable = true;
        this.btnBet.interactable = true;
        this.btnExchange.interactable = true;
        this.btnSetting.interactable = true;
        this.btnMinus.interactable = true;
        this.btnPlus.interactable = true;
        if (this.betSetPanel.currentBet == this.betSetPanel.arrBet[0]) {
            this.btnMinus.interactable = false;
        } else if (this.betSetPanel.currentBet == this.betSetPanel.arrBet[this.betSetPanel.arrBet.length - 1]) {
            this.btnPlus.interactable = false;
        }
    }

    private spinningMode():void 
    {
        this.btnSpin.interactable = false;
        this.btnPlus.interactable = false;
        this.btnMinus.interactable = false;
        this.btnAuto.interactable = false;
        this.btnBet.interactable = false;
        this.btnExchange.interactable = false;
        this.btnSetting.interactable = false;

        this.betSetPanel.node.active = false;
        this.autoSetPanel.node.active = false;
    }

    private canStopMode():void 
    {
        this.btnSpin.interactable = true;
        this.btnPlus.interactable = false;
        this.btnMinus.interactable = false;
        this.btnAuto.interactable = false;
        this.btnBet.interactable = false;
        this.btnExchange.interactable = false;
        this.btnSetting.interactable = false;
    }

    public lock():void 
    {
        this.btnSpin.interactable = false;
        this.btnPlus.interactable = false;
        this.btnMinus.interactable = false;
        this.btnAuto.interactable = false;
        this.btnBet.interactable = false;
        this.btnExchange.interactable = false;
        this.btnSetting.interactable = false;
    }

    public onHotKeys(keyCode: KeyCode) {
        if (keyCode === KeyCode.SPACE && this.btnSpin.interactable) {
            this.btnSpin.node.emit(Button.EventType.CLICK);
        }
    }

    public setSpinAnimationSpeed(speed: number) {
        const animation: Animation = this.btnSpin.getComponent(Animation);
        animation.getState(animation.defaultClip.name).speed = speed;
    }
    /**
     * 設定SpeedUp按鈕狀態
     * @param bool 
     */
    public setSpeedUp(bool: boolean) {
        this.btnSpeedUp.node.active = !bool;
        this.btnSpeedUpStop.node.active = bool;
        this._doSpeedUp = bool;
        if (bool) {
            this._speedUpAlertStatus.buttonHasBeenTriggered = true;
        }
    }
    /**
     * 設定SetBet按鈕金額
     * @param index 
     */
    public setBetAmount(num:number = 0) {
        if (num > 0)
            this.betSetPanel.currentBet = num;
    }
    /**
     * 成功才執行
     */
    public accumulationOfSpin() {
        this._speedUpAlertStatus.accumulationOfSpin++;
    }

}