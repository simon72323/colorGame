import { _decorator, Component, SpriteFrame, Animation, Node, LightProbeGroup } from 'cc';
import { CGView } from '../view/CGView';
import { CGModel } from '../model/CGModel';
import { CGZoomView } from '../view/CGZoomView';
import { CGChipDispatcher } from '../view/CGChipDispatcher';
import { CGRoundView } from '../view/CGRoundView';
import { CGChipSetView } from '../view/CGChipSetView';
// import { CGWinView } from '../view/CGWinView';
import { CGDiceRunView } from '../view/CGDiceRunView';
import { CGMarquee } from '../view/CGMarquee';
import { CGRoadView } from '../view/CGRoadView';
import PoolHandler from '../tools/PoolHandler';
import { GameState, Payoff, User, UserBets, onJoinGame, onLoadInfo, onUpdate } from '../enum/CGInterface';
import { IBetHandler } from '../enum/CGInterface';

import { CGRankView } from '../view/CGRankView';
import { CGDataService } from '../manager/CGDataService';
import { CGUtils } from '../tools/CGUtils';
import { PlayAnimOnEnable } from '../manager/anim/PlayAnimOnEnable';
const { ccclass, property } = _decorator;

@ccclass('CGController')
export class CGController extends Component {
    //組件腳本
    @property(CGModel)//GameModel
    public model: CGModel = null;
    @property(CGView)//基本介面
    public view: CGView = null;
    @property(CGZoomView)//骰子視角
    public zoomView: CGZoomView = null;
    @property(CGChipDispatcher)//籌碼表演
    public chipDispatcher: CGChipDispatcher = null;
    @property(CGRoundView)//回合流程
    public roundView: CGRoundView = null;
    @property(CGChipSetView)//籌碼設置
    public chipSetView: CGChipSetView = null;
    // @property(CGWinView)//勝利表演
    // public winView: CGWinView = null;
    @property(CGDiceRunView)//開骰表演
    public diceRunView: CGDiceRunView = null;
    @property(CGRoadView)//路子
    public roadView: CGRoadView = null;
    @property(CGRankView)//排名
    public rankView: CGRankView = null;
    @property(CGMarquee)//跑馬燈腳本
    private Marquee: CGMarquee = null;

    @property(Node)
    public waitNewRound!: Node;
    @property(Node)
    public lockBetArea!: Node;//禁用下注區，介面區域

    //遊戲資源


    private betHandler: IBetHandler | null = null;
    private dataService: CGDataService;//數據服務

    public setBetHandler(handler: IBetHandler) {
        this.betHandler = handler;
    }

    protected onLoad() {
        this.node.on('OnButtonEventPressed', this.betAreaPressed, this);
        this.dataService = CGDataService.getInstance();//實例化數據服務
        //非loading時暫時使用
        // CGPathManager.getInstance().node.on("completed", async () => {
        //路徑加載完畢，開始模擬遊戲
        // });

        // this.initWebSocket();
        //開始模擬server發送消息
        // this.startSimulatingServerMessages();
    }


    //----------處理遊戲流程----------
    /**
     * 處理新局開始
     * @param startColor 開始顏色編號
     */
    private handleNewRound(startColor: number[]) {
        if (this.waitNewRound)
            this.waitNewRound.active = false;//關閉派彩中
        this.roundView.startRound();//開始執行遊戲回合
        this.zoomView.zoomShowing();//放大鏡功能顯示
        this.diceRunView.diceIdle(startColor);//初始化骰子(隨機顏色)
        const reBetBetCredits = this.chipDispatcher.testReBet();//判斷是否執行續押(回傳續押注區額度)
        if (reBetBetCredits) {
            this.betHandler.onBet(reBetBetCredits, 'reBet');//傳送續押各注區注額
        }
    }

    /**
     * 處理下注資料
     * @param newBets 前三名+其他玩家新增注額
     */
    private handleNewBets(newBets: number[][]) {
        for (let i = 0; i < newBets.length; i++) {
            this.otherUserDelayBet(i, newBets[i]);//前三名+其他玩家新增注區注額
        }
    }

    /*
    //處理下注資料(全用戶注額版本)
    // private handleBets(newAllBets: UserBets[]) {
    //     for (let i = 0; i < newAllBets.length; i++) {
    //         const userID = newAllBets[i].userID;//紀錄該userID
    //         const newBets = newAllBets[i].betCredits;//本次下注資料
    //         let oldBets: number[] = new Array(newBets.length).fill(0);;//上一次同玩家下注資料
    //         let isNewPlayer = true; // 標記是否為新玩家
    //         for (let j = 0; j < this.model.allBets.length; j++) {
    //             if (userID === this.model.allBets[j].userID) {
    //                 oldBets = this.model.allBets[j].betCredits;
    //                 isNewPlayer = false; // 找到匹配的玩家，不是新玩家
    //                 break;
    //             }
    //         }
    //         let addBets: number[] = new Array(newBets.length);//新增的注額
    //         for (let j = 0; j < newBets.length; j++) {
    //             addBets[j] = newBets[j] - (oldBets?.[j] || 0);
    //         }
    //         //有新增注額才表演籌碼下注且不是本地玩家
    //         if (!addBets.every(bet => bet === 0) && userID !== this.model.userID) {
    //             for (let k = 0; k < 3; k++) {
    //                 if (userID === this.model.rankings[k].userID) {
    //                     //前三名玩家下注
    //                     const rankID = k + 1;
    //                     const userPos = this.chipDispatcher.userPos.children[rankID];
    //                     const startPos = userPos.getWorldPosition();
    //                     for (let l = 0; l < addBets.length; l++) {
    //                         const chipCredit = addBets[l];
    //                         if (chipCredit > 0) {
    //                             //隨機延遲下注表演
    //                             setTimeout(() => {
    //                                 userPos.getComponent(Animation).play();//頭像移動
    //                                 this.chipDispatcher.otherUserBetChip(l, rankID, chipCredit, startPos);
    //                                 //如果本地玩家有跟注，這時要表演跟注
    //                             }, Math.random() * 800)
    //                         }
    //                     }
    //                 } else {
    //                     //非前三名玩家的表演
    //                     const rankID = 4;
    //                     const userPos = this.chipDispatcher.userPos.children[rankID];
    //                     const startPos = userPos.getWorldPosition();
    //                     for (let l = 0; l < addBets.length; l++) {
    //                         const chipCredit = addBets[l];
    //                         if (chipCredit > 0) {
    //                             //隨機延遲下注表演
    //                             setTimeout(() => {
    //                                 this.chipDispatcher.otherUserBetChip(l, rankID, chipCredit, startPos);
    //                             }, Math.random() * 800)
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     this.model.allBets = [...newAllBets];//更新參數
    // }
    */

    /**
     * 處理回合結束流程與派獎
     * @param pathID 路徑ID
     * @param winColor 勝利顏色編號
     * @param userPayoff 本地用戶派彩
     * @param ranksPayoff 前三名用戶派彩
     */
    private async handleEndRound(pathID: number, winColor: number[], userPayoff: Payoff, ranksPayoff: Payoff[]) {
        const { localWinArea, betOdds } = this.model.calculateWinData(winColor);//計算表演所需參數
        this.model.setPathData(pathID);//設置該回合路徑資料
        // 停止下注等操作
        this.roundView.betStop();//停止下注
        this.lockBetArea.active = true;//啟用禁用下注區
        this.zoomView.zoomHideing();//放大鏡功能隱藏
        this.chipDispatcher.updateReBetData(this.model.betTotal, this.model.userBetAreaCredits);//更新寫入續押資料
        await CGUtils.Delay(1);
        await this.diceRunView.diceStart(this.model.pathData, winColor);//骰子表演
        this.roundView.endRound(winColor, localWinArea, betOdds, userPayoff)//表演開獎結果
        await CGUtils.Delay(1);
        for (let i = 0; i < betOdds.length; i++) {
            if (betOdds[i] === 0)
                this.chipDispatcher.recycleChip(i);//回收未中獎的籌碼 
        }
        await CGUtils.Delay(0.9);
        for (let i = 0; i < betOdds.length; i++) {
            if (betOdds[i] > 0)
                this.chipDispatcher.payChipToBetArea(i, this.model.calculateOdds(betOdds[i]));//派發籌碼
        }
        await CGUtils.Delay(2.1);
        this.model.betTotal = 0;//清空下注分數
        //本地玩家加分
        if (userPayoff.payoff > 0) {
            this.roundView.showAddCredit(userPayoff.payoff);//顯示加分
            this.model.credit = userPayoff.credit;//用戶額度更新
        }
        this.view.comBtnCredits.getComponent(Animation).play();
        this.view.updateUserCredit(this.model.credit); //本地餘額更新
        this.rankView.updateRanksCredit(ranksPayoff);//排名用戶餘額更新
        //等待新局開始
    }
    //----------處理遊戲流程----------

    /**
     * ==========確認下注按鈕按下==========
     */
    private btnBetConfirmDown() {
        this.betHandler.onBet(this.chipDispatcher.tempBetCredits, 'newBet');//傳送新增各注區注額
    }

    /**
     * ==========續押按鈕按下==========
     * @param event 
     * @param state 續押狀態
     */
    private btnReBetDown(event: Event, state: string) {
        const reBetBetCredits = this.chipDispatcher.setReBet(state);//續押各注區注額
        if (reBetBetCredits) {
            this.betHandler.onBet(reBetBetCredits, 'reBet');//傳送續押各注區注額
        }
    }

    /**
     * 本地用戶下注區按下(監聽事件觸發，僅做籌碼移動)
     * @param param 注區ID
     */
    private betAreaPressed(param: string) {
        const data = this.dataService;
        const betID = parseInt(param);
        const chipID = data.touchChipID;//目前點選的籌碼ID
        const touchChipPos = this.chipSetView.touchChip.children[this.dataService.touchChipPosID].getWorldPosition();//選擇的籌碼世界座標位置
        this.chipDispatcher.betChip(betID, chipID, touchChipPos);//該籌碼移動至下注區
    }

    /**
     * 處理本地用戶新下注成功
     * @param betCredits 注區下注金額分佈
     * @param credit 餘額
     */
    public handleNewBetSuccessful(betCredits: number[], credit: number) {
        const view = this.view;
        const model = this.model;
        this.model.updateBetCredit(betCredits, credit);
        this.chipDispatcher.newBetSuccessful(this.model.betTotal);//執行下注成功
        view.updateUserCredit(model.credit);
        view.updateBetAreaCredits(model.totalBetAreaCredits, model.betTotal, model.userBetAreaCredits);
    }

    /**
     * 處理本地用戶新下注失敗
     */
    public handleNewBetError() {
        this.chipDispatcher.newBetError();
    }

    /**
     * 處理本地用戶續押下注成功
     * @param betCredits 注區下注金額分佈
     * @param credit 餘額
     */
    public async handleReBetSuccessful(betCredits: number[], credit: number) {
        const view = this.view;
        const model = this.model;
        this.model.updateBetCredit(betCredits, credit);
        this.chipDispatcher.reBetSuccessful(this.model.betTotal);//執行下注成功
        await CGUtils.Delay(0.3);//延遲顯示分數更新
        view.updateUserCredit(model.credit);
        view.updateBetAreaCredits(model.totalBetAreaCredits, model.betTotal, model.userBetAreaCredits);
    }

    /**
     * 處理本地用戶續押下注失敗
     */
    public handleReBetError() {
        this.chipDispatcher.reBetError();
    }

    /**
     * 處理登入遊戲流程
     * @param msg 用戶登入資料
     */
    public handleLogInfo(msg: onLoadInfo) {
        const { userID, credit } = msg.data;
        this.model.userID = userID;
        this.model.credit = credit;
    }

    /**
     * 處理加入遊戲流程
     * @param msg 加入遊戲資料
     */
    public handleJoinGame(msg: onJoinGame) {
        const { gameState, avatarID, wagersID, betCreditList, startColor, countdown, betTotalTime,
            roadMap, totalBetAreaCredits, rankings, liveCount, pathID, winColor, userPayoff, ranksPayoff
        } = msg.data;
        this.model.avatarID = avatarID;
        this.model.wagersID = wagersID;
        this.dataService.betCreditList = betCreditList;
        this.model.roadMap = roadMap;
        this.model.rankings = rankings;
        this.model.liveCount = liveCount;
        this.model.betTotalTime = betTotalTime;
        this.model.totalBetAreaCredits = totalBetAreaCredits;//更新注區額度
        this.rankView.updateRanks(rankings, this.model.userID);//更新排名，同時判斷跟注狀態
        this.rankView.updateLiveCount(liveCount);//更新線上人數
        switch (gameState) {
            case GameState.NewRound:
            case GameState.Betting:
                this.roadView.updateRoadMap(roadMap);//更新路子
                this.handleNewRound(startColor);
                this.roundView.setCountdown(countdown, betTotalTime);//表演時間倒數
                let otherTotalBets = [...totalBetAreaCredits];
                //配置已下注籌碼
                for (let i = 0; i < rankings.length; i++) {
                    this.otherUserDelayBet(i, rankings[i].betCredits);//前三名玩家籌碼下注
                    for (let j = 0; j < rankings[i].betCredits.length; j++) {
                        const betCredit = rankings[i].betCredits[j];
                        otherTotalBets[j] -= betCredit;//更新其他玩家下注分數
                    }
                }
                this.otherUserDelayBet(3, otherTotalBets);//其他玩家籌碼下注
                break;
            case GameState.EndRound:
                //更新路子，表演開骰結果(路徑最後一格)，並更新路子
                this.model.roadMap.pop();//刪除最後一個路子
                this.model.roadMap.push(winColor);//添加新路子
                this.roadView.updateRoadMap(this.model.roadMap);//更新路子
                this.waitNewRound.active = true;
                break;
        }
    }

    /**
     * 模擬其他玩家延遲下注
     * @param rankID 排名位置
     * @param betCredits 注區下注金額分佈
     */
    private async otherUserDelayBet(rankID: number, betCredits: number[]) {
        const randomArea = CGUtils.shuffleArray([0, 1, 2, 3, 4, 5]);//隨機表演下注注區
        for (let i = 0; i < randomArea.length; i++) {
            await CGUtils.Delay(Math.random() * 0.15);
            if (betCredits[randomArea[i]] > 0)
                this.chipDispatcher.otherUserBetChip(i, rankID, betCredits[randomArea[i]]);//排名玩家籌碼下注
        }
    }

    /**
     * 處理更新流程
     * @param msg 更新資料
     */
    public handleUpdate(msg: onUpdate) {
        const { gameState, wagersID, startColor, countdown, totalBetAreaCredits,
            newBets, rankings, liveCount, pathID, winColor, userPayoff, ranksPayoff
        } = msg.data;
        switch (gameState) {
            case GameState.NewRound:
                this.handleNewRound(startColor);
                break;
            case GameState.Betting:
                this.model.totalBetAreaCredits = totalBetAreaCredits;
                this.model.liveCount = liveCount;
                this.view.updateBetAreaCredits(this.model.totalBetAreaCredits);//下注區總額更新
                this.rankView.updateLiveCount(liveCount);//更新線上人數
                this.roundView.setCountdown(countdown, this.model.betTotalTime);//表演時間倒數
                this.handleNewBets(newBets);//處理每秒下注區資料
                break;
            case GameState.EndRound:
                this.handleEndRound(pathID, winColor, userPayoff, ranksPayoff);//表演回合結束流程
                break;
        }
    }
}