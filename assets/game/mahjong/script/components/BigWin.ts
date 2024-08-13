import { _decorator, Animation, Button, Component, EventHandler, js, Label, Node, sp, Tween, tween } from 'cc';
import { UtilsKit } from '../lib/UtilsKit';
import { AudioManager } from './AudioManager';
import { SoundFiles } from './SoundFiles';
const { ccclass, property } = _decorator;

@ccclass('BigWin')
export class BigWin extends Component {

    private _bigWinMultiple: Array<number> = [10, 20, 50, 100]; // 切換bigWin的分數倍率
    private _bigWinSpineAnimName: Array<string> = ['win', 'big_win', 'mega_win', 'super_win']; // bigWinSpine動態名稱
    private _bigWinSoundName: Array<string> = [SoundFiles.Win, SoundFiles.BigWin, SoundFiles.MegaWin, SoundFiles.SuperWin]; // bigWin Sound 名稱
    private _runScoreTime: number = 10; // 跑分時間(最多)

    private _bet: number = 0;
    private _payoff: number = 0;

    get bigWinMultiple(): Array<number> {
        return this._bigWinMultiple;
    }

    private bigWinResolve: any;

    start() {
        this.node.on(Button.EventType.CLICK, () => { this.endBigWinRun() });
    }

    running(bet: number, payoff: number): Promise<void> {
        this._bet = bet;
        this._payoff = payoff;

        return new Promise(async (resolve) => {
            this.bigWinResolve = resolve;

            const runningScoreLabel: Label = this.node.getChildByName("label").getComponent(Label);
            runningScoreLabel.string = "0"; // 清空跑分

            const rollMoneyAmount: number = 3;
            for (let i:number = 0; i < rollMoneyAmount; i++) {
                this.scheduleOnce(() => {
                    AudioManager.getInstance().play(SoundFiles.RollMoney, true);
                }, 0.1 * i);
            }

            this.node.active = true; // 顯示跑分物件
            this.node.getComponent(Button).interactable = true; // 啟用按鈕
            this.node.getComponent(Animation).play("bigWinReset");

            let arrayId: number = 0;
            this.playBigWinSpin(arrayId);

            // 等待跑分結束(回傳)
            const runBigWinScore: { runScore: number } = { runScore: 0 };
            tween(runBigWinScore).to(this._runScoreTime, { runScore: this._payoff }, {
                onUpdate: () => {
                    runningScoreLabel.string = UtilsKit.NumberSpecification(runBigWinScore.runScore);
                    if (arrayId < this.bigWinMultiple.length - 1 && runBigWinScore.runScore >= this._bet * this.bigWinMultiple[arrayId+1]) {
                        arrayId++; // 判斷下個階段
                        this.playBigWinSpin(arrayId);
                    }
                }
            }).call(() => {
                this.endBigWinRun();
            }).tag(88).start();
        })
    }

    private async playBigWinSpin(arrayId: number) {
        AudioManager.getInstance().play(this._bigWinSoundName[arrayId]);
        
        const bigWinSpineNode: Node = this.node.getChildByName("spine");
        await UtilsKit.SetSkeletonAnimation(bigWinSpineNode, 0, this._bigWinSpineAnimName[arrayId] + '_begin', false, true);
        UtilsKit.SetSkeletonAnimation(bigWinSpineNode, 0, this._bigWinSpineAnimName[arrayId] + '_loop', true);
    }

    // 執行bigWin跑分結束
    private bigWinOver(): Promise<void> {
        return new Promise(async (resolve) => {

            AudioManager.getInstance().stop(SoundFiles.RollMoney);

            const runningScoreLabel: Label = this.node.getChildByName("label").getComponent(Label);
            runningScoreLabel.string = UtilsKit.NumberSpecification(this._payoff);

            this.node.getComponent(Animation).play("bigWinOver");

            await UtilsKit.DeferByScheduleOnce(2000);

            this.node.active = false; // 隱藏跑分物件

            resolve();
        })
    }

    //大獎跑分畫面按下觸發
    private async endBigWinRun() {

        if (this.node.getComponent(Button).interactable) {
            this.node.getComponent(Button).interactable = false; // 禁用按鈕

            Tween.stopAllByTag(88);

            const bigWinSpine: sp.Skeleton = this.node.getChildByName("spine").getComponent(sp.Skeleton);
            bigWinSpine.setCompleteListener(null); // 結束監聽

            let i: number = 0;
            while (this._payoff >= this._bet * this.bigWinMultiple[i+1]) {
                if (i == this.bigWinMultiple.length - 1) {
                    break;
                } else {
                    i++;
                }
            }
            bigWinSpine.setAnimation(0, this._bigWinSpineAnimName[i] + '_loop', true);

            await this.bigWinOver();

            if (this.bigWinResolve) this.bigWinResolve();
        }
    }

    public async skip() {
        return await this.endBigWinRun();
    }
}

