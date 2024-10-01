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
import { BetType, GameState, Payoff, onBetInfo, onJoinGame, onLoadInfo, onUpdate } from '../enum/CGInterface';
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

    private isOnBet: boolean = false;//如果等待確認下注中，就不能清除暫存的籌碼(會有錯誤)

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
        // console.log("初始化參數")
        const model = this.model;
        model.dataInit();//初始化參數
        this.rankView.updateRanks(model.rankings, model.userID);//更新排名，同時判斷跟注狀態
        this.rankView.updateLiveCount(model.liveCount);//更新線上人數
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
            this.betHandler.onBet(reBetBetCredits, BetType.ReBet);//傳送續押各注區注額
        }
        this.lockBetArea.active = false;//隱藏禁用下注區
    }

    /**
     * 處理回合結束流程與派獎
     * @param pathID 路徑ID
     * @param winColor 勝利顏色編號
     * @param userPayoff 本地用戶派彩
     * @param ranksPayoff 前三名用戶派彩
     */
    private async handleEndRound(pathID: number, winColor: number[], userPayoff: Payoff, ranksPayoff: Payoff[]) {
        const model = this.model;
        console.log("停止下注", model.userBetAreaCredits)
        this.lockBetArea.active = true;//顯示禁用下注區
        model.setPathData(pathID);//設置該回合路徑資料
        this.roundView.betStop();//停止下注
        this.zoomView.zoomHideing();//放大鏡功能隱藏
        if (!this.isOnBet)
            this.chipDispatcher.cancelBetChip();//清除未下注成功的籌碼
        await CGUtils.Delay(1);
        const { localWinArea, betOdds } = model.calculateWinData(winColor);//計算表演所需參數
        this.chipDispatcher.updateReBetData(model.betTotal, model.userBetAreaCredits);//更新寫入續押資料
        await this.diceRunView.diceStart(model.pathData, winColor);//骰子表演
        this.roundView.endRound(winColor, localWinArea, betOdds, userPayoff)//表演開獎結果
        await CGUtils.Delay(1);
        for (let i = 0; i < betOdds.length; i++) {
            if (betOdds[i] === 0)
                this.chipDispatcher.recycleChip(i);//回收未中獎的籌碼 
        }
        await CGUtils.Delay(0.9);
        for (let i = 0; i < betOdds.length; i++) {
            if (betOdds[i] > 0)
                this.chipDispatcher.payChipToBetArea(i, model.getOdds(betOdds[i]));//派發籌碼
        }
        await CGUtils.Delay(2.1);
        model.betTotal = 0;//清空下注分數
        //本地玩家加分
        if (userPayoff.payoff > 0) {
            this.roundView.showAddCredit(userPayoff.payoff);//顯示加分
            model.credit = userPayoff.credit;//用戶額度更新
        }
        this.view.comBtnCredits.getComponent(Animation).play();
        this.view.updateUserCredit(model.credit); //本地餘額更新
        this.rankView.updateRanksCredit(ranksPayoff);//排名用戶餘額更新
        model.roadMap.pop();//刪除最後一個路子
        model.roadMap.push(winColor);//添加新路子
        this.roadView.updateRoadMap(model.roadMap);//更新路子
        //等待新局開始
    }

    /**
     * ==========確認下注按鈕按下==========
     */
    private btnBetConfirmDown() {
        // console.log("下注分數", this.chipDispatcher.tempBetCredits)
        this.isOnBet = true;
        this.betHandler.onBet(this.chipDispatcher.tempBetCredits, BetType.NewBet);//傳送新增各注區注額
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
            this.betHandler.onBet(reBetBetCredits, BetType.ReBet);//傳送續押各注區注額
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
        const chipCredit = data.betCreditList[chipID];//籌碼額度
        const touchChipPos = this.chipSetView.touchChip.children[data.touchChipPosID].getWorldPosition();//選擇的籌碼世界座標位置
        this.chipDispatcher.betChip(parseInt(betID), chipID, chipCredit, touchChipPos, false);//該籌碼移動至下注區
    }

    /**
     * 處理下注事件
     * @param msg 下注資訊 
     * @param betCredits 當時傳送的下注額度
     */
    public async handleBetInfo(msg: onBetInfo, betCredits: number[]) {
        const model = this.model;
        const chipDispatcher = this.chipDispatcher;
        const betType = msg.data.type as BetType;
        if (!msg.event) {
            chipDispatcher.betError(betType);
            if (betType === BetType.NewBet)
                this.isOnBet = false;
            return;
        }
        model.updateBetCredit(betCredits, msg.data.credit);//更新本地下注額度
        chipDispatcher.betSuccess(betType, betCredits, model.betTotal);
        if (betType === BetType.NewBet)
            this.isOnBet = false;
        else
            await CGUtils.Delay(0.25); //延遲顯示分數更新
        this.updataCreditUI();
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
     * 模擬其他玩家延遲下注
     * @param rankPosID 排名節點位置
     * @param betCredits 注區下注金額分佈
     * @param isLast 是否最後一筆下注
     */
    private async otherUserDelayBet(rankPosID: number, betCredits: number[], isLast: boolean) {
        const betTotal = betCredits.reduce((a, b) => a + b, 0);//下注總額
        if (betTotal <= 0)
            return;//無新增注額就不表演
        const model = this.model;
        let delayTime = isLast ? 0.5 : 0.2;
        await CGUtils.Delay(Math.random() * delayTime);
        let callBets = [0, 0, 0, 0, 0, 0];
        for (let i = 0; i < betCredits.length; i++) {
            if (betCredits[i] > 0) {
                const data = this.dataService;
                callBets[i] = data.betCreditList[data.touchChipID];//目前選擇籌碼分數
                this.chipDispatcher.otherUserBetChip(i, rankPosID, betCredits[i]);//排名玩家籌碼下注
            }
        }
        //判斷跟注
        if (rankPosID < 4 && this.rankView.testCall(rankPosID)) {
            this.betHandler.onBet(callBets, BetType.CallBet);//傳送新增注額
        }
        await CGUtils.Delay(0.25);//延遲更新分數
        model.updateTotalBetArea(betCredits, rankPosID - 1);//更新注區與排名玩家餘額
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
        const { gameState, wagersID, betCreditList, startColor, countdown, betTotalTime,
            roadMap, totalBetAreaCredits, rankings, liveCount, winColor } = msg.data;
        const model = this.model;
        // model.avatarID = avatarID;
        model.wagersID = wagersID;
        model.roadMap = roadMap;
        model.rankings = rankings;
        model.liveCount = liveCount;
        model.betTotalTime = betTotalTime;
        model.totalBetAreaCredits = totalBetAreaCredits;//更新注區額度
        this.dataService.betCreditList = betCreditList;
        this.resetUI();//初始化參數
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
        const { gameState, wagersID, startColor, countdown, newBets, rankings,
            liveCount, pathID, winColor, userPayoff, ranksPayoff } = msg.data;
        const model = this.model;
        switch (gameState) {
            case GameState.NewRound:
                model.rankings = rankings;
                model.liveCount = liveCount;
                this.resetUI();//初始化參數
                this.handleNewRound(startColor);
                break;
            case GameState.Betting:
                model.liveCount = liveCount;
                this.rankView.updateLiveCount(liveCount);//更新線上人數
                this.roundView.setCountdown(countdown, model.betTotalTime);//表演時間倒數
                //處理每秒新增下注資料
                for (let i = 0; i < newBets.length; i++) {
                    //本地玩家未在排名內才表演下注
                    if (model.rankings[i].userID !== model.userID)
                        this.otherUserDelayBet(i + 1, newBets[i], countdown > 0);//前三名+其他玩家新增注區注額(表演隨機延遲下注)
                }
                break;
            case GameState.EndRound:
                this.handleEndRound(pathID, winColor, userPayoff, ranksPayoff);//表演回合結束流程
                break;
        }
    }
}