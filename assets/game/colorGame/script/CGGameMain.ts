// import { gtCommEvents } from '@gt-npm/gtlibts';
import { h5GameTools, useGlobalEventDispatcher } from '@gt-npm/gt-lib-ts';
import { _decorator, CCBoolean, Component, director } from 'cc';
import { CGController } from './controller/CGController';
import { WorkOnBlur } from './tools/WorkOnBlur';
import { WorkerTimeout } from './tools/WorkerTimeout';
import { CGUtils } from './tools/CGUtils';
import { GameState, onBetInfo } from './enum/CGInterface';
// import { WebSocketManager } from './WebSocketManager';
import { GAME_TYPE } from './enum/CGInterface';
import { IBetHandler } from './enum/CGInterface';
import { onLoadInfo, onJoinGame, onUpdate } from './enum/CGInterface';
import { LoadInfoData, JoinGameData, UpdateNewRoundData, UpdateBettingData, UpdateEndRoundData } from './enum/CGMockData';
import CGLanguageManager from './manager/CGLanguageManager';


const { ccclass, property } = _decorator;

@ccclass('CGGameMain')
export class CGGameMain extends Component implements IBetHandler {
    @property(CCBoolean)
    public isSimulate: boolean = false;//模擬資料
    @property(CGController)
    private controller: CGController = null!;
    // @property(CGLanguageManager)
    // private languageManager: CGLanguageManager = null!;

    // private webSocketManager: WebSocketManager = null;

    protected async onLoad(): Promise<void> {
        //啟用後台運行(針對動畫、tween、schedule、spine等動畫)
        WorkOnBlur.getInstance();
        WorkerTimeout.getInstance().enable();
        let h5Lang = h5GameTools.UrlHelper.shared.lang;
        CGLanguageManager.setLanguage(h5Lang);
        // this.languageManager.setLanguage(h5Lang);//加載語系圖
    }

    protected start(): void {
        // 註冊監聽GS事件
        // useGlobalEventDispatcher().addEventListener(h5GameTools.slotGameConnector.SlotGameEvent.LOAD_INFO, this.onLoadInfo.bind(this));
        // useGlobalEventDispatcher().addEventListener(h5GameTools.slotGameConnector.SlotGameEvent.CREDIT_EXCHANGE, this.onCreditExchange.bind(this));
        // useGlobalEventDispatcher().addEventListener(h5GameTools.slotGameConnector.SlotGameEvent.BEGIN_GAME, this.onBeginGame.bind(this));
        this.controller.setBetHandler(this);
        if (!this.isSimulate)
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


    protected onDestroy(): void {
        // 移除監聽公版事件
        useGlobalEventDispatcher().removeEventListener(h5GameTools.slotGameConnector.SlotGameEvent.LOAD_INFO);
        useGlobalEventDispatcher().removeEventListener(h5GameTools.slotGameConnector.SlotGameEvent.CREDIT_EXCHANGE);
        useGlobalEventDispatcher().removeEventListener(h5GameTools.slotGameConnector.SlotGameEvent.BEGIN_GAME);
    }

    /**
     * 模擬:登入、加入遊戲和初始遊戲狀態
     */
    private async simulateInit() {
        await CGUtils.Delay(1);
        const loadInfoMsg = structuredClone(LoadInfoData.getData());
        this.onLoadInfo(loadInfoMsg);//接收登入訊息
        await CGUtils.Delay(0.5);
        //本地發送加入遊戲
        const joinGameMsg = structuredClone(JoinGameData.getData());
        this.onJoinGame(joinGameMsg);//接收登入遊戲資料
        if (joinGameMsg.data.gameState === GameState.NewRound || joinGameMsg.data.gameState === GameState.Betting)
            this.simulateBettingOnUpdate(joinGameMsg.data.countdown);//模擬下注倒數
        else {
            await CGUtils.Delay(1);
            const newRoundMsg = structuredClone(UpdateNewRoundData.getData());
            this.onUpdate(newRoundMsg);//發送新局開始
            this.simulateBettingOnUpdate(joinGameMsg.data.betTotalTime);//模擬下注倒數
        }
    }

    /**
     * 模擬:獲取update訊息
     * @param countdown - 剩餘的下注時間
     */
    private async simulateBettingOnUpdate(countdown: number) {
        this.scheduleOnce(async () => {
            const bettingMsg = structuredClone(UpdateBettingData.getData(countdown));//會自動-1秒
            this.onUpdate(bettingMsg);//發送下注資料(有第0秒的下注資料)
            if (bettingMsg.data.countdown > 0)
                this.simulateBettingOnUpdate(bettingMsg.data.countdown);//再次執行下注倒數
            else {
                await CGUtils.Delay(0.1);
                const endRoundMsg = structuredClone(UpdateEndRoundData.getData());
                this.onUpdate(endRoundMsg);//發送回合結束資料
                await CGUtils.Delay(10);
                const newRoundMsg = structuredClone(UpdateNewRoundData.getData());
                this.onUpdate(newRoundMsg);//發送新局開始
                this.simulateBettingOnUpdate(10);//再次執行下注倒數
            }
        }, 1)
    }

    private async init() {

    }

    /**
     * 處理登入資訊訊息
     * @param msg - 登入資訊訊息
     */
    private async onLoadInfo(msg: onLoadInfo) {
        // console.log('收到登入資訊:', JSON.stringify(msg));
        msg.gameType === GAME_TYPE && this.controller.handleLogInfo(msg);
    }

    /**
     * 處理加入遊戲訊息
     * @param msg - 加入遊戲訊息
     */
    private async onJoinGame(msg: onJoinGame) {
        // console.log('收到加入遊戲資訊:', JSON.stringify(msg));
        msg.gameType === GAME_TYPE && this.controller.handleJoinGame(msg);
    }

    /**
     * 處理更新訊息
     * @param msg - 更新訊息
     */
    private async onUpdate(msg: onUpdate) {
        // console.log('收到更新資料:', JSON.stringify(msg));
        msg.gameType === GAME_TYPE && this.controller.handleUpdate(msg);
    }

    /**
     * 傳送下注訊息給server
     * @param betCredits 新增的各注區注額
     */
    public async onBet(betCredits: number[], type: string) {
        if (this.isSimulate) {
            //傳送下注資料給server，server確認後回傳
            const sendBetInfo = {
                "action": "betInfo",
                "gametype": GAME_TYPE,
                "data": { "type": type, "betCredits": betCredits }
            }
            await CGUtils.Delay(0.05);//模擬等待回傳資料
            const msg: onBetInfo = {
                "event": true,
                "data": { "type": type, "credit": 2000 }
            }
            this.controller.handleOnBetInfo(msg, betCredits);//處理下注流程
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
}