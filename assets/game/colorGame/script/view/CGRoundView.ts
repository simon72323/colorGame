import { _decorator, Component, Label, SpriteFrame, Sprite, Animation, UIOpacity, tween, Vec3, Color, Node, Vec2, instantiate } from 'cc';
import { CGUtils } from '../tools/CGUtils';
import { AudioName, CGAudioManager } from '../manager/CGAudioManager';
// import { CGController } from '../controller/CGController';
const { ccclass, property } = _decorator;

@ccclass('CGRoundView')
export class CGRoundView extends Component {
    @property(Node)
    private bgLight!: Node;//背景燈光
    @property(Node)
    private betInfo!: Node;//下注區資訊
    @property(Node)
    private result!: Node;//結算
    @property(Node)
    private stageTitle!: Node;//狀態標題
    @property(Node)
    private betWin!: Node;//下注勝利顯示區
    @property(Node)
    private betLight!: Node;//下注提示光區
    @property(Node)
    private betTime!: Node;//下注時間
    @property(Node)
    private localWinFx!: Node;//本地用戶贏分特效
    @property(Node)
    private infoBar!: Node;//資訊面板
    @property(Node)
    private bigWin!: Node;//大贏節點
    @property(Node)
    private winCredit!: Node;//本地贏分節點
    @property([SpriteFrame])
    private winOddSF: SpriteFrame[] = [];//倍率貼圖
    @property([SpriteFrame])
    private resultColorSF: SpriteFrame[] = [];//結算顏色貼圖
    @property(CGAudioManager)
    public audioManager: CGAudioManager = null;

    private chips: Node[] = [];

    /**
     * 在組件載入時初始化籌碼陣列
     * 遍歷 chipParent 的子節點，將它們添加到 chips 陣列中
     */
    protected onLoad(): void {
        for (const chip of this.bigWin.getChildByName('CreatChip').children)
            this.chips.push(chip);
    }

    /**
     * 新局開始
     * @controller
     */
    public async newRound() {
        this.betWin.active = false;
        for (const child of this.betWin.children) {
            child.active = false;
        }
        this.result.active = false;
        this.infoBar.getComponent(Animation).play('InfoBarTip');//播放跑馬燈動態
        this.bgLight.getComponent(Animation).play('BgLightIdle');
        for (let child of this.betInfo.children) {
            child.getComponent(UIOpacity).opacity = 255;
        }
        this.stageTitle.children[0].active = true;//標題顯示
        this.audioManager.playAudio(AudioName.TitleStartBet);
        this.betLight.active = true;//下注提示光
        await CGUtils.Delay(1);
        this.stageTitle.children[0].active = false;//標題隱藏
    }

    /**
     * 執行下注倒數
     * @param time 剩餘下注時間
     * @param betTotalTime 總下注時間
     * @controller
     * @returns 
     */
    public async setCountdown(time: number, betTotalTime: number) {
        const betTimeNode = this.betTime;
        const labelNode = betTimeNode.getChildByName('Label');
        const comLabel = labelNode.getComponent(Label);
        comLabel.string = time.toString();//顯示秒數
        if (time <= 0) {
            this.audioManager.playAudio(AudioName.TimeUp);
            tween(labelNode).to(0.2, { scale: new Vec3(1.4, 1.4, 1) }, { easing: 'sineOut' })
                .then(tween(labelNode).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }))
                .start();
            await CGUtils.Delay(1);
            betTimeNode.active = false;
        } else {
            labelNode.setScale(new Vec3(1, 1, 1));
            const lastUIOpacity = betTimeNode.getChildByName('Last').getComponent(UIOpacity);
            lastUIOpacity.opacity = 0;
            if (time <= 5) {
                this.audioManager.playAudio(AudioName.Countdown);
                comLabel.color = new Color(255, 0, 0, 255);
                tween(betTimeNode).to(0.3, { scale: new Vec3(1.15, 1.15, 1) })
                    .then(tween(betTimeNode).to(0.7, { scale: new Vec3(1, 1, 1) }))
                    .start();
                tween(lastUIOpacity).to(0.3, { opacity: 255 })
                    .then(tween(lastUIOpacity).to(0.7, { opacity: 0 }))
                    .start();
            }
            else
                comLabel.color = new Color(0, 90, 80, 255);
            betTimeNode.active = true;
            tween(labelNode).to(0.2, { scale: new Vec3(1.4, 1.4, 1) }, { easing: 'sineOut' })
                .then(tween(labelNode).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }))
                .start();
            const frameSprite = betTimeNode.getChildByName('Frame').getComponent(Sprite);
            frameSprite.fillRange = time / betTotalTime;
            tween(frameSprite).to(1, { fillRange: (time - 1) / betTotalTime }).start();//進度條倒數
        }
    }

    /**
     * 停止下注
     * @controller
     */
    public async betStop() {
        this.stageTitle.children[1].active = true;
        this.audioManager.playAudio(AudioName.TitleStopBet);
        await CGUtils.Delay(1);
        this.stageTitle.children[1].active = false;
    }

    /**
     * 回合結束
     * @param winColor //開獎顏色
     * @param localWinArea //本地勝利注區
     * @param betOdds //各注區賠率
     * @param payoff 本地用戶派彩
     * @controller
     */
    public async endRound(winColor: number[], localWinArea: number[], betOdds: number[], payoff: number) {
        this.bgLight.getComponent(Animation).play('BgLightOpen');//背景燈閃爍
        this.betWin.active = true;
        const winNum = new Set(winColor);//過濾重複數字
        for (let i of winNum) {
            this.betWin.children[i].active = true;
        }
        for (let i = 0; i < betOdds.length; i++) {
            if (betOdds[i] > 0) {
                if (localWinArea.indexOf(i) !== -1) {
                    const winFx = this.localWinFx.children[i];
                    this.audioManager.playAudio(AudioName.BetWin);
                    winFx.active = true;
                    const winOddSFID = betOdds[i] > 2 ? 2 : betOdds[i] - 1;//判斷倍率貼圖顯示
                    winFx.children[0].getComponent(Sprite).spriteFrame = this.winOddSF[winOddSFID];
                }
            } else
                this.betInfo.children[i].getComponent(UIOpacity).opacity = 100;
        }
        //本地用戶勝利設置
        if (payoff > 0) {
            //size===1代表開骰3顆骰子同一個id
            if (winNum.size === 1) {
                this.audioManager.playAudio(AudioName.BigWin);
                await this.runBigWin(payoff);//大獎顯示
            }
            const WinCreditLabel = this.infoBar.getChildByName('Win').getChildByName('WinCredit').getChildByName('Label');
            WinCreditLabel.getComponent(Label).string = CGUtils.NumDigits(payoff);
            this.infoBar.getComponent(Animation).play('InfoBarWin');
        }
        //顯示結算彈窗
        this.result.active = true;
        this.audioManager.playAudio(AudioName.Result);
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
    private runBigWin(winCredit: number): Promise<void> {
        this.bigWin.active = true;
        return new Promise<void>(async (resolve) => {
            this.bigWin.getComponent(UIOpacity).opacity = 0;
            this.bigWin.getComponent(Animation).play('BigWinShow');
            const label = this.bigWin.getChildByName('WinCredit').getChildByName('Label').getComponent(Label);
            label.string = '0';
            CGUtils.runCredit(1.7, winCredit, label);
            this.chipRunAndDistroy(30, new Vec2(500, 300));//噴籌碼
            await CGUtils.Delay(1.6);
            this.bigWin.getComponent(Animation).play('BigWinHide');
            await CGUtils.Delay(0.5);
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
        instCoin.position = new Vec3(0, 0, 0);
        instCoin.active = true;
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