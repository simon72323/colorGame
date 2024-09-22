import { _decorator, Component, Node, Label, Sprite, SpriteFrame, EventHandler, Button } from 'cc';
import { CGUtils } from '../tools/CGUtils';
const { ccclass, property } = _decorator;

@ccclass('CGRoadView')
export class CGRoadView extends Component {
    @property({ type: Node, tooltip: "走勢" })
    private roadMap!: Node;
    @property({ type: Node, tooltip: "走勢彈窗" })
    private roadMapPopup!: Node;
    @property({ type: Node, tooltip: "關閉彈窗按鈕" })
    private btnClose!: Node;
    @property({ type: [SpriteFrame], tooltip: "路紙區骰子顏色" })
    public roadColorSF!: SpriteFrame[];

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
        openEventHandler.handler = 'roadMapPopupShow';
        this.roadMap.getComponent(Button).clickEvents.push(openEventHandler);

        //關閉彈窗按鈕設置
        const closeEventHandler = new EventHandler();
        closeEventHandler.target = this.node;
        closeEventHandler.component = scriptName;
        closeEventHandler.handler = 'roadMapPopupHide';
        this.btnClose.getComponent(Button).clickEvents.push(closeEventHandler);
    }

    /**
     * 更新路紙
     * @contorller
     * @param roadMap 前10局路紙[[顏色], [顏色], ...]
     * @param roadMapPer 前100局各顏色百分比
     */
    public updateRoadMap(roadMap: number[][], roadMapPer: number[]) {
        const colorMap = this.roadMap.getChildByName('ColorMap');
        const popupColorMap = this.roadMapPopup.getChildByName('ColorMap');
        for (let i = 0; i < 6; i++) {
            const percentage = roadMapPer[i].toFixed(2);
            colorMap.children[i].getComponent(Label).string = `${percentage}%`;
            popupColorMap.children[i].getComponent(Label).string = `${percentage}\n%`;
        }
        this.updateLastColors(roadMap);// 更新上局顏色
        this.updateHotColdValues(roadMapPer, colorMap, popupColorMap);// 更新冷熱值
    }

    /**
     * 更新路紙，上局顏色
     * @param roadMap 前10局路紙[[顏色], [顏色], ...]
     */
    private updateLastColors(roadMap: number[][]) {
        const lastColor = this.roadMap.getChildByName('LastColor');
        const popupLastColor = this.roadMapPopup.getChildByName('LastColor');
        for (let i = 0; i < 3; i++) {
            lastColor.children[i].getComponent(Sprite).spriteFrame = this.roadColorSF[roadMap[0][i]];
        }
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 3; j++) {
                const sprite = popupLastColor.children[i].children[j].getComponent(Sprite);
                sprite.spriteFrame = this.roadColorSF[roadMap[i][j]];
            }
        }
    }

    /**
     * 更新路紙，冷熱值
     * @param roadMapPer 前100局各顏色百分比
     * @param colorMap 顏色路紙節點
     * @param popupColorMap 彈窗顏色路紙節點
     */
    private updateHotColdValues(roadMapPer: number[], colorMap: Node, popupColorMap: Node) {
        const updateElement = (type: 'Hot' | 'Freeze') => {
            const value = type === 'Hot' ? Math.max(...roadMapPer) : Math.min(...roadMapPer);
            const index = roadMapPer.indexOf(value);
            [colorMap, popupColorMap].forEach(node => {
                const element = node.getChildByName(type);
                element.active = roadMapPer.lastIndexOf(value) === index;
                if (element.active)
                    element.setPosition(node.children[index].getPosition());
            });
        };
        updateElement('Hot');//更新熱值
        updateElement('Freeze');//更新冷值
    }

    /**
     * 路紙視窗顯示
     */
    private roadMapPopupShow() {
        CGUtils.popupShow(this.roadMapPopup);
    }

    /**
     * 路紙視窗關閉
     */
    private roadMapPopupHide() {
        CGUtils.popupHide(this.roadMapPopup);
    }
}