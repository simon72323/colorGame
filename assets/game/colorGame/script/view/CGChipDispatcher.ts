import { _decorator, Component, Node, tween, Vec3, Label, Sprite, UITransform, Button, Color, Prefab, SpriteFrame, EventHandler, instantiate } from 'cc';
import PoolHandler from '../tools/PoolHandler';
import { CGUtils } from '../tools/CGUtils';
import { CGDataService } from '../manager/CGDataService';
const { ccclass, property } = _decorator;

interface ChipNode extends Node {
    ChipID: number;
    UserPosID: number;
}

enum ReBetState {
    Init = "init",
    OnceBet = "onceBet",
    AutoBet = "autoBet"
}

@ccclass('CGChipDispatcher')
export class CGChipDispatcher extends Component {
    @property(Node)
    public chipDispatcher!: Node;//籌碼派發層
    @property(Node)
    public tipMessage!: Node;//提示訊息顯示層
    @property([Node])
    public btnCall!: Node[];//跟注按鈕(3顆)
    @property([Node])
    public btnStopCall!: Node[];//取消跟注按鈕(3顆)
    @property([Node])
    public callFx!: Node[];//跟注特效
    @property(Node)
    public btnReBet!: Node;//續押按鈕
    @property(Node)
    public btnAuto!: Node;//自動投注按鈕
    @property(Node)
    public btnAutoStop!: Node;//停止自動投注按鈕
    @property(Label)
    public reBetCreditLable!: Label;//續押額度
    @property(Node)
    public betTopBtns!: Node;//下注按鈕區
    @property(Node)//用戶位置
    public userPos!: Node;
    @property([SpriteFrame])
    public chipSF: SpriteFrame[] = [];//下注籌碼貼圖
    @property(Prefab)
    public betChipBlack: Prefab = null;//其他用戶下注籌碼
    @property(Prefab)
    public betChipColor: Prefab = null;//本地用戶下注籌碼
    @property(Prefab)
    public tipPrefab: Prefab = null;//提示訊息

    //本地續押資料
    private reBetSave: number[][] = Array(6).fill(null).map(() => []);;//上局本地用戶續押資料[下注區][籌碼ID]
    private reBetBetAreaCredits: number[] = Array(6).fill(0);//暫存續押的各區下注額
    private reBetCredit: number = 0;//續押金額
    public reBetState: ReBetState = ReBetState.Init;

    //本地暫存資料
    public tempBetCredits: number[] = Array(6).fill(0);//暫存的各區下注額
    private tempBetCredit: number = 0;//暫存下注金額
    private tempBetChip: Node[] = [];//暫存的下注籌碼
    private tempBetData: number[][] = [];//[下注區][籌碼ID]

    private pool: PoolHandler = null;
    private dataService: CGDataService;//數據服務

    /**
     * 設置按鈕事件監聽器
     */
    protected onLoad(): void {
        this.dataService = CGDataService.getInstance();//實例化數據服務;
        for (let i = 0; i < this.btnCall.length; i++) {
            this.bindButtonEvent(this.btnCall[i], 'btnCallDown', i.toString());//跟注按鈕事件
        }
        for (let i = 0; i < this.btnStopCall.length; i++) {
            this.bindButtonEvent(this.btnStopCall[i], 'btnStopCallDown', i.toString());//停止跟注按鈕事件件
        }
        this.bindButtonEvent(this.betTopBtns.getChildByName('btnUndo'), 'betUndo');//返回上一步按鈕事件
        this.bindButtonEvent(this.betTopBtns.getChildByName('btnCancel'), 'resetBetBtns');//取消下注按鈕事件

        this.pool = PoolHandler.getInstance();//獲得pool池實例
        this.initializeChipPool();//預先生成pool
    }

    /**
     * 按鈕事件設置
     * @param touchNode 觸發節點 
     * @param handler 函數名稱
     * @param customData 自定義事件數據?
     */
    private bindButtonEvent(touchNode: Node, handler: string, customData?: string) {
        const componentName = this.name.match(/<(.+)>/)?.[1] || '';
        CGUtils.bindButtonEvent(this.node, componentName, touchNode, handler, customData);
    }

    /**
     * 預先生成pool
     */
    private initializeChipPool() {
        const tempPool: Node[] = [];
        for (let i = 0; i < 300; i++) {
            tempPool.push(this.pool.get(this.betChipBlack));
            if (i > 100) {
                tempPool.push(this.pool.get(this.betChipColor));
            }
        }
        tempPool.forEach(chip => this.pool.put(chip));
    }

    /**
     * 跟注按鈕按下
     */
    private btnCallDown(event: Event, customEventData: string) {
        const id = parseInt(customEventData);
        this.updateBetCallUI(id, true);//啟用跟注
    }

    /**
     * 取消跟注按鈕按下
     */
    private btnStopCallDown(event: Event, customEventData: string) {
        const id = parseInt(customEventData);
        this.updateBetCallUI(id, false);//停用跟注
    }

    /**
     * 更新跟注介面
     */
    private updateBetCallUI(id: number, isActive: boolean) {
        this.btnCall[id].active = !isActive;
        this.btnStopCall[id].active = isActive;
        this.callFx[id].active = isActive;
    }

    /**
     * 返回上一步按下
     */
    private betUndo() {
        this.tempBetChip.pop();// 刪除最後一個資料
        this.tempBetData.pop();// 刪除最後一個資料
        if (this.tempBetChip.length === 0)
            this.resetBetBtns();
    }

    /**
     * 初始化暫存下注資料
     */
    private resetBetBtns() {
        this.tempBetCredit = 0;
        this.tempBetCredits = Array(6).fill(0);//清空
        this.setTempBetInfo();
        this.tempBetData = [];//清空
        for (let chip of this.tempBetChip) {
            this.pool.put(chip);//退還所有
        }
        this.betTopBtns.active = false;//隱藏下注按鈕介面
    }

    /**
     * 新下注成功，隱藏下注介面
     * @param betTotal 總下注額
     */
    public newBetSuccessful(betTotal: number) {
        this.betTopBtns.active = false;//隱藏下注按鈕介面
        this.reBetCredit = betTotal;
        this.reBetCreditLable.string = CGUtils.NumDigits(this.reBetCredit);//續押額度更新
    }

    /**
     * 新下注失敗，清空籌碼與介面，並彈出下注失敗提示
     * @param error 錯誤訊息
     */
    public newBetError(error: string) {
        this.resetBetBtns();
        this.showTipMessage(error, new Color(255, 0, 0, 255));
    }

    /**
     * 續押下注成功，表演籌碼移動下注
     * @param betTotal 總下注額
     */
    public reBetSuccessful(betTotal: number) {
        this.reBetCredit = betTotal;
        this.reBetCreditLable.string = CGUtils.NumDigits(this.reBetCredit);//續押額度更新
        this.showTipMessage("續押:" + this.reBetCredit.toString());
        if (this.reBetState !== ReBetState.AutoBet) {
            this.btnReBet.active = false;
            this.btnAuto.active = true;
            this.btnAutoStop.active = false;
        }
        for (let i = 0; i < this.reBetSave.length; i++) {
            for (let j of this.reBetSave[i]) {
                this.reBetChip(i, j);// 籌碼派發
            }
        }
    }

    /**
     * 續押下注失敗
     * @param error 錯誤訊息
     */
    public reBetError(error: string) {
        this.setReBet(ReBetState.Init);//初始化續押狀態
        this.showTipMessage(error, new Color(255, 0, 0, 255));
    }

    /**
     * 暫存下注額度更新
     */
    private setTempBetInfo() {
        this.betTopBtns.getChildByName('BetInfo').getChildByName('Label').getComponent(Label).string = '下注: ' + CGUtils.NumDigits(this.tempBetCredit);
    }

    /**
     * 本地用戶下注(只做暫存，不會更新下注分數)
     * @param betID 注區ID
     * @param chipID 下注的籌碼ID
     * @param startPos 籌碼起點世界座標位置
     * @controller
     */
    public betChip(betID: number, chipID: number, startPos: Vec3) {
        this.btnReBet.getComponent(Button).interactable = false;//禁用續押
        const chipCredit = this.dataService.betCreditList[chipID];//籌碼額度
        //更新暫存資料
        if (this.tempBetCredit === 0)
            this.betTopBtns.active = true;//顯示投注區操作按鈕
        this.tempBetCredit += chipCredit;
        this.setTempBetInfo();
        this.tempBetCredits[betID] += chipCredit;
        const poolBetChip = this.pool.get(this.betChipColor) as ChipNode;
        poolBetChip.getComponent(Sprite).spriteFrame = this.chipSF[chipID];//設置籌碼貼圖
        poolBetChip.ChipID = chipID;
        poolBetChip.UserPosID = 0;//本地用戶排名為0
        poolBetChip.children[0].getComponent(Label).string = CGUtils.NumDigits(chipCredit);//設置籌碼額度
        const betPos = this.chipDispatcher.getChildByName('MainUser').children[betID];//下注區節點
        poolBetChip.parent = betPos;
        poolBetChip.position = startPos.subtract(betPos.worldPosition);
        this.chipMove(betPos, poolBetChip);
    }

    /**
     * 本地用戶續押下注
     * @param betID 注區ID
     * @param chipID 下注的籌碼ID
     */
    private reBetChip(betID: number, chipID: number) {
        this.btnReBet.getComponent(Button).interactable = false;//禁用續押
        const chipCredit = this.dataService.betCreditList[chipID];//籌碼額度
        const poolBetChip = this.pool.get(this.betChipColor) as ChipNode;
        poolBetChip.getComponent(Sprite).spriteFrame = this.chipSF[chipID];//設置籌碼貼圖
        poolBetChip.ChipID = chipID;
        poolBetChip.UserPosID = 0;//本地用戶排名為0
        poolBetChip.children[0].getComponent(Label).string = CGUtils.NumDigits(chipCredit);//設置籌碼額度
        const betPos = this.chipDispatcher.getChildByName('MainUser').children[betID];//下注區節點
        poolBetChip.parent = betPos;
        poolBetChip.position = this.userPos.children[0].getWorldPosition().subtract(betPos.worldPosition);
        this.chipMove(betPos, poolBetChip);
    }

    /**
     * 其他用戶下注
     * @param betID 注區ID
     * @param rankID 該用戶的排名區域位置ID
     * @param chipCredit 下注的籌碼額度
     * @param startPos 籌碼起點世界座標位置
     * @controller
     */
    public otherUserBetChip(betID: number, rankID: number, chipCredit: number, startPos: Vec3) {
        const poolBetChip = this.pool.get(this.betChipBlack) as ChipNode;
        poolBetChip.ChipID = -1;//其他用戶id為-1
        poolBetChip.UserPosID = rankID;//用戶排名區域位置ID
        poolBetChip.children[0].getComponent(Label).string = CGUtils.NumDigits(chipCredit);//設置籌碼額度
        const betPos = this.chipDispatcher.getChildByName('OtherUser').children[betID];//下注區節點
        poolBetChip.parent = betPos;
        poolBetChip.position = startPos.subtract(betPos.worldPosition);
        this.chipMove(betPos, poolBetChip);
    }

    /**
     * 籌碼移動
     * @param betPos 目標下注位置
     * @param poolBetChip 移動的籌碼
     */
    private chipMove(betPos: Node, poolBetChip: Node) {
        const betChipHeight = betPos.getComponent(UITransform).height;
        const betChipWidth = betPos.getComponent(UITransform).width;
        const movePos = new Vec3(betChipWidth / 2 - Math.random() * betChipWidth, betChipHeight / 2 - Math.random() * betChipHeight, 0);//籌碼移動位置
        tween(poolBetChip).to(0.3, { position: movePos }, { easing: 'sineOut' })
            .call(() => {
                this.chipScale(poolBetChip);//籌碼縮放動態
            }).start();
    }

    /**
     * 籌縮放動態
     * @param chip 籌碼
     */
    private chipScale(chip: Node) {
        tween(chip).to(0.03, { scale: new Vec3(1.05, 1.05, 1) })
            .then(tween(chip).to(0.15, { scale: new Vec3(1, 1, 1) }))
            .start();
    }

    /**
     * 回收籌碼
     * @param betID 注區ID
     */
    public recycleChip(betID: number) {
        //回收籌碼到莊家位置並清除
        for (let i = 0; i < 2; i++) {
            const betPos = this.chipDispatcher.children[i].children[betID];//下注區節點
            const savePos = betPos.getPosition();
            const bankWorldPos = this.chipDispatcher.getChildByName('BankerPos').getWorldPosition();
            const movePos = bankWorldPos.subtract(betPos.getWorldPosition()).add(savePos);
            tween(betPos).to(0.5, { position: movePos }, { easing: 'sineOut' })
                .call(() => {
                    while (betPos.children.length > 0) {
                        this.pool.put(betPos.children[0]);//退還所有子節點
                    }
                    betPos.setPosition(savePos);//回到原位置
                }).start();
        }
    }

    /**
     * 生成派獎籌碼到注區
     * @param betID 注區ID
     * @param odds 倍率
     */
    public async createPayChipToBetArea(betID: number, odds: number) {
        //0=其他用戶，1=本地用戶
        for (let i = 0; i < 2; i++) {
            const betPos = this.chipDispatcher.children[i].children[betID];//下注區節點
            if (betPos.children.length > 0) {
                const payChip = new Node();
                //生成派獎籌碼(會根據倍率生成數量不同)
                for (let j = 0; j < odds; j++) {
                    for (let k = 0; k < betPos.children.length; k++) {
                        const poolBetChip = this.pool.get(i === 0 ? this.betChipBlack : this.betChipColor) as ChipNode;//生成新籌碼
                        poolBetChip.parent = payChip;
                        const referChip = betPos.children[k] as ChipNode;
                        poolBetChip.ChipID = referChip.ChipID;
                        poolBetChip.UserPosID = referChip.UserPosID;
                        poolBetChip.getComponent(Sprite).spriteFrame = referChip.getComponent(Sprite).spriteFrame;
                        poolBetChip.children[0].getComponent(Label).string = referChip.children[0].getComponent(Label).string;
                        const chipPos = referChip.position;
                        poolBetChip.setPosition(new Vec3(chipPos.x, chipPos.y + (j + 1) * (i === 0 ? 5 : 6), chipPos.z));//籌碼疊高
                    }
                }
                payChip.parent = betPos;
                const bankWorldPos = this.chipDispatcher.getChildByName('BankerPos').getWorldPosition();
                payChip.position = bankWorldPos.subtract(betPos.getWorldPosition());
                payChip.setScale(new Vec3(0, 0, 0));
                tween(payChip).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' }).call(async () => {
                    const movePos = new Vec3(0, 0, 0);
                    await CGUtils.Delay(0.4);
                    tween(payChip).to(0.5, { position: movePos }, { easing: 'sineOut' }).call(async () => {
                        while (payChip.children.length > 0) {
                            const child = payChip.children[0];
                            child.parent = betPos;
                        }
                        payChip.destroy();
                        this.chipScale(betPos);//籌碼縮放動態
                        await CGUtils.Delay(0.4);
                        this.chipPayToUser(betPos);//注區籌碼派彩給用戶
                    }).start();
                }).start()
            }
        }
    }

    /**
     * 注區籌碼派彩給用戶
     * @param betPos 注區節點
     */
    private chipPayToUser(betPos: Node) {
        // for (let i = 0; i < 2; i++) {
        // const betPos = this.chipDispatcher.children[userPosID].children[betID];
        for (let j = 0; j < betPos.children.length; j++) {//判斷籌碼數量
            let chip = betPos.children[j] as ChipNode;
            const movePos = this.userPos.children[chip.UserPosID].getWorldPosition().subtract(betPos.getWorldPosition());
            tween(chip).to(0.5, { position: movePos }, { easing: 'sineOut' }).call(() => {
                this.pool.put(chip);
            }).start();
        }
        // }
    }

    /**
     * 更新寫入續押資料
     * @param betTotal 該用戶目前總下注額
     * @param userBetAreaCredit 該用戶各注區目前下注額
     * @returns 
     */
    public updateReBetData(betTotal: number, userBetAreaCredit: number[]) {
        if (betTotal <= 0)
            return;
        this.reBetSave = Array(6).fill(null).map(() => []);//清空後重新記錄籌碼
        this.chipDispatcher.getChildByName('MainUser').children.forEach((betArea, i) => {
            for (const chip of betArea.children) {
                this.reBetSave[i].push((chip as ChipNode).ChipID);//添加籌碼id到續押資料內
            }
        });
        this.reBetBetAreaCredits = [...userBetAreaCredit];
        this.reBetCredit = betTotal;
        this.reBetCreditLable.string = CGUtils.NumDigits(this.reBetCredit);
    }

    /**
     * 設置續押狀態
     * @param state 續押觸發狀態
     */
    public setReBet(state: string): number[] | undefined {
        const btnReBet = this.btnReBet;
        const btnAuto = this.btnAuto;
        const btnAutoStop = this.btnAutoStop;
        this.reBetState = state as ReBetState;
        switch (state as ReBetState) {
            case ReBetState.Init://未續押狀態
                btnReBet.active = true;
                btnAuto.active = false;
                btnAutoStop.active = false;
                this.btnReBet.getComponent(Button).interactable = true;//啟用續押按鈕狀態
                break;
            case ReBetState.OnceBet://單次續押狀態
                if (this.btnReBet.active) {
                    if (this.reBetCredit > 0)
                        return this.reBetBetAreaCredits;
                    else
                        this.showTipMessage("請先下注");
                }
                else {
                    this.showTipMessage("停止自動續押");
                    btnAuto.active = true;
                    btnAutoStop.active = false;
                }
                break;
            case ReBetState.AutoBet://自動續押狀態
                this.showTipMessage("啟用自動續押", new Color(255, 255, 0, 255));
                btnReBet.active = false;
                btnAuto.active = false;
                btnAutoStop.active = true;
                break;
        }
        return undefined;
    }

    /**
     * 判斷是否執行續押
     */
    public testReBet(): number[] | undefined {
        if (this.reBetState === ReBetState.OnceBet) {
            this.setReBet(ReBetState.Init);//初始化
        } else if (this.reBetState === ReBetState.AutoBet) {
            if (this.reBetCredit > 0)
                return this.reBetBetAreaCredits;
            else
                this.showTipMessage("請先下注");
        }
        return undefined;
    }

    /**
     * 提示訊息顯示
     * @param tx 顯示文字
     * @param setColor 設置顏色
     */
    private async showTipMessage(tx: string, setColor?: Color) {
        const instTip = instantiate(this.tipPrefab);
        const tipLabel = instTip.children[0].getComponent(Label);
        instTip.parent = this.tipMessage;
        tipLabel.color = setColor ?? new Color(220, 220, 220, 255);
        tipLabel.string = tx;
        await CGUtils.Delay(1);
        instTip.destroy();
    }
}