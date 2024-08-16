import { _decorator, Component, Node, Animation, Vec3, Button, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupUIControl')
export class PopupUIControl extends Component {
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
    @property({ type: [Node], tooltip: "zoom按鈕顯示" })
    private btnOn: Node[] = [];

    onLoad() {

    }

    public zoomPopupShow() {
        this.zoomCamera.setPosition(this.cameraPos[0]);
        this.zoomCamera.setRotationFromEuler(this.cameraEuler[0]);
        this.hideBtn();
        this.btnZoom.active = false;
        this.zoomPopup.active = true;
        this.zoomPopup.getComponent(Animation).play('PopupShow');
        tween(this.zoomCamera).delay(1).call(() => {
            this.zoomRun(1);
        }).delay(1).call(() => {
            this.zoomRun(2);
        }).delay(1).call(() => {
            this.zoomRun(3);
        }).delay(1).call(() => {
            this.zoomRun(4);
        }).delay(1).call(() => {
            this.zoomRun(0);
        }).start();
    }

    public zoomChange(event: Event, zoomID: number) {
        Tween.stopAllByTarget(this.zoomCamera);
        this.zoomRun(zoomID);
    }

    private zoomRun(zoomID: number) {
        this.hideBtn();
        if (zoomID > 0)
            this.btnOn[zoomID - 1].active = true;
        tween(this.zoomCamera).to(0.2, { position: this.cameraPos[zoomID], eulerAngles: this.cameraEuler[zoomID] }, { easing: 'sineOut' }).start();
    }

    private hideBtn() {
        for (let i = 0; i < this.btnOn.length; i++) {
            this.btnOn[i].active = false;
        }
    }

    public zoomClose() {
        this.zoomPopup.getChildByName('BtnClose').getComponent(Button).interactable = false;
        this.zoomPopup.getComponent(Animation).play('PopupHide');
        setTimeout(() => {
            this.zoomPopup.active = false;
            this.btnZoom.active = true;
        }, 200)
    }
}


