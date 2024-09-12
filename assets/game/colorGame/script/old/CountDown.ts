import { _decorator, Component, Node, Label, Sprite, tween, Vec3, Color, SpriteFrame, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CountDown')
export class CountDown extends Component {
    // @property(Node)
    // timeNode: Node = null;
    // @property(Node)
    // labelNode: Node = null;
    // @property(Sprite)
    // frameSprite: Sprite = null;
    // @property(Node)
    // last: Node = null;

    // public runCountDown(time: number): Promise<void> {
    //     return new Promise<void>((resolve) => {
    //         this.last.getComponent(UIOpacity).opacity = 0;
    //         const comLabel = this.labelNode.getComponent(Label);
    //         comLabel.color = new Color(0, 90, 80, 255);
    //         this.frameSprite.fillRange = 1;
    //         this.timeNode.active = true;
    //         this.timeNode.setScale(new Vec3(0, 0, 1));
    //         tween(this.timeNode).to(0.4, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).start();
    //         tween(this.frameSprite).to(time, { fillRange: 0 }).start();
    //         let timer = time;
    //         comLabel.string = timer.toString();//起始秒數
    //         this.schedule(() => {
    //             timer--;
    //             comLabel.string = timer.toString();
    //             this.labelNode.setScale(new Vec3(1, 1, 1));
    //             this.timeNode.setScale(new Vec3(1, 1, 1));
    //             if (timer <= 5) {
    //                 comLabel.color = new Color(255, 0, 0, 255);
    //                 tween(this.timeNode).to(0.5, { scale: new Vec3(1.1, 1.1, 1) })
    //                     .then(tween(this.timeNode).to(0.5, { scale: new Vec3(1, 1, 1) }))
    //                     .start();
    //                 tween(this.last.getComponent(UIOpacity)).to(0.5, { opacity: 255 })
    //                     .then(tween(this.last.getComponent(UIOpacity)).to(0.5, { opacity: 0 }))
    //                     .start();
    //             }
    //             if (timer === 0) {
    //                 this.timeNode.active = false;
    //                 resolve();
    //             } else {
    //                 tween(this.labelNode).to(0.2, { scale: new Vec3(1.4, 1.4, 1) }, { easing: 'sineOut' })
    //                     .then(tween(this.labelNode).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }))
    //                     .start();
    //             }
    //         }, 1, time - 1, 1)
    //     })
    // }

    //切換時間(目前時間，總時間)
    // public showBetTime(timer: number, totalTime: number) {
    //     const labelNode = this.timeNode.getChildByName('Label');
    //     const comLabel = labelNode.getComponent(Label);
    //     const frameSprite = this.timeNode.getChildByName('Frame').getComponent(Sprite);
    //     comLabel.string = timer.toString();//顯示秒數
    //     if (timer === 0) {
    //         this.timeNode.active = false;
    //         return;
    //     }
    //     labelNode.setScale(new Vec3(1, 1, 1));
    //     const lastUIOpacity = this.timeNode.getChildByName('Last').getComponent(UIOpacity);
    //     lastUIOpacity.opacity = 0;
    //     if (timer <= 5) {
    //         comLabel.color = new Color(0, 90, 80, 255);
    //         tween(this.timeNode).to(0.5, { scale: new Vec3(1.1, 1.1, 1) })
    //             .then(tween(this.timeNode).to(0.5, { scale: new Vec3(1, 1, 1) }))
    //             .start();
    //         tween(lastUIOpacity).to(0.5, { opacity: 255 })
    //             .then(tween(lastUIOpacity).to(0.5, { opacity: 0 }))
    //             .start();
    //     }
    //     else
    //         comLabel.color = new Color(255, 0, 0, 255);

    //     frameSprite.fillRange = timer / totalTime;
    //     if (!this.timeNode.active)
    //         this.timeNode.active = true;
    //     tween(frameSprite).to(1, { fillRange: (timer - 1) / totalTime }).start();//進度條倒數
    //     tween(labelNode).to(0.2, { scale: new Vec3(1.4, 1.4, 1) }, { easing: 'sineOut' })
    //         .then(tween(labelNode).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }))
    //         .start();
    // }
}