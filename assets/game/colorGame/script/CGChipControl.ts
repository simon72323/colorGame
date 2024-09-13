import { _decorator, Component, Node, tween, Vec3, Label, Sprite, Prefab, Animation, UITransform, Button, Color, } from 'cc';
import { CGUI } from './CGUI';
import { CGResource } from './CGResource';
import { CGData } from './CGData';
import PoolHandler from '../../../common/script/tools/PoolHandler';
import { UtilsKitS } from '../../../common/script/lib/UtilsKitS';
import { SetChipID } from './ui/SetChipID';
const { ccclass, property } = _decorator;


@ccclass('CGChipControl')
export class CGChipControl extends Component {
    //Script
    @property({ type: CGUI, tooltip: "遊戲UI腳本" })
    private gameUI: CGUI = null;
    @property({ type: CGResource, tooltip: "遊戲資源腳本" })
    private gameResource: CGResource = null;
    @property({ type: CGData, tooltip: "遊戲資料腳本" })
    private gameData: CGData = null;

    //Prefab
    @property({ type: Prefab, tooltip: "其他玩家下注籌碼" })
    public betChipBlack: Prefab = null;
    @property({ type: Prefab, tooltip: "本地玩家下注籌碼" })
    public betChipColor: Prefab = null;
    @property({ type: Prefab, tooltip: "提示訊息" })
    public tipPrefab: Prefab = null;

    private pool: PoolHandler = new PoolHandler;
    private rebetSave: number[][] = Array(6).fill([]);//上局本地玩家續押資料[下注區][籌碼ID]
    private rebetScore: number = 0;//續押金額
    public rebetState: string = 'init';//'init','onceBet','autoBet'

    onLoad() {
        //預先生成pool
        let tempPool = [];
        for (let i = 0; i < 300; i++) {
            tempPool.push(this.pool.get(this.betChipBlack));
            if (i > 100)
                tempPool.push(this.pool.get(this.betChipColor));
        }
        for (let pool of tempPool) {
            this.pool.put(pool);
        }
        tempPool = [];
        this.gameUI.rebetScoreLable.string = '0';
    }

    //更新寫入續押資料
    public updataRebetData() {
        const betTotalScore = this.gameData.userInfo.BetTotalCredit;
        if (betTotalScore <= 0)
            return;
        this.rebetSave = [[], [], [], [], [], []];//清空後重新記錄籌碼
        for (let i = 0; i < this.rebetSave.length; i++) {
            for (let chip of this.gameUI.chipDispatcher.getChildByName('MainPlayer').children[i].children) {
                this.rebetSave[i].push(chip.getComponent(SetChipID).chipID);//添加籌碼id到續押資料內
            }
        }
        this.rebetScore = betTotalScore;
        this.gameUI.rebetScoreLable.string = UtilsKitS.NumDigits(this.rebetScore);
    }

    //設置續押狀態
    public setRebet(event: Event, state: string) {
        switch (state) {
            case 'init'://未續押狀態
                this.rebetState = state;
                this.gameUI.btnRebet.active = true;
                this.gameUI.btnAuto.active = false;
                this.gameUI.btnAutoStop.active = false;
                break;
            case 'onceBet'://單次續押狀態
                this.rebetState = state;
                if (this.gameUI.btnRebet.active)
                    this.runRebet();
                else {
                    this.showTipMessage("停止自動續押", 0);
                    this.gameUI.btnAuto.active = true;
                    this.gameUI.btnAutoStop.active = false;
                }
                break;
            case 'autoBet'://自動續押狀態
                this.showTipMessage("啟用自動續押", 1);
                this.rebetState = state;
                this.gameUI.btnRebet.active = false;
                this.gameUI.btnAuto.active = false;
                this.gameUI.btnAutoStop.active = true;
                break;
        }
    }

    //執行續押
    public runRebet() {
        if (this.rebetScore <= 0) {
            this.setRebet(null, 'init');
            this.showTipMessage("請先投注", 0);
            return;
        }
        if (this.gameData.userInfo.Credit < this.rebetScore) {
            this.setRebet(null, 'init');
            this.showTipMessage("分數不足無法續押", 0);
            return;
        }
        this.showTipMessage("續押:" + this.rebetScore.toString(), 0);
        if (this.rebetState !== 'autoBet') {
            this.gameUI.btnRebet.active = false;
            this.gameUI.btnAuto.active = true;
            this.gameUI.btnAutoStop.active = false;
        }
        for (let i = 0; i < this.rebetSave.length; i++) {
            for (let j of this.rebetSave[i]) {
                this.createChipToBetArea(i, 0, j, true);//籌碼派發
            }
        }
    }

    //生成籌碼到注區(注區id，下注人，籌碼分ID，是否為續押)
    public createChipToBetArea(betId: number, playerId: number, chipID: number, rebet: boolean) {
        let betChip: Node;
        let betChipHeight: number;
        let betChipWidth: number;
        let poolBetChip: Node;//生成的籌碼
        let movePos: Vec3;//籌碼移動位置
        let chipScore = this.gameData.gameSetInfo.ChipRange[chipID];
        if (playerId === 0) {
            if (this.gameData.userInfo.BetTotalCredit + chipScore > this.gameData.gameSetInfo.Limit) {
                this.showTipMessage("投注超過限額", 0);
                return;
            }
            if (this.gameData.userInfo.Credit < chipScore) {
                this.showTipMessage("餘額不足", 0);
                for (let i = 0; i < 3; i++) {
                    this.gameUI.stopBetCall(i);//取消跟注
                }
                return;
            }
            this.gameUI.btnRebet.getComponent(Button).interactable = false;
            betChip = this.gameUI.chipDispatcher.getChildByName('MainPlayer').children[betId];//下注區節點
            poolBetChip = this.pool.get(this.betChipColor);
            poolBetChip.getComponent(Sprite).spriteFrame = this.gameResource.chipSF[chipID];//設置籌碼貼圖
            poolBetChip.getComponent(SetChipID).chipID = chipID;
            poolBetChip.children[0].getComponent(Label).string = UtilsKitS.NumDigits(chipScore);//設置籌碼分數
            poolBetChip.parent = betChip;
            this.gameData.userInfo.BetTotalCredit += chipScore;//本地下注總分增加

            this.gameData.userInfo.Credit -= chipScore;
            //*****注意續押的籌碼編號可能會跟選擇區的籌碼不同，如果執行續押，籌碼會從玩家頭像下注 */
            if (rebet)
                poolBetChip.position = this.gameUI.playerPos.children[0].getWorldPosition().subtract(betChip.worldPosition);
            else
                poolBetChip.position = this.gameUI.selectChip.children[this.gameData.userInfo.ChipSetID.indexOf(chipID)].getWorldPosition().subtract(betChip.worldPosition);

            this.rebetScore = this.gameData.userInfo.BetTotalCredit;
            this.gameUI.rebetScoreLable.string = UtilsKitS.NumDigits(this.rebetScore);//續押分數更新
            this.gameUI.comBtnBet.getComponent(Animation).play();
        } else {
            betChip = this.gameUI.chipDispatcher.getChildByName('OtherPlayer').children[betId];//下注區節點
            this.gameUI.playerPos.children[playerId].getComponent(Animation).play();//頭像移動
            poolBetChip = this.pool.get(this.betChipBlack);
            poolBetChip.parent = betChip;
            poolBetChip.position = this.gameUI.playerPos.children[playerId].getWorldPosition().subtract(betChip.worldPosition);
        }
        // this.gameData.betInfo.BetAreaData[betId].BetCredit += chipScore;//注區分數增加
        this.gameData.betInfo.BetAreaData[betId].BetCredit += chipScore;//注區總分更新
        poolBetChip.getComponent(SetChipID).playerID = playerId;
        betChipHeight = betChip.getComponent(UITransform).height;
        betChipWidth = betChip.getComponent(UITransform).width;
        movePos = new Vec3(betChipWidth / 2 - Math.random() * betChipWidth, betChipHeight / 2 - Math.random() * betChipHeight, 0);
        tween(poolBetChip).to(0.3, { position: movePos }, { easing: 'sineOut' })
            .call(() => {
                if (playerId === 0) {
                    this.gameData.userInfo.BetAreaCredit[betId] += chipScore;//本地玩家該下注區總分數
                    this.gameUI.betInfo.children[betId].getChildByName('BetScore').getComponent(Label).string = UtilsKitS.NumDigits(this.gameData.userInfo.BetAreaCredit[betId]);
                }
                else {
                    poolBetChip.children[0].getComponent(Label).string = UtilsKitS.NumDigits(chipScore);
                }
                this.gameUI.updataUIScore(); //更新介面分數
                this.chipScale(poolBetChip);//籌碼縮放動態
            }).start();
    }

    //更新注區資訊(下注區,下注人,下注分數)
    // public updataBetInfo(betId: number, playerId: number, score: number) {
    //     if (playerId === 0) {
    //         this.gameData.userInfo.BetAreaCredit[betId] += score;//本地該下注區總分增加
    //         this.gameData.userInfo.Credit -= score;
    //         this.gameUI.comBtnBet.getComponent(Animation).play();
    //     }
    //     this.gameData.betInfo.BetAreaData[betId].BetCredit += score;//注區總分更新
    //     this.gameUI.updataUIScore(); //更新介面分數
    // }

    //籌縮放動態
    private chipScale(chip: Node) {
        tween(chip).to(0.03, { scale: new Vec3(1.05, 1.05, 1) })
            .then(tween(chip).to(0.15, { scale: new Vec3(1, 1, 1) }))
            .start();
    }

    //回收籌碼(失敗注區id)
    public recycleChip(betId: number) {
        //回收籌碼到莊家位置並清除
        for (let i = 0; i < 2; i++) {
            const betChip = this.gameUI.chipDispatcher.children[i].children[betId];//下注區節點
            const savePos = betChip.getPosition();
            const movePos = this.gameUI.chipDispatcher.getChildByName('BankerPos').getWorldPosition().subtract(betChip.getWorldPosition()).add(savePos);
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
            const betChip = this.gameUI.chipDispatcher.children[i].children[betId];//下注區節點
            if (betChip.children.length > 0) {
                let payNode = new Node();
                //生成籌碼
                for (let j = 0; j < multiply; j++) {
                    for (let k = 0; k < betChip.children.length; k++) {
                        poolBetChip = this.pool.get(i === 0 ? this.betChipBlack : this.betChipColor);
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
                payNode.position = this.gameUI.chipDispatcher.getChildByName('BankerPos').getWorldPosition().subtract(betChip.getWorldPosition());
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
            const betChip = this.gameUI.chipDispatcher.children[i].children[betId];
            for (let j = 0; j < betChip.children.length; j++) {
                let chip = betChip.children[j];
                const chipPlayerID = chip.getComponent(SetChipID).playerID;
                const movePos = this.gameUI.playerPos.children[chipPlayerID].getWorldPosition().subtract(betChip.getWorldPosition());
                tween(chip).to(0.5, { position: movePos }, { easing: 'sineOut' }).call(() => {
                    this.pool.put(chip);
                }).start();
            }
        }
    }

    //提示訊息顯示
    public async showTipMessage(tx: string, colorID: number) {
        const tip = this.pool.get(this.tipPrefab);
        tip.parent = this.gameUI.tipMessage;
        switch (colorID) {
            case 0:
                tip.children[0].getComponent(Label).color = new Color(220, 220, 220, 255);
                break;
            case 1:
                tip.children[0].getComponent(Label).color = new Color(255, 255, 0, 255);
                break;
        }
        tip.children[0].getComponent(Label).string = tx;
        await UtilsKitS.Delay(1);
        this.pool.put(tip);
    }
}