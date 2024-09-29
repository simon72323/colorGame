import { Animation, Node, Button, director, UITransform, tween, Label, sp, EventHandler, Toggle } from "cc";

export class CGUtils {
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
                const onAnimationComplete = () => {
                    skeletonComponent.setCompleteListener(null);
                    resolve();
                }
                skeletonComponent.setCompleteListener(onAnimationComplete.bind(this));
            } else
                resolve();
        });
    }

    /**
     * 綁定按鈕事件
     * @param target 事件處裡目標
     * @param component 組件/腳本名稱
     * @param touchNode 觸發節點
     * @param handler 函數名稱
     * @param customData 自定義事件數據?
     */
    public static bindButtonEvent(target: Node, component: string, touchNode: Node, handler: string, customData?: string) {
        const eventHandler = new EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        if (customData) eventHandler.customEventData = customData;
        touchNode.getComponent(Button).clickEvents.push(eventHandler);
    }

    /**
     * 綁定Toggle事件
     * @param target 事件處裡目標
     * @param component 組件/腳本名稱
     * @param touchNode 觸發節點
     * @param handler 函數名稱
     * @param customData 自定義事件數據?
     */
    public static bindToggleEvent(target: Node, component: string, touchNode: Node, handler: string, customData?: string) {
        const eventHandler = new EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        if (customData) eventHandler.customEventData = customData;
        touchNode.getComponent(Toggle).clickEvents.push(eventHandler);
    }

    /**
     * 彈窗顯示
     * @param node 彈窗節點
    */
    public static popupShow(node: Node) {
        node.active = true;
        node.getChildByName('BtnClose').getComponent(Button).interactable = true;
        node.getComponent(Animation).play('PopupShow');
    }

    /**
     * 彈窗隱藏
     * @param node 彈窗節點
    */
    public static popupHide(node: Node) {
        node.getChildByName('BtnClose').getComponent(Button).interactable = false;
        node.getComponent(Animation).play('PopupHide');
        setTimeout(() => {
            node.active = false;
        }, 200)
    }

    public static get parent(): { Site: 'XC' | '' } {
        const Site = parent['Site'] || "";
        return { Site };
    }
}