import { _decorator, Component, Node, instantiate, tween, Vec3, Tween, Animation, UIOpacity, Label } from 'cc';
import { UtilsKitS } from '../../../../common/script/lib/UtilsKitS';
const { ccclass, property } = _decorator;

@ccclass('ColorGameBigWin')
export class ColorGameBigWin extends Component {
    @property({ type: Node, tooltip: "要噴的籌碼種類" })
    private chips: Node[] = [];
    @property({ type: Node, tooltip: "要噴的籌碼層" })
    private chipParent: Node = null;
    // @property({ tooltip: "要噴的籌碼總數" })
    private count = 30;
    // @property({ tooltip: "單一金幣生命週期" })
    // private lifeTime = 1;
    // @property({ tooltip: "bigWin的停留時間" })
    private runTime = 1.2;
    // public score: number = 0;


    public async runScore(winScore: number, callback: any) {
        this.node.getComponent(UIOpacity).opacity = 0;
        this.node.getComponent(Animation).play('BigWinShow');
        const label = this.node.getChildByName('WinScore').getChildByName('Label').getComponent(Label);
        label.string = '0';
        UtilsKitS.runScore(this.runTime, winScore, label);
        for (let i = 0; i < this.count; i++) {
            this.scheduleOnce(() => {
                const instChip = instantiate(this.chips[Math.floor(Math.random() * this.chips.length)]);
                const chipParent = new Node();
                instChip.parent = chipParent;
                instChip.setPosition(new Vec3(0, 0, 0));
                instChip.active = true;
                chipParent.parent = this.chipParent;
                this.chipRunAndDistroy(chipParent, instChip);
            }, Math.random())
        }
        await UtilsKitS.Delay(this.runTime - 0.1);
        await UtilsKitS.PlayAnim(this.node, 'BigWinHide');
        this.node.active = false;
        callback();
    }

    private chipRunAndDistroy(chipParent: Node, chip: Node) {
        let i = 0;
        // const count = Math.round(this.showTime / this.lifeTime);
        // const runTime = this.lifeTime;
        // this.schedule(() => {
        Tween.stopAllByTarget(chipParent);
        Tween.stopAllByTarget(chip);
        chipParent.setPosition(new Vec3(0, 0, 0));
        chip.setPosition(new Vec3(0, 0, 0));
        i++;
        // if (i < count + 1) {
        const moveX = 500 - Math.random() * 1000;
        const moveY = 300 + Math.random() * 120;
        //水平移動
        tween(chipParent).to(1, { position: new Vec3(moveX, 0, 0) }, { easing: 'sineOut' }).call(() => {
            chip.destroy();
            console.log("移除")
        })
            .start();
        tween(chip).to(0.5, { position: new Vec3(0, moveY, 0) }, { easing: 'sineOut' }).then(
            tween(chip).to(0.5, { position: new Vec3(0, 0, 0) }, { easing: 'sineIn' })).start();
        // }
        // else {

        // }
        // }, runTime, count, 0.01)
    }
}