import { Animation, Node, UITransform, director, sp } from "cc";
import { PlayAnimOnEnable } from "../anim/PlayAnimOnEnable";

export class UtilsKit_Simon {
    /**
     * 延遲事件
     * @param duration 單位：毫秒
    */
    public static Defer(duration: number = 0): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => resolve(), duration);
        });
    }

    /**
     * 延遲事件(藉由 cocos api "scheduleOnce")
     * @param duration 單位：毫秒
    */
    public static DeferByScheduleOnce(duration: number = 0): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let scene = director.getScene();
            let rootNode: Node = scene.children[0];
            rootNode.getComponent(UITransform).scheduleOnce(() => resolve(), duration / 1000);
        });
    }

    /**
     * 播放動畫
     * @param node 持有動畫 Component 的 Node
     * @param animationName 動畫名稱(如果沒給即為預設動畫)
     * @param awaitFINISHED 是否監聽 FINISHED 事件
     * @returns 
     */
    public static PlayAnimation(node: Node, animationName?: string, awaitFINISHED?: boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const animationComponent: Animation = node.getComponent(Animation);
            console.log("PlayAnimation_1")
            if (node.getComponent(PlayAnimOnEnable)) {
                if (node.active) {
                    node.active = false;
                }
                node.active = true;
            } else {
                animationComponent.play(animationName);
            }

            if (awaitFINISHED) {
                const onAnimationFinished = () => {
                    animationComponent.off(Animation.EventType.FINISHED, onAnimationFinished.bind(this));
                    animationComponent.stop();
                    resolve();
                }
                animationComponent.on(Animation.EventType.FINISHED, onAnimationFinished.bind(this));
            } else {
                console.log("PlayAnimation_resolve")
                resolve();
            }
        });
    }

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
     * 規格化數值(取小數點後2位)
     * @param num 數值
     * @returns 
     */
    public static NumberSpecification(num: number): string {
        return num.toLocaleString('zh', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    }
    /**
     * 縮短數字字串
     * @param value 
     * @returns {string}
     */
    public static FormatNumber(value: number): string {
        let output = '';
        let suffix: string = ''
        if (value >= 1000000) {
            suffix = "M";
            value /= 1000000
            // output = (value / 1000).toLocaleString('zh', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + suffix;
        } else if (value >= 1000) {
            suffix = "K";
            value /= 1000
        }
        output = value.toLocaleString('zh', { maximumFractionDigits: 2, minimumFractionDigits: 0 }) + suffix;
        return output;
    }
    public static get parent(): { Site: 'XC' | '' } {
        const Site = parent['Site'] || "";

        return { Site };

    }
}