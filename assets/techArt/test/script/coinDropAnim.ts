import { _decorator, Component, Node, tween, Vec3, Tween, Vec2, UITransform, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('coinDropAnim')
export class coinDropAnim extends Component {
    //掉落範圍會自動根據節點的尺寸決定
    @property({ type: Node, tooltip: "隨機動畫主物件(子物件執行掉落)" })
    private anim: Node = null;
    @property({ tooltip: "掉落生存時間(x=生存時間，y=生存浮動時間" })
    private lifeTime = new Vec2(1.5, 0.5);

    onEnable() {
        this.anim.getComponent(UIOpacity).opacity = 255;
        for (let i = 0; i < this.anim.children.length; i++) {
            for (const node of this.anim.children[i].children) {
                const waitTime = Math.random() * this.lifeTime.x;
                tween(this.node).delay(waitTime).call(() => {
                    node.active = true;
                    this.loopRun(node);
                }).start()
            }
        }
    }
    //執行循環掉落表演
    private loopRun(node: Node) {
        const size = this.node.getComponent(UITransform);
        const randomX = size.width / 2 - Math.random() * size.width;//根據節點的寬度決定掉落範圍
        node.angle = Math.random() * 360;//隨機起始角度
        node.setScale(new Vec3(0.8 + Math.random() * 0.2, 0.8 + Math.random() * 0.2, 1));
        node.setPosition(new Vec3(randomX, 0, 0));//設置隨機位置
        let randomTime = this.lifeTime.x + Math.random() * this.lifeTime.y;
        tween(node).by(randomTime, { angle: 90 + Math.random() * 90 }).start();//執行動態
        tween(node).to(randomTime, { position: new Vec3(randomX, -size.height, 0) }, { easing: 'sineIn' })
            .call(() => {
                this.loopRun(node);
            }).start();
    }

    //聽牌背景表演結束
    readyHide() {
        tween(this.anim.getComponent(UIOpacity)).to(0.3, { opacity: 0 }).call(() => {
            this.node.active = false;//隱藏此節點
        }).start();
    }

    onDisable() {
        Tween.stopAllByTarget(this.node);//結束等待執行動態
        for (let i = 0; i < this.anim.children.length; i++) {
            for (const node of this.anim.children[i].children) {
                Tween.stopAllByTarget(node);//結束下落動態
                node.active = false;
            }
        }
    }
}