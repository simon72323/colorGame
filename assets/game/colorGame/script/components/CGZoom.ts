import { _decorator, Component, Node, Vec3, tween, Tween } from 'cc';
import { CGUtils } from '../utils/CGUtils';
const { ccclass, property } = _decorator;

@ccclass('CGZoom')
export class CGZoom extends Component {
    private cameraPos: Vec3[] = [
        new Vec3(0, 10.5, 14),
        new Vec3(0, 16.3, 9.8),
        new Vec3(0, -0.18, 12),
        new Vec3(-9.8, 7.3, 9),
        new Vec3(9.8, 7.3, 9),
    ]

    private cameraEuler: Vec3[] = [
        new Vec3(-20, 0, 0),
        new Vec3(-45, 0, 0),
        new Vec3(20, 0, 0),
        new Vec3(-10, -40, 10),
        new Vec3(-10, 40, -10),
    ]
    @property({ type: Node, tooltip: "zoom按鈕" })
    private btnZoom: Node = null;
    @property({ type: Node, tooltip: "zoom視窗" })
    private zoomPopup: Node = null;
    @property({ type: Node, tooltip: "zoom攝影機" })
    private zoomCamera: Node = null;
    @property({ type: Node, tooltip: "zoom按鈕顯示" })
    private btnOn: Node = null;
    private openBool: boolean = false;

    
    //ZOOM顯示(按鈕節點觸發)
    public zoomPopupShow() {
        this.openBool = true;
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

    //執行視角轉換
    private zoomRun(zoomID: number) {
        this.hideBtn();
        if (zoomID > 0)
            this.btnOn.children[zoomID - 1].active = true;
        tween(this.zoomCamera).to(0.2, { position: this.cameraPos[zoomID], eulerAngles: this.cameraEuler[zoomID] }, { easing: 'sineOut' }).start();
    }

    //開獎中隱藏狀態
    public zoomHideing() {
        this.btnZoom.active = false;
        this.zoomPopup.active = false;
    }

    //下注中顯示狀態
    public zoomShowing() {
        this.btnZoom.active = !this.openBool;
        this.zoomPopup.active = this.openBool;
    }

    //視角改變(按鈕節點觸發)
    public zoomChange(event: Event, zoomID: string) {
        Tween.stopAllByTarget(this.zoomCamera);
        this.zoomRun(parseInt(zoomID));
    }

    //隱藏控制按鈕
    private hideBtn() {
        for (let i = 0; i < this.btnOn.children.length; i++) {
            this.btnOn.children[i].active = false;
        }
    }
    //ZOOM隱藏
    public zoomHide() {
        this.openBool = false;
        CGUtils.popupHide(this.zoomPopup);
        setTimeout(() => {
            Tween.stopAllByTarget(this.zoomCamera);
            this.btnZoom.active = true;
        }, 200)
    }
}