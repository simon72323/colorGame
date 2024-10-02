import { _decorator, Component, Node, tween, Vec3, Label, Sprite, UITransform, Button, Color, Prefab, SpriteFrame, Animation, instantiate, UIOpacity } from 'cc';
import PoolHandler from '../tools/PoolHandler';
import { CGUtils } from '../tools/CGUtils';
import { CGDataService } from '../manager/CGDataService';
import { BetType, ReBetData, ReBetState, TempBetData } from '../enum/CGInterface';
const { ccclass, property } = _decorator;

//生成籌碼屬性設置
interface ChipNode extends Node {
    ChipID: number;
    UserPosID: number;
}

@ccclass('CGChipDispatcher')
export class CGChipDispatcher extends Component {
    @property(Node)
    private chipDispatcher!: Node;//籌碼派發層
    @property(Node)//籌碼選擇區
    private touchChip!: Node;
    @property(Node)
    private tipMessage!: Node;//提示訊息顯示層
    @property([Node])
    private btnCall!: Node[];//跟注按鈕(3顆)
    @property([Node])
    private btnStopCall!: Node[];//取消跟注按鈕(3顆)
    @property([Node])
    private callFx!: Node[];//跟注特效
    @property(Node)
    private btnReBet!: Node;//續押按鈕
    @property(Node)
    private btnAuto!: Node;//自動投注按鈕
    @property(Node)
    private btnAutoStop!: Node;//停止自動投注按鈕
    @property(Label)
    private reBetCreditLable!: Label;//續押額度
    @property(Node)
    private betTopBtns!: Node;//下注按鈕區
    @property(Node)//用戶位置
    private userPos!: Node;
    @property([SpriteFrame])
    private chipSF: SpriteFrame[] = [];//下注籌碼貼圖
    @property(Prefab)
    private betChipBlack: Prefab = null;//其他用戶下注籌碼
    @property(Prefab)
    private betChipColor: Prefab = null;//本地用戶下注籌碼
    @property(Prefab)
    private tipPrefab: Prefab = null;//提示訊息

    private reBetData: ReBetData = null;//本地續押資料
    private tempBetData: TempBetData = null;//本地暫存資料
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
        this.bindButtonEvent(this.betTopBtns.getChildByName('BtnBetUndo'), 'betUndo');//返回上一步按鈕事件
        this.bindButtonEvent(this.betTopBtns.getChildByName('BtnBetCancel'), 'clearTempBetChip');//取消下注按鈕事件

        this.pool = PoolHandler.getInstance();//獲得pool池實例
        //初始化參數
        this.tempBetData = {
            credits: Array(6).fill(0),
            total: 0,
            chipNode: [],
            chipCredit: []
        };
        this.reBetData = {
            areaChipID: Array(6).fill(null).map(() => []),
            credits: Array(6).fill(0),
            total: 0,
            state: ReBetState.Init
        }
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
        // console.log("更新跟注介面")
        this.btnCall[id].active = !isActive;
        this.btnStopCall[id].active = isActive;
        this.callFx[id].active = isActive;
    }

    /**
     * 返回上一步按下
     */
    private betUndo() {
        const lastChip = this.tempBetData.chipNode.pop();// 刪除最後一個籌碼
        this.pool.put(lastChip);
        const chipCredit = this.tempBetData.chipCredit.pop();// 刪除最後一個額度
        this.tempBetData.total -= chipCredit;//額度扣回
        if (this.tempBetData.total <= 0)
            this.clearTempBetData();//清除暫存下注資料
        else
            this.updateTempBetUI();
    }

    /**
     * 清除暫存下注資料
     */
    private clearTempBetData() {
        this.tempBetData.total = 0;
        this.tempBetData.credits = Array(6).fill(0);//清空
        this.tempBetData.chipCredit = [];//清空
        this.tempBetData.chipNode = [];
        this.betTopBtns.active = false;//隱藏下注按鈕介面
        this.updateTempBetUI();
    }

    /**
     * 清除暫存籌碼
     */
    public clearTempBetChip() {
        while (this.tempBetData.chipNode.length > 0) {
            const chip = this.tempBetData.chipNode.pop();
            chip.getComponent(UIOpacity).opacity = 255; //還原透明度
            this.pool.put(chip); // 退还所有
        }
        this.clearTempBetData();//清除暫存下注資料
    }

    /**
     * 下注成功
     * @param type 下注類型
     * @param betCredits 下注注區額度
     * @param betTotal 目前下注總額
     */
    public betSuccess(type: BetType, betCredits: number[], betTotal: number) {
        this.reBetData.total = betTotal;
        this.reBetCreditLable.string = CGUtils.NumDigits(this.reBetData.total);//續押額度更新
        switch (type) {
            case BetType.NewBet:
                //新增的籌碼縮放
                for (let chip of this.tempBetData.chipNode) {
                    chip.getComponent(UIOpacity).opacity = 255;
                    this.chipScale(chip);//新下注的籌碼縮放
                }
                this.clearTempBetData();//清除暫存下注資料
                break;
            case BetType.ReBet:
                this.showTipMessage("續押: " + CGUtils.NumDigits(this.reBetData.total));
                if (this.reBetData.state !== ReBetState.AutoBet) {
                    this.btnReBet.active = false;
                    this.btnAuto.active = true;
                    this.btnAutoStop.active = false;
                }
                for (let betID = 0; betID < this.reBetData.areaChipID.length; betID++) {
                    for (let chipID of this.reBetData.areaChipID[betID]) {
                        const chipCredit = this.dataService.betCreditList[chipID];//籌碼額度
                        this.betChip(betID, chipID, chipCredit, BetType.ReBet);// 籌碼派發
                    }
                }
                break;
            case BetType.CallBet:
                const data = this.dataService;
                const chipID = data.touchChipID;//目前點選的籌碼ID
                const chipCredit = data.betCreditList[chipID];//籌碼額度
                let callBetTotal = 0;
                for (let i = 0; i < betCredits.length; i++) {
                    if (betCredits[i] > 0) {
                        callBetTotal += chipCredit;
                        this.betChip(i, chipID, chipCredit, BetType.CallBet);//跟注籌碼下注
                    }
                }
                this.showTipMessage("跟注: " + CGUtils.NumDigits(callBetTotal));
                break;
        }
    }

    /**
     * 下注失敗
     * @param type 下注類型 
     */
    public betError(type: BetType) {
        switch (type) {
            case BetType.NewBet:
                this.clearTempBetChip();//清除暫存籌碼
                this.showTipMessage("下注失敗", new Color(255, 0, 0, 255));
                break;
            case BetType.ReBet:
                this.setReBet(ReBetState.Init);//初始化續押狀態
                this.showTipMessage("續押失敗", new Color(255, 0, 0, 255));
                break;
            case BetType.CallBet:
                this.showTipMessage("跟注失敗", new Color(255, 0, 0, 255));
                break;
        }
    }

    /**
     * 暫存下注額度更新
     */
    private updateTempBetUI() {
        this.betTopBtns.getChildByName('BetInfo').getChildByName('Label').getComponent(Label).string =
            'BET : ' + CGUtils.NumDigits(this.tempBetData.total);
    }

    public getTempAreaCredits() {
        return this.tempBetData.credits;
    }

    /**
     * 本地用戶下注(只做暫存，不會更新下注分數)
     * @param betID 注區ID
     * @param chipID 下注的籌碼ID
     * @param chipCredit 下注的籌碼額度
     * @param isSuccess 是否下注成功
     * @controller
     */
    public betChip(betID: number, chipID: number, chipCredit: number, betType: BetType) {
        this.btnReBet.getComponent(Button).interactable = false;//禁用續押
        const poolBetChip = this.pool.get(this.betChipColor) as ChipNode;
        poolBetChip.getComponent(UIOpacity).opacity = betType === BetType.NewBet ? 150 : 255;
        poolBetChip.getComponent(Sprite).spriteFrame = this.chipSF[chipID];//設置籌碼貼圖
        poolBetChip.ChipID = chipID;
        poolBetChip.UserPosID = 0;//本地用戶排名為0
        poolBetChip.children[0].getComponent(Label).string = CGUtils.NumDigits(chipCredit);//設置籌碼額度
        const betChipPos = this.chipDispatcher.getChildByName('MainUser').children[betID];//下注區節點
        poolBetChip.parent = betChipPos;
        const startNode = betType === BetType.ReBet ? this.userPos.children[0] : this.touchChip.children[this.dataService.touchChipPosID]
        poolBetChip.position = startNode.getWorldPosition().subtract(betChipPos.worldPosition);
        this.chipMove(betChipPos, poolBetChip);
        if (betType === BetType.NewBet) {
            //更新暫存資料
            if (this.tempBetData.total === 0)
                this.betTopBtns.active = true;//顯示投注區操作按鈕
            this.tempBetData.total += chipCredit;
            this.tempBetData.credits[betID] += chipCredit;
            this.tempBetData.chipNode.push(poolBetChip);//添加到暫存籌碼
            this.tempBetData.chipCredit.push(chipCredit);
            this.updateTempBetUI();
        }
    }

    /**
     * 其他用戶下注
     * @param betID 注區ID
     * @param userPosID 用戶區域位置ID
     * @param chipCredit 下注的籌碼額度
     * @controller
     */
    public otherUserBetChip(betID: number, userPosID: number, chipCredit: number) {
        const poolBetChip = this.pool.get(this.betChipBlack) as ChipNode;
        poolBetChip.ChipID = -1;//其他用戶id為-1
        poolBetChip.UserPosID = userPosID;//用戶區域位置ID
        poolBetChip.children[0].getComponent(Label).string = CGUtils.NumDigits(chipCredit);//設置籌碼額度
        const betChipPos = this.chipDispatcher.getChildByName('OtherUser').children[betID];//下注區節點
        poolBetChip.parent = betChipPos;
        this.userPos.children[userPosID].getComponent(Animation).play();
        const startPos = this.userPos.children[userPosID].getWorldPosition();
        poolBetChip.position = startPos.subtract(betChipPos.worldPosition);
        this.chipMove(betChipPos, poolBetChip);
    }

    /**
     * 籌碼移動
     * @param betPos 目標下注位置
     * @param poolBetChip 移動的籌碼
     */
    private chipMove(betChipPos: Node, poolBetChip: Node) {
        const betChipHeight = betChipPos.getComponent(UITransform).height;
        const betChipWidth = betChipPos.getComponent(UITransform).width;
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
        tween(chip).to(0.03, { scale: new Vec3(1.1, 1.1, 1) })
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
     * @param odds 倍率(生成籌碼數量)
     * @controller
     */
    public async payChipToBetArea(betID: number, odds: number) {
        //0=其他用戶，1=本地用戶
        for (let i = 0; i < 2; i++) {
            const betChipPos = this.chipDispatcher.children[i].children[betID];//下注區籌碼父節點
            if (betChipPos.children.length > 0) {
                const payChip = new Node();
                //生成派獎籌碼(會根據倍率生成數量不同)
                for (let j = 0; j < odds; j++) {
                    for (const child of betChipPos.children) {
                        const poolBetChip = this.pool.get(i === 0 ? this.betChipBlack : this.betChipColor) as ChipNode;//生成新籌碼
                        poolBetChip.parent = payChip;
                        const referChip = child as ChipNode;
                        poolBetChip.ChipID = referChip.ChipID;
                        poolBetChip.UserPosID = referChip.UserPosID;
                        poolBetChip.getComponent(Sprite).spriteFrame = referChip.getComponent(Sprite).spriteFrame;
                        poolBetChip.children[0].getComponent(Label).string = referChip.children[0].getComponent(Label).string;
                        const chipPos = referChip.position;
                        poolBetChip.setPosition(new Vec3(chipPos.x, chipPos.y + (j + 1) * (i === 0 ? 5 : 6), chipPos.z));//籌碼疊高
                    }
                }
                payChip.parent = betChipPos;
                const bankWorldPos = this.chipDispatcher.getChildByName('BankerPos').getWorldPosition();
                payChip.position = bankWorldPos.subtract(betChipPos.getWorldPosition());
                payChip.setScale(new Vec3(0, 0, 0));
                tween(payChip).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' }).call(async () => {
                    await CGUtils.Delay(0.4);
                    tween(payChip).to(0.5, { position: new Vec3(0, 0, 0) }, { easing: 'sineOut' }).call(async () => {
                        while (payChip.children.length > 0) {
                            const child = payChip.children[0];
                            child.parent = betChipPos;
                        }
                        payChip.destroy();
                        this.chipScale(betChipPos);//籌碼縮放動態
                        await CGUtils.Delay(0.4);
                        this.chipPayToUser(betChipPos);//注區籌碼派彩給用戶
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
     * @param userCredits 該用戶各注區目前下注額
     * @returns 
     */
    public updateReBetData(betTotal: number, userCredits: number[]) {
        if (betTotal <= 0)
            return;

        this.reBetData.areaChipID = Array(6).fill(null).map(() => []);//清空後重新記錄籌碼
        this.chipDispatcher.getChildByName('MainUser').children.forEach((betArea, i) => {
            for (const chip of betArea.children) {
                this.reBetData.areaChipID[i].push((chip as ChipNode).ChipID);//添加籌碼id到續押資料內
            }
        });
        this.reBetData.credits = [...userCredits];
        console.log("更新續押資料", betTotal);
        console.log("該用戶各注區目前下注額", userCredits);
        this.reBetData.total = betTotal;
        this.reBetCreditLable.string = CGUtils.NumDigits(this.reBetData.total);
    }

    /**
     * 設置續押狀態
     * @param state 續押觸發狀態
     * @controller
     */
    public setReBet(state: string): number[] | undefined {
        const btnReBet = this.btnReBet;
        const btnAuto = this.btnAuto;
        const btnAutoStop = this.btnAutoStop;
        this.reBetData.state = state as ReBetState;
        switch (state as ReBetState) {
            case ReBetState.Init://未續押狀態
                btnReBet.active = true;
                btnAuto.active = false;
                btnAutoStop.active = false;
                this.btnReBet.getComponent(Button).interactable = true;//啟用續押按鈕狀態
                break;
            case ReBetState.OnceBet://單次續押狀態
                if (this.btnReBet.active) {
                    if (this.reBetData.total > 0)
                        return this.reBetData.credits;
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
     * 新局開始時，判斷是否執行續押
     * @returns 
     */
    public testReBet() {
        if (this.reBetData.state === ReBetState.AutoBet && this.reBetData.total > 0)
            return this.reBetData.credits;
        this.setReBet(ReBetState.Init);//初始化
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