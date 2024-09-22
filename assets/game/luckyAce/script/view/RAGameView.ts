import { _decorator, Component, find, instantiate, JsonAsset, Label, Line, Node, Prefab, random, randomRangeInt, sp, tween, Vec2, Vec3 } from 'cc';
import { RASymbol } from './RASymbol';
import { RASymbolID } from '../enum/RAEnum';
import { GreenWild, Lines, RedWild, Scatter } from '../enum/RAInterface';
const { ccclass, property } = _decorator;

@ccclass('RABaseGameView')
export class RABaseGameView extends Component {

    @property(Node)
    public openingFx: Node = null!; // 開場特效節點

    @property(Node)
    public mask: Node = null!; // mask

    @property(Node)
    public symbolFxLayer: Node = null!; // symbol中獎，聽牌演出時掛載節點

    @property(Node)
    public winScoreInfo: Node = null!; // 所有 symbol根節點

    @property({ type: Node, tooltip: "Slot上方牌靴" })
    private pokerShoe: Node = null;

    @property(Node)
    private slotListenRoot: Node = null; // 聽牌根節點

    @property(Node)
    private freeGameGet: Node = null; // freegame轉場節點

    @property(Prefab)
    private symbolPrefab: Prefab = null; // freegame轉場節點

    private symbolRoot: Node = null!; //  // 所有 symbol根節點
    private symbol: RASymbol[][] = [] // 所有 symbol節點
    private readonly column: number = 5; // symbol行數

    private readonly row: number = 4; // symbol列數
    // private scoreLabel: Label = null!; // 分數 Label

    private slotListenNode: Node[] = []; // 聽牌特效節點

    private symbolInterval: number = 200; // 同一行 symbol落下間隔時間
    private symbolListenInterval: number = 1000; // 該行聽牌時，每個symbol落下間隔時間
    private columnInterval: number = 150; // 每一行 symbol開始發牌間隔時間
    private listenTime: number = 500;
    private moveToTime: number = 100;
    private wildMoveTime: number = 500; // 金色 wild移到其他 wild的速度

    private symbolFinishMove: Function = ()=>{};
    private symbolFinishMoveCallBack: Function = ()=>{};


    protected onLoad(): void {
        this.symbolRoot = find('slotRun', this.node);

        for (let i = 0; i < this.column; ++i) {
            this.symbol[i] = [];
            for (let j = 0; j < this.row; ++j) {
                this.symbol[i].push(this.symbolRoot.children[(i * 4) + j].getComponent(RASymbol));
            }
        }

        // this.scoreLabel = this.winScoreInfo.getChildByPath('score/label').getComponent(Label);

        for (let i = 0; i < this.column; ++i) {
            this.slotListenNode[i] = this.slotListenRoot.getChildByName('slotListen' + i);
        }
    }

    protected start(): void {
    }

    protected update(deltaTime: number): void {

    }

    /**
     * 開場動畫
     */
    public async playOpenFx(): Promise<void> {
        // 進入遊戲後等待500毫秒再啟動開局特效
        await this.waitMilliSeconds(500);

        //顯示開場特效
        this.openingFx.active = true;
        let waitTime = 800;

        await this.waitMilliSeconds(waitTime);
        //等待特效播放800毫秒後啟動Symbol開場動態表演

        for(let i = 0; i < this.symbol.length; ++i) {
            for(let j = 0; j < this.symbol[i].length; ++j) {
                //每個Symbol表演的延遲間格時間50毫秒
                await this.waitMilliSeconds(50);
                this.symbol[i][j].playSymbolOpening();
            }
        }

        this.openingFx.active = false;  //關閉開場特效
    }

    /**
     * 更新 gameview 上所有 symbol
     */
    public async updateSymbols(cards: number[][], callback?: Function): Promise<void> {
        // 所有 symbol下移
        this.playSymbolsMoveOut();

        // 等500 毫秒
        await this.waitMilliSeconds(500);
        // 設定symbol資料
        this.setSymbols(cards);
        // symbol移入演出，含聽牌演出...等等
        this.playSymbolsMoveIn();


        if (callback) {
            this.symbolFinishMoveCallBack = callback;
        }
    }

    /**
     * 播放中線演出(動畫時間 1.8秒)
     * @param linedata 中線資料
     * @param draw 補牌資料
     * @param callBack 中線演出完畢要做的事
     */
    public async playLinesWin(linedata: Lines[], draw: Number[][], greenwild: GreenWild[], redwild: RedWild[],callBack ?: Function): Promise<void> {
        await this.waitMilliSeconds(500);

        this.mask.active = true; // 打開 mask

        // 找出中線節點
        let linegrids: number[] = []
        for(let i = 0; i < linedata.length; ++i){
            linegrids = linegrids.concat(linedata[i].Grids);
        }
        // 去除重覆的 grid
        let lineset = new Set(linegrids);
        linegrids = Array.from(lineset);
        console.log('linegrids:', JSON.stringify(linegrids));

        // 中獎節點掛到mask上面，播放中線動畫
        this.changeSymbolParent(linegrids, this.symbolFxLayer);
        this.symbolPlayWin(linegrids);

        // 等1.1秒後播放symbol消失動畫
        await this.waitMilliSeconds(1100);
        this.symbolPlayDestroy(linegrids);

        // 金色卡牌變成牌背
        let flipgrids : number[] = []; // 需要變成牌背的 grids
        for(let i = 0; i < linedata.length; ++i){
            for(let j = 0; j < linedata[i].Element.length; ++j){
                if(linedata[i].Element[j] >= RASymbolID.GoldAce){
                    flipgrids.push(linedata[i].Grids[j]);
                }
            }
        }
        this.symbolPlayWildFlop(flipgrids);

        // 尋找紅色Wild MainGrid (紅色Wild MainGrid 可能有多個)
        let redWildMainGrids: number []= []; // 紅色 wild main grid
        if(redwild.length !== 0){
            for(let i = 0; i < redwild.length; ++i){
                redWildMainGrids.push(redwild[i].MainGrid);
            }
            // this.symbolPlayWildFlop(redWildMainGrids);
        }

        // 動畫播放完畢，等1000毫秒，關閉 mask，中線節點掛回原本父節點
        await this.waitMilliSeconds(1000);
        this.mask.active = false;
        this.changeSymbolParent(linegrids, this.symbolRoot);

        // 等0.2秒補牌
        await this.waitMilliSeconds(200);
        console.log(' playDraw linegrids: ', JSON.stringify(linegrids));
        for (let i = 0; i < linegrids.length; ++i) {
            const column = this.getColumnID(linegrids[i]);
            const row = this.getRowID(linegrids[i]);
            this.symbol[column][row].playDraw(draw[column][row] as RASymbolID);

            // 補牌時，scatter node掛到symbolFxLayer下，其他掛到symbolRoot下
            (this.symbol[column][row].symbolID === RASymbolID.Scatter) ? 
            (this.symbol[column][row].node.parent = this.symbolFxLayer):
            (this.symbol[column][row].node.parent = this.symbolRoot)
        }

        // wild 牌背翻成牌面
        if(flipgrids.length !== 0){
            this.symbolPlayWildFlip(flipgrids);
        }

        if(redWildMainGrids.length !== 0){
            this.symbolPlayWildFlip(redWildMainGrids);

            await this.waitMilliSeconds(1000);
            // 紅Wild出現複製多個，吃掉指定位置卡牌
            await this.symbolPlayWildReplicate(redWildMainGrids);

            for(let i = 0; i < redWildMainGrids.length; ++i){
                this.symbolReplicate(redWildMainGrids[i], redwild[i].Grids)
            }
        }


        // 等0.5秒執行 callback
        await this.waitMilliSeconds(1000);
        if(callBack){
            console.log('playLinesWin callback');
            callBack();
        }

    }

    /**
     * 播放某一行的聽牌特效
     * @param index
     */
    public playListenFx(index: number): void {
        for(let i = 0; i < this.slotListenNode.length; ++i){
            this.slotListenNode[i].active = false;
        }

        this.slotListenNode[index].active = true;
    }

    /**
     * 隱藏聽牌特效
     */
    public hideListenFx(): void {
        for(let i = 0; i < this.slotListenNode.length; ++i){
            this.slotListenNode[i].active = false;
        }
        // 聽牌結束，scatter 播放 idle 動畫
        let scatter: RASymbol[] = this.checkListenSymbol(this.column - 1);
        for(let i = 0; i < scatter.length; ++i){
            scatter[i].playScatterSpine('idle', true);
        }
    }

    /**
     * 播放中scatter演出
     * @param data 中scatter資料
     */
    public async playScatterWin(data: Scatter, callBack ?: Function): Promise<void> {
        console.log('playScatterWin...');
        this.mask.active = true; // 打開 mask

        let scattersymbol: RASymbol[] = this.gridsToSymbolArray(data.Grids);
        for(let i = 0; i < scattersymbol.length; ++i){
            scattersymbol[i].playScatterSpine('win', true);
        }

        // 2秒後開啟免費遊戲轉場
        await this.waitMilliSeconds(2000);
        this.freeGameGet.active = true;

        await this.waitMilliSeconds(2000);
        this.mask.active = false;
        for(let i = 0; i < scattersymbol.length; ++i){
            // scattersymbol[i].node.parent = this.symbolRoot;
            scattersymbol[i].playScatterSpine('idle', true);
        }

        // 4秒後免費遊戲轉場結束
        await this.waitMilliSeconds(4000);
        this.freeGameGet.active = false;

        if(callBack){
            callBack();
        }
    }

    /**
     * 演出所有 symbol 移出 Game View
     */
    private playSymbolsMoveOut(): void {
        for (let i = 0; i < this.symbol.length; ++i) {
            for (let j = 0; j < this.symbol[i].length; ++j) {
                this.symbol[i][j].moveOut();
            }
        }
    }

    /**
     * 演出 symbol 進入 Game View
     * @param Cards 卡牌資料
     */
    private async playSymbolsMoveIn(): Promise<void> {
        let delay: number = 0; //每一行發牌間隔時間

        let listenid = this.findListenLineID(); // 哪幾行需要聽牌
        let finishid = this.findFinishListenLineID();

        if(listenid.length > 0){ // 需要聽牌
            // 聽牌前正常移入
            for (let i = 0; i < listenid[0]; ++i) {
                this.playColumnMoveIn(i);
                await this.waitMilliSeconds(this.columnInterval);
            }

            // 聽牌時，停頓1秒，聽牌symbol逐個掉下xx
            await this.waitMilliSeconds(this.listenTime);
            console.log('播放聽牌fx');
            for(let i = 0; i < listenid.length; ++i){
                this.playListenFx(listenid[i]); // 播放聽牌fx
                await this.playListenColumnMoveIn(listenid[i]);
            }

            // 聽牌結束，聽牌那行剩下symbol正常速度落下
            console.log('關閉聽牌fx');
            this.hideListenFx();

            // 聽牌聽到某一行結束
            if(finishid > -1){
                if((finishid + 1) === this.column){// 如果後面沒有其他行，正常結束
                    this.symbolFinishMoveCallBack();
                }else{ // 後面有其他行，後面所有symbol正常落下
                    for (let i = (finishid + 1); i < this.column; ++i) {
                        this.playColumnMoveIn(i, this.symbolFinishMoveCallBack);
                        await this.waitMilliSeconds(this.columnInterval);
                    }
                }

            }else{ // 一直聽牌聽到最後一行
                this.symbolFinishMoveCallBack();
            }
        }else{ // 不需要聽牌，正常掉落
            for (let i = 0; i < this.column; ++i) {
                this.playColumnMoveIn(i);
                delay += this.columnInterval; // 每行發牌總等待時間
                await this.waitMilliSeconds(this.columnInterval); // 每一行發牌間隔150毫秒
            }
            await this.waitMilliSeconds(delay);
            this.symbolFinishMoveCallBack();
        }
    }

    /**
     * 設定所有 symbol牌面顯示
     * @param Cards
     */
    private setSymbols(Cards: number[][]): void {
        for (let i = 0; i < this.symbol.length; ++i) {
            for (let j = 0; j < this.symbol[i].length; ++j) {
                this.symbol[i][j].setSymbol(Cards[i][j]);

                if(this.symbol[i][j].getSymbolID() === RASymbolID.WW || this.symbol[i][j].getSymbolID() === RASymbolID.GoldWW || this.symbol[i][j].getSymbolID() === RASymbolID.Scatter){
                    this.symbol[i][j].node.parent = this.symbolFxLayer;
                }else{
                    this.symbol[i][j].node.parent = this.symbolRoot;
                }
            }
        }
    }

    /**
     * 播放單一行 symbol 逐一下移至 gameview
     * @param index index 行編號
     * @param callback 此行所有symbol落下要做的事
     */
    private async playColumnMoveIn(index: number, callback?: Function): Promise<void> {
        let startIndex: number = 3;
        let endIndex: number = 0;
        let delay: number = 0;

        // 每一行落下時間 (200 + delay) 毫秒
        for (let i = startIndex; i >= endIndex; i--) {
            setTimeout(() => {
                this.playPokerShoeSp(index, 1);
                this.symbol[index][i].moveIn();
            }, delay);
            delay += this.symbolInterval; // 發牌間隔150毫秒
        }

        await this.waitMilliSeconds(delay);

        if(callback){
            callback();
        }
    }

    /**
     * 播放該行聽牌時 symbol 逐一下移至 gameview
     * @param index index 行編號
     * @param callback 此行所有symbol落下要做的事
     * @returns 此行 listen花費時間
     */
    private async playListenColumnMoveIn(index: number, callback?: Function): Promise<void> {
        let startIndex: number = 3;
        let endIndex: number = 0;

        let isScatterAppear: boolean = false;

        // scatter symbol 播放聽牌spine動畫
        let scatter: RASymbol[] = this.checkListenSymbol(index - 1);
        for(let i = 0; i < scatter.length; ++i){
            scatter[i].playScatterSpine('listen', true);
        }

        for (let i = startIndex; i >= endIndex; i--) {
            // 聽牌時，scatter symbol已出現，發牌間隔時間還原
            if(isScatterAppear){
                await this.waitMilliSeconds(this.symbolInterval);
            }else{
                await this.waitMilliSeconds(this.symbolListenInterval);
            }

            this.playPokerShoeSp(index, 1);
            this.symbol[index][i].moveIn();

            if(this.symbol[index][i].getSymbolID() === RASymbolID.Scatter){
                isScatterAppear = true;
            }
        }
        await this.waitMilliSeconds(this.symbolInterval);
    }

    /**
     * 播放牌靴動畫
     * @param slotNum 行編號
     * @param dealNum 播放牌靴張數
     */
    private playPokerShoeSp(slotNum: number, dealNum: number): void {
        this.pokerShoe.children[slotNum].getComponent(sp.Skeleton).setAnimation(0, `deal${dealNum}`, false);
    }

    /**
     * 取得 grid所在行數 index
     * @param grid
     * @returns
     */
    private getColumnID(grid: number): number {
        return Math.floor((grid - 1) / this.row);
    }

    /**
     * 取得 grid所在列數 index
     * @param grid
     * @returns
     */
    private getRowID(grid: number): number {
        return (grid - 1) % this.row;
    }

    /**
     * 找出哪一行symbol落下需要聽牌
     * @returns 需要聽牌的行 index
     */
    private findListenLineID(): number[] {
        const listencolumn: number[] = [];
        for(let i = 0; i < this.column; ++i){
            let n = this.checkListenSymbol(i);

            if(n.length === 2 && (i < (this.column - 1))){
                listencolumn.push(i + 1);
            }
        }
        return listencolumn;
    }

    /**
     * 找出哪一行symbol落下聽牌結束
     * @returns 聽牌結束的行 index
     */
    private findFinishListenLineID(): number {
        for(let i = 0; i < this.column; ++i){
            let n = this.checkListenSymbol(i);

            if(n.length === 3 && (i < (this.column))){
                return i;
            }
        }
        return -1; // 此局無聽牌結束
    }

    /**
     * 取得某一行完全落下時，哪些節點是scatter
     * @param columnIndex
     * @returns
     */
    private checkListenSymbol(columnIndex: number): RASymbol[] {
        let scatterNode: RASymbol[] = [];
        for(let i = 0 ; i < (columnIndex + 1); ++i){
            for(let j = 0; j < this.row; ++j){
                if(this.symbol[i][j].getSymbolID() === RASymbolID.Scatter){
                    scatterNode.push(this.symbol[i][j]);
                }
            }
        }
        return scatterNode;
    }

    /**
     * 輸入grids陣列，回傳取得相對應位置的symbol
     * @param grids grids陣列
     * @returns 相對應位置的symbol
     */
    private gridsToSymbolArray(grids: number[]): RASymbol[] {
        let find: RASymbol[] = []

        for(let i = 0; i < grids.length; ++i){
            let column = this.getColumnID(grids[i]);
            let row = this.getRowID(grids[i]);
            find.push(this.symbol[column][row]);
        }
        return find;
    }

    private attachScatterToFxLayer(index: number): void {
        let scatter: RASymbol[] = this.checkListenSymbol(index);
        for(let i = 0; i < scatter.length; ++i){
            // scatter[i].node.parent = this.symbolFxLayer;
            scatter[i].playScatterSpine('listen', true);
        }
    }

    // private attachScatterToRoot(index: number): void {
    //     let scatter: RASymbol[] = this.checkListenSymbol(index);
    //     for(let i = 0; i < scatter.length; ++i){
    //         // scatter[i].node.parent = this.symbolRoot;
    //         scatter[i].playScatterSpine('idle', true);
    //     }
    // }

    /**
     * 等待多少毫秒
     * @param ms
     * @returns
     */
    private waitMilliSeconds(ms: number): Promise<void> {
        return new Promise((r) => setTimeout(r, ms));
    }

    private getGridPos(grid: number): Vec3{
        let c = this.getColumnID(grid)
        let r = this.getRowID(grid)
        return this.symbol[c][r].getEndPos();
    }

    /**
     * 指定grid播放卡牌變Wild卡背動畫
     * @param grids
     */
    private symbolPlayWildFlop(grids: number[]){
        for(let i = 0; i < grids.length; ++i){
            let c = this.getColumnID(grids[i])
            let r = this.getRowID(grids[i])
            this.symbol[c][r].playSymbolFlopFx();
        }
    }

    /**
     * symbol 播放 wild 翻牌動畫
     * @param grids
     */
    private symbolPlayWildFlip(grids: number[]):void{
        for(let i = 0; i < grids.length; ++i){
            let c = this.getColumnID(grids[i])
            let r = this.getRowID(grids[i])
            this.symbol[c][r].playWildSFlipSpine();
        }
    }

    /**
     * 改變指定 grid symbol的父節點
     * @param grids
     * @param parentsNode
     */
    private changeSymbolParent(grids: number[], parentsNode: Node): void {
        for(let i = 0; i < grids.length; ++i){
            let c = this.getColumnID(grids[i])
            let r = this.getRowID(grids[i])
            this.symbol[c][r].node.parent = parentsNode;
        }
    }

    /**
     * 指定 grid symbol播放win動畫
     * @param grids
     */
    private symbolPlayWin(grids: number[]): void{
        for(let i = 0; i < grids.length; ++i){
            let c = this.getColumnID(grids[i])
            let r = this.getRowID(grids[i])
            this.symbol[c][r].playWin();
        }
    }

    /**
     * 指定 grid symbol播放destroy動畫
     * @param grids
     */
    private symbolPlayDestroy(grids: number[]): void{
        for(let i = 0; i < grids.length; ++i){
            let c = this.getColumnID(grids[i])
            let r = this.getRowID(grids[i])
            this.symbol[c][r].playDestroy();
        }
    }

    /**
     * 指定 grid symbol播放wild 分裂動畫
     * @param grids
     */
    private async symbolPlayWildReplicate(grids: number[]): Promise<void>{
        for(let i = 0; i < grids.length; ++i){
            let c = this.getColumnID(grids[i])
            let r = this.getRowID(grids[i])
            this.symbol[c][r].playWildReplicateSpine();
        }
    }

    /**
     * 從指定 maingrid，分裂 symbol至 grids位置
     * @param maingrid
     * @param grids
     */
    private async symbolReplicate(maingrid: number, grids: number[]): Promise<void>{
        // grids 去除掉 maingrid
        grids = grids.filter(item => item!== maingrid);

        let mainpos: Vec3 = this.symbol[this.getColumnID(maingrid)][this.getRowID(maingrid)].getEndPos();
        let replicatpos: Vec3[] = []

        for(let i = 0; i < grids.length; ++i){
            if(maingrid !== grids[i]){
                replicatpos.push(this.symbol[this.getColumnID(grids[i])][this.getRowID(grids[i])].getEndPos())
            }
        }
        // 找到要被吃掉的 symbol
        let towild = this.gridsToSymbolArray(grids);

        for(let i = 0; i < replicatpos.length; ++i){
            let replicatnode = instantiate(this.symbolPrefab);
            replicatnode.parent = this.symbolFxLayer;
            replicatnode.getComponent(RASymbol).setWildSymbolDirect(RASymbolID.GoldWW);
            replicatnode.setPosition(mainpos);
            replicatnode.getComponent(RASymbol).moveTo(replicatpos[i],()=>{
                towild[i].setWildSymbolDirect(RASymbolID.GoldWW);
            });
            await this.waitMilliSeconds(this.wildMoveTime);
        }
        console.log('replicatnode done');

    }

}

