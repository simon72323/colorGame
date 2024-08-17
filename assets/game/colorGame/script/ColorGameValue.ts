import { _decorator, Component, Node, Animation, Vec3, Button, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ColorGameValue')
export class ColorGameValue extends Component {

    public betScoreRange: number[] = [10, 20, 50, 100, 200];


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

}


