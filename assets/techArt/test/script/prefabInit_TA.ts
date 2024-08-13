import { _decorator, Color, Component, sp, UIOpacity, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('prefabInit_TA')
export class prefabInit_TA extends Component {
    @property({ type: [Node], tooltip: "事先隱藏的物件" })
    public nodeHide: Node[] = []!;
    @property({ type: [sp.Skeleton], tooltip: "spine透明度初始化" })
    public spineColorHide: sp.Skeleton[] = []!;

    init() {
        this.node.getComponent(UIOpacity).opacity = 0;
        for (let i = 0; i < this.spineColorHide.length; i++) {
            this.spineColorHide[i].color = new Color(0, 0, 0, 0);
        }
        for (let i = 0; i < this.nodeHide.length; i++) {
            this.nodeHide[i].active = false;
        }
    }
}