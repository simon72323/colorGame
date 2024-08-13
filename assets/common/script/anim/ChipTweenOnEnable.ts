import { _decorator, Component, Vec3, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ChipTweenOnEnable')
export class ChipTweenOnEnable extends Component {
    private time = 0.2;//縮放時間
    private scale: Vec3 = new Vec3(1.1, 1.1, 1);//縮放比例

    public onEnable(): void {
        this.node.setScale(new Vec3(1, 1, 1));
        tween(this.node).to(this.time, { scale: this.scale }, { easing: 'cubicOut' }).start();
        tween(this.node.parent.getChildByName('Label')).to(this.time, { scale: this.scale }, { easing: 'cubicOut' }).start();
    }

    public onDisable(): void {
        Tween.stopAllByTarget(this.node);
        Tween.stopAllByTarget(this.node.parent.getChildByName('Label'));
        this.node.setScale(new Vec3(1, 1, 1));
        this.node.parent.getChildByName('Label').setScale(new Vec3(1, 1, 1));
    }
}