import { _decorator, Component, SpriteFrame, Prefab } from 'cc';
import { CGView } from './CGView';
import { CGModel } from './CGModel';
import { CGZoom } from './CGZoom';
import { CGChipController } from './CGChipController';
import { CGManager } from './CGManager';
import { CGChipSet } from './CGChipSet';
import { CGBigWin } from './CGBigWin';
import { CGDiceRunSet } from './CGDiceRunSet';
import { WorkOnBlur_Simon } from '../../../../common/script/tools/WorkOnBlur_Simon';
import { WorkerTimeout_Simon } from '../../../../common/script/lib/WorkerTimeout_Simon';
import { Marquee } from '../../../../common/script/components/Marquee';
import PoolHandler from '../../../../common/script/tools/PoolHandler';
import { WebSocketManager } from '../WebSocketManager';
import { UtilsKitS } from '../../../../common/script/lib/UtilsKitS';
import { GameState } from '../connector/receive/CGReceive';

const { ccclass, property } = _decorator;

@ccclass('CGGameManager')
export class CGGameManager extends Component {
    //組件腳本
    @property({ type: CGView, tooltip: "遊戲介面腳本", group: { name: '遊戲腳本', id: '1' } })
    public View: CGView = null;
    @property({ type: CGZoom, tooltip: "縮放腳本", group: { name: '遊戲腳本', id: '1' } })
    public Zoom: CGZoom = null;
    @property({ type: CGChipController, tooltip: "籌碼控制腳本", group: { name: '遊戲腳本', id: '1' } })
    public ChipController: CGChipController = null;
    @property({ type: CGManager, tooltip: "遊戲流程腳本", group: { name: '遊戲腳本', id: '1' } })
    public Manager: CGManager = null;
    @property({ type: CGChipSet, tooltip: "遊戲流程腳本", group: { name: '遊戲腳本', id: '1' } })
    public ChipSet: CGChipSet = null;
    @property({ type: CGBigWin, tooltip: "大獎表演", group: { name: '遊戲腳本', id: '1' } })
    public BigWin: CGBigWin = null;
    @property({ type: CGDiceRunSet, tooltip: "開骰表演", group: { name: '遊戲腳本', id: '1' } })
    public DiceRunSet: CGDiceRunSet = null;
    // @property({ type: Marquee, tooltip: "跑馬燈腳本" })
    // private Marquee: Marquee = null;

    public Model: CGModel = null;

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
        WorkOnBlur_Simon.getInstance();
        WorkerTimeout_Simon.getInstance().enable();
        // 初始化所有组件
        this.initComponents();
        this.initWebSocket();

        //開始模擬server發送消息
        this.startSimulatingServerMessages();
    }
    private initComponents() {
        // 初始化各个组件,并传入必要的引用
        this.Model = CGModel.getInstance();
        this.View.init(this);
        this.ChipController.init(this);
        this.Manager.init(this);
        this.ChipSet.init(this);
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
                this.Model.setOnLoadInfo(message.data);//獲得玩家資料
                //判斷目前遊戲狀態，表演相應畫面
                break;
            case 'roundData':
                this.Model.setRoundData(message.data);//接收回合資料
                //如果目前狀態是NewRound，需要觸發新局流程
                if (this.Model.roundInfo.gameState === GameState.NewRound)
                    this.Manager.newRound();
                else
                    this.View.updateRoadMap();//更新路紙
                if (this.Model.roundInfo.gameState === GameState.Betting)
                    this.Manager.betStart();//開始下注(顯示標題)
                break;
            case 'betData':
                //有接收到這個消息代表是下注階段
                this.Model.setBetData(message.data);//接收下注資料
                this.Manager.setBetTime(this.Model.betInfo.countdown);//更新下注時間
                this.View.updateUserRanks();//更新排名資料
                await UtilsKitS.Delay(0.3);
                this.View.updateUICredit();//更新介面額度(等籌碼移動，等待0.3秒後更新)
                break;
            case 'rewardInfo':
                this.Model.setRewardInfo(message.data);//接收開獎資料
                this.Manager.runDice(); // 表演開骰流程
                break;
            case 'onBeginGameInfo':
                this.Model.setBeginGameInfo(message.data);//接收下注成功資料
                await UtilsKitS.Delay(0.3);
                this.View.updateUICredit();//更新介面額度(等籌碼移動，等待0.3秒後更新)
                // 表演本地用戶下注
                break;
            // ... 其他消息類型 ...
            default:
                console.log('Unknown message type:', message);
        }
    }

    // 發送訊息到伺服器
    public sendToServer(message: any) {
        this.webSocketManager.sendMessage(message);
    }

    // -------------模拟服务器发送消息的方法-----------------------
    public simulateServerMessage(type: string, data: any) {
        const message = { type, data };
        this.handleServerMessage(message);
    }

    // 开始模拟服务器消息
    private startSimulatingServerMessages() {
        this.schedule(this.sendSimulatedMessages, 1); // 每秒发送一次模拟消息
    }

    private sendSimulatedMessages() {
        // 模拟发送 onLoadInfo 消息
        this.simulateServerMessage('onLoadInfo', {
            event: true,
            gameState: "Betting",
            userID: 123,
            avatar: 2,
            base: '',
            defaultBase: '',
            balance: 0,
            loginName: 'simon',
            autoExchange: false,
            credit: 5000,//用戶餘額
            betAreaCredit: [0, 0, 0, 0, 0, 0],//用戶目前各注區下注額(需要中途出現籌碼)
            betTotalCredit: 0,//用戶目前總下注額
            limit: 30000,
            betTime: 1,//遊戲的下注時間設置
            chipRange: [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],
            betAreaTotalCredit: [0, 0, 0, 0, 0, 0],//目前各注區的下注額(需要中途出現籌碼)
        });

        // 模拟发送 roundData 消息(每次登入都會接收一次，新局時也會接收)
        this.simulateServerMessage('roundData', {
            gameState: "Betting",//如果狀態是NewRound，需要觸發新局流程
            roundSerial: 12415214,
            roadColors: Array.from({ length: 10 }, () => [
                Math.floor(Math.random() * 6),
                Math.floor(Math.random() * 6),
                Math.floor(Math.random() * 6)
            ]),
            roadColorPers: [10, 20, 20, 20, 20, 10],
        });

        // 模拟发送 betData 消息
        this.simulateServerMessage('betData', {
            gameState: "Betting",
            countdown: 10,
            //目前的排名玩家
            rank: [
                { userID: 11111111, loginName: 'john', avatar: 10, credit: 70000 },
                { userID: 22222222, loginName: 'kenny', avatar: 11, credit: 60000 },
                { userID: 33333333, loginName: 'simon', avatar: 12, credit: 50000 }
            ],
            betAreaTotalCredit: [0, 0, 0, 0, 0, 0],
            //前三名跟其他玩家此次的下注分布
            otherUserBetAreaCredit: [
                [200, 100, 0, 300, 400, 0],
                [0, 100, 50, 50, 100, 200],
                [100, 100, 100, 300, 200, 100],
                [0, 0, 200, 500, 0, 400]
            ],
            otherUserCount: 50,
        });

        // 模拟发送 rewardInfo 消息
        this.simulateServerMessage('rewardInfo', {
            roundSerial: 12415214,
            wagersID: 21547815,
            pathID: Math.floor(Math.random() * 1000),
            winNumber: [
                Math.floor(Math.random() * 6),
                Math.floor(Math.random() * 6),
                Math.floor(Math.random() * 6)
            ],
            userWinCredit: { winBetArea: [0, 2, 4], winCredit: 200 },
            otherUserWinCredit: [
                { winBetArea: [0, 2, 4], winCredit: 200 },
                { winBetArea: [0, 2, 4], winCredit: 200 },
                { winBetArea: [0, 2, 4], winCredit: 200 },
                { winBetArea: [0, 2, 4], winCredit: 200 }
            ],
        });

        //回傳下注成功資料
        this.simulateServerMessage('onBeginGameInfo', {
            isSuccess: true,
            betAreaID: 2,//用戶下注區id
            betCredit: 20,//用戶下注額
            credit: 2500,//用戶餘額
            betAreaCredit: [0, 0, 0, 0, 0, 0],//用戶目前各注區下注額
            betTotalCredit: 0,//用戶目前總下注額
            betAreaTotalCredit: [0, 0, 0, 0, 0, 0],//目前各下注區總額
        });
    }




}