import { _decorator, Component, Node, Vec3, tween, Tween } from 'cc';
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
    @property([Node])
    private btnChange: Node[] = [];//change按鈕(上下左右，1~4)

    private isOpen = false;//記錄使否開啟狀態

    /**
     * 設置按鈕事件監聽器
     */
    protected onLoad(): void {
        this.bindButtonEvent(this.btnZoom, 'zoomPopupShow');//顯示彈窗按鈕設置
        this.bindButtonEvent(this.btnClose, 'zoomPopupHide');//關閉彈窗按鈕設置
        for (let i = 0; i < this.btnChange.length; i++) {
            this.bindButtonEvent(this.btnChange[i], 'zoomChange', (i + 1).toString());//視角改變按鈕設置
        }
    }

    /**
     * 按鈕事件設置
     * @param touchNode 觸發節點 
     * @param handler 函數名稱
     * @param customData 自定義事件數據?
     */
    private bindButtonEvent(touchNode: Node, handler: string, customData?: string) {
        const componentName = this.name.match(/<(.+)>/)?.[1] || '';
        CGUtils.bindButtonEvent(this.node, componentName, touchNode, handler, customData);
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