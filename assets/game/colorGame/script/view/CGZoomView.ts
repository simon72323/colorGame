import { _decorator, Component, Node, Vec3, tween, Tween, Button, EventHandler } from 'cc';
import { CGUtils } from '../tools/CGUtils';
const { ccclass, property } = _decorator;

@ccclass('CGZoomView')
export class CGZoomView extends Component {
    //攝影機位置，依次為：正、上、下、左、右
    private readonly cameraPos: Vec3[] = [
        new Vec3(0, 10.5, 14),
        new Vec3(0, 16.3, 9.8),
        new Vec3(0, -0.18, 12),
        new Vec3(-9.8, 7.3, 9),
        new Vec3(9.8, 7.3, 9),
    ]
    //攝影機角度，依次為：正、上、下、左、右
    private readonly cameraEuler: Vec3[] = [
        new Vec3(-20, 0, 0),
        new Vec3(-45, 0, 0),
        new Vec3(20, 0, 0),
        new Vec3(-10, -40, 10),
        new Vec3(-10, 40, -10),
    ]
    @property(Node)
    private btnZoom!: Node;//zoom按鈕
    @property(Node)
    private zoomPopup!: Node;//zoom視窗
    @property(Node)
    private btnClose!: Node;//關閉彈窗按鈕
    @property(Node)
    private zoomCamera!: Node;//zoom攝影機
    @property(Node)
    private btnOn!: Node;//zoom按鈕顯示
    
    private isOpen = false;//記錄使否開啟狀態

    /**
     * 組件加載時初始化
     * 設置縮放按鈕和彈窗的事件監聽器
     */
    protected onLoad(): void {
        const scriptName = this.name.match(/<(.+)>/)?.[1] || '';

        //顯示彈窗按鈕設置
        const openEventHandler = new EventHandler();
        openEventHandler.target = this.node;
        openEventHandler.component = scriptName;
        openEventHandler.handler = 'zoomPopupShow';
        this.btnZoom.getComponent(Button).clickEvents.push(openEventHandler);

        //關閉彈窗按鈕設置
        const closeEventHandler = new EventHandler();
        closeEventHandler.target = this.node;
        closeEventHandler.component = scriptName;
        closeEventHandler.handler = 'zoomPopupHide';
        this.btnClose.getComponent(Button).clickEvents.push(closeEventHandler);
    }

    /**
     * zoom彈窗顯示
     */
    private zoomPopupShow() {
        this.isOpen = true;
        this.zoomCamera.setPosition(this.cameraPos[0]);
        this.zoomCamera.setRotationFromEuler(this.cameraEuler[0]);
        this.hideBtn();
        this.btnZoom.active = false;
        CGUtils.popupShow(this.zoomPopup);
        const zoomIDs = [1, 2, 3, 4, 0];
        let tweenSequence = tween(this.zoomCamera);
        zoomIDs.forEach(zoomID => {
            tweenSequence = tweenSequence.delay(1).call(() => this.zoomRun(zoomID));
        });
        tweenSequence.start();
    }

    /**
     * 執行視角轉換
     * @param zoomID 視角ID，依次為：正、上、下、左、右(0~4)
     */
    private zoomRun(zoomID: number) {
        this.hideBtn();
        if (zoomID > 0)
            this.btnOn.children[zoomID - 1].active = true;
        tween(this.zoomCamera).to(0.2, { position: this.cameraPos[zoomID], eulerAngles: this.cameraEuler[zoomID] }, { easing: 'sineOut' }).start();
    }

    /**
     * 開獎中隱藏狀態
     * @controller
     */
    public zoomHideing() {
        this.btnZoom.active = false;
        this.zoomPopup.active = false;
    }

    /**
     * 下注中顯示狀態
     * @controller
     */
    public zoomShowing() {
        this.btnZoom.active = !this.isOpen;
        this.zoomPopup.active = this.isOpen;
    }

    /**
     * 視角改變
     * @param event 事件對象
     * @param zoomID 視角ID
     */
    private zoomChange(event: Event, zoomID: string) {
        Tween.stopAllByTarget(this.zoomCamera);
        this.zoomRun(parseInt(zoomID));
    }

    /**
     * 隱藏控制按鈕
     */
    private hideBtn() {
        for (const child of this.btnOn.children) {
            child.active = false;
        }
    }

    /**
     * zoom彈窗隱藏
     */
    private zoomPopupHide() {
        this.isOpen = false;
        CGUtils.popupHide(this.zoomPopup);
        setTimeout(() => {
            Tween.stopAllByTarget(this.zoomCamera);
            this.btnZoom.active = true;
        }, 200)
    }
}