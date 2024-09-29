// import { gtCommEvents } from '@gt-npm/gtlibts';
import { h5GameTools, useGlobalEventDispatcher } from '@gt-npm/gt-lib-ts';
import { _decorator, CCBoolean, Component } from 'cc';
import { CGController } from './controller/CGController';
import { CGModel } from './model/CGModel';
import { WorkOnBlur } from './tools/WorkOnBlur';
import { WorkerTimeout } from './tools/WorkerTimeout';
import { CGUtils } from './tools/CGUtils';
import { GameState, onBetInfo } from './enum/CGInterface';
import { WebSocketManager } from './WebSocketManager';
import { GAME_TYPE } from './enum/CGInterface';
import { IBetHandler } from './enum/CGInterface';

import { onLoadInfo, onJoinGame, onUpdate } from './enum/CGInterface';
import { LoadInfoData, JoinGameData, UpdateNewRoundData, UpdateBettingData, UpdateRewardData } from './enum/CGMockData';
const { ccclass, property } = _decorator;

@ccclass('CGGameMain')
export class CGGameMain extends Component implements IBetHandler {


    @property(CCBoolean)
    public useSimulateData: boolean = false;//模擬資料
    @property(CGController)
    private controller: CGController = null!;
    @property(CGModel)
    private model: CGModel = null!;

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

        if (!this.useSimulateData)
            this.init();
        else
            this.simulateInit();

        // 註冊監聽公版事件
        // Spin按鈕事件
        // useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.SPIN, this.onSpinBtnClick)
        // Turbo按鈕事件
        // useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.TURBO, this.onTurboBtnClick)
        //useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.GET_AUTO_PLAY_ROUND, ()=>{})
        // 註冊監聽GS事件
        // useGlobalEventDispatcher().addEventListener(h5GameTools.slotGameConnector.SlotGameEvent.LOAD_INFO, this.onLoadInfo)
    }

    // protected update(deltaTime: number): void {

    // }

    protected onDestroy(): void {
        // 移除監聽公版事件
        useGlobalEventDispatcher().removeEventListener(h5GameTools.slotGameConnector.SlotGameEvent.LOAD_INFO);
        useGlobalEventDispatcher().removeEventListener(h5GameTools.slotGameConnector.SlotGameEvent.CREDIT_EXCHANGE);
        useGlobalEventDispatcher().removeEventListener(h5GameTools.slotGameConnector.SlotGameEvent.BEGIN_GAME);
    }

    /**
     * 模擬資料
     * ------------------------
     * 此區段包含用於模擬遊戲數據和事件的方法
    */

    /**
     * 模擬:登入、加入遊戲和初始遊戲狀態
     */
    private async simulateInit() {
        const loadInfoMsg = structuredClone(LoadInfoData.Instance.getData());
        this.onLoadInfo(loadInfoMsg);//發送登入訊息
        await CGUtils.Delay(0.5);
        const joinGameMsg = structuredClone(JoinGameData.Instance.getData());
        this.onJoinGame(joinGameMsg);//發送登入遊戲資料
        if (joinGameMsg.data.gameState === GameState.Betting)
            this.simulateBettingOnUpdate(joinGameMsg.data.countdown);//執行更新倒數下注資料發送剩餘下注時間
        else {
            this.controller.waitNewRound.active = true;//等待新局開始
            await CGUtils.Delay(3);
            this.simulateNewRoundOnUpdate();
        }
    }

    /**
     * 模擬:獲取每秒update訊息(時間)
     * @param countdown - 剩餘的下注時間
     */
    private async simulateBettingOnUpdate(countdown: number) {
        this.scheduleOnce(async () => {
            const bettingMsg = structuredClone(UpdateBettingData.Instance.getData(countdown));
            this.onUpdate(bettingMsg);//發送下注資料
            if (countdown > 0)
                this.simulateBettingOnUpdate(countdown);//再次執行下注倒數
            else
                this.simulateRewardOnUpdate();//派彩
        }, 1)
    }

    /**
     * 模擬:獲取派彩update訊息
     */
    private async simulateRewardOnUpdate() {
        const rewardMsg = structuredClone(UpdateRewardData.Instance.getData());
        this.onUpdate(rewardMsg);//發送派彩資料
        await CGUtils.Delay(8);
        this.simulateNewRoundOnUpdate();//新局開始
    }

    /**
     * 模擬:獲取新局開始update訊息
     */
    private async simulateNewRoundOnUpdate() {
        const newRoundMsg = structuredClone(UpdateNewRoundData.Instance.getData());
        this.onUpdate(newRoundMsg);//發送新局開始
        this.simulateBettingOnUpdate(this.model.betTotalTime);//再次執行下注倒數
    }

    /**
     * 訊息接收
     * ------------------------
     * 此區段包含處理各種遊戲訊息的方法
    */

    private async init() {

    }

    /**
     * 處理登入資訊訊息
     * @param msg - 登入資訊訊息
     */
    private async onLoadInfo(msg: onLoadInfo) {
        console.log('收到登入資訊:', JSON.stringify(msg));
        if (msg.gameType === GAME_TYPE) {
            this.controller.onLogInfoData(msg);
        }
    }

    /**
     * 處理加入遊戲訊息
     * @param msg - 加入遊戲訊息
     */
    private async onJoinGame(msg: onJoinGame) {
        console.log('收到加入遊戲資訊:', JSON.stringify(msg));
        if (msg.gameType === GAME_TYPE) {
            this.controller.onJoinGameData(msg);
        }
    }

    /**
     * 處理更新訊息
     * @param msg - 更新訊息
     */
    private async onUpdate(msg: onUpdate) {
        console.log('收到更新資料:', JSON.stringify(msg));
        if (msg.gameType === GAME_TYPE) {
            this.controller.onUpdateData(msg);
        }
    }

    /**
     * 確認下注
     * @param betCredits 新增的各注區注額
     */
    public async onBet(betCredits: number[], type: string) {
        this.controller.lockBetArea.active = true;//開啟禁用下注區
        if (this.useSimulateData) {
            //傳送下注資料給server，server確認後回傳
            const sendBetInfo = {
                "action": "betInfo",
                "gametype": GAME_TYPE,
                "data": { "type": type, "betCredits": betCredits }
            }
            await CGUtils.Delay(0.05);//模擬等待傳送資料回傳
            const msg: onBetInfo = {
                "event": true,
                "error": "",
                "data": { "type": "reBet", "credit": 2000 }
            }
            this.controller.lockBetArea.active = false;//關閉禁用下注區
            if (msg.error !== "") {
                if (msg.data.type === 'newBet')
                    this.controller.handleNewBetSuccessful(betCredits, msg.data.credit);
                else if (msg.data.type === 'reBet')
                    this.controller.handleReBetSuccessful(betCredits, msg.data.credit);
            }
            else {
                if (msg.data.type === 'newBet')
                    this.controller.handleNewBetError(msg.error);
                else if (msg.data.type === 'reBet')
                    this.controller.handleReBetError(msg.error);
            }
        } else {
            try {
                // const response = await h5GameTools.slotGameConnector.SlotGameConnector.shared.callBeginGame({
                //     "action": "beginGame4",
                //     "betInfo": { "BetCredit": 200, "betArea": param }
                // });
                // if (response.event)
                //     this.controller.chipDispatcher.createChipToBetArea(Number(param), 0, this.model.touchChipID, false);

            } catch (error) {
                // console.error('下注过程中出错:', error);
            }
            // await h5GameTools.slotGameConnector.SlotGameConnector.shared.callBeginGame({ "action": "beginGame4", "betInfo": { "BetCredit": 200 } });
            // console.log('下注完成...');
        }
    }





    //-------------------------------以上是colorGame使用---------------------------------

    /**
     * 下注
     */
    // public async Spin() {
    //     if (this.useFakeData) {
    //         //傳送下注資料給server
    //         let msg = structuredClone(beginGameData.Instance.getData());
    //         this.controller.onBeginGame(msg);
    //     } else {
    //         await h5GameTools.slotGameConnector.SlotGameConnector.shared.callBeginGame({ "action": "beginGame4", "betInfo": { "BetCredit": 200 } });
    //         console.log('下注完成...');
    //     }
    // }


    // private async init(): Promise<void> {
    //     await this.linkWs();
    //     await new Promise((r) => setTimeout(r, 2000));
    //     await this.exchange('50000');
    //     // await new Promise((r) => setTimeout(r, 10000));
    //     // await this.spin();
    //     // await new Promise((r) => setTimeout(r, 5000));
    //     // await this.spin();
    // }

    /**
     * GS連線
     */
    // private async linkWs(): Promise<void> {
    //     h5GameTools.UrlHelper.shared.domain = 'https://casino1.bb-in555.com';
    //     await h5GameTools.boot();
    //     await h5GameTools.slotGameConnector.SlotGameConnector.shared.connect();
    //     console.log('GS連線完成...');
    // }

    /**
     * 換洗分
     * @param exchange 
     */
    // private async exchange(exchange: string): Promise<void> {
    //     await h5GameTools.slotGameConnector.SlotGameConnector.shared.callCreditExchange(h5GameTools.commonStore.CommonStore.shared.storeState.betBase, exchange);
    //     console.log('開始換分...');
    // }

    // private async onBeginGame(data) {
    //     console.log('收到下注結果:', JSON.stringify(data));
    //     this.controller.onBeginGame(data);
    // }

    // private async endGame() {
    //     await h5GameTools.slotGameConnector.SlotGameConnector.shared.callEndGame(h5GameTools.commonStore.CommonStore.shared.storeState.wagersID);
    // }

    /**
     * 收到 onLoadInfo 要做的事
     * @param data 
     */
    // private onLoadInfo(data: onOnLoadInfo) {
    //     console.log('onLoadInfo:', JSON.stringify(data));
    //     this.model.setLoadingInfo(data);
    // }

    // private onCreditExchange(data: object): void {
    //     console.log('onCreditExchange:', JSON.stringify(data));
    //     console.log('換分完成...');
    // }


    private onSpinBtnClick(): void {

    }

    private onTurboBtnClick(): void {

    }


    //-------------------------待調整----------------------------
    // private initWebSocket() {
    //     this.webSocketManager = new WebSocketManager(this);
    //     this.webSocketManager.connect('ws://localhost:8080');
    // }
    // // 處理從伺服器接收的訊息
    // public async handleServerMessage(message: any) {
    //     switch (message.type) {
    //         case 'onLoadInfo':
    //             this.gameModel.setOnLoadInfo(message.data);//獲得玩家資料
    //             break;
    //         case 'onJoinGame':
    //             this.gameModel.setOnLoadInfo(message.data);//獲得玩家資料
    //             // this.onJoinGame();//進入遊戲
    //             break;
    //         case 'update':
    //             if (message.gameType === '5270')
    //                 this.handleUpdateMessage(message.data);
    //             break;
    //         case 'onBeginGameInfo':
    //             this.gameModel.setBeginGameInfo(message.data);//接收下注成功資料
    //             // await CGUtils.Delay(0.3);
    //             // this.view.updateUICredit();//更新介面額度(等籌碼移動，等待0.3秒後更新)
    //             // 表演本地用戶下注
    //             break;
    //         // ... 其他消息類型 ...
    //         default:
    //             console.log('Unknown message type:', message);
    //     }
    // }

    // //火箭
    // public handleUpdateMessage(data: any) {
    //     const { state, odds, time, sec, countdown, totalsBet, liveCount, roundSerial, arrCoefficient, arrOddsPartition, startTime, escape } = data;
    //     switch (state) {
    //         case 'gameReady':
    //             this.handleReady(roundSerial);
    //             break;
    //         case 'gameNewRound':
    //             this.handleNewRound(startTime, arrCoefficient, arrOddsPartition, totalsBet, liveCount);
    //             break;
    //         case 'gameBetting':
    //             this.handleBetting(odds, time, sec);
    //             break;
    //         case 'gameReward':
    //             this.handleReward(odds, data.rankings, data.exchangeRate);
    //             break;
    //         default:
    //             console.log('Unknown game state:', state);
    //     }
    // }
    // private handleReady(roundSerial?: number) {
    //     console.log('遊戲準備中', roundSerial ? `局號: ${roundSerial}` : '');
    //     // 更新UI顯示準備狀態
    //     // this.view.showReadyState(roundSerial);
    // }
    // private handleWaiting(countdown: number, totalsBet: string, liveCount: number) {
    //     console.log(`等待中，倒計時: ${countdown}秒，總下注: ${totalsBet}，在線人數: ${liveCount}`);
    //     // 更新倒計時、總下注額和在線人數
    //     // this.view.updateWaitingInfo(countdown, totalsBet, liveCount);
    // }

    // private handleNewRound(startTime: number, arrCoefficient: number[], arrOddsPartition: number[], totalsBet: string, liveCount: number) {
    //     console.log(`新局開始，開始時間: ${startTime}，總下注: ${totalsBet}，在線人數: ${liveCount}`);
    //     console.log('係數數組:', arrCoefficient);
    //     console.log('賠率分區:', arrOddsPartition);
    //     // 初始化新一輪遊戲
    //     // this.roundManager.startNewRound(startTime, arrCoefficient, arrOddsPartition);
    //     // this.view.updateBetInfo(totalsBet, liveCount);
    // }
    // private handleBetting(odds: number, time: number, sec: number) {
    //     console.log(`下注中: ${odds}，時間: ${time}，已進行: ${sec}秒`);
    //     // 更新遊戲進行狀態
    //     // this.view.updateGameProgress(odds, sec);
    // }
    // private handleReward(odds: number, rankings?: any[], exchangeRate?: number) {
    //     console.log(`遊戲派彩: ${odds}`);
    //     if (rankings) {
    //         console.log('排行榜:', rankings);
    //         // 更新排行榜
    //         // this.view.updateRankings(rankings);
    //     }
    //     if (exchangeRate !== undefined) {
    //         console.log('匯率:', exchangeRate);
    //         // 處理匯率
    //         // this.dataModel.setExchangeRate(exchangeRate);
    //     }
    //     // 結束遊戲，顯示結果
    //     // this.roundManager.endGame(odds);
    // }
    // // 發送訊息到伺服器
    // public sendToServer(message: any) {
    //     this.webSocketManager.sendMessage(message);
    // }

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

