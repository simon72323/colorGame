import { CommandEventName, CostumeEventMap, ExchangeInfo, IfToolBar, ToolBarEventName, ToolbarEventMap, log, onCreditExchange } from "../include";
import { Component, ccenum, _decorator, EventMouse, input, Input, EventHandler, Button, Node, Vec3, tween, Prefab, Enum, UIOpacity, Animation, Label, js, SpriteFrame, Sprite, sp, Tween, game, Game, director, Mask, Graphics, Color, profiler, KeyCode, color, utils, UITransform, Vec2, size, Size } from "cc";
const { ccclass, property, menu } = _decorator;
import { Emitter } from "strict-event-emitter";
import { Roller, RollerEvent } from "../wheel/Roller";
import { UtilsKit } from "../lib/UtilsKit";
import { MahjongRoller, MahjongRollerEvent } from "../wheel/MahjongRoller";
import { PrefabInstancePoolManager } from "../tools/PrefabInstancePoolManager";
import { symbolResource_TA } from "../../../../techArt/game/mahjong/script/symbolResource_TA";
import { FreeGameData, MockData, PayTypeData } from "../mock/MockData";
import { CalculationCupboard, WinLineType } from "./CalculationCupboard";
import { MahjongSymbol } from "../wheel/MahjongSymbol";
import { GameCommand, GameCommandMode } from "./GameCommand";
import { RecvMessage } from "../lib/RecvMessage";
import { BaseGame, BaseGameEventName } from "../lib/BaseGame";
import { symbolSet_TA } from "../../../../techArt/game/mahjong/script/symbolSet_TA";
import { Result } from "./Result";
import { BigWin } from "./BigWin";
import { TotalWin } from "./TotalWin";
import { Info } from "./Info";
import { WorkOnBlur } from "../tools/WorkOnBlur";
import { Marquee } from "../../../../common/script/components/Marquee";
import { BUILD } from "cc/env";
import { UserAnalysis } from "../lib/analytics/UserAnalysis";
import { Application } from "../Applicaiton";
import { LanguageFiles } from "../LanguageFiles";
import { LanguageManager } from "../LanguageManager";
import { AudioManager } from "./AudioManager";
import { SoundFiles } from "./SoundFiles";
import { Multiple } from "./Multiple";
import { MahjongCardsPool } from "../wheel/MahjongCardsPool";
import { AlertPanel } from "./AlertPanel";
import { diceSeats_TA } from "../../../../techArt/game/mahjong/script/diceSeats_TA";
import { WorkerTimeout } from "../lib/WorkerTimeout";
import { selectChipData } from "../../../colorGame/script/ColorGameInterfaceData";
export enum TransitionType {
    MAIN = "main", // main game
    FREE = "free", // free game
}

/**
 * 收到 begin game data 後延遲停止時間(單位:毫秒)
 */
enum DelayTimeToStop {
    FREE = 200, // free game
    AUTO = 200, // 自動狀態
    SPEED_UP = 0, // 加速狀態
    NORMAL = 2000, // 正常狀態
}

/**
 * 此局結束後延遲多久後自動開始下一局(單位:毫秒)
 */
enum DelayTimeToAutoSpin {
    FREE = 200, // free game
    AUTO = 200, // 自動狀態
}

@ccclass('GameManager')
@menu('Mahjong/GameManager')
export class GameManager extends Component implements BaseGame {
    /** 餘額 */
    public credit: number;
    /** 下注比例 */
    public betBase: string;
    /** 下注比例列表 */
    public base: string;
    /** 線數 */
    public line: number;
    /** 下注比例 */
    public lineBet: number;
    /** 總押注 */
    public bet: number;
    /** 單號 */
    public wagersID: string;
    /** 結果牌型 */
    public cards?: any;
    /** 贏得分數 */
    public payoff: number;
    /** 每線結果 */
    public lines?: any;
    public scatter?: any;
    public bonus?: any;
    public free: RecvMessage.MahjongFreeGameSpin;
    public freeTimes: number;
    public doubleTime: number;
    public winJPType?: number;
    public winJPAmount?: number;
    public levelID?: number;
    public brickNum?: number;
    public axisLocation?: string;
    public betCreditList?: number[];
    public defaultBetCredit?: number;
    /** @deprecated */
    public isCash: boolean;
    public isExchangePageOpen: boolean;

    protected diceNum: Array<number>; // 本花對應骰子點數
    protected myFlowerID: Array<number>; // 本花 ID

    public readonly events: Emitter<CostumeEventMap> = new Emitter();
    @property({ type: GameCommand, tooltip: '遊戲按鈕相關物件' })
    command: GameCommand;
    /**
     * 這邊結構改變
     * @deprecated 
     */
    toolbar?: IfToolBar<ToolbarEventMap>;

    @property({ type: Roller })
    protected roller: Roller;

    @property({ type: Info })
    protected info: Info;

    @property({ type: [Node], tooltip: "牌型顯示(0=free、1=花、2=槓、3=碰、4=聽、5=胡)" })
    private fontType: Array<Node> = [];

    private symbolWinLayerBG: Node = null;
    @property({ type: SpriteFrame, tooltip: "單色貼圖" })
    private picBlock: SpriteFrame = null;

    @property({ type: Node, tooltip: "symbol中獎動畫層" })
    private symbolWinLayer: Node = null;
    @property({ type: Prefab, tooltip: "symbol中獎 Prefab" })
    private symbolWin: Prefab = null!;

    @property({ type: Node, tooltip: "抓位表演節點" })
    private diceSeatsNode: Node = null;

    @property({ type: Node, tooltip: "算牌區" })
    private calculationCupboard: Node = null;

    @property({ type: Multiple, tooltip: "目前倍率" })
    private multiple: Multiple = null;

    @property({ type: Node, tooltip: "免費遊戲上方背景圖" })
    private freeTopBg: Node = null;
    @property({ type: Node, tooltip: "免費遊戲剩餘次數介面" })
    private freeGameTimes: Node = null;
    @property({ type: Node, tooltip: "免費遊戲獲得" })
    private freeGameGet: Node = null;
    @property({ type: TotalWin, tooltip: "免費遊戲結算" })
    private totalWin: TotalWin = null;
    @property({ type: Node, tooltip: "free紀錄顯示" })
    private freeGet: Node = null;

    @property({ type: Result, tooltip: "胡牌結算畫面" })
    private result: Result = null;

    @property({ type: BigWin, tooltip: "大獎跑分層" })
    private bigWin: BigWin = null;

    @property({ type: Node, tooltip: "slot 主界面" })
    private slotGameUI: Node = null;

    @property({ type: symbolResource_TA, tooltip: "symbol資源" })
    private symbolResourceTA: symbolResource_TA = null;

    @property({ type: Marquee, tooltip: "跑馬燈" })
    private marquee: Marquee = null;

    private _isFree: boolean = false; // 是否在 Free Game 中
    private _freeGamePayoffTotal: number; // Free Game Total payoff (包含中 free game 那局)

    private currentCardIndex: number; // 目前顯示到牌組(cards)中的第幾組資料
    private arrCleanAll: Array<boolean>; // 每一牌組顯示後是否清除全部牌
    private arrListenStartIndex: Array<number>; // 每一牌組實做聽牌效果的起始轉輪 Index

    private rejectDelayingToStop: (reason?: any) => void;

    get isFree():boolean { return this._isFree }

    set payRate(a: Array<number>) { Multiple.payRate = a };
    set taiNum(a: Array<number>) { Multiple.taiNum = a };

    get event(): Node {
        return this.node;
    }

    onLoad() {

        profiler.hideStats(); // 關閉相關測試面板

        WorkOnBlur.getInstance();
        WorkerTimeout.getInstance().enable();

        this.roller.node.on(RollerEvent.StopEnd, this.checkCurrentCrad, this);
        this.roller.node.on(RollerEvent.DropEnd, this.checkCurrentCrad, this);
        this.roller.node.on(MahjongRollerEvent.DropAwayEnd, this.nextPhase, this);

        // this.command.node.on(CommandEventName.SPIN, this.onSpin, this);
        this.command.node.on(CommandEventName.STOP, () => { this.onStop(true) }, this);

        this.symbolWinLayerBG = new Node("bg");
        this.roller.node.parent.addChild(this.symbolWinLayerBG);
        this.symbolWinLayerBG.setSiblingIndex(this.roller.node.getSiblingIndex() + 1);
        this.symbolWinLayerBG.setPosition(this.symbolWinLayer.position);
        this.symbolWinLayerBG.addComponent(UITransform);
        this.symbolWinLayerBG.addComponent(Sprite);
        this.symbolWinLayerBG.getComponent(Sprite).spriteFrame = this.picBlock;
        this.symbolWinLayerBG.getComponent(Sprite).color = new Color(0, 0, 0, 255 * 0.7);
        this.symbolWinLayerBG.getComponent(UITransform).contentSize = new Size(1080, 1110);
        this.symbolWinLayer.active = false;
        this.symbolWinLayerBG.active = false;
        this.symbolWinLayerBG.addComponent(UIOpacity);

        this.freeGameGet.setPosition(0, 0, 0);

        this.info.updateSN("");
        this.multiple.updateMultiple(0);

        this.command.lock();
    }

    start(): void {
        LanguageManager.getInstance().setSpriteFrame(this.fontType[0].getChildByName('tx').getComponent(Sprite), LanguageFiles.FreeSpins);
        LanguageManager.getInstance().setSpriteFrame(this.freeGameTimes.getChildByName('tx').getComponent(Sprite), LanguageFiles.FreeSpinsRemaining);
        LanguageManager.getInstance().setSpriteFrame(this.freeGet.getChildByName('freeGetTx').getChildByName('tx').getComponent(Sprite), LanguageFiles.FreeSpinsSmall);
        this.freeTimes = 0;
    }
    /** @deprecated */
    protected createToolbar(): any {

    }

    protected createCommand(): any {
        // GUI Setup Command
    }

    /**
     * 連線取得OnloadInfo會觸發setupGame
     */
    public setupGame(): void {
        // onLoadInfo Success
        log(`GameManager:setupGame() started`);

        if (this.betCreditList) {
            log("this.betCreditList", this.betCreditList);
            this.command.arrBet = this.betCreditList;
            this.command.currentBet = this.defaultBetCredit;
        } else if (!BUILD) { // for standalone
            this.command.arrBet = MockData.arrBet;
        }
    }

    /**
     * 彩池更新
     * @param value 
     */
    public updateJackpot(value: number[]): void {
        // TODO: Jackpot panel update value array
        // 目前這款遊戲沒有JP
    }

    /**
     * 跑馬燈更新
     * @param message 訊息更新
     */
    public updateMarquee(message: string): void {
        this.marquee.addText(message);
        this.marquee.run();
    }

    /** 更新資訊 */
    updateInfo(exchangeInfo?: ExchangeInfo): void {
        if (!exchangeInfo && !BUILD) { // for standalone
            this.info.updateCredit(MockData.credit);
            this.info.updateBetBase(MockData.betBase);
        } else if(exchangeInfo) {
            this.info.updateCredit(exchangeInfo.credit);
            this.info.updateBetBase(exchangeInfo.betBase);
        }
    };

    updateBet(): void {
        this.info.updateBet(this.bet);
    };
    updateBottomInfo(gameId: string, userId: string) {
        this.info.updateBottomInfo(gameId, userId);
    }

    begin(data?: RecvMessage.MahjongBeginGameData) {

        if (!data && !BUILD) { // for standalone
            // data = MockData.produceMockData(this.command.currentBet);
            data = MockData.produceMockDataFromServer();
        }

        log("beginGame Data", data);
        const { isAuto, doSpeedUp } = this.command;
        let flags: Record<UserAnalysis.BeginGameFlags, boolean> = {
            auto: isAuto,
            turbo: doSpeedUp
        }
        UserAnalysis.Instance.beginGame(flags);

        this.command.accumulationOfSpin();

        this.cards = data.Cards;
        this.lines = data.Lines;
        this.scatter = data.FreeGame;
        this.free = data.FreeGameSpin;
        this.payoff = data.PayTotal;
        this.bonus = data.PayType;
        this.credit = data.Credit;
        this.wagersID = data.WagersID.toString();

        this.info.updateCredit(this.credit);
        this.info.updateSN(this.wagersID);

        this.delayToStop().then(() => {
            this.onStop(false);
        }).catch((reason: any) => {
            log(reason);
        });
    };

    public disableExchange(): void {
        // 開關換分面板?!
    }

    public clear(): void {

    }

    /**
     * 抓位
     * @param diceNum 骰子點數
     * @param myFlowerID 本花 ID
     */
    public pickTheSeat(diceNum: Array<number>, myFlowerID: Array<number>): Promise<void> {
        return new Promise(async (resolve)=>{
            if (!this.diceNum) {
                this.diceNum = diceNum;
                this.myFlowerID = myFlowerID;
                this.calculationCupboard.getComponent(CalculationCupboard).myFlowerID = myFlowerID;
                this.result.myFlowerID = myFlowerID;
                Multiple.myFlowerID = myFlowerID;

                this.command.lock();
                await this.diceSeatsNode.getComponent(diceSeats_TA).runDiceSeats(diceNum, myFlowerID);
                this.command.mode(GameCommandMode.BETTING);
            } 
            resolve();
        })
    }

    public async onSpin() {
        MahjongCardsPool.getInstance().produceCardsPool();

        this.cards = null;
        this.currentCardIndex = 0;
        this.roller.speedUp(this.command.doSpeedUp);
        this.roller.launch();
        this.command.mode(GameCommandMode.SPINNING);
        this.command.setSpinAnimationSpeed(4);

        this.calculationCupboard.getComponent(CalculationCupboard).clean();
        this.info.endWinTotalScore();
        this.multiple.updateMultiple(0);
        this.diceSeatsNode.getComponent(diceSeats_TA).showMyFlower(true);

        if (this._isFree) {
            this.freeGameTimes.getChildByName('label').getComponent(Label).string = (this.freeTimes - 1).toString();
        }
    }

    protected delayToStop() {
        return new Promise(async (resolve, reject) => {

            this.rejectDelayingToStop = reject;

            let delayTimeToStop: number;
            if (this.command.doSpeedUp) {
                delayTimeToStop = DelayTimeToStop.SPEED_UP;
            } else if (this._isFree) {
                delayTimeToStop = DelayTimeToStop.FREE;
            } else {
                if (this.command.isAuto) {
                    delayTimeToStop = DelayTimeToStop.AUTO;
                } else {
                    delayTimeToStop = DelayTimeToStop.NORMAL;
                    this.command.mode(GameCommandMode.CAN_STOP);
                }
            }

            if (delayTimeToStop > 0) {
                await UtilsKit.DeferByScheduleOnce(delayTimeToStop);
            }

            resolve(null);
        })
    }

    protected onStop(triggerByCommand: boolean) {
        this.rejectDelayingToStop("reject delaying to stop because of manual");
        this.rejectDelayingToStop = null;

        this.command.lock();

        let arrCards: Array<Array<number>> = [];
        for (let i: number = 0; i < 5; i++) {
            arrCards.push(this.cards[this.currentCardIndex].slice(i * 4, (i + 1) * 4));
        }

        let extendedCards: Array<Array<number>>;
        let fillUpData: { ExtendedCards: Array<Array<number>>, CleanAll: Array<boolean>, ListenStartIndex: Array<number> } = (<MahjongRoller>this.roller).takeMahjongFillUpData(this.cards, this.lines, this.scatter, this._isFree);
        extendedCards = fillUpData.ExtendedCards;
        this.arrCleanAll = fillUpData.CleanAll;
        this.arrListenStartIndex = fillUpData.ListenStartIndex;

        log("arrCleanAll", this.arrCleanAll);

        this.roller.listenStartIndex = this.arrListenStartIndex[this.currentCardIndex];
        this.roller.stop(arrCards, triggerByCommand ? 0 : this.roller.stopDelayTime, extendedCards);
    }

    /**
     * 遊戲結束須通知 model 做資料結算
     */
    protected over() {
        this.event.emit(BaseGameEventName.END);
    }

    /**
     * model 做資料結算後確認此局結束
     */
    public end(credit: number) {
        this.credit = credit;
        this.nextRound();
    }

    /**
     * 下一局
     */
    protected async nextRound() {

        this.info.updateCredit(this.credit);

        if (this.payoff && this.payoff > 0) {
            this.info.updateAccumulatedScore(this.payoff);
        }

        // 此局結束後 free game 狀態
        this._isFree = ((this.scatter && this.scatter.length > 0) || (this.free && this.free.FreeGameTime > 0));
        if (this._isFree) {
            if (this._freeGamePayoffTotal == null) {
                this._freeGamePayoffTotal = this.payoff;
            }

            if (this.scatter && this.scatter.length > 0) {
                if (this.free) {
                    this.freeTimes = this.free.FreeGameTime;
                } else {
                    this.freeTimes = 0;
                }
                let len: number = this.scatter.length;
                for (let i: number = 0; i < len; i++) {
                    this.freeTimes += (<FreeGameData>this.scatter[i]).FreeGameTime;
                }
            } else {
                this.freeTimes = this.free.FreeGameTime;
            }
        } else {
            this.freeTimes = 0;
        }

        // 退出此局免費遊戲獲得紀錄
        if (this.freeGet.active) {
            this.freeGet.getComponent(Animation).play('freeGetExit');
            await UtilsKit.DeferByScheduleOnce(300);
            this.freeGet.active = false;
        }
        this.fontType[0].active = false;

        // 做場景轉換
        if (this._isFree) {
            await this.runTransition(TransitionType.FREE);
        } else {
            await this.runTransition(TransitionType.MAIN);
        }

        if (this._isFree) { // free game 自動開始
            await UtilsKit.DeferByScheduleOnce(DelayTimeToAutoSpin.FREE);
            this.command.node.emit(CommandEventName.SPIN);
        } else if (this.command.isAuto) {
            await UtilsKit.DeferByScheduleOnce(DelayTimeToAutoSpin.AUTO);
            if (this.command.currentAutoNumber > 0) {
                this.command.currentAutoNumber--;
            }
            this.command.node.emit(CommandEventName.SPIN);
        } else {
            this.onBettingStatus();
        }
    }

    /**
     * 遊戲為可下注狀態
     */
    public onBettingStatus(): void {
        this.command.currentAutoNumber = 0;
        this.command.mode(GameCommandMode.BETTING);
        this.command.setSpinAnimationSpeed(1);
    }

    /**
     * 轉場景
     * @param transitionType free game or main game
     */
    protected runTransition(transitionType: TransitionType): Promise<void> {
        return new Promise(async (resolve) => {
            if (transitionType == TransitionType.MAIN && this.freeTopBg.active) {

                // 與後端確認過 FreeGamePayoffTotal 並不包含當局 payoff
                this._freeGamePayoffTotal += (this.free.FreeGamePayoffTotal + this.payoff);
                if (this._freeGamePayoffTotal > 0) {
                    await this.totalWin.running(this._freeGamePayoffTotal);
                }

                AudioManager.getInstance().stopEffect(0.3);
                tween(this.freeTopBg.getComponent(UIOpacity)).to(0.3, { opacity: 0 })
                    .call(() => {
                        this.freeTopBg.active = false;
                    }).start();

                tween(this.freeGameTimes.getComponent(UIOpacity)).to(0.3, { opacity: 0 })
                    .call(() => {
                        this.freeGameTimes.active = false;
                        // this.info.updateBet(this.command.currentBet);
                        resolve();
                    }).start();

            } else if (transitionType == TransitionType.FREE && !this.freeTopBg.active) {

                AudioManager.getInstance().play(SoundFiles.FGInto);
                await UtilsKit.PlayAnimation(this.freeGameGet, null, true);  // 獲得免費遊戲

                this.freeGameGet.active = false;

                AudioManager.getInstance().playEffect({ soundId: SoundFiles.FGBakcgroundMusic, duration: 0.3, loop: true });

                const freeGameTimesUIOpacity: UIOpacity = this.freeGameTimes.getComponent(UIOpacity);
                freeGameTimesUIOpacity.opacity = 0;
                this.freeGameTimes.active = true;
                tween(freeGameTimesUIOpacity).to(0.3, { opacity: 255 }).start();

                const freeTopBgUIOpacity: UIOpacity = this.freeTopBg.getComponent(UIOpacity);
                freeTopBgUIOpacity.opacity = 0;
                this.freeTopBg.active = true;
                tween(freeTopBgUIOpacity).to(0.3, { opacity: 255 })
                    .call(() => {
                        // this.info.updateBet(0);
                        resolve();
                    }).start();

            } else {
                resolve();
            }
        })
    }

    protected checkCurrentCrad() {
        if (this.cards.length - 1 > this.currentCardIndex || this.bonus.WinCard) {
            this.winProcess();
        } else {
            this.showConclusion(false);
        }
    }

    /**
     * 中獎流程(此遊戲順序為 補花 --> 槓 --> 碰)
     */
    private async winProcess() {
        let arrFlower: Array<any> = [];
        let arrKong: Array<any> = [];
        let arrPong: Array<any> = [];

        let len: number = this.lines[this.currentCardIndex].length;
        for (let i: number = 0; i < len; i++) {
            let line: any = this.lines[this.currentCardIndex][i];
            if (line["ElementID"] >= 35 && line["ElementID"] <= 42) {
                arrFlower.push(line);
            } else if (line["GridNum"] == 4 || line["GridNum"] == 1) {
                arrKong.push(line);
            } else if (line["GridNum"] == 3) {
                arrPong.push(line);
            }
        }

        // 處理 補花 --> 槓 --> 碰
        let arrWin: Array<Array<any>> = [arrFlower, arrKong, arrPong];
        let arrWinFontTypeIndex: Array<number> = [1, 2, 3];
        let arrWinType: Array<string> = [WinLineType.FLOWER, WinLineType.KONG, WinLineType.PONG];
        let arrWinTypeSound: Array<string> = [SoundFiles.WinHandsFlowerTiles, SoundFiles.Kong, SoundFiles.Pong];
        len = arrWin.length;
        for (let i: number = 0; i < len; i++) {
            let win: Array<any> = arrWin[i];
            let winLen: number = win.length;
            if (winLen > 0) {

                this.fadeInWinLayer();

                if (!this.fontType[4].active) {
                    if (arrWinTypeSound[i]) {
                        AudioManager.getInstance().play(arrWinTypeSound[i]);
                    }
                    this.fontType[arrWinFontTypeIndex[i]].active = false;
                    this.fontType[arrWinFontTypeIndex[i]].active = true;
                    if (arrWinType[i] == WinLineType.KONG || arrWinType[i] == WinLineType.PONG) {
                        this.slotGameUI.getComponent(Animation).play('shark'); //播放震動
                    }
                }

                let arrWinSymbol: Array<Array<MahjongSymbol>> = [];
                for (let j: number = 0; j < winLen; j++) {
                    arrWinSymbol.push([]);
                    AudioManager.getInstance().play(SoundFiles.Mjslc);
                    if (j == winLen - 1) {
                        await this.playSymbolWinAnimation(win[j]["Grids"], arrWinSymbol[j]);
                    } else {
                        this.playSymbolWinAnimation(win[j]["Grids"], arrWinSymbol[j]);
                    }
                }

                await this.fadeOutWinLayer();

                for (let j: number = 0; j < winLen; j++) {
                    if (j == winLen - 1) {
                        await this.calculationCupboard.getComponent(CalculationCupboard).place(arrWinType[i], win[j]["ElementID"], arrWinSymbol[j], this.roller.doSpeed);
                    } else {
                        this.calculationCupboard.getComponent(CalculationCupboard).place(arrWinType[i], win[j]["ElementID"], arrWinSymbol[j], this.roller.doSpeed);
                    }
                }

                // 還是得 call eliminate，為了讓轉輪順利執行掉落
                for (let j: number = 0; j < winLen; j++) {
                    this.roller.eliminate(win[j]["Grids"]);
                }
            }
        }

        // 湊滿 Free Game 物件  
        if (this.scatter && this.scatter.length > 0) {
            let len: number = this.scatter.length;
            for (let i: number = 0; i < len; i++) {
                if ((<FreeGameData>this.scatter[i]).Round == this.currentCardIndex + 1) {
                    this.fadeInWinLayer();
                    await this.playScatterWinAnimation((<FreeGameData>this.scatter[i]).Grids, (<FreeGameData>this.scatter[i]).FreeGameTime);
                    await this.fadeOutWinLayer();
                    break;
                }
            }
        }

        if (this.cards.length - 1 == this.currentCardIndex && this.bonus.WinCard) { // 胡了！
            // 先處理 眼睛
            let allEye: Array<number> = this.bonus.AllEye;
            let allEyeLen: number = allEye.length;
            let arrWinSymbol: Array<Array<MahjongSymbol>> = [];
            if (allEyeLen > 0) {
                for (let k:number = 0; k < allEyeLen; k++) {
                    let winSymbols: Array<MahjongSymbol> = (<MahjongRoller>this.roller).getPairSymbol(allEye[k]);
                    let len: number = winSymbols.length;
                    if (len >= 2) { // 不是用算牌區(碰或槓)的元素作眼睛
                        
                        if (arrWinSymbol.length == 0) {
                            this.fadeInWinLayer();
                            AudioManager.getInstance().play(SoundFiles.Mjslc);
                        } else {
                            arrWinSymbol[arrWinSymbol.length - 1][1].getComponent(MahjongSymbol).win(this.symbolWinLayer);
                        }

                        arrWinSymbol.push([winSymbols[0], winSymbols[1]]);
                        winSymbols[0].getComponent(MahjongSymbol).win(this.symbolWinLayer);
                    }
                }
            }
            len = arrWinSymbol.length;
            if (len > 0) {
                arrWinSymbol[arrWinSymbol.length - 1][1].getComponent(MahjongSymbol).win(this.symbolWinLayer);
                await this.fadeOutWinLayer();

                // 將眼睛放置算牌區
                for (let i: number = 0; i < len; i++) {
                    if (i == len - 1) {
                        await this.calculationCupboard.getComponent(CalculationCupboard).place(WinLineType.PAIR, arrWinSymbol[i][0].symbolID + 1, arrWinSymbol[i], this.roller.doSpeed);
                    } else {
                        this.calculationCupboard.getComponent(CalculationCupboard).place(WinLineType.PAIR, arrWinSymbol[i][0].symbolID + 1, arrWinSymbol[i], this.roller.doSpeed);
                    }   
                }
            }

            // 再顯示 "胡" 特效
            this.fadeInWinLayer();
            this.slotGameUI.getComponent(Animation).play('shark'); //播放震動
            AudioManager.getInstance().play(SoundFiles.Mahjong);
            this.fontType[5].active = false;
            this.fontType[5].active = true;

            let multiple: number = Multiple.calculateWinningMultiple(this.payoff, this.bet);
            this.multiple.updateMultiple(multiple);
            this.diceSeatsNode.getComponent(diceSeats_TA).showMyFlower(multiple == 0);

            await UtilsKit.DeferByScheduleOnce(3000);

            this.showConclusion(true);
            this.symbolWinLayer.active = false;
            this.symbolWinLayerBG.active = false;
        } else {
            const calculationCupboard: CalculationCupboard = this.calculationCupboard.getComponent(CalculationCupboard);

            let multiple: number = Multiple.calculateMultiple(calculationCupboard.getSetInfo(), calculationCupboard.getFlowerInfo());
            this.multiple.updateMultiple(multiple);
            this.diceSeatsNode.getComponent(diceSeats_TA).showMyFlower(multiple == 0);

            //顯示聽牌
            if (this.calculationCupboard.getComponent(CalculationCupboard).isReady()) {
                AudioManager.getInstance().play(SoundFiles.ReadyHand);
                this.fontType[4].active = true;
                await UtilsKit.DeferByScheduleOnce(1000);
            }

            if (this.arrCleanAll[this.currentCardIndex]) {
                this.dropAway();
            } else {
                this.nextPhase();
            }
        }
    }

    /**
     * 播放中獎動畫
     * @param grids symbol 位置
     * @param 所有中獎 symbol
     */
    private playSymbolWinAnimation(grids: Array<number>, arrWinSymbol?: Array<MahjongSymbol>): Promise<void> {
        return new Promise(async (resolve) => {
            let len: number = grids.length;
            for (let i: number = 0; i < len; i++) {

                let winSymbol: MahjongSymbol = this.roller.getSymbolByIndex(grids[i]).getComponent(MahjongSymbol);
                if (arrWinSymbol) {
                    arrWinSymbol.push(winSymbol);
                }

                if (i == len - 1) {
                    await winSymbol.getComponent(MahjongSymbol).win(this.symbolWinLayer);
                } else {
                    winSymbol.getComponent(MahjongSymbol).win(this.symbolWinLayer);
                }
            }
            resolve();
        })
    }

    /**
     * 播放 Scatter 動畫
     * @param grids symbol 位置
     * @param times 贏得次數
     * @returns 
     */
    private playScatterWinAnimation(grids: Array<number>, times: number): Promise<void> {
        return new Promise(async (resolve) => {
            AudioManager.getInstance().play(SoundFiles.Scatter);
            await this.playSymbolWinAnimation(grids);

            // 還是得 call eliminate，為了讓轉輪順利執行掉落
            this.roller.eliminate(grids);

            this.freeTimes += times;

            // 獲得免費遊戲動態字
            const fontType = this.fontType[0];
            fontType.active = true;
            fontType.getChildByName('label').getComponent(Label).string = `+${times}`;
            fontType.getChildByName('getAgain').active = false;
            fontType.getChildByName('getFx').active = false;

            AudioManager.getInstance().play(SoundFiles.FGGet);

            if (this._isFree) {
                fontType.getChildByName('getAgain').active = true;
            } else {
                fontType.getChildByName('getFx').active = true;
            }

            // 等待指向線特效出現
            await UtilsKit.DeferByScheduleOnce(2200);

            if (!this.freeGameTimes.active) {
                const timesGetLabel: Label = this.freeGet.getChildByName('freeGetTx').getChildByName('label').getComponent(Label);
                AudioManager.getInstance().play(SoundFiles.FGAdd);
                if (this.freeGet.active) {
                    let previousTimes: number = Number(timesGetLabel.string.split("+")[1]);
                    timesGetLabel.string = `+${previousTimes + times}`;
                    this.freeGet.getComponent(Animation).play('freeGetAgain');
                } else {
                    timesGetLabel.string = `+${times}`;
                    this.freeGet.getComponent(UIOpacity).opacity = 0;
                    this.freeGet.active = true; // 顯示獲得免費遊戲紀錄
                    this.freeGet.getComponent(Animation).play('freeGet');
                }
            }

            const timesLabel: Node = this.freeGameTimes.getChildByName('label');
            if (this.freeGameTimes.active) {
                timesLabel.getComponent(Animation).play(); // 播放縮放動態
                timesLabel.getComponent(Label).string = (this.freeTimes - 1).toString();
            } else {
                timesLabel.getComponent(Label).string = this.freeTimes.toString();
            }

            resolve();
        })
    }

    /**
     * 目前牌組進行補牌前掉落
     */
    private dropAway() {
        (<MahjongRoller>this.roller).dropAway();
    }

    /**
     * 目前牌組進行補牌後掉落
     */
    private drop() {
        this.roller.listenStartIndex = this.arrListenStartIndex[this.currentCardIndex];
        this.roller.drop();
    }

    /**
     * 進行此局下一階段
     */
    private nextPhase() {
        this.currentCardIndex++;
        this.drop();
    }

    /**
     * 結算
     * @param isWinning 是否有胡牌
     */
    private async showConclusion(isWinning: boolean) {
        this.fontType[4].active = false; // 隱藏聽牌狀態

        if (this.payoff > 0) {
            if (isWinning) {

                this.result.node.active = true; // 顯示胡牌結算畫面

                this.result.setResult(this.bonus, this.calculationCupboard.getComponent(CalculationCupboard)); // 設置結算內容

                this.result.score = this.payoff; // 設置結算得分

                const animation: Animation = this.result.getComponent(Animation);
                await UtilsKit.PlayAnimation(this.result.node, animation.clips[0].name, true);

                // 判斷是否執行bigWin跑分
                if (this.payoff >= this.bet * this.bigWin.bigWinMultiple[0]) {
                    await this.bigWin.running(this.bet, this.payoff);
                }
                await this.result.showResultScore(); // 顯示結算總得分

            } else {
                // 判斷是否執行bigWin跑分
                if (this.payoff >= this.bet * this.bigWin.bigWinMultiple[0]) {
                    await this.bigWin.running(this.bet, this.payoff);
                }
            }

            await this.info.showWinTotalScore(this.payoff); // 顯示共贏得
        }

        this.over();
    }

    private fadeInWinLayer() {
        this.symbolWinLayer.active = true;
        this.symbolWinLayerBG.active = true;
        tween(this.symbolWinLayerBG.getComponent(UIOpacity)).to(0.1, { opacity: 255 }).start();
    }

    private fadeOutWinLayer(): Promise<void> {
        return new Promise(async (resolve) => {
            tween(this.symbolWinLayerBG.getComponent(UIOpacity)).to(0.1, { opacity: 0 })
                .call(() => {
                    this.symbolWinLayer.active = false;
                    this.symbolWinLayerBG.active = false;
                    resolve();
                }).start();
        })
    }
    public onHotKeys(keyCode: KeyCode) {
        log(`hotKeys ${keyCode}`);
        if (keyCode === KeyCode.SPACE) {

            if (AlertPanel.getInstance().node.active) {
                return;
            }

            if (this.bigWin.node.active) {
                this.bigWin.skip();
            } else if (this.result.node.active && this.result.canSkip) {
                this.result.endResultScore();
            } else {
                this.command.onHotKeys(keyCode);
            }



        }
    }


}
