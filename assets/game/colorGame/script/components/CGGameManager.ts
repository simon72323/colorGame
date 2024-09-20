import { _decorator, Component, SpriteFrame, Prefab } from 'cc';
import { CGView } from './CGView';
import { CGDataModel } from './CGDataModel';
import { CGZoom } from './CGZoom';
import { CGChipController } from './CGChipController';
import { CGRoundManager } from './CGRoundManager';
import { CGChipSet } from './CGChipSet';
import { CGBigWin } from './CGBigWin';
import { CGDiceRunSet } from './CGDiceRunSet';
import { WorkOnBlur } from '../tools/WorkOnBlur';
import { WorkerTimeout } from '../tools/WorkerTimeout';
import { Marquee } from './Marquee';
import PoolHandler from '../tools/PoolHandler';
import { WebSocketManager } from '../WebSocketManager';
import { UtilsKits } from '../tools/UtilsKits';
import { GameState } from '../connector/receive/CGReceive';


const { ccclass, property } = _decorator;

@ccclass('CGGameManager')
export class CGGameManager extends Component {
    //組件腳本
    @property({ type: CGView, tooltip: "介面腳本", group: { name: '遊戲腳本', id: '1' } })
    public view: CGView = null;
    @property({ type: CGZoom, tooltip: "骰子視角腳本", group: { name: '遊戲腳本', id: '1' } })
    public zoom: CGZoom = null;
    @property({ type: CGChipController, tooltip: "籌碼表演腳本", group: { name: '遊戲腳本', id: '1' } })
    public chipController: CGChipController = null;
    @property({ type: CGRoundManager, tooltip: "回合腳本", group: { name: '遊戲腳本', id: '1' } })
    public roundManager: CGRoundManager = null;
    @property({ type: CGChipSet, tooltip: "籌碼設置腳本", group: { name: '遊戲腳本', id: '1' } })
    public chipSet: CGChipSet = null;
    @property({ type: CGBigWin, tooltip: "大獎表演", group: { name: '遊戲腳本', id: '1' } })
    public bigWin: CGBigWin = null;
    @property({ type: CGDiceRunSet, tooltip: "開骰表演", group: { name: '遊戲腳本', id: '1' } })
    public diceRunSet: CGDiceRunSet = null;
    @property({ type: Marquee, tooltip: "跑馬燈腳本" })
    private Marquee: Marquee = null;

    public dataModel: CGDataModel = null;

    //遊戲資源
    @property({ type: [SpriteFrame], tooltip: "下注籌碼貼圖", group: { name: '貼圖資源', id: '2' } })
    public chipSF: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "結算區骰子顏色", group: { name: '貼圖資源', id: '2' } })
    public resultColorSF: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "路紙區骰子顏色", group: { name: '貼圖資源', id: '2' } })
    public roadColorSF: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "勝利倍率貼圖", group: { name: '貼圖資源', id: '2' } })
    public winOddSF: SpriteFrame[] = [];
    @property({ type: Prefab, tooltip: "提示訊息", group: { name: 'prefab資源', id: '3' } })
    public tipPrefab: Prefab = null;
    @property({ type: Prefab, tooltip: "其他玩家下注籌碼", group: { name: 'prefab資源', id: '3' } })
    public betChipBlack: Prefab = null;
    @property({ type: Prefab, tooltip: "本地玩家下注籌碼", group: { name: 'prefab資源', id: '3' } })
    public betChipColor: Prefab = null;

    public pool: PoolHandler = new PoolHandler();
    private webSocketManager: WebSocketManager = null;

    async onLoad() {
        //啟用後台運行(針對動畫、tween、schedule、spine等動畫)
        WorkOnBlur.getInstance();
        WorkerTimeout.getInstance().enable();
        // 初始化所有组件
        this.initComponents();
        // this.initWebSocket();

        //開始模擬server發送消息
        // this.startSimulatingServerMessages();
    }
    private initComponents() {
        // 初始化各个组件,并传入必要的引用
        this.dataModel = CGDataModel.getInstance();
        this.view.init(this);
        this.chipController.init(this);
        this.roundManager.init(this);
        this.chipSet.init(this);
        // this.zoom.init(this);
    }

    private initWebSocket() {
        this.webSocketManager = new WebSocketManager(this);
        this.webSocketManager.connect('ws://localhost:8080');
    }

    // 處理從伺服器接收的訊息
    public async handleServerMessage(message: any) {
        switch (message.type) {
            case 'onLoadInfo':
                this.dataModel.setOnLoadInfo(message.data);//獲得玩家資料
                break;
            case 'onJoinGame':
                this.dataModel.setOnLoadInfo(message.data);//獲得玩家資料
                this.onJoinGame();//進入遊戲
                break;
            case 'update':
                if (message.gameType === '5270')
                    this.handleUpdateMessage(message.data);
                break;
            // case 'roundData':
                // this.dataModel.setRoundData(message.data);//接收回合資料
                // break;
            // case 'betData':
            //     //有接收到這個消息代表是下注階段
            //     // this.dataModel.setBetData(message.data);//接收下注資料
            //     this.roundManager.setBetTime(this.dataModel.countdown);//直接更新下注時間?
            //     this.view.updateUserRanks();//更新排名資料
            //     await UtilsKitS.Delay(0.3);
            //     this.view.updateUICredit();//更新介面額度(等籌碼移動，等待0.3秒後更新)
            //     break;
            // case 'rewardInfo':
            //     // this.dataModel.setRewardInfo(message.data);//接收開獎資料
            //     this.roundManager.runReward();//表演開獎流程
            //     break;
            case 'onBeginGameInfo':
                this.dataModel.setBeginGameInfo(message.data);//接收下注成功資料
                await UtilsKits.Delay(0.3);
                this.view.updateUICredit();//更新介面額度(等籌碼移動，等待0.3秒後更新)
                // 表演本地用戶下注
                break;
            // ... 其他消息類型 ...
            default:
                console.log('Unknown message type:', message);
        }
    }

    public handleUpdateMessage(data: any) {
        const { state, odds, time, sec, countdown, totalsBet, liveCount, roundSerial, arrCoefficient, arrOddsPartition, startTime, escape } = data;
        switch (state) {
            case 'gameReady':
                this.handleReady(roundSerial);
                break;
            case 'gameNewRound':
                this.handleNewRound(startTime, arrCoefficient, arrOddsPartition, totalsBet, liveCount);
                break;
            case 'gameBetting':
                this.handleBetting(odds, time, sec);
                break;
            case 'gameReward':
                this.handleReward(odds, data.rankings, data.exchangeRate);
                break;
            default:
                console.log('Unknown game state:', state);
        }
        if (escape) {
            this.handleEscape(escape);
        }
    }

    private handleReady(roundSerial?: number) {
        console.log('游戏准备中', roundSerial ? `局号: ${roundSerial}` : '');
        // 更新UI显示准备状态
        // this.view.showReadyState(roundSerial);
    }

    private handleWaiting(countdown: number, totalsBet: string, liveCount: number) {
        console.log(`等待中，倒计时: ${countdown}秒，总下注: ${totalsBet}，在线人数: ${liveCount}`);
        // 更新倒计时、总下注额和在线人数
        // this.view.updateWaitingInfo(countdown, totalsBet, liveCount);
    }

    private handleNewRound(startTime: number, arrCoefficient: number[], arrOddsPartition: number[], totalsBet: string, liveCount: number) {
        console.log(`新局开始，开始时间: ${startTime}，总下注: ${totalsBet}，在线人数: ${liveCount}`);
        console.log('系数数组:', arrCoefficient);
        console.log('赔率分区:', arrOddsPartition);
        // 初始化新一轮游戏
        // this.roundManager.startNewRound(startTime, arrCoefficient, arrOddsPartition);
        // this.view.updateBetInfo(totalsBet, liveCount);
    }

    private handleBetting(odds: number, time: number, sec: number) {
        console.log(`下注中: ${odds}，时间: ${time}，已进行: ${sec}秒`);
        // 更新游戏进行状态
        // this.view.updateGameProgress(odds, sec);
    }

    private handleReward(odds: number, rankings?: any[], exchangeRate?: number) {
        console.log(`遊戲派彩: ${odds}`);
        if (rankings) {
            console.log('排行榜:', rankings);
            // 更新排行榜
            // this.view.updateRankings(rankings);
        }
        if (exchangeRate !== undefined) {
            console.log('汇率:', exchangeRate);
            // 处理汇率
            // this.dataModel.setExchangeRate(exchangeRate);
        }
        // 结束游戏，显示结果
        // this.roundManager.endGame(odds);
    }

    private handleEscape(escapeData: Array<{ displayName: string, payoff: number, odds: number }>) {
        console.log('玩家逃脱:', escapeData);
        // 处理玩家逃脱的逻辑
        // this.view.showEscapedPlayers(escapeData);
    }

    // 發送訊息到伺服器
    public sendToServer(message: any) {
        this.webSocketManager.sendMessage(message);
    }


    //進入遊戲後執行的流程
    private onJoinGame() {
        this.view.updateRoadMap();//更新路紙
        this.chipSet.loadChipSetID();//讀取籌碼設置資料(本地)
        this.chipSet.updateTouchChip();//更新點選的籌碼(每局更新)
        if (this.dataModel.gameState === GameState.GameNewRound)
            this.roundManager.newRound();
        else if (this.dataModel.gameState === GameState.GameBetting)
            this.roundManager.betStart();//下注流程
        else if (this.dataModel.gameState === GameState.GameReward)
            this.roundManager.runReward();//表演開獎流程
    }

    // -------------模拟服务器发送消息的方法-----------------------


    // public simulateServerMessage(type: string, data: any) {
    //     const message = { type, data };
    //     this.handleServerMessage(message);
    // }

    // // 开始模拟服务器消息
    // private startSimulatingServerMessages() {
    //     this.schedule(this.sendSimulatedMessages, 1); // 每秒发送一次模拟消息
    // }

    // private sendSimulatedMessages() {
    //     // 模拟发送 onLoadInfo 消息
    //     this.simulateServerMessage('onLoadInfo', {
    //         event: true,
    //         GameState: "Betting",
    //         UserID: 123,
    //         Avatar: 2,
    //         Base: '',
    //         DefaultBase: '',
    //         Balance: 0,
    //         LoginName: 'simon',
    //         AutoExchange: false,
    //         Credit: 5000,//用戶餘額
    //         userBets: [0, 0, 0, 0, 0, 0],//用戶目前各注區下注額(需要中途出現籌碼)
    //         usetTotalBet: 0,//用戶目前總下注額
    //         Limit: 30000,
    //         BetTime: 1,//遊戲的下注時間設置
    //         ChipRange: [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],
    //         BetAreaTotalCredit: [0, 0, 0, 0, 0, 0],//目前各注區的下注額(需要中途出現籌碼)
    //     });

    //     // 模拟发送 roundData 消息(每次登入都會接收一次，新局時也會接收)
    //     this.simulateServerMessage('roundData', {
    //         GameState: "Betting",//如果狀態是NewRound，需要觸發新局流程
    //         RoundSerial: 12415214,
    //         RoadColors: Array.from({ length: 10 }, () => [
    //             Math.floor(Math.random() * 6),
    //             Math.floor(Math.random() * 6),
    //             Math.floor(Math.random() * 6)
    //         ]),
    //         RoadColorPers: [10, 20, 20, 20, 20, 10],
    //     });

    //     // 模拟发送 betData 消息
    //     this.simulateServerMessage('betData', {
    //         GameState: "Betting",
    //         Countdown: 10,
    //         //目前的排名玩家
    //         Rank: [
    //             { userID: 11111111, loginName: 'john', avatar: 10, credit: 70000 },
    //             { userID: 22222222, loginName: 'kenny', avatar: 11, credit: 60000 },
    //             { userID: 33333333, loginName: 'simon', avatar: 12, credit: 50000 }
    //         ],
    //         BetAreaTotalCredit: [0, 0, 0, 0, 0, 0],
    //         //前三名跟其他玩家此次的下注分布
    //         OtherUserBetAreaCredit: [
    //             [200, 100, 0, 300, 400, 0],
    //             [0, 100, 50, 50, 100, 200],
    //             [100, 100, 100, 300, 200, 100],
    //             [0, 0, 200, 500, 0, 400]
    //         ],
    //         OtherUserCount: 50,
    //     });

    //     // 模拟发送 rewardInfo 消息
    //     this.simulateServerMessage('rewardInfo', {
    //         RoundSerial: 12415214,
    //         WagersID: 21547815,
    //         PathID: Math.floor(Math.random() * 1000),
    //         WinNumber: [
    //             Math.floor(Math.random() * 6),
    //             Math.floor(Math.random() * 6),
    //             Math.floor(Math.random() * 6)
    //         ],
    //         UserWinCredit: { winBetArea: [0, 2, 4], winCredit: 200 },
    //         OtherUserWinCredit: [
    //             { winBetArea: [0, 2, 4], winCredit: 200 },
    //             { winBetArea: [0, 2, 4], winCredit: 200 },
    //             { winBetArea: [0, 2, 4], winCredit: 200 },
    //             { winBetArea: [0, 2, 4], winCredit: 200 }
    //         ],
    //     });

    //     //回傳下注成功資料
    //     this.simulateServerMessage('onBeginGameInfo', {
    //         isSuccess: true,
    //         BetAreaID: 2,//用戶下注區id
    //         BetCredit: 20,//用戶下注額
    //         Credit: 2500,//用戶餘額
    //         BetAreaCredit: [0, 0, 0, 0, 0, 0],//用戶目前各注區下注額
    //         BetTotalCredit: 0,//用戶目前總下注額
    //         BetAreaTotalCredit: [0, 0, 0, 0, 0, 0],//目前各下注區總額
    //     });
    // }




}