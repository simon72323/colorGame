import { _decorator, Component, Label, SpriteFrame, Sprite, Animation, UIOpacity, tween, Vec3, Color, Node, Vec2, instantiate } from 'cc';
import { CGUtils } from '../tools/CGUtils';
import { Payoff } from '../enum/CGInterface';
// import { CGController } from '../controller/CGController';
const { ccclass, property } = _decorator;

@ccclass('CGRoundView')
export class CGRoundView extends Component {
    @property(Node)//背景燈光
    private bgLight: Node = null;
    @property(Node)//下注區資訊
    private betInfo!: Node;

    @property(Node)//結算
    private result: Node = null;
    @property(Node)//狀態標題
    private stageTitle: Node = null;
    // @property(Node)//3d盒子
    // private box3D: Node = null;
    // @property(Node)//下注按鈕區
    // private betArea: Node = null;
    @property(Node)//下注勝利顯示區
    private betWin: Node = null;
    @property(Node)//下注提示光區
    private betLight!: Node;
    @property(Node)//下注時間
    private betTime: Node = null;
    @property(Node)//本地用戶贏分特效
    private mainUserWin: Node = null;

    private chips: Node[] = [];
    @property(Node)//資訊面板
    private infoBar: Node = null;
    @property(Node)
    private bigWin!: Node;//大贏節點
    // @property(Node)
    // private chipParent!: Node;//要噴的籌碼層


    @property(Node)
    private winCredit!: Node;//贏分節點

    @property([SpriteFrame])
    private winOddSF: SpriteFrame[] = [];
    @property([SpriteFrame])
    private resultColorSF: SpriteFrame[] = [];

    /**
     * 在組件載入時初始化籌碼陣列
     * 遍歷 chipParent 的子節點，將它們添加到 chips 陣列中
     */
    protected onLoad(): void {
        for (const chip of this.bigWin.getChildByName('CreatChip').children)
            this.chips.push(chip);
    }

    //開始執行回合(server觸發)
    public async startRound() {
        //初始化
        this.betWin.active = false;
        for (const child of this.betWin.children) {
            child.active = false;
        }
        this.result.active = false;
        this.infoBar.getComponent(Animation).play('InfoBarTip');//播放跑馬燈動態
        this.bgLight.getComponent(Animation).play('BgLightIdle');
        for (let i = 0; i < 6; i++) {
            this.betInfo.children[i].getComponent(UIOpacity).opacity = 255;
        }
        //標題顯示
        this.stageTitle.children[0].active = true;//標題顯示
        this.betLight.active = true;//下注提示光
        // this.btnState(true);//按鈕啟用
        await CGUtils.Delay(1);
        this.stageTitle.children[0].active = false;//標題隱藏
    }

    //執行下注倒數(server觸發)
    public setCountdown(time: number, betTotalTime: number) {
        const betTimeNode = this.betTime;
        const labelNode = betTimeNode.getChildByName('Label');
        const comLabel = labelNode.getComponent(Label);
        comLabel.string = time.toString();//顯示秒數
        labelNode.setScale(new Vec3(1, 1, 1));
        const lastUIOpacity = betTimeNode.getChildByName('Last').getComponent(UIOpacity);
        lastUIOpacity.opacity = 0;
        if (time <= 5) {
            comLabel.color = new Color(255, 0, 0, 255);
            tween(betTimeNode).to(0.5, { scale: new Vec3(1.1, 1.1, 1) })
                .then(tween(betTimeNode).to(0.5, { scale: new Vec3(1, 1, 1) }))
                .start();
            tween(lastUIOpacity).to(0.5, { opacity: 255 })
                .then(tween(lastUIOpacity).to(0.5, { opacity: 0 }))
                .start();
        }
        else
            comLabel.color = new Color(0, 90, 80, 255);
        const frameSprite = betTimeNode.getChildByName('Frame').getComponent(Sprite);
        frameSprite.fillRange = time / betTotalTime;
        if (!betTimeNode.active)
            betTimeNode.active = true;
        tween(frameSprite).to(1, { fillRange: (time - 1) / betTotalTime }).start();//進度條倒數
        tween(labelNode).to(0.2, { scale: new Vec3(1.4, 1.4, 1) }, { easing: 'sineOut' })
            .then(tween(labelNode).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }))
            .start();
    }

    //其他用戶押注
    // private async otherPlayerBet() {
    //     // const model = this.controller.model;
    //     // const chipDispatcher = this.controller.chipDispatcher;
    //     await CGUtils.Delay(0.1 + Math.random() * 0.1);
    //     for (let i = 1; i < 5; i++) {
    //         if (Math.random() > 0.5) {
    //             const randomBetArea = Math.floor(Math.random() * 6);
    //             const randomChipID = Math.floor(Math.random() * 10);
    //             chipDispatcher.createChipToBetArea(randomBetArea, i, randomChipID, false);
    //             //判斷本地用戶是否跟注
    //             if (i < 4)
    //                 if (chipDispatcher.btnStopCall[i - 1].active) {
    //                     chipDispatcher.createChipToBetArea(randomBetArea, 0, model.touchChipID, false);//用戶跟注
    //                 }
    //         }
    //     }
    // }

    /**
     * 停止下注
     * @controller
     */
    public async betStop() {
        this.stageTitle.children[1].active = true;
        await CGUtils.Delay(1);
        this.stageTitle.children[1].active = false;
        // let winColor = model.winColor;
        // await DiceRunSet.diceStart(model.pathData, winColor);//骰子表演

    }

    /**
     * 回合結束
     * @param winColor //開獎顏色
     * @param localWinArea //本地勝利注區
     * @param betOdds //各注區賠率
     * @param userPayoff 本地用戶派彩
     * @controller
     */
    public async endRound(winColor: number[], localWinArea: number[], betOdds: number[], userPayoff: Payoff) {
        this.bgLight.getComponent(Animation).play('BgLightOpen');//背景燈閃爍
        this.betWin.active = true;
        const winNum = new Set(winColor);//過濾重複數字
        for (let i of winNum) {
            this.betWin.children[i].active = true;
        }
        for (let i = 0; i < betOdds.length; i++) {
            const odds = betOdds[i];
            if (odds > 0) {
                if (localWinArea.indexOf(i) !== -1) {
                    this.mainUserWin.children[i].active = true;
                    const winOddSFID = odds === 9 ? 2 : odds - 1;
                    this.mainUserWin.children[i].children[0].getComponent(Sprite).spriteFrame = this.winOddSF[winOddSFID];
                }
            } else
                this.betInfo.children[i].getComponent(UIOpacity).opacity = 100;
        }
        //本地用戶勝利設置
        if (userPayoff.payoff > 0) {
            const showWinCredit = () => {
                this.infoBar.getChildByName('Win').getChildByName('WinCredit').getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(userPayoff.payoff);
                this.infoBar.getComponent(Animation).play('InfoBarWin');
            }
            //size===1代表開骰3顆骰子同一個id
            if (winNum.size === 1)
                await this.runBigWin(userPayoff.payoff);
            else
                showWinCredit.bind(this)();
        }
        //顯示結算彈窗
        this.result.active = true;
        for (let i = 0; i < 3; i++) {
            this.result.getChildByName(`Dice${i}`).getComponent(Sprite).spriteFrame = this.resultColorSF[winColor[i]];
        }
    }

    /**
     * 顯示本地勝利派彩
     * @param payoff 派彩
     * @controller
     */
    public showAddCredit(payoff: number) {
        this.winCredit.getChildByName('Win').getComponent(Label).string = '+' + CGUtils.NumDigits(payoff);
        this.winCredit.active = true;
    }

    /**
     * 運行大獎動畫並顯示獲勝金額
     * @param winCredit - 獲勝的金額
     * @returns 動畫完成後 resolve
     */
    public runBigWin(winCredit: number): Promise<void> {
        this.bigWin.active = true;
        return new Promise<void>(async (resolve) => {
            this.bigWin.getComponent(UIOpacity).opacity = 0;
            this.bigWin.getComponent(Animation).play('BigWinShow');
            const label = this.bigWin.getChildByName('WinCredit').getChildByName('Label').getComponent(Label);
            label.string = '0';
            CGUtils.runCredit(1.2, winCredit, label);
            this.chipRunAndDistroy(30, new Vec2(500, 300));//噴籌碼
            await CGUtils.Delay(1.1);
            this.bigWin.getComponent(Animation).play('BigWinHide');
            await CGUtils.Delay(0.6);
            this.scheduleOnce(() => {
                this.bigWin.active = false;
            }, 0.2)
            resolve();
        });
    }

    /**
     * 執行多個籌碼的生成和銷毀
     * @param count - 要生成的籌碼數量
     * @param size - 籌碼移動的範圍大小
     */
    private chipRunAndDistroy(count: number, size: Vec2) {
        for (let i = 0; i < count; i++) {
            this.scheduleOnce(() => this.createChip(size), Math.random() * 1.2);
        }
    }

    /**
     * 生成籌碼
     * @param size - 籌碼移動的範圍大小
     */
    private createChip(size: Vec2) {
        const instCoin = instantiate(this.chips[Math.floor(Math.random() * this.chips.length)]);
        const chipParent = new Node();
        chipParent.addChild(instCoin);
        this.bigWin.getChildByName('CreatChip').addChild(chipParent);

        // 計算籌碼的移動距離
        const moveX = size.x * (Math.random() * 2 - 1);
        let moveY = size.y + Math.random() * 100;
        moveY += Math.max(0, (size.x / 2 - Math.abs(moveX)) / 2);

        const moveTime = 0.8 + Math.random() * 0.2;// 設定移動時間

        // 設定父節點的水平移動動畫
        tween(chipParent)
            .to(moveTime, { position: new Vec3(moveX, 0, 0) }, { easing: 'sineOut' })
            .call(() => instCoin.destroy())
            .start();

        // 設定籌碼的垂直移動動畫
        tween(instCoin)
            .to(moveTime / 2, { position: new Vec3(0, moveY, 0) }, { easing: 'sineOut' })
            .then(tween(instCoin).to(moveTime / 2, { position: Vec3.ZERO }, { easing: 'sineIn' }))
            .start();
    }
}