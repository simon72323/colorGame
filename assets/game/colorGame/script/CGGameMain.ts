// import { gtCommEvents } from '@gt-npm/gtlibts';
// import { h5GameTools, useGlobalEventDispatcher } from '@gt-npm/gt-lib-ts';
import { _decorator, CCBoolean, Component, find, Node } from 'cc';
import { CGGameControl } from './control/CGGameControl';
import { CGGameModel } from './model/CGGameModel';
import { WorkOnBlur } from './tools/WorkOnBlur';
import { WorkerTimeout } from './tools/WorkerTimeout';
import { CGUtils } from './tools/CGUtils';
import { GameState } from './connector/CGReceive';
import { WebSocketManager } from './WebSocketManager';

import { onOnLoadInfo } from '../../luckyAce/script/enum/RAInterface';
import { beginGameData } from '../../luckyAce/script/enum/mockData';
const { ccclass, property } = _decorator;

@ccclass('CGGameMain')
export class CGGameMain extends Component {

    @property(CCBoolean)
    public useFakeData: boolean = false;//假資料

    @property(CGGameControl)
    private gameControl: CGGameControl = null!;
    @property(CGGameModel)
    private gameModel: CGGameModel = null!;
    private webSocketManager: WebSocketManager = null;
    
    protected onLoad(): void {
        //啟用後台運行(針對動畫、tween、schedule、spine等動畫)
        WorkOnBlur.getInstance();
        WorkerTimeout.getInstance().enable();
    }

    protected start(): void {

        // 註冊監聽GS事件
        // useGlobalEventDispatcher().addEventListener(h5GameTools.slotGameConnector.SlotGameEvent.LOAD_INFO, this.onLoadInfo.bind(this));
        // useGlobalEventDispatcher().addEventListener(h5GameTools.slotGameConnector.SlotGameEvent.CREDIT_EXCHANGE, this.onCreditExchange.bind(this));
        // useGlobalEventDispatcher().addEventListener(h5GameTools.slotGameConnector.SlotGameEvent.BEGIN_GAME, this.onBeginGame.bind(this));

        if(!this.useFakeData){
            this.init();
        }

        // 註冊監聽公版事件

        // Spin按鈕事件
        // useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.SPIN, this.onSpinBtnClick)

        // Turbo按鈕事件
        // useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.TURBO, this.onTurboBtnClick)

        // 
        //useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.GET_AUTO_PLAY_ROUND, ()=>{})

        // 註冊監聽GS事件
        // useGlobalEventDispatcher().addEventListener(h5GameTools.slotGameConnector.SlotGameEvent.LOAD_INFO, this.onLoadInfo)
    }

    protected update(deltaTime: number): void {
        
    }

    protected onDestroy(): void {
        // 移除監聽公版事件
        // useGlobalEventDispatcher().removeEventListener(h5GameTools.slotGameConnector.SlotGameEvent.LOAD_INFO);
        // useGlobalEventDispatcher().removeEventListener(h5GameTools.slotGameConnector.SlotGameEvent.CREDIT_EXCHANGE);
        // useGlobalEventDispatcher().removeEventListener(h5GameTools.slotGameConnector.SlotGameEvent.BEGIN_GAME);
    }

   /**
    * 下注
    */
    public async Spin() {
        if(this.useFakeData){
            let msg = structuredClone(beginGameData.Instance.getData());
            // this.gameControl.onBeginGame(msg);
        }else{
            // await h5GameTools.slotGameConnector.SlotGameConnector.shared.callBeginGame({"action":"beginGame4","betInfo":{"BetCredit":200}});
            console.log('下注完成...');
        }
   }


    private async init(): Promise<void> {
        await this.linkWs();
        await new Promise((r) => setTimeout(r, 2000));
        await this.exchange('50000');
        // await new Promise((r) => setTimeout(r, 10000));
        // await this.spin();
        // await new Promise((r) => setTimeout(r, 5000));
        // await this.spin();
    }

    /**
     * GS連線
     */
    private async linkWs(): Promise<void> {
        // h5GameTools.UrlHelper.shared.domain = 'https://casino1.bb-in555.com';
        // await h5GameTools.boot();
        // await h5GameTools.slotGameConnector.SlotGameConnector.shared.connect();
        // console.log('GS連線完成...');
    }

    /**
     * 換洗分
     * @param exchange 
     */
    private async exchange(exchange: string): Promise<void> {
        // await h5GameTools.slotGameConnector.SlotGameConnector.shared.callCreditExchange(h5GameTools.commonStore.CommonStore.shared.storeState.betBase, exchange);
        console.log('開始換分...');
    }

    private async onBeginGame(data) {
        console.log('收到下注結果:', JSON.stringify(data));
        // this.gameControl.onBeginGame(data);
    } 

    // private async endGame() {
    //     await h5GameTools.slotGameConnector.SlotGameConnector.shared.callEndGame(h5GameTools.commonStore.CommonStore.shared.storeState.wagersID);
    // }

    /**
     * 收到 onLoadInfo 要做的事
     * @param data 
     */
    private onLoadInfo(data: onOnLoadInfo) {
        console.log('onLoadInfo:', JSON.stringify(data));
        // this.model.setLoadingInfo(data);
    }

    private onCreditExchange(data: object): void {
        console.log('onCreditExchange:', JSON.stringify(data));
        console.log('換分完成...');
    }
        

    private onSpinBtnClick(): void {

    }

    private onTurboBtnClick(): void {

    }


    //-------------------------待調整----------------------------
    private initWebSocket() {
        this.webSocketManager = new WebSocketManager(this);
        this.webSocketManager.connect('ws://localhost:8080');
    }
    // 處理從伺服器接收的訊息
    public async handleServerMessage(message: any) {
        switch (message.type) {
            case 'onLoadInfo':
                this.gameModel.setOnLoadInfo(message.data);//獲得玩家資料
                break;
            case 'onJoinGame':
                this.gameModel.setOnLoadInfo(message.data);//獲得玩家資料
                // this.onJoinGame();//進入遊戲
                break;
            case 'update':
                if (message.gameType === '5270')
                    this.handleUpdateMessage(message.data);
                break;
            case 'onBeginGameInfo':
                this.gameModel.setBeginGameInfo(message.data);//接收下注成功資料
                // await CGUtils.Delay(0.3);
                // this.view.updateUICredit();//更新介面額度(等籌碼移動，等待0.3秒後更新)
                // 表演本地用戶下注
                break;
            // ... 其他消息類型 ...
            default:
                console.log('Unknown message type:', message);
        }
    }

    //火箭
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
    }
    private handleReady(roundSerial?: number) {
        console.log('遊戲準備中', roundSerial ? `局號: ${roundSerial}` : '');
        // 更新UI顯示準備狀態
        // this.view.showReadyState(roundSerial);
    }
    private handleWaiting(countdown: number, totalsBet: string, liveCount: number) {
        console.log(`等待中，倒計時: ${countdown}秒，總下注: ${totalsBet}，在線人數: ${liveCount}`);
        // 更新倒計時、總下注額和在線人數
        // this.view.updateWaitingInfo(countdown, totalsBet, liveCount);
    }

    private handleNewRound(startTime: number, arrCoefficient: number[], arrOddsPartition: number[], totalsBet: string, liveCount: number) {
        console.log(`新局開始，開始時間: ${startTime}，總下注: ${totalsBet}，在線人數: ${liveCount}`);
        console.log('係數數組:', arrCoefficient);
        console.log('賠率分區:', arrOddsPartition);
        // 初始化新一輪遊戲
        // this.roundManager.startNewRound(startTime, arrCoefficient, arrOddsPartition);
        // this.view.updateBetInfo(totalsBet, liveCount);
    }
    private handleBetting(odds: number, time: number, sec: number) {
        console.log(`下注中: ${odds}，時間: ${time}，已進行: ${sec}秒`);
        // 更新遊戲進行狀態
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
            console.log('匯率:', exchangeRate);
            // 處理匯率
            // this.dataModel.setExchangeRate(exchangeRate);
        }
        // 結束遊戲，顯示結果
        // this.roundManager.endGame(odds);
    }
    // 發送訊息到伺服器
    public sendToServer(message: any) {
        this.webSocketManager.sendMessage(message);
    }

    //進入遊戲後執行的流程
    // private onJoinGame() {
    //     this.view.updateRoadMap();//更新路紙
    //     this.chipSet.loadChipSetID();//讀取籌碼設置資料(本地)
    //     this.chipSet.updateTouchChip();//更新點選的籌碼(每局更新)
    //     if (this.gameModel.gameState === GameState.GameNewRound)
    //         this.roundManager.newRound();
    //     else if (this.gameModel.gameState === GameState.GameBetting)
    //         this.roundManager.betStart();//下注流程
    //     else if (this.gameModel.gameState === GameState.GameReward)
    //         this.roundManager.runReward();//表演開獎流程
    // }
}

