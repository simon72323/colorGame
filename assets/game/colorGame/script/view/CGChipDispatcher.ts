import { _decorator, Component, Node, tween, Vec3, Label, Sprite, Animation, UITransform, Button, Color, Prefab, SpriteFrame, EventHandler, instantiate } from 'cc';
import { CGController } from '../controller/CGController';
import PoolHandler from '../tools/PoolHandler';
import { CGUtils } from '../tools/CGUtils';
import { CGChipID } from './prefab/CGChipID';
const { ccclass, property } = _decorator;

enum RebetState {
    Init,
    OnceBet,
    AutoBet
}

@ccclass('CGChipDispatcher')
export class CGChipDispatcher extends Component {
    @property({ type: Node, tooltip: "籌碼派發層" })
    public chipDispatcher: Node = null;
    @property({ type: Node, tooltip: "提示訊息顯示層" })
    public tipMessage: Node = null;
    @property({ type: [Node], tooltip: "跟注按鈕(3顆)" })
    public btnCall: Node[] = [];
    @property({ type: [Node], tooltip: "取消跟注按鈕(3顆)" })
    public btnStopCall: Node[] = [];
    @property({ type: [Node], tooltip: "跟注特效" })
    public callFx: Node[] = [];
    @property({ type: Node, tooltip: "續押按鈕", group: { name: '注區相關', id: '3' } })
    public btnRebet: Node = null;
    @property({ type: Node, tooltip: "自動投注按鈕", group: { name: '注區相關', id: '3' } })
    public btnAuto: Node = null;
    @property({ type: Node, tooltip: "停止自動投注按鈕", group: { name: '注區相關', id: '3' } })
    public btnAutoStop: Node = null;
    @property({ type: Label, tooltip: "續押額度", group: { name: '注區相關', id: '3' } })
    public rebetCreditLable: Label = null;

    @property({ type: [SpriteFrame], tooltip: "下注籌碼貼圖" })
    public chipSF: SpriteFrame[] = [];
    @property({ type: Prefab, tooltip: "其他玩家下注籌碼" })
    public betChipBlack: Prefab = null;
    @property({ type: Prefab, tooltip: "本地玩家下注籌碼" })
    public betChipColor: Prefab = null;
    @property({ type: Prefab, tooltip: "提示訊息" })
    public tipPrefab: Prefab = null;

    private controller: CGController = null;


    private rebetSave: number[][] = Array(6).fill(null).map(() => []);;//上局本地玩家續押資料[下注區][籌碼ID]
    private rebetCredit: number = 0;//續押金額
    public rebetState: RebetState = RebetState.Init;

    private pool: PoolHandler = null;

    public init(controller: CGController) {
        this.controller = controller;
    }

    protected onLoad(): void {
        const scriptName = this.name.match(/<(.+)>/)?.[1] || '';
        //btnCall按鈕觸發事件設置
        for (let i = 0; i < this.btnCall.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'btnCallDown';
            eventHandler.customEventData = i.toString();
            this.btnCall[i].getComponent(Button).clickEvents.push(eventHandler);
        }
        //btnStopCall按鈕觸發事件設置
        for (let i = 0; i < this.btnStopCall.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'btnStopCallDown';
            eventHandler.customEventData = i.toString();
            this.btnStopCall[i].getComponent(Button).clickEvents.push(eventHandler);
        }
    }

    //跟注按鈕按下
    public btnCallDown(event: Event, customEventData: string) {
        const id = parseInt(customEventData);
        // 例如：更新遊戲狀態，發送網路請求等
        this.updateBetCallUI(id, true);//啟用跟注
    }

    //取消跟注按鈕按下
    public btnStopCallDown(event: Event, customEventData: string) {
        const id = parseInt(customEventData);
        // 例如：更新遊戲狀態，發送網路請求等
        this.updateBetCallUI(id, false);//停用跟注
    }

    //更新跟注介面
    public updateBetCallUI(id: number, isActive: boolean) {
        this.btnCall[id].active = !isActive;
        this.btnStopCall[id].active = isActive;
        this.callFx[id].active = isActive;
    }

    //預先生成pool
    private initializeChipPool() {
        const tempPool = [];
        for (let i = 0; i < 300; i++) {
            tempPool.push(this.pool.get(this.betChipBlack));
            if (i > 100) {
                tempPool.push(this.pool.get(this.betChipColor));
            }
        }
        tempPool.forEach(chip => this.pool.put(chip));
    }

    /**
     * 本地用戶下注
     * @param betID 注區ID
     * @param chipID 籌碼ID
     */
    //本地用戶下注
    public betLocally(betID: number, chipID: number) {
        const view = this.controller.view;
        const model = this.controller.model;
        let betChip: Node;
        let betChipHeight: number;
        let betChipWidth: number;
        let poolBetChip: Node;//生成的籌碼
        let movePos: Vec3;//籌碼移動位置
        let chipCredit = model.chipRange[chipID];

        if (model.userTotalBet + chipCredit > model.limit) {
            this.showTipMessage("投注超過限額");
            return;
        }
        if (model.credit < chipCredit) {
            this.showTipMessage("餘額不足");
            for (let i = 0; i < 3; i++) {
                this.updateBetCallUI(i, false);//取消跟注
            }
            return;
        }
        this.btnRebet.getComponent(Button).interactable = false;
        betChip = this.chipDispatcher.getChildByName('MainPlayer').children[betId];//下注區節點
        poolBetChip = this.pool.get(this.betChipColor);
        poolBetChip.getComponent(Sprite).spriteFrame = this.chipSF[chipID];//設置籌碼貼圖
        poolBetChip.getComponent(CGChipID).chipID = chipID;
        console.log("籌碼額度", chipCredit)
        poolBetChip.children[0].getComponent(Label).string = CGUtils.NumDigits(chipCredit);//設置籌碼額度
        poolBetChip.parent = betChip;
        model.userTotalBet += chipCredit;//本地下注總分增加

        model.credit -= chipCredit;
        //*****注意續押的籌碼編號可能會跟選擇區的籌碼不同，如果執行續押，籌碼會從玩家頭像下注 */
        if (rebet)
            poolBetChip.position = view.playerPos.children[0].getWorldPosition().subtract(betChip.worldPosition);
        else
            poolBetChip.position = this.controller.chipSetView.touchChip.children[this.controller.chipSetView.chipSetID.indexOf(chipID)].getWorldPosition().subtract(betChip.worldPosition);

        this.rebetCredit = model.userTotalBet;
        this.rebetCreditLable.string = CGUtils.NumDigits(this.rebetCredit);//續押額度更新
        view.comBtnBet.getComponent(Animation).play();
        // model.betInfo.BetAreaData[betId].BetCredit += chipCredit;//注區額度增加
        model.totalBets[betID] += chipCredit;//各注區總分更新
        betChipHeight = betChip.getComponent(UITransform).height;
        betChipWidth = betChip.getComponent(UITransform).width;
        movePos = new Vec3(betChipWidth / 2 - Math.random() * betChipWidth, betChipHeight / 2 - Math.random() * betChipHeight, 0);
        tween(poolBetChip).to(0.3, { position: movePos }, { easing: 'sineOut' })
            .call(() => {
                model.userBets[betID] += chipCredit;//本地玩家該下注區總額度
                view.betInfo.children[betID].getChildByName('BetCredit').getComponent(Label).string = CGUtils.NumDigits(model.userBets[betId]);

                view.updateUICredit(); //更新介面額度
                this.chipScale(poolBetChip);//籌碼縮放動態
            }).start();
    }

    //生成籌碼到注區(注區id，下注人，籌碼分ID，是否為續押)
    public createChipToBetArea(betId: number, playerId: number, chipID: number, rebet: boolean) {
        const view = this.controller.view;
        const model = this.controller.model;
        let betChip: Node;
        let betChipHeight: number;
        let betChipWidth: number;
        let poolBetChip: Node;//生成的籌碼
        let movePos: Vec3;//籌碼移動位置
        let chipCredit = model.chipRange[chipID];
        if (playerId === 0) {
            if (model.userTotalBet + chipCredit > model.limit) {
                this.showTipMessage("投注超過限額");
                return;
            }
            if (model.credit < chipCredit) {
                this.showTipMessage("餘額不足");
                for (let i = 0; i < 3; i++) {
                    this.updateBetCallUI(i, false);//取消跟注
                }
                return;
            }
            this.btnRebet.getComponent(Button).interactable = false;
            betChip = this.chipDispatcher.getChildByName('MainPlayer').children[betId];//下注區節點
            poolBetChip = this.pool.get(this.betChipColor);
            poolBetChip.getComponent(Sprite).spriteFrame = this.chipSF[chipID];//設置籌碼貼圖
            poolBetChip.getComponent(CGChipID).chipID = chipID;
            console.log("籌碼額度", chipCredit)
            poolBetChip.children[0].getComponent(Label).string = CGUtils.NumDigits(chipCredit);//設置籌碼額度
            poolBetChip.parent = betChip;
            model.userTotalBet += chipCredit;//本地下注總分增加

            model.credit -= chipCredit;
            //*****注意續押的籌碼編號可能會跟選擇區的籌碼不同，如果執行續押，籌碼會從玩家頭像下注 */
            if (rebet)
                poolBetChip.position = view.playerPos.children[0].getWorldPosition().subtract(betChip.worldPosition);
            else
                poolBetChip.position = this.controller.chipSetView.touchChip.children[this.controller.chipSetView.chipSetID.indexOf(chipID)].getWorldPosition().subtract(betChip.worldPosition);

            this.rebetCredit = model.userTotalBet;
            this.rebetCreditLable.string = CGUtils.NumDigits(this.rebetCredit);//續押額度更新
            view.comBtnBet.getComponent(Animation).play();
        } else {
            betChip = this.chipDispatcher.getChildByName('OtherPlayer').children[betId];//下注區節點
            view.playerPos.children[playerId].getComponent(Animation).play();//頭像移動
            poolBetChip = this.pool.get(this.betChipBlack);
            poolBetChip.parent = betChip;
            poolBetChip.position = view.playerPos.children[playerId].getWorldPosition().subtract(betChip.worldPosition);
        }
        // model.betInfo.BetAreaData[betId].BetCredit += chipCredit;//注區額度增加
        model.totalBets[betId] += chipCredit;//各注區總分更新
        // poolBetChip.getComponent(CGChipID).playerID = playerId;
        betChipHeight = betChip.getComponent(UITransform).height;
        betChipWidth = betChip.getComponent(UITransform).width;
        movePos = new Vec3(betChipWidth / 2 - Math.random() * betChipWidth, betChipHeight / 2 - Math.random() * betChipHeight, 0);
        tween(poolBetChip).to(0.3, { position: movePos }, { easing: 'sineOut' })
            .call(() => {
                if (playerId === 0) {
                    model.userBets[betId] += chipCredit;//本地玩家該下注區總額度
                    view.betInfo.children[betId].getChildByName('BetCredit').getComponent(Label).string = CGUtils.NumDigits(model.userBets[betId]);
                }
                else {
                    poolBetChip.children[0].getComponent(Label).string = CGUtils.NumDigits(chipCredit);
                }
                view.updateUICredit(); //更新介面額度
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
        //0=其他玩家，1=本地玩家
        for (let i = 0; i < 2; i++) {
            const betChip = this.chipDispatcher.children[i].children[betId];//下注區節點
            if (betChip.children.length > 0) {
                let payNode = new Node();
                //生成籌碼
                for (let j = 0; j < multiply; j++) {
                    for (let k = 0; k < betChip.children.length; k++) {
                        poolBetChip = this.pool.get(i === 0 ? this.betChipBlack : this.betChipColor);
                        poolBetChip.parent = payNode;
                        poolBetChip.getComponent(Sprite).spriteFrame = betChip.children[k].getComponent(Sprite).spriteFrame;
                        // poolBetChip.getComponent(CGSetChipID).playerID = betChip.children[k].getComponent(CGSetChipID).playerID;
                        poolBetChip.getComponent(CGChipID).chipID = betChip.children[k].getComponent(CGChipID).chipID;
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
                    await CGUtils.Delay(0.4);
                    tween(payNode).to(0.5, { position: movePos }, { easing: 'sineOut' }).call(async () => {
                        while (payNode.children.length > 0) {
                            const child = payNode.children[0];
                            child.parent = betChip;
                        }
                        payNode.destroy();
                        this.chipScale(betChip);//籌碼縮放動態
                        await CGUtils.Delay(0.4);
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
            for (let j = 0; j < betChip.children.length; j++) {//判斷籌碼數量
                let chip = betChip.children[j];
                // const chipPlayerID = chip.getComponent(CGSetChipID).playerID;
                const movePos = this.controller.view.playerPos.children[chipPlayerID].getWorldPosition().subtract(betChip.getWorldPosition());
                tween(chip).to(0.5, { position: movePos }, { easing: 'sineOut' }).call(() => {
                    this.pool.put(chip);
                }).start();
            }
        }
    }

    //更新寫入續押資料
    public updateRebetData() {
        const userTotalBet = this.controller.model.userTotalBet;
        if (userTotalBet <= 0)
            return;
        this.rebetSave = [[], [], [], [], [], []];//清空後重新記錄籌碼
        for (let i = 0; i < this.rebetSave.length; i++) {
            for (let chip of this.chipDispatcher.getChildByName('MainPlayer').children[i].children) {
                // this.rebetSave[i].push(chip.getComponent(CGSetChipID).chipID);//添加籌碼id到續押資料內
            }
        }
        this.rebetCredit = userTotalBet;
        this.rebetCreditLable.string = CGUtils.NumDigits(this.rebetCredit);
    }

    //設置續押狀態
    public setRebet(event: Event, state: RebetState) {
        const btnRebet = this.btnRebet;
        const btnAuto = this.btnAuto;
        const btnAutoStop = this.btnAutoStop;
        switch (state) {
            case RebetState.Init://未續押狀態
                this.rebetState = state;
                btnRebet.active = true;
                btnAuto.active = false;
                btnAutoStop.active = false;
                break;
            case RebetState.OnceBet://單次續押狀態
                this.rebetState = state;
                if (this.btnRebet.active)
                    this.runRebet();
                else {
                    this.showTipMessage("停止自動續押");
                    btnAuto.active = true;
                    btnAutoStop.active = false;
                }
                break;
            case RebetState.AutoBet://自動續押狀態
                this.showTipMessage("啟用自動續押", new Color(255, 255, 0, 255));
                this.rebetState = state;
                btnRebet.active = false;
                btnAuto.active = false;
                btnAutoStop.active = true;
                break;
        }
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
        if (this.rebetCredit <= 0) {
            this.setRebet(null, RebetState.Init);
            this.showTipMessage("請先投注");
            return;
        }
        if (this.controller.model.credit < this.rebetCredit) {
            this.setRebet(null, RebetState.Init);
            this.showTipMessage("額度不足無法續押");
            return;
        }
        this.showTipMessage("續押:" + this.rebetCredit.toString());
        if (this.rebetState !== RebetState.AutoBet) {
            this.btnRebet.active = false;
            this.btnAuto.active = true;
            this.btnAutoStop.active = false;
        }
        for (let i = 0; i < this.rebetSave.length; i++) {
            for (let j of this.rebetSave[i]) {
                this.createChipToBetArea(i, 0, j, true);//籌碼派發
            }
        }
    }

    //提示訊息顯示
    public async showTipMessage(tx: string, setColor?: Color) {
        const instTip = instantiate(this.tipPrefab);
        const tipLabel = instTip.children[0].getComponent(Label);
        instTip.parent = this.tipMessage;
        tipLabel.color = setColor ?? new Color(220, 220, 220, 255);
        tipLabel.string = tx;
        await CGUtils.Delay(1);
        instTip.destroy();
    }
}