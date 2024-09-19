import { Animation, Node, UITransform, director, sp, tween, Label } from "cc";
import { PlayAnimOnEnable } from "../anim/PlayAnimOnEnable";

export class UtilsKitS {
    /**
     * 延遲事件
     * @param duration 單位：秒
    */
    public static Delay(duration: number = 0): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // setTimeout(() => resolve(), duration * 1000);
            let scene = director.getScene();
            let rootNode: Node = scene.children[0];
            if (!rootNode.getComponent(UITransform))
                rootNode.addComponent(UITransform)
            // this.scheduleOnce(() => resolve(), duration);
            rootNode.getComponent(UITransform).scheduleOnce(() => resolve(), duration);
        });
    }
    static scheduleOnce(arg0: () => void, duration: number) {
        throw new Error("Method not implemented.");
    }

    // /**
    //  * 延遲事件(藉由 cocos api "scheduleOnce")
    //  * @param duration 單位：毫秒
    // */
    // public static DeferByScheduleOnce(duration: number = 0): Promise<void> {
    //     return new Promise<void>((resolve, reject) => {
    //         let scene = director.getScene();
    //         let rootNode: Node = scene.children[0];
    //         rootNode.getComponent(UITransform).scheduleOnce(() => resolve(), duration / 1000);
    //     });
    // }

    // /**
    //  * 播放動畫
    //  * @param node 持有動畫 Component 的 Node
    //  * @param animationName 動畫名稱(如果沒給即為預設動畫)
    //  * @param awaitFINISHED 是否監聽 FINISHED 事件
    //  * @returns 
    //  */
    // public static PlayAnimation(node: Node, animationName?: string, awaitFINISHED?: boolean): Promise<void> {
    //     return new Promise<void>((resolve, reject) => {
    //         const animationComponent: Animation = node.getComponent(Animation);
    //         if (node.getComponent(PlayAnimOnEnable)) {
    //             if (node.active) {
    //                 node.active = false;
    //             }
    //             node.active = true;
    //         } else {
    //             animationComponent.play(animationName);
    //         }

    //         if (awaitFINISHED) {
    //             const onAnimationFinished = () => {
    //                 animationComponent.off(Animation.EventType.FINISHED, onAnimationFinished.bind(this));
    //                 animationComponent.stop();
    //                 resolve();
    //             }
    //             animationComponent.on(Animation.EventType.FINISHED, onAnimationFinished.bind(this));
    //         } else {
    //             resolve();
    //         }
    //     });
    // }



    /**
     * 播放 Skeleton 動畫
     * @param node 持有 Skeleton Component 的 Node
     * @param trackIndex 動畫通道索引
     * @param animationName 動畫名稱
     * @param loop 是否循環
     * @param awaitFINISHED 是否等待 Complete
     * @returns 
     */
    public static SetSkeletonAnimation(node: Node, trackIndex: number, animationName: string, loop?: boolean, awaitComplete?: boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const skeletonComponent: sp.Skeleton = node.getComponent(sp.Skeleton);

            skeletonComponent.setAnimation(trackIndex, animationName, loop);

            if (awaitComplete) {
                const onAnimationComplete = (trackEntry, loopCount) => {
                    skeletonComponent.setCompleteListener(null);
                    resolve();
                }
                skeletonComponent.setCompleteListener(onAnimationComplete.bind(this));
            } else {
                resolve();
            }
        });
    }

    /**
     * 規格化數值
     * @param num 數值
     * @returns 
     */
    public static NumDigits(num: number): string {
        return num.toLocaleString('zh', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
    }

    /**
    * 跑分
    * @param runTime 跑分時間
    * @param endCredit 最終分數
    * @param label 分數節點(Label)
    * @returns 
    */
    public static runCredit(runTime: number, endCredit: number, label: Label) {
        const runCredit = { Credit: Number(label.string.replace(/,/gi, '')) };//設置起始分
        tween(runCredit).to(runTime, { Credit: endCredit }, {
            onUpdate: () => {
                label.string = this.NumDigits(runCredit.Credit);//更新分數
            }
        }).call(() => {
            label.string = this.NumDigits(endCredit);//更新分數
        }).start();
    }

    /**
     * 播放動畫
     * @param node 持有動畫 Component 的 Node
     * @param animationName 動畫名稱(如果沒給即為預設動畫)
     * @returns 
     */
    public static PlayAnim(node: Node, animationName: string): Promise<void> {
        return new Promise((resolve) => {
            const animationComponent: Animation = node.getComponent(Animation);
            animationComponent.play(animationName);
            animationComponent.on(Animation.EventType.FINISHED, () => {
                animationComponent.stop();
                animationComponent.off(Animation.EventType.FINISHED);
                resolve();
            });
        })
    }

    // /**
    //  * 縮短數字字串
    //  * @param value 
    //  * @returns {string}
    //  */
    // public static FormatNumber(value: number): string {
    //     let output = '';
    //     let suffix: string = ''
    //     if (value >= 1000000) {
    //         suffix = "M";
    //         value /= 1000000
    //         // value = Math.floor(value * 100) / 100;
    //         // output = (value / 1000).toLocaleString('zh', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + suffix;
    //     } else if (value >= 1000) {
    //         suffix = "K";
    //         value /= 1000
    //         // value = Math.floor(value * 100) / 100;
    //     }
    //     output = value.toLocaleString('zh', { maximumFractionDigits: 2, minimumFractionDigits: 0 }) + suffix;
    //     return output;
    // }
    
    public static get parent(): { Site: 'XC' | '' } {
        const Site = parent['Site'] || "";

        return { Site };

    }
}