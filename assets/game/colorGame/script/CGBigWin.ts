import { _decorator, Component, Node, instantiate, tween, Vec3, Tween, Animation, UIOpacity, Label, Vec2 } from 'cc';
import { UtilsKitS } from '../../../common/script/lib/UtilsKitS';
const { ccclass, property } = _decorator;

@ccclass('CGBigWin')
export class CGBigWin extends Component {
    @property({ type: Node, tooltip: "要噴的籌碼種類" })
    private chips: Node[] = [];
    @property({ type: Node, tooltip: "要噴的籌碼層" })
    private chipParent: Node = null;

    public runScore(winScore: number): Promise<void> {
        return new Promise<void>(async (resolve) => {
            this.node.getComponent(UIOpacity).opacity = 0;
            this.node.getComponent(Animation).play('BigWinShow');
            const label = this.node.getChildByName('WinScore').getChildByName('Label').getComponent(Label);
            label.string = '0';
            UtilsKitS.runScore(1.2, winScore, label);
            this.chipRunAndDistroy(30, new Vec2(500, 300));//噴籌碼
            await UtilsKitS.Delay(1.1);
            this.node.getComponent(Animation).play('BigWinHide');
            await UtilsKitS.Delay(0.6);
            this.scheduleOnce(() => {
                this.node.active = false;
            }, 0.2)
            resolve();
        });
    }
    //生成噴籌碼
    private chipRunAndDistroy(count: number, size: Vec2) {
        for (let i = 0; i < count; i++) {
            this.scheduleOnce(() => {
                const instCoin = instantiate(this.chips[Math.floor(Math.random() * this.chips.length)]);
                const chipParent = new Node();
                instCoin.parent = chipParent;
                instCoin.setPosition(new Vec3(0, 0, 0));
                instCoin.active = true;
                chipParent.parent = this.chipParent;
                Tween.stopAllByTarget(chipParent);
                Tween.stopAllByTarget(instCoin);
                chipParent.setPosition(new Vec3(0, 0, 0));
                instCoin.setPosition(new Vec3(0, 0, 0));
                let moveX = size.x - Math.random() * size.x * 2;
                let moveY = size.y + Math.random() + 100;
                //越靠中間，y軸噴越高
                if (moveX > -size.x / 2 && moveX < size.x / 2) {
                    moveY += (size.x / 2 - Math.abs(moveX)) / 2;
                }
                //水平移動
                const moveTime = 0.8 + Math.random() * 0.2;
                tween(chipParent).to(moveTime, { position: new Vec3(moveX, 0, 0) }, { easing: 'sineOut' }).call(() => {
                    instCoin.destroy();
                    console.log("移除籌碼")
                }).start();
                tween(instCoin).to(moveTime / 2, { position: new Vec3(0, moveY, 0) }, { easing: 'sineOut' }).then(
                    tween(instCoin).to(moveTime / 2, { position: new Vec3(0, 0, 0) }, { easing: 'sineIn' })).start();
            }, Math.random() * 1.2)
        }
    }
}