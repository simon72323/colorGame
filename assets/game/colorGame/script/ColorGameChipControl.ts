import { _decorator, Component, Node, tween, Vec3, Label, Sprite, find, Animation, UITransform, } from 'cc';
import { ColorGameMain } from './ColorGameMain';
import { ColorGameResource } from './ColorGameResource';
import { ColorGameData } from './ColorGameData';
import PoolHandler from '../../../common/script/tools/PoolHandler';
import { UtilsKitS } from '../../../common/script/lib/UtilsKitS';
import { SetChipID } from './ui/SetChipID';

//玩家下注資料
// interface PlayerBetData {
//     betPlayerID: number;//0=本地玩家，1~3=前三名玩家，4=其他玩家
//     betChipID: number[][];//下注區區資料[下注區][籌碼ID]
//     // betScore:number;//下注總金額
// }

const { ccclass, property } = _decorator;
@ccclass('ColorGameChipControl')
export class ColorGameChipControl extends Component {
    private gameMain: ColorGameMain = null;
    private gameResource: ColorGameResource = null;
    private gameData: ColorGameData = null;
    private pool: PoolHandler = new PoolHandler;

    @property({ type: Node, tooltip: "籌碼派發層" })
    private chipDispatcher: Node = null;
    @property({ type: Node, tooltip: "續押按鈕" })
    public btnRebet: Node = null;
    @property({ type: Node, tooltip: "自動投注按鈕" })
    public btnAuto: Node = null;
    @property({ type: Node, tooltip: "停止自動投注按鈕" })
    public btnAutoStop: Node = null;
    @property({ type: Label, tooltip: "續押分數" })
    public rebetScoreLable: Label = null;
    @property({ type: [Node], tooltip: "跟注按鈕(3顆)" })
    public btnCall: Node[] = [];

    // public playerBetData: PlayerBetData[] = [];//目前玩家下注資料
    private rebetSave: number[][] = [[], [], [], [], [], []];//上局本地玩家續押資料[下注區][籌碼ID]
    private rebetScore: number = 0;//續押金額
    public rebetState: string = 'init';//續押狀態(0=未續押，1=單次續押，2=自動續押)

    onLoad() {
        this.gameMain = find('Canvas/Scripts/ColorGameMain').getComponent(ColorGameMain);
        this.gameResource = find('Canvas/Scripts/ColorGameResource').getComponent(ColorGameResource);
        this.gameData = find('Canvas/Scripts/ColorGameData').getComponent(ColorGameData);

        //預先生成pool
        let tempPool = [];
        for (let i = 0; i < 300; i++) {
            tempPool.push(this.pool.get(this.gameResource.betChipBlack));
            if (i > 100)
                tempPool.push(this.pool.get(this.gameResource.betChipColor));
        }
        for (let pool of tempPool) {
            this.pool.put(pool);
        }
        tempPool = [];
        // console.log(tempPool);
    }

    //更新續押資料
    public updataRebetData() {
        if (this.gameData.localBetTotal <= 0)
            return;
        this.rebetSave = [[], [], [], [], [], []];//清空後重新記錄籌碼
        for (let i = 0; i < this.rebetSave.length; i++) {
            for (let chip of this.chipDispatcher.getChildByName('MainPlayer').children[i].children) {
                this.rebetSave[i].push(chip.getComponent(SetChipID).chipID);//添加籌碼id到續押資料內
            }
        }
        this.rebetScore = this.gameData.localBetTotal;
        this.rebetScoreLable.string = UtilsKitS.NumDigits(this.rebetScore);
        console.log("續押資料", this.rebetSave)
    }

    //設置續押狀態
    public setRebet(event: Event, state: string) {
        this.rebetState = state;
        console.log('狀態', this.rebetState)
        switch (state) {
            case 'init'://未續押狀態
                this.btnRebet.active = true;
                this.btnAuto.active = false;
                this.btnAutoStop.active = false;
                break;
            case 'onceBet'://單次續押狀態
                if (this.btnRebet.active)
                    this.runRebet();
                else {
                    this.btnAuto.active = true;
                    this.btnAutoStop.active = false;
                }
                break;
            case 'autoBet'://自動續押狀態
                this.btnRebet.active = false;
                this.btnAuto.active = false;
                this.btnAutoStop.active = true;
                break;
        }
    }

    //執行續押
    public runRebet() {
        if (this.rebetScore < 0) {
            console.log("無續押資料")
            return;
        }
        if (this.gameData.localScore < this.rebetScore) {
            this.setRebet(null, 'init');
            console.log("分數不足無法續押")
            return;
        }
        if (this.rebetState !== 'autoBet') {
            this.btnRebet.active = false;
            this.btnAuto.active = true;
            this.btnAutoStop.active = false;
        }

        console.log("單次續押")
        for (let i = 0; i < this.rebetSave.length; i++) {
            for (let j of this.rebetSave[i]) {
                this.createChipToBetArea(i, 0, j);//籌碼派發
            }
        }
    }
    // //按下續押按鈕
    // public btnRebetTouch() {
    //     this.rebetState = 1;
    //     this.setRebet();
    // }

    // public btnAutoTouch() {
    //     this.rebetState = 2;
    //     this.setRebet();
    // }

    // public btnAutoStopTouch() {
    //     this.rebetState = 1;
    //     this.setRebet();
    // }

    //生成籌碼到注區(注區id，下注人，籌碼分ID)
    public createChipToBetArea(betId: number, playerId: number, chipID: number) {
        let betChip: Node;
        let betChipHeight: number;
        let betChipWidth: number;
        let poolBetChip: Node;//生成的籌碼
        let movePos: Vec3;//籌碼移動位置
        let chipScore = this.gameData.betScoreRange[chipID];
        if (playerId === 0) {
            betChip = this.chipDispatcher.getChildByName('MainPlayer').children[betId];//下注區節點
            // const selectChipID = this.gameData.selectChipID;
            poolBetChip = this.pool.get(this.gameResource.betChipColor);
            poolBetChip.getComponent(Sprite).spriteFrame = this.gameResource.chipSF[chipID];//設置籌碼貼圖
            poolBetChip.getComponent(SetChipID).chipID = chipID;
            // chipScore = this.gameData.betScoreRange[selectChipID];
            poolBetChip.children[0].getComponent(Label).string = UtilsKitS.NumDigits(chipScore);//設置籌碼分數
            poolBetChip.parent = betChip;
            //*****注意續押的籌碼編號可能會跟選擇區的籌碼不同，如果執行續押，籌碼會從玩家頭像下注 */
            if (this.rebetState === 'init')
                poolBetChip.position = this.gameMain.selectChip.children[this.gameData.chipSetID.indexOf(chipID)].getWorldPosition().subtract(betChip.worldPosition);
            else
                poolBetChip.position = this.gameMain.playerPos.children[0].getWorldPosition().subtract(betChip.worldPosition);
            this.gameData.localBetTotal += chipScore;//本地下注總分增加
            this.gameData.localScore -= chipScore;
            this.gameMain.comBtnBet.getComponent(Animation).play();
            // this.updataBetInfo(betId, playerId, chipScore);//分數變化
        } else {
            betChip = this.chipDispatcher.getChildByName('OtherPlayer').children[betId];//下注區節點
            this.gameMain.playerPos.children[playerId].getComponent(Animation).play();//頭像移動
            poolBetChip = this.pool.get(this.gameResource.betChipBlack);
            poolBetChip.parent = betChip;
            poolBetChip.position = this.gameMain.playerPos.children[playerId].getWorldPosition().subtract(betChip.worldPosition);
        }
        this.gameData.betAreaTotal[betId] += chipScore;//注區總分更新

        poolBetChip.getComponent(SetChipID).playerID = playerId;

        betChipHeight = betChip.getComponent(UITransform).height;
        betChipWidth = betChip.getComponent(UITransform).width;
        movePos = new Vec3(betChipWidth / 2 - Math.random() * betChipWidth, betChipHeight / 2 - Math.random() * betChipHeight, 0);
        tween(poolBetChip).to(0.3, { position: movePos }, { easing: 'sineOut' })
            .call(() => {
                if (playerId === 0) {
                    let betChipScore = this.gameData.localBetScore[betId] += chipScore;//本地玩家下注總分數
                    this.gameMain.betInfo.children[betId].getChildByName('BetScore').getComponent(Label).string = UtilsKitS.NumDigits(betChipScore);
                }
                else {
                    poolBetChip.children[0].getComponent(Label).string = UtilsKitS.NumDigits(chipScore);
                }
                this.gameData.updataUIScore(); //更新介面分數
                this.chipScale(poolBetChip);//籌碼縮放動態
            }).start();
    }

    //更新注區資訊(下注區,下注人,下注分數)
    public updataBetInfo(betId: number, playerId: number, score: number) {
        if (playerId === 0) {
            this.gameData.localBetTotal += score;//本地下注總分增加
            this.gameData.localScore -= score;
            this.gameMain.comBtnBet.getComponent(Animation).play();
            this.gameData.betAreaTotal[betId] += score;//注區總分更新
        }
        this.gameData.updataUIScore(); //更新介面分數
    }

    //籌縮放動態
    chipScale(chip: Node) {
        tween(chip).to(0.03, { scale: new Vec3(1.05, 1.05, 1) })
            .then(tween(chip).to(0.15, { scale: new Vec3(1, 1, 1) }))
            .start();
    }

    //回收籌碼(失敗注區id)
    public recycleChip(betId: number) {
        //回收籌碼到莊家位置並清除
        for (let i = 0; i < 2; i++) {
            const betChip = this.chipDispatcher.children[i].children[betId];//下注區節點
            const savePos = betChip.getPosition();
            const movePos = this.chipDispatcher.getChildByName('BankerPos').getWorldPosition().subtract(betChip.getWorldPosition()).add(savePos);
            tween(betChip).to(0.5, { position: movePos }, { easing: 'sineOut' })
                .call(() => {
                    while (betChip.children.length > 0) {
                        this.pool.put(betChip.children[0]);//退還所有子節點
                    }
                    betChip.setPosition(savePos);//回到原位置
                }).start();
        }
    }

    //生成派獎籌碼到注區(勝利注區id，倍率)
    public createPayChipToBetArea(betId: number, multiply: number) {
        let poolBetChip: Node;//生成的籌碼
        for (let i = 0; i < 2; i++) {
            const betChip = this.chipDispatcher.children[i].children[betId];//下注區節點
            if (betChip.children.length > 0) {
                let payNode = new Node();
                //生成籌碼
                for (let j = 0; j < multiply; j++) {
                    for (let k = 0; k < betChip.children.length; k++) {
                        poolBetChip = this.pool.get(i === 0 ? this.gameResource.betChipBlack : this.gameResource.betChipColor);
                        poolBetChip.parent = payNode;
                        poolBetChip.getComponent(Sprite).spriteFrame = betChip.children[k].getComponent(Sprite).spriteFrame;
                        poolBetChip.getComponent(SetChipID).playerID = betChip.children[k].getComponent(SetChipID).playerID;
                        poolBetChip.getComponent(SetChipID).chipID = betChip.children[k].getComponent(SetChipID).chipID;
                        poolBetChip.children[0].getComponent(Label).string = betChip.children[k].children[0].getComponent(Label).string;
                        const chipPos = betChip.children[k].position;
                        poolBetChip.setPosition(new Vec3(chipPos.x, chipPos.y + (j + 1) * (i === 0 ? 5 : 6), chipPos.z));
                    }
                }
                payNode.parent = betChip;
                payNode.position = this.chipDispatcher.getChildByName('BankerPos').getWorldPosition().subtract(betChip.getWorldPosition());
                payNode.setScale(new Vec3(0, 0, 0));
                tween(payNode).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' }).call(async () => {
                    const movePos = new Vec3(0, 0, 0);
                    await UtilsKitS.Delay(0.4);
                    tween(payNode).to(0.5, { position: movePos }, { easing: 'sineOut' }).call(async () => {
                        while (payNode.children.length > 0) {
                            const child = payNode.children[0];
                            child.parent = betChip;
                        }
                        payNode.destroy();
                        this.chipScale(betChip);//籌碼縮放動態
                        await UtilsKitS.Delay(0.4);
                        this.chipPayToPlayer(betId);//注區籌碼派彩給玩家
                    }).start();
                }).start()
            }
        }
    }

    //注區籌碼派彩給玩家(勝利注區id)
    private chipPayToPlayer(betId: number) {
        for (let i = 0; i < 2; i++) {
            const betChip = this.chipDispatcher.children[i].children[betId];
            for (let j = 0; j < betChip.children.length; j++) {
                let chip = betChip.children[j];
                const chipPlayerID = chip.getComponent(SetChipID).playerID;
                const movePos = this.gameMain.playerPos.children[chipPlayerID].getWorldPosition().subtract(betChip.getWorldPosition());
                tween(chip).to(0.5, { position: movePos }, { easing: 'sineOut' }).call(() => {
                    this.pool.put(chip);
                }).start();
            }
        }
    }
}