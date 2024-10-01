import { _decorator, Component, Animation, Node } from 'cc';
import { CGView } from '../view/CGView';
import { CGModel } from '../model/CGModel';
import { CGZoomView } from '../view/CGZoomView';
import { CGChipDispatcher } from '../view/CGChipDispatcher';
import { CGRoundView } from '../view/CGRoundView';
import { CGChipSetView } from '../view/CGChipSetView';
import { CGDiceRunView } from '../view/CGDiceRunView';
import { CGMarquee } from '../view/CGMarquee';
import { CGRoadView } from '../view/CGRoadView';
import { GameState, Payoff, onBetInfo, onJoinGame, onLoadInfo, onUpdate } from '../enum/CGInterface';
import { IBetHandler } from '../enum/CGInterface';
import { CGRankView } from '../view/CGRankView';
import { CGDataService } from '../manager/CGDataService';
import { CGUtils } from '../tools/CGUtils';

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
    @property(CGDiceRunView)//開骰表演
    public diceRunView: CGDiceRunView = null;
    @property(CGRoadView)//路子
    public roadView: CGRoadView = null;
    @property(CGRankView)//排名
    public rankView: CGRankView = null;
    @property(CGMarquee)//跑馬燈腳本
    private Marquee: CGMarquee = null;

    @property(Node)
    public waitNewRound!: Node;//等待派獎畫面
    @property(Node)
    public lockBetArea!: Node;//禁用下注區，介面區域

    private isOnBet: boolean = false;

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

    /**
     * 初始化界面
     */
    private resetUI() {
        console.log("初始化參數")
        this.model.dataInit();//初始化參數
        this.updataCreditUI();//介面更新
    }

    /**
     * 處理新局開始
     * @param startColor 開始顏色編號
     */
    private handleNewRound(startColor: number[]) {
        if (this.waitNewRound)
            this.waitNewRound.active = false;//關閉派彩中
        this.roundView.newRound();//開始執行遊戲回合
        this.zoomView.zoomShowing();//放大鏡功能顯示
        this.diceRunView.diceIdle(startColor);//初始化骰子(隨機顏色)
        const reBetBetCredits = this.chipDispatcher.testReBet();//判斷是否執行續押(回傳續押注區額度)
        if (reBetBetCredits) {
            this.betHandler.onBet(reBetBetCredits, 'reBet');//傳送續押各注區注額
        }
        this.lockBetArea.active = false;//隱藏禁用下注區
    }

    /**
     * 處理下注資料
     * @param newBets 前三名+其他玩家新增注額
     */
    private handleNewBets(newBets: number[][], isDelay: boolean) {
        for (let i = 0; i < newBets.length; i++) {
            this.otherUserDelayBet(i + 1, newBets[i], isDelay);//前三名+其他玩家新增注區注額(表演隨機延遲下注)
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
        console.log("停止下注", this.model.userBetAreaCredits)
        this.lockBetArea.active = true;//顯示禁用下注區
        this.model.setPathData(pathID);//設置該回合路徑資料
        this.roundView.betStop();//停止下注
        this.zoomView.zoomHideing();//放大鏡功能隱藏
        if (!this.isOnBet)
            this.chipDispatcher.cancelBetChip();//清除未下注成功的籌碼
        await CGUtils.Delay(1);
        const { localWinArea, betOdds } = this.model.calculateWinData(winColor);//計算表演所需參數
        this.chipDispatcher.updateReBetData(this.model.betTotal, this.model.userBetAreaCredits);//更新寫入續押資料
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

    /**
     * ==========確認下注按鈕按下==========
     */
    private btnBetConfirmDown() {
        // console.log("下注分數", this.chipDispatcher.tempBetCredits)
        this.isOnBet = true;
        this.betHandler.onBet(this.chipDispatcher.tempBetCredits, 'newBet');//傳送新增各注區注額
    }

    /**
     * ==========續押按鈕按下==========
     * @param event 
     * @param state 續押狀態
     */
    private btnReBetDown(event: Event, state: string) {
        console.log("按下續押狀態", state);
        const reBetBetCredits = this.chipDispatcher.setReBet(state);//續押各注區注額
        console.log("各注區注額", reBetBetCredits);
        if (reBetBetCredits) {
            this.betHandler.onBet(reBetBetCredits, 'reBet');//傳送續押各注區注額
        }
    }

    /**
     * 本地用戶下注區按下事件(監聽事件觸發，僅做籌碼移動)
     * @param betID 注區ID
     */
    private betAreaPressed(betID: string) {
        if (this.lockBetArea.active)
            return;
        const data = this.dataService;
        const chipID = data.touchChipID;//目前點選的籌碼ID
        const touchChipPos = this.chipSetView.touchChip.children[data.touchChipPosID].getWorldPosition();//選擇的籌碼世界座標位置
        this.chipDispatcher.betChip(parseInt(betID), chipID, touchChipPos);//該籌碼移動至下注區
    }

    /**
     * 處理下注事件
     * @param msg 下注資訊 
     * @param betCredits 當時傳送的下注額度
     */
    public async handleBetInfo(msg: onBetInfo, betCredits: number[]) {
        const model = this.model;
        const chipDispatcher = this.chipDispatcher;
        if (msg.event) {
            model.updateBetCredit(betCredits, msg.data.credit);//更新本地下注額度
            let waitTime = 0;
            switch (msg.data.type) {
                case 'newBet':
                    chipDispatcher.newBetSuccessful(model.betTotal);
                    this.isOnBet = false;
                    break;
                case 'reBet':
                    chipDispatcher.reBetSuccessful(model.betTotal);
                    waitTime = 0.25;
                    break;
                case 'callBet':
                    const data = this.dataService;
                    const chipID = data.touchChipID;//目前點選的籌碼ID
                    const touchChipPos = this.chipSetView.touchChip.children[data.touchChipPosID].getWorldPosition();//選擇的籌碼世界座標位置
                    for (let i = 0; i < betCredits.length; i++) {
                        if (betCredits[i] > 0)
                            chipDispatcher.realBetChip(i, chipID, touchChipPos);//跟注籌碼下注
                    }
                    chipDispatcher.callBetSuccessful(model.betTotal);
                    waitTime = 0.25;
                    break;
            }
            await CGUtils.Delay(waitTime);//延遲顯示分數更新
            this.updataCreditUI();
        }
        else {
            switch (msg.data.type) {
                case 'newBet':
                    chipDispatcher.newBetError();
                    this.isOnBet = false;
                    break;
                case 'reBet':
                    chipDispatcher.reBetError();
                    break;
                case 'callBet':
                    chipDispatcher.callBetError();
                    break;
            }
        }
    }

    /**
     * 更新注區介面參數
     */
    public updataCreditUI() {
        const view = this.view;
        const model = this.model;
        view.updateUserCredit(model.credit);
        view.updateBetAreaCredits(model.totalBetAreaCredits, model.betTotal, model.userBetAreaCredits);
    }

    /**
     * 處理排名更新
     */
    private handleRanks() {
        const model = this.model;
        this.rankView.updateRanks(model.rankings, model.userID);//更新排名，同時判斷跟注狀態
        this.rankView.updateLiveCount(model.liveCount);//更新線上人數
    }

    /**
     * 模擬其他玩家延遲下注
     * @param rankPosID 排名節點位置
     * @param betCredits 注區下注金額分佈
     * @param isDelay 是否表演延遲
     */
    private async otherUserDelayBet(rankPosID: number, betCredits: number[], isDelay: boolean) {
        const randomArea = CGUtils.shuffleArray([0, 1, 2, 3, 4, 5]);//隨機表演下注注區

        for (let i = 0; i < randomArea.length; i++) {
            const chipCredit = betCredits[randomArea[i]];//下注籌碼額度
            if (isDelay)
                await CGUtils.Delay(0.05 + Math.random() * 0.1);
            else
                await CGUtils.Delay(Math.random() * 0.05);
            if (chipCredit > 0) {
                this.chipDispatcher.otherUserBetChip(i, rankPosID, chipCredit);//排名玩家籌碼下注
                //判斷跟注
                // console.log("有跟注嗎", rankPosID, this.rankView.testCall(rankPosID))
                if (rankPosID < 4 && this.rankView.testCall(rankPosID)) {
                    let callBets = [0, 0, 0, 0, 0, 0];
                    callBets[i] = this.dataService.getTouchChipCredit();
                    console.log("跟注", rankPosID, callBets)
                    this.betHandler.onBet(callBets, 'callBet');//傳送新增注額
                }
                this.delaySetCredit(i, chipCredit, rankPosID - 1);//延遲更新分數
            }
        }
    }

    /**
     * 
     * @param betID 注區ID
     * @param chipCredit 籌碼分數 
     * @param rankID 名次
     */
    //延遲更新其他玩家分數
    private async delaySetCredit(betID: number, chipCredit: number, rankID: number) {
        const model = this.model;
        await CGUtils.Delay(0.25);//延遲更新分數
        model.updateTotalBet(betID, chipCredit, rankID);//更新注區與排名玩家餘額
        this.updataCreditUI();//更新注區分數
        this.rankView.updateRanks(model.rankings, model.userID);//更新排名，同時判斷跟注狀態
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
        const model = this.model;
        model.avatarID = avatarID;
        model.wagersID = wagersID;
        model.roadMap = roadMap;
        model.rankings = rankings;
        model.liveCount = liveCount;
        model.betTotalTime = betTotalTime;
        model.totalBetAreaCredits = totalBetAreaCredits;//更新注區額度
        this.dataService.betCreditList = betCreditList;
        this.resetUI();//初始化參數
        this.handleRanks();//更新排名與線上人數
        switch (gameState) {
            case GameState.NewRound:
            case GameState.Betting:
                this.handleNewRound(startColor);
                this.roundView.setCountdown(countdown, betTotalTime);//表演時間倒數
                let otherTotalBets = [...totalBetAreaCredits];
                //配置已下注籌碼
                for (let i = 0; i < rankings.length; i++) {
                    this.otherUserDelayBet(i + 1, rankings[i].betCredits, countdown > 0);//前三名玩家籌碼下注
                    for (let j = 0; j < rankings[i].betCredits.length; j++) {
                        const betCredit = rankings[i].betCredits[j];
                        otherTotalBets[j] -= betCredit;//更新其他玩家下注分數
                    }
                }
                this.otherUserDelayBet(4, otherTotalBets, countdown > 0);//其他玩家籌碼下注
                break;
            case GameState.EndRound:
                //更新路子，表演開骰結果(路徑最後一格)，並更新路子
                model.roadMap.pop();//刪除最後一個路子
                model.roadMap.push(winColor);//添加新路子
                this.waitNewRound.active = true;
                break;
        }
        this.roadView.updateRoadMap(model.roadMap);//更新路子
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
                this.model.liveCount = liveCount;
                this.handleRanks();//更新排名與線上人數
                this.resetUI();//初始化參數
                this.handleNewRound(startColor);
                break;
            case GameState.Betting:
                // this.model.totalBetAreaCredits = totalBetAreaCredits;
                this.model.liveCount = liveCount;
                // this.view.updateBetAreaCredits(this.model.totalBetAreaCredits);//下注區總額更新
                this.rankView.updateLiveCount(liveCount);//更新線上人數
                this.roundView.setCountdown(countdown, this.model.betTotalTime);//表演時間倒數
                this.handleNewBets(newBets, countdown > 0);//處理每秒下注區資料
                break;
            case GameState.EndRound:
                this.handleEndRound(pathID, winColor, userPayoff, ranksPayoff);//表演回合結束流程
                break;
        }
    }
}