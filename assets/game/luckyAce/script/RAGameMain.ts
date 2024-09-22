// import { gtCommEvents } from '@gt-npm/gtlibts';
// import { h5GameTools, useGlobalEventDispatcher } from '@gt-npm/gt-lib-ts';
import { _decorator, CCBoolean, Component, find, Node } from 'cc';
import { onOnLoadInfo } from './enum/RAInterface';
import { RAGameControl } from './control/RAGameControl';
import { RAGameModel } from './model/RAGameModel';
import { beginGameData } from './enum/mockData';
const { ccclass, property } = _decorator;

@ccclass('RAGameMain')
export class RAGameMain extends Component {

    @property(CCBoolean)
    public useFakeData: boolean = false;

    private gameControl: RAGameControl = null!;
    private model: RAGameModel = null!;
    

    protected onLoad(): void {
        this.gameControl = find('GameControl', this.node.parent).getComponent(RAGameControl);
        this.model = find('GameModel', this.node.parent).getComponent(RAGameModel);
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
            this.gameControl.onBeginGame(msg);
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
        this.gameControl.onBeginGame(data);
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
        this.model.setLoadingInfo(data);
    }

    private onCreditExchange(data: object): void {
        console.log('onCreditExchange:', JSON.stringify(data));
        console.log('換分完成...');
    }
        

    private onSpinBtnClick(): void {

    }

    private onTurboBtnClick(): void {

    }
}

