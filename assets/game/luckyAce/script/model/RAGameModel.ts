import { _decorator, Component, Node } from 'cc';
import { GreenWild, Lines, onBeginGame, onOnLoadInfo, RedWild, Scatter } from '../enum/RAInterface';
import { RASymbolID } from '../enum/RAEnum';
const { ccclass, property } = _decorator;

@ccclass('RAGameModel')
export class RAGameModel extends Component {

    public enableTip: boolean = true;

    private beginGameData: onBeginGame = null!;
    private onLoadInfoData: onOnLoadInfo = null!;
    private rates: {[key: string]: number[]} = {};


    protected onLoad(): void {

    }

    protected start(): void {

    }

    protected update(deltaTime: number): void {

    }

    /**
     * 儲存 onLoadInfo 資料
     * @param msg 
     */
    public setLoadingInfo(msg: onOnLoadInfo): void {
        this.rates = msg.data.Rates;

        // server 賠率只給symbol key值 0~10，11~18要自己推算
        for(let i = 11; i < 19; ++i){
            this.rates[i.toString()] = this.rates[(i - 9).toString()]
        }

        console.log('Rates: ', this.rates);
    }

    /**
     * 取得 symbol 賠率
     * @returns 
     */
    public getRates(id: RASymbolID): number[] {
        return this.rates[id.toString()];
    }

    /**
     * 取得 onLoadInfo 資料
     * @param msg 
     */
    public getLoadingInfo(): onOnLoadInfo {
        return this.onLoadInfoData;
    }

    /**
     * 儲存 begin game 資料
     * @param msg
     */
    public setBeginGameData(msg: onBeginGame): void {
        console.log('set beginGameData: ', msg);
        this.beginGameData = msg;
    }

    /**
     * 取得 begin game 資料
     * @returns 回傳 begin game 資料
     */
    public getBeginGameData(): onBeginGame {
        console.log('get beginGameData: ', this.beginGameData);
        return this.beginGameData;
    }

    /**
     * 此筆 onBeginGame 資料是否還有中線
     * @returns 是否還有中線
     */
    public isLineHit(): boolean {
        return (this.beginGameData['data'].Lines.length > 1) ?  true : false;
    }

    /**
     * 此筆 onBeginGame 資料是否還有中Scatter
     * @returns 是否還有中Scatter
     */
    public isScatterHit(): boolean {
        if(this.beginGameData['data'].FreeGame.HitFree){
            this.beginGameData['data'].FreeGame.HitFree = false;
            return true;
        }else{
            return false;
        }
    }

    /**
     * 檢查Free Game剩下次數
     * @returns
     */
    public isFreeGameSpin(): boolean {
        return (this.beginGameData['data'].FreeGameSpin.FreeGameTime > 0) ? true : false;
    }


    /**
     * shift 出一筆中線資料
     * @returns
     */
    public shiftLinesData(): Lines[] {
        return this.beginGameData['data']['Lines'].shift(); // 中線資料
    }

    /**
     * shift 出一筆累積加總金額資料
     * @returns
     */
    public shiftAccumulateData(): number[] {
        return this.beginGameData['data']['Accumulate'].shift(); // 中線累加金額
    }

    /**
     * shift 出一筆盤面卡牌資料
     * @returns
     */
    public shiftCardsData(): number[][]{
        return this.beginGameData['data']['Cards'].shift(); // 掉落完畢，盤面上卡牌資料
    }

    /**
     * shift 出一筆綠色Wild資料
     * @returns
     */
    public shiftGreenWildData(): GreenWild[] {
        return this.beginGameData['data']['GreenWild'].shift();
    }

    /**
     * shift 出一筆紅色Wild資料
     * @returns
     */
    public shiftRedWildData(): RedWild[] {
        return this.beginGameData['data']['RedWild'].shift();
    }

    /**
     * 回傳 Scatter 資料
     * @returns
     */
    public getScatterData(): Scatter {
        return this.beginGameData['data']['Scatter'];
    }
}

