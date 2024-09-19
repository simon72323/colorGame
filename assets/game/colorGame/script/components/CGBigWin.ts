import { _decorator, Component, Node, instantiate, tween, Vec3, Tween, Animation, UIOpacity, Label, Vec2 } from 'cc';
import { UtilsKitS } from '../../../../common/script/lib/UtilsKitS';
const { ccclass, property } = _decorator;

@ccclass('CGBigWin')
export class CGBigWin extends Component {
    private chips: Node[] = [];
    @property({ type: Node, tooltip: "大贏節點" })
    private bigWin: Node = null;
    @property({ type: Node, tooltip: "要噴的籌碼層" })
    private chipParent: Node = null;

    protected onLoad(): void {
        for (const chip of this.chipParent.children)
            this.chips.push(chip);
    }

    public runScore(winScore: number): Promise<void> {
        this.bigWin.active = true;
        return new Promise<void>(async (resolve) => {
            this.bigWin.getComponent(UIOpacity).opacity = 0;
            this.bigWin.getComponent(Animation).play('BigWinShow');
            const label = this.bigWin.getChildByName('WinScore').getChildByName('Label').getComponent(Label);
            label.string = '0';
            UtilsKitS.runScore(1.2, winScore, label);
            this.chipRunAndDistroy(30, new Vec2(500, 300));//噴籌碼
            await UtilsKitS.Delay(1.1);
            this.bigWin.getComponent(Animation).play('BigWinHide');
            await UtilsKitS.Delay(0.6);
            this.scheduleOnce(() => {
                this.bigWin.active = false;
            }, 0.2)
            resolve();
        });
    }

    //生成籌碼
    private createChip(size: Vec2) {
        const instCoin = instantiate(this.chips[Math.floor(Math.random() * this.chips.length)]);
        const chipParent = new Node();
        chipParent.addChild(instCoin);
        this.chipParent.addChild(chipParent);
        const moveX = size.x * (Math.random() * 2 - 1);
        let moveY = size.y + Math.random() * 100;
        moveY += Math.max(0, (size.x / 2 - Math.abs(moveX)) / 2);

        const moveTime = 0.8 + Math.random() * 0.2;

        tween(chipParent)
            .to(moveTime, { position: new Vec3(moveX, 0, 0) }, { easing: 'sineOut' })
            .call(() => instCoin.destroy())
            .start();

        tween(instCoin)
            .to(moveTime / 2, { position: new Vec3(0, moveY, 0) }, { easing: 'sineOut' })
            .then(tween(instCoin).to(moveTime / 2, { position: Vec3.ZERO }, { easing: 'sineIn' }))
            .start();
    }

    private chipRunAndDistroy(count: number, size: Vec2) {
        for (let i = 0; i < count; i++) {
            this.scheduleOnce(() => this.createChip(size), Math.random() * 1.2);
        }
    }
    //生成噴籌碼
    // private chipRunAndDistroy(count: number, size: Vec2) {

    //     for (let i = 0; i < count; i++) {
    //         this.scheduleOnce(() => {
    //             const instCoin = instantiate(this.chips[Math.floor(Math.random() * this.chips.length)]);
    //             const chipParent = new Node();
    //             instCoin.parent = chipParent;
    //             instCoin.setPosition(new Vec3(0, 0, 0));
    //             instCoin.active = true;
    //             chipParent.parent = this.chipParent;
    //             Tween.stopAllByTarget(chipParent);
    //             Tween.stopAllByTarget(instCoin);
    //             chipParent.setPosition(new Vec3(0, 0, 0));
    //             instCoin.setPosition(new Vec3(0, 0, 0));
    //             let moveX = size.x - Math.random() * size.x * 2;
    //             let moveY = size.y + Math.random() + 100;
    //             //越靠中間，y軸噴越高
    //             if (moveX > -size.x / 2 && moveX < size.x / 2) {
    //                 moveY += (size.x / 2 - Math.abs(moveX)) / 2;
    //             }
    //             //水平移動
    //             const moveTime = 0.8 + Math.random() * 0.2;
    //             tween(chipParent).to(moveTime, { position: new Vec3(moveX, 0, 0) }, { easing: 'sineOut' }).call(() => {
    //                 instCoin.destroy();
    //                 console.log("移除籌碼")
    //             }).start();
    //             tween(instCoin).to(moveTime / 2, { position: new Vec3(0, moveY, 0) }, { easing: 'sineOut' }).then(
    //                 tween(instCoin).to(moveTime / 2, { position: new Vec3(0, 0, 0) }, { easing: 'sineIn' })).start();
    //         }, Math.random() * 1.2)
    //     }
    // }
}