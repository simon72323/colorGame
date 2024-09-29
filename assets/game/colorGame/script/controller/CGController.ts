import { _decorator, Component, SpriteFrame, Animation, Node } from 'cc';
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
import { GameState, User, UserBets, UserPayoff, onJoinGame, onLoadInfo, onUpdate } from '../enum/CGInterface';
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
    // @property(CGWinView)//勝利表演
    // public winView: CGWinView = null;
    @property(CGDiceRunView)//開骰表演
    public diceRunView: CGDiceRunView = null;
    @property(CGRoadView)//路紙
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

    //處理新局開始
    private handleNewRound(startColor: number[]) {
        this.roundView.startRound();//開始執行遊戲回合
        this.diceRunView.diceIdle(startColor);//初始化骰子(隨機顏色)
        const reBetBetCredits = this.chipDispatcher.testReBet();//判斷是否執行續押(回傳續押注區額度)
        if (reBetBetCredits) {
            this.betHandler.onBet(reBetBetCredits, 'reBet');//傳送續押各注區注額
        }
        this.zoomView.zoomShowing();//放大鏡功能顯示
    }

    //處理回合結束流程與派獎
    private async handleReward(pathID: number, winColor: number[], payoff: number) {
        const { localWinArea, betOdds } = this.model.calculateWinData(winColor);//計算表演所需參數
        this.model.setPathData(pathID);//設置該回合路徑資料
        // 停止下注等操作
        this.roundView.betStop();//停止下注
        this.lockBetArea.active = true;//啟用禁用下注區
        this.zoomView.zoomHideing();//放大鏡功能隱藏
        this.chipDispatcher.updateReBetData(this.model.betTotal, this.model.userBetAreaCredit);//更新寫入續押資料
        await CGUtils.Delay(1);
        await this.diceRunView.diceStart(this.model.pathData, winColor);//骰子表演
        this.roundView.rewardShow(winColor, localWinArea, betOdds, payoff)//表演勝利效果
        await CGUtils.Delay(1);
        for (let i = 0; i < betOdds.length; i++) {
            if (betOdds[i] === 0)
                this.chipDispatcher.recycleChip(i);//回收未中獎的籌碼 
        }
        await CGUtils.Delay(0.9);
        for (let i = 0; i < betOdds.length; i++) {
            if (betOdds[i] > 0)
                this.chipDispatcher.createPayChipToBetArea(i, this.model.calculateOdds(betOdds[i]));//派發籌碼
        }
        await CGUtils.Delay(2.1);
        if (payoff > 0) {
            this.roundView.showAddCredit(payoff);//顯示加分
            this.model.credit += payoff;//用戶額度更新
        }
        this.view.comBtnCredits.getComponent(Animation).play();
        //等待新局開始
    }

    //確認下注按鈕按下
    private btnBetConfirmDown(event: Event) {
        this.betHandler.onBet(this.chipDispatcher.tempBetCredits, 'newBet');//傳送新增各注區注額
    }

    //續押按鈕按下
    private btnReBetDown(event: Event, state: string) {
        const reBetBetCredits = this.chipDispatcher.setReBet(state);//續押各注區注額
        if (reBetBetCredits) {
            this.betHandler.onBet(reBetBetCredits, 'reBet');//傳送續押各注區注額
        }
    }


    //本地用戶下注區按下(僅觸發籌碼移動)
    private betAreaPressed(param: string) {
        const data = this.dataService;
        const betID = parseInt(param);
        const chipID = data.touchChipID;//目前點選的籌碼ID
        const touchChipPos = this.chipSetView.touchChip.children[this.dataService.touchChipPosID].getWorldPosition();//選擇的籌碼世界座標位置
        this.chipDispatcher.betChip(betID, chipID, touchChipPos);//該籌碼移動至下注區
    }

    //處理本地用戶新下注成功
    public handleNewBetSuccessful(betCredits: number[], credit: number) {
        this.model.updateBetCredit(betCredits, credit);
        this.chipDispatcher.newBetSuccessful(this.model.betTotal);//執行下注成功
        this.updateView();
    }

    //處理本地用戶新下注失敗
    public handleNewBetError(error: string) {
        this.chipDispatcher.newBetError(error);
    }

    //處理本地用戶續押下注成功
    public async handleReBetSuccessful(betCredits: number[], credit: number) {
        this.model.updateBetCredit(betCredits, credit);
        this.chipDispatcher.reBetSuccessful(this.model.betTotal);//執行下注成功
        await CGUtils.Delay(0.3);//延遲顯示分數更新
        this.updateView();
    }

    //處理本地用戶續押下注失敗
    public handleReBetError(error: string) {
        this.chipDispatcher.reBetError(error);
    }

    //更新注額分數
    private updateView() {
        const view = this.view;
        const model = this.model;
        view.updateUserBetCredit(model.betTotal, model.credit);
        view.updateUserBetAreaCredit(model.userBetAreaCredit);
        view.updateTotalBets(model.totalBetAreaCredit);
    }



    //處理所有下注區資料
    private handleAllBets(newAllBets: UserBets[]) {
        for (let i = 0; i < newAllBets.length; i++) {
            const userID = newAllBets[i].userID;//紀錄該userID
            const newBets = newAllBets[i].betCredits;//本次下注資料
            let oldBets: number[] = new Array(newBets.length).fill(0);;//上一次同玩家下注資料
            let isNewPlayer = true; // 標記是否為新玩家
            for (let j = 0; j < this.model.allBets.length; j++) {
                if (userID === this.model.allBets[j].userID) {
                    oldBets = this.model.allBets[j].betCredits;
                    isNewPlayer = false; // 找到匹配的玩家，不是新玩家
                    break;
                }
            }
            let addBets: number[] = new Array(newBets.length);//新增的注額
            for (let j = 0; j < newBets.length; j++) {
                addBets[j] = newBets[j] - (oldBets?.[j] || 0);
            }
            //有新增注額才表演籌碼下注且不是本地玩家
            if (!addBets.every(bet => bet === 0) && userID !== this.model.userID) {
                for (let k = 0; k < 3; k++) {
                    if (userID === this.model.rankings[k].userID) {
                        //前三名玩家下注
                        const rankID = k + 1;
                        const userPos = this.chipDispatcher.userPos.children[rankID];
                        const startPos = userPos.getWorldPosition();
                        for (let l = 0; l < addBets.length; l++) {
                            const chipCredit = addBets[l];
                            if (chipCredit > 0) {
                                //隨機延遲下注表演
                                setTimeout(() => {
                                    userPos.getComponent(Animation).play();//頭像移動
                                    this.chipDispatcher.otherUserBetChip(l, rankID, chipCredit, startPos);
                                    //如果本地玩家有跟注，這時要表演跟注
                                }, Math.random() * 800)
                            }
                        }
                    } else {
                        //非前三名玩家的表演
                        const rankID = 4;
                        const userPos = this.chipDispatcher.userPos.children[rankID];
                        const startPos = userPos.getWorldPosition();
                        for (let l = 0; l < addBets.length; l++) {
                            const chipCredit = addBets[l];
                            if (chipCredit > 0) {
                                //隨機延遲下注表演
                                setTimeout(() => {
                                    this.chipDispatcher.otherUserBetChip(l, rankID, chipCredit, startPos);
                                }, Math.random() * 800)
                            }
                        }
                    }
                }
            }
        }
        this.model.allBets = [...newAllBets];//更新參數
    }

    public onLogInfoData(msg: onLoadInfo) {
        const { userID, credit } = msg.data;
        this.model.userID = userID;
        this.model.credit = credit;
    }


    public onJoinGameData(msg: onJoinGame) {
        const { gameState, avatarID, roundSerial, betCreditList, startColor, countdown, betTotalTime,
            roadMap, allBets, rankings, liveCount, pathID, winColor, winners
        } = msg.data;

        if (gameState === GameState.Betting) {
            this.handleNewRound(startColor);
            this.roundView.setCountdown(countdown, betTotalTime);//表演時間倒數
        }
        this.model.avatarID = avatarID;
        this.model.roundSerial = roundSerial;
        this.dataService.betCreditList = betCreditList;
        this.model.roadMap = roadMap;
        this.roadView.updateRoadMap(roadMap);//更新下注介面
        this.model.rankings = rankings;
        this.model.liveCount = liveCount;
        this.rankView.updateUserRanks(this.chipDispatcher.userPos, rankings, this.model.userID, liveCount);//更新排名與其他玩家人數
        this.model.betTotalTime = betTotalTime;
        this.model.allBets = allBets;

        //派彩資料
        // if (gameState === GameState.Reward) {
        //     this.model.pathData = CGPathManager.getInstance().allPathData[pathID];//設置該回合路徑資料
        //     this.model.pathID = pathID;
        //     this.model.winColor = winColor;
        //     this.model.winners = winners;
        // }
    }

    public onUpdateData(msg: onUpdate) {
        const { gameState, roundSerial, startColor, countdown,
            allBets, rankings, liveCount, pathID, winColor, payoff
        } = msg.data;
        switch (gameState) {
            case GameState.NewRound:
                this.handleNewRound(startColor);
                break;
            case GameState.Betting:
                this.roundView.setCountdown(countdown, this.model.betTotalTime);//表演時間倒數
                this.handleAllBets(allBets);//處理所有下注區資料
                break;
            case GameState.Reward:
                this.handleReward(pathID, winColor, payoff);
                break;
        }
    }
}