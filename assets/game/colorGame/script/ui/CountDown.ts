import { _decorator, Component, Node, Label, Sprite, tween, Vec3, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CountDown')
export class CountDown extends Component {
    @property(Node)
    timeNode: Node = null;
    @property(Node)
    labelNode: Node = null;
    @property(Sprite)
    frameSprite: Sprite = null;

    public runCountDown(time: number, callback: any) {
        const comLabel = this.labelNode.getComponent(Label);
        comLabel.color = new Color(0, 0, 0, 255);
        this.frameSprite.fillRange = 1;
        this.timeNode.active = true;
        this.timeNode.setScale(new Vec3(0, 0, 1));
        tween(this.timeNode).to(0.4, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).start();
        tween(this.frameSprite).to(time, { fillRange: 0 }).start();
        let timer = time;
        comLabel.string = timer.toString();//起始秒數
        this.schedule(() => {
            timer--;
            comLabel.string = timer.toString();
            this.labelNode.setScale(new Vec3(1, 1, 1));
            this.timeNode.setScale(new Vec3(1, 1, 1));
            if (timer <= 5) {
                comLabel.color = new Color(255, 0, 0, 255);
                tween(this.timeNode).to(0.5, { scale: new Vec3(1.1, 1.1, 1) })
                    .then(tween(this.timeNode).to(0.5, { scale: new Vec3(1, 1, 1) }))
                    .start();
            }
            if (timer === 0) {
                this.timeNode.active = false;
                callback();
            } else {
                tween(this.labelNode).to(0.1, { scale: new Vec3(1.3, 1.3, 1) }, { easing: 'sineOut' })
                    .then(tween(this.labelNode).to(0.15, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }))
                    .start();
            }
        }, 1, time - 1, 1)
    }
}