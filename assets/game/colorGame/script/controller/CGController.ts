import { _decorator, Component, SpriteFrame, Prefab } from 'cc';
import { CGView } from '../view/CGView';
import { CGModel } from '../model/CGModel';
import { CGZoomView } from '../view/CGZoomView';
import { CGChipDispatcher } from '../view/CGChipDispatcher';
import { CGRoundView } from '../view/CGRoundView';
import { CGChipSetView } from '../view/CGChipSetView';
import { CGBigWin } from '../view/CGBigWinView';
import { CGDiceRunView } from '../view/CGDiceRunView';
import { CGMarquee } from '../view/CGMarquee';
import { CGRoadView } from '../view/CGRoadView';
import PoolHandler from '../tools/PoolHandler';
import { GameState, onJoinGame, onLoadInfo, onUpdate } from '../enum/CGInterface';
import { CGPathManager } from '../components/CGPathManager';
import { CGRankView } from '../view/CGRankView';
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
    @property(CGBigWin)//大獎表演
    public bigWin: CGBigWin = null;
    @property(CGDiceRunView)//開骰表演
    public diceRunView: CGDiceRunView = null;
    @property(CGRoadView)//路紙
    public roadView: CGRoadView = null;
    @property(CGRankView)//排名
    public rankView: CGRankView = null;
    @property(CGMarquee)//跑馬燈腳本
    private Marquee: CGMarquee = null;

    //遊戲資源
    @property([SpriteFrame])
    public resultColorSF: SpriteFrame[] = [];
    @property([SpriteFrame])
    public winOddSF: SpriteFrame[] = [];

    protected onLoad() {
        this.node.on('OnButtonEventPressed', this.betAreapressed, this);
        // 初始化所有组件
        this.initComponents();
        // this.initWebSocket();

        //非loading時暫時使用
        CGPathManager.getInstance().node.on("completed", async () => {
            //路徑加載完畢，開始模擬遊戲
        });

        //開始模擬server發送消息
        // this.startSimulatingServerMessages();
    }
    private initComponents() {
        this.chipSetView.init(this);
    }

    //下注區按下(本地表演派彩)
    private betAreapressed(param: string) {
        const id = parseInt(param);
        this.chipDispatcher.betChip(id, this.model.touchChipID);//籌碼下注移動
        // this.model.userBetAreaCredit[id] += this.model.betCreditList[this.model.touchChipID];
        // this.view.updateUserBetArea(id, this.model.userBetAreaCredit[id]);//更新該下注區本地分數
    }

    //確認下注按鈕按下
    // private btnBetConfirmDown(event: Event) {
    //     this.chipDispatcher.tempBetCredits;
    //     //傳送下注資料給server
    // }

    //設置點選中的籌碼ID
    setTouchChipID(chipID: number) {
        this.model.touchChipID = chipID;
    }

    //更新注區分數
    updateBetCredit(betCredits: number[], isLocal: boolean) {
        const model = this.model;
        const view = this.view;
        if (isLocal) {
            const addCredit = betCredits.reduce((a, b) => a + b, 0);
            model.credit -= addCredit;
            model.betTotal += addCredit;
            for (let i = 0; i < 6; i++) {
                model.userBetAreaCredit[i] += betCredits[i];
            }
            view.updateUserBetCredit(model.betTotal, model.credit, model.userBetAreaCredit);
        }
        for (let i = 0; i < 6; i++) {
            model.totalBetAreaCredit[i] += betCredits[i];
        }
        view.updateTotalBets(model.totalBetAreaCredit);
    }

    // //取得點選中的籌碼ID
    // getTouchChipID(): number {
    //     return this.model.touchChipID;
    // }

    //等待接收到onJoinGame之後，傳送chipRange給需要的View
    setChipRangeToView() {
        const chipRange = [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
        this.chipSetView.setChipRange(chipRange);
    }


    public onLogInfoData(msg: onLoadInfo) {
        const { userID, credit } = msg.data;
        this.model.userID = userID;
        this.model.credit = credit;
    }


    public onJoinGameData(msg: onJoinGame) {
        const { gameState, avatarID, betCreditList, roundSerial, startColor, betTotalTime, countdown, roadMap,
            totalBetAreaCredit, rankings, liveCount, pathID, winColor, otherPayoffs
        } = msg.data;

        if (gameState === GameState.Betting) {
            this.roundView.startRound();//開始執行遊戲回合
            this.diceRunView.diceIdle(startColor);//初始化骰子(隨機顏色)
            this.chipDispatcher.testRebet();//判斷是否執行續押
            this.zoomView.zoomShowing();//放大鏡功能顯示
            this.roundView.setCountdown(countdown, betTotalTime);//表演時間倒數
        }

        this.model.roundSerial = roundSerial;
        this.model.roadMap = roadMap;
        this.roadView.updateRoadMap(roadMap);//更新下注介面
        this.rankView.updateUserRanks(rankings, this.model.userID, liveCount);//更新排名與其他玩家人數

        this.model.avatarID = avatarID;
        this.model.betCreditList = betCreditList;
        // this.model.startColor = startColor;
        this.model.betTotalTime = betTotalTime;

        // this.model.roadMapPer = roadMapPer;
        this.model.totalBetAreaCredit = totalBetAreaCredit;
        // this.model.rankings = rankings;
        // this.model.liveCount = liveCount;

        this.model.pathData = CGPathManager.getInstance().allPathData[pathID];//設置該回合路徑資料
        // if (gameState === GameState.Reward) {
        //     this.model.pathID = pathID;
        //     this.model.winColor = winColor;
        //     this.model.otherPayoffs = otherPayoffs;
        // }
    }

    public onUpdateData(msg: onUpdate) {
        const { gameState, roundSerial, startColor, countdown,
            totalBetAreaCredit, rankings, liveCount, pathID, winColor, otherPayoffs
        } = msg.data;
        switch (gameState) {
            case GameState.NewRound:
                this.roundView.startRound();//開始執行遊戲回合
                this.diceRunView.diceIdle(startColor);//初始化骰子(隨機顏色)
                this.chipDispatcher.testRebet();//判斷是否執行續押
                this.zoomView.zoomShowing();//放大鏡功能顯示
                break;
            case GameState.Betting:
                this.roundView.setCountdown(countdown, this.model.betTotalTime);//表演時間倒數
                break;
            case GameState.Reward:
                break;
        }
    }
}