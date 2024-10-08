import { _decorator, Component, Node, tween, Vec3, Label, Sprite, Animation, UITransform, Button, Color } from 'cc';
import { CGGameManager } from './CGGameManager';
import PoolHandler from '../../../../common/script/tools/PoolHandler';
import { UtilsKitS } from '../../../../common/script/lib/UtilsKitS';
import { SetChipID } from '../ui/SetChipID';
const { ccclass, property } = _decorator;

enum RebetState {
    Init,
    OnceBet,
    AutoBet
}

@ccclass('CGChipController')
export class CGChipController extends Component {
    @property({ type: Node, tooltip: "籌碼派發層" })
    public chipDispatcher: Node = null;

    private GM: CGGameManager = null;
    private pool: PoolHandler = new PoolHandler;

    private rebetSave: number[][] = Array(6).fill(null).map(() => []);;//上局本地玩家續押資料[下注區][籌碼ID]
    private rebetCredit: number = 0;//續押金額
    public rebetState: RebetState = RebetState.Init;

    public init(GM: CGGameManager) {
        this.GM = GM;
        this.initializeChipPool();//預先生成pool
        this.GM.View.rebetCreditLable.string = '0';
    }

    //預先生成pool
    private initializeChipPool() {
        const tempPool = [];
        for (let i = 0; i < 300; i++) {
            tempPool.push(this.pool.get(this.GM.betChipBlack));
            if (i > 100) {
                tempPool.push(this.pool.get(this.GM.betChipColor));
            }
        }
        tempPool.forEach(chip => this.pool.put(chip));
    }

    //生成籌碼到注區(注區id，下注人，籌碼分ID，是否為續押)
    public createChipToBetArea(betId: number, playerId: number, chipID: number, rebet: boolean) {
        const View = this.GM.View;
        const Model = this.GM.Model;
        let betChip: Node;
        let betChipHeight: number;
        let betChipWidth: number;
        let poolBetChip: Node;//生成的籌碼
        let movePos: Vec3;//籌碼移動位置
        let chipCredit = Model.loadInfo.chipRange[chipID];
        if (playerId === 0) {
            if (Model.loadInfo.betTotalCredit + chipCredit > Model.loadInfo.limit) {
                View.showTipMessage("投注超過限額");
                return;
            }
            if (Model.loadInfo.credit < chipCredit) {
                View.showTipMessage("餘額不足");
                for (let i = 0; i < 3; i++) {
                    View.updateBetCallUI(i, false);//取消跟注
                }
                return;
            }
            View.btnRebet.getComponent(Button).interactable = false;
            betChip = this.chipDispatcher.getChildByName('MainPlayer').children[betId];//下注區節點
            poolBetChip = this.pool.get(this.GM.betChipColor);
            poolBetChip.getComponent(Sprite).spriteFrame = this.GM.chipSF[chipID];//設置籌碼貼圖
            poolBetChip.getComponent(SetChipID).chipID = chipID;
            console.log("籌碼額度", chipCredit)
            poolBetChip.children[0].getComponent(Label).string = UtilsKitS.NumDigits(chipCredit);//設置籌碼額度
            poolBetChip.parent = betChip;
            Model.loadInfo.betTotalCredit += chipCredit;//本地下注總分增加

            Model.loadInfo.credit -= chipCredit;
            //*****注意續押的籌碼編號可能會跟選擇區的籌碼不同，如果執行續押，籌碼會從玩家頭像下注 */
            if (rebet)
                poolBetChip.position = View.playerPos.children[0].getWorldPosition().subtract(betChip.worldPosition);
            else
                poolBetChip.position = this.GM.ChipSet.touchChip.children[this.GM.ChipSet.chipSetID.indexOf(chipID)].getWorldPosition().subtract(betChip.worldPosition);

            this.rebetCredit = Model.loadInfo.betTotalCredit;
            View.rebetCreditLable.string = UtilsKitS.NumDigits(this.rebetCredit);//續押額度更新
            View.comBtnBet.getComponent(Animation).play();
        } else {
            betChip = this.chipDispatcher.getChildByName('OtherPlayer').children[betId];//下注區節點
            View.playerPos.children[playerId].getComponent(Animation).play();//頭像移動
            poolBetChip = this.pool.get(this.GM.betChipBlack);
            poolBetChip.parent = betChip;
            poolBetChip.position = View.playerPos.children[playerId].getWorldPosition().subtract(betChip.worldPosition);
        }
        // Model.betInfo.BetAreaData[betId].BetCredit += chipCredit;//注區額度增加
        Model.betInfo.betAreaTotalCredit[betId] += chipCredit;//各注區總分更新
        poolBetChip.getComponent(SetChipID).playerID = playerId;
        betChipHeight = betChip.getComponent(UITransform).height;
        betChipWidth = betChip.getComponent(UITransform).width;
        movePos = new Vec3(betChipWidth / 2 - Math.random() * betChipWidth, betChipHeight / 2 - Math.random() * betChipHeight, 0);
        tween(poolBetChip).to(0.3, { position: movePos }, { easing: 'sineOut' })
            .call(() => {
                if (playerId === 0) {
                    Model.loadInfo.betAreaCredit[betId] += chipCredit;//本地玩家該下注區總額度
                    View.betInfo.children[betId].getChildByName('BetCredit').getComponent(Label).string = UtilsKitS.NumDigits(Model.loadInfo.betAreaCredit[betId]);
                }
                else {
                    poolBetChip.children[0].getComponent(Label).string = UtilsKitS.NumDigits(chipCredit);
                }
                View.updateUICredit(); //更新介面額度
                this.chipScale(poolBetChip);//籌碼縮放動態
            }).start();
    }

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
    public async createPayChipToBetArea(betId: number, multiply: number) {
        let poolBetChip: Node;//生成的籌碼
        for (let i = 0; i < 2; i++) {
            const betChip = this.chipDispatcher.children[i].children[betId];//下注區節點
            if (betChip.children.length > 0) {
                let payNode = new Node();
                //生成籌碼
                for (let j = 0; j < multiply; j++) {
                    for (let k = 0; k < betChip.children.length; k++) {
                        poolBetChip = this.pool.get(i === 0 ? this.GM.betChipBlack : this.GM.betChipColor);
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
                const movePos = this.GM.View.playerPos.children[chipPlayerID].getWorldPosition().subtract(betChip.getWorldPosition());
                tween(chip).to(0.5, { position: movePos }, { easing: 'sineOut' }).call(() => {
                    this.pool.put(chip);
                }).start();
            }
        }
    }

    //更新寫入續押資料
    public updateRebetData() {
        const betTotalCredit = this.GM.Model.loadInfo.betTotalCredit;
        if (betTotalCredit <= 0)
            return;
        this.rebetSave = [[], [], [], [], [], []];//清空後重新記錄籌碼
        for (let i = 0; i < this.rebetSave.length; i++) {
            for (let chip of this.chipDispatcher.getChildByName('MainPlayer').children[i].children) {
                this.rebetSave[i].push(chip.getComponent(SetChipID).chipID);//添加籌碼id到續押資料內
            }
        }
        this.rebetCredit = betTotalCredit;
        this.GM.View.rebetCreditLable.string = UtilsKitS.NumDigits(this.rebetCredit);
    }

    //設置續押狀態
    public setRebet(event: Event, state: RebetState) {
        const View = this.GM.View;
        switch (state) {
            case RebetState.Init://未續押狀態
                this.rebetState = state;
                View.btnRebet.active = true;
                View.btnAuto.active = false;
                View.btnAutoStop.active = false;
                break;
            case RebetState.OnceBet://單次續押狀態
                this.rebetState = state;
                if (View.btnRebet.active)
                    this.runRebet();
                else {
                    View.showTipMessage("停止自動續押");
                    View.btnAuto.active = true;
                    View.btnAutoStop.active = false;
                }
                break;
            case RebetState.AutoBet://自動續押狀態
                View.showTipMessage("啟用自動續押", new Color(255, 255, 0, 255));
                this.rebetState = state;
                View.btnRebet.active = false;
                View.btnAuto.active = false;
                View.btnAutoStop.active = true;
                break;
        }
    }

    //判斷是否非自動模式，續押按鈕是否啟用
    public isNotAutoBet() {
        if (this.rebetState !== RebetState.AutoBet)
            return true;
        else
            return false;
        // View.btnRebet.getComponent(Button).interactable = true;//續押按鈕啟用
    }

    //判斷是否執行續押
    public testRebet() {
        if (this.rebetState === RebetState.OnceBet)
            this.setRebet(null, RebetState.Init);//初始化
        else if (this.rebetState === RebetState.AutoBet)
            this.runRebet();//執行續押
    }

    //執行續押
    public runRebet() {
        const View = this.GM.View;
        if (this.rebetCredit <= 0) {
            this.setRebet(null, RebetState.Init);
            View.showTipMessage("請先投注");
            return;
        }
        if (this.GM.Model.loadInfo.credit < this.rebetCredit) {
            this.setRebet(null, RebetState.Init);
            View.showTipMessage("額度不足無法續押");
            return;
        }
        View.showTipMessage("續押:" + this.rebetCredit.toString());
        if (this.rebetState !== RebetState.AutoBet) {
            View.btnRebet.active = false;
            View.btnAuto.active = true;
            View.btnAutoStop.active = false;
        }
        for (let i = 0; i < this.rebetSave.length; i++) {
            for (let j of this.rebetSave[i]) {
                this.createChipToBetArea(i, 0, j, true);//籌碼派發
            }
        }
    }
}