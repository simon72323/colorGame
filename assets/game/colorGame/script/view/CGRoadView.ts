import { _decorator, Component, Node, Label, Sprite, SpriteFrame } from 'cc';
import { CGUtils } from '../tools/CGUtils';
import { AudioName, CGAudioManager } from '../manager/CGAudioManager';
const { ccclass, property } = _decorator;

@ccclass('CGRoadView')
export class CGRoadView extends Component {
    @property(Node)//走勢
    private roadMap!: Node;
    @property(Node)//走勢彈窗
    private roadMapPopup!: Node;
    @property(Node)//關閉彈窗按鈕
    private btnClose!: Node;
    @property([SpriteFrame])//路子區骰子顏色
    private roadColorSF!: SpriteFrame[];
    @property(CGAudioManager)
    public audioManager: CGAudioManager = null;

    /**
     * 設置按鈕事件監聽器
     */
    protected onLoad(): void {
        this.bindButtonEvent(this.roadMap, 'roadMapPopupShow'); //顯示彈窗按鈕設置
        this.bindButtonEvent(this.btnClose, 'roadMapPopupHide'); //關閉彈窗按鈕設置

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
     * 更新路子
     * @contorller
     * @param roadMap 前100局路子[[顏色], [顏色], ...]
     */
    public updateRoadMap(roadMap: number[][]) {
        const colorMap = this.roadMap.getChildByName('ColorMap');
        const popupColorMap = this.roadMapPopup.getChildByName('ColorMap');
        let roadMapPer: number[] = [0, 0, 0, 0, 0, 0];
        let totalCount: number = 0;
        // 計算每個顏色的出現次數和總次數
        for (let i = 0; i < roadMap.length; i++) {
            const row = roadMap[i];
            for (let j = 0; j < row.length; j++) {
                roadMapPer[row[j]]++;
                totalCount++;
            }
        }
        for (let i = 0; i < roadMapPer.length; i++) {
            const percentage = (roadMapPer[i] / totalCount * 100).toFixed(2);
            colorMap.children[i].getComponent(Label).string = `${percentage}%`;
            popupColorMap.children[i].getComponent(Label).string = `${percentage}\n%`;
        }
        this.updateLastColors(roadMap);// 更新上局顏色
        this.updateHotColdValues(roadMapPer, colorMap, popupColorMap);// 更新冷熱值
    }

    /**
     * 更新路子，上局顏色
     * @param roadMap 前100局路子[[顏色], [顏色], ...]
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
     * 更新路子，冷熱值
     * @param roadMapPer 前100局各顏色百分比
     * @param colorMap 顏色路子節點
     * @param popupColorMap 彈窗顏色路子節點
     */
    private updateHotColdValues(roadMapPer: number[], colorMap: Node, popupColorMap: Node) {
        const updateElement = (type: 'Hot' | 'Freeze') => {
            const value = type === 'Hot' ? Math.max(...roadMapPer) : Math.min(...roadMapPer);
            const index = roadMapPer.indexOf(value);
            [colorMap, popupColorMap].forEach(node => {
                const element = node.getChildByName(type);
                element.active = roadMapPer.lastIndexOf(value) === index;
                element.active && element.setPosition(node.children[index].getPosition());
            });
        };
        updateElement('Hot');//更新熱值
        updateElement('Freeze');//更新冷值
    }

    /**
     * 路子視窗顯示
     */
    private roadMapPopupShow() {
        this.audioManager.playOnceAudio(AudioName.BtnOpen);
        CGUtils.popupShow(this.roadMapPopup);
    }

    /**
     * 路子視窗關閉
     */
    private roadMapPopupHide() {
        this.audioManager.playOnceAudio(AudioName.BtnClose);
        CGUtils.popupHide(this.roadMapPopup);
    }
}