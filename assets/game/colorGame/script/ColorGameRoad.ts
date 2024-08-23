import { _decorator, Component, find, Node, Label, Sprite, Button, Animation, color } from 'cc';
import { ColorGameData } from './ColorGameData';
import { ColorGameResource } from './ColorGameResource';
const { ccclass, property } = _decorator;

@ccclass('ColorGameRoad')
export class ColorGameRoad extends Component {
    private gameData: ColorGameData = null;
    private gameResource: ColorGameResource = null;

    @property({ type: Node, tooltip: "走勢" })
    private roadMap: Node = null;
    @property({ type: Node, tooltip: "走勢彈窗" })
    private roadMapPopup: Node = null;

    onLoad() {
        this.gameData = find('Canvas/Scripts/ColorGameData').getComponent(ColorGameData);
        this.gameResource = find('Canvas/Scripts/ColorGameResource').getComponent(ColorGameResource);
    }

    //更新走勢
    public updataRoadMap() {
        const colorPer = this.gameData.getColorPer();//獲得前100局顏色比例
        const colorMap = this.roadMap.getChildByName('ColorMap');
        const popupColorMap = this.roadMapPopup.getChildByName('ColorMap');
        for (let i = 0; i < 6; i++) {
            colorMap.children[i].getComponent(Label).string = colorPer[i].toFixed(2) + '%';
            popupColorMap.children[i].getComponent(Label).string = colorPer[i].toFixed(2) + '\n%';

        }
        for (let i = 0; i < 3; i++) {
            this.roadMap.getChildByName('LastColor').children[i].getComponent(Sprite).spriteFrame =
                this.gameResource.roadColorSpriteFrame[this.gameData.colorRoad[0][i]];
        }
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 3; j++) {
                this.roadMapPopup.getChildByName('LastColor').children[i].children[j].getComponent(Sprite).spriteFrame =
                    this.gameResource.roadColorSpriteFrame[this.gameData.colorRoad[i][j]];
            }
        }

        //判斷冷熱數值
        const roadHot = colorMap.getChildByName('Hot');
        const popupRoadHot = popupColorMap.getChildByName('Hot');
        const roadFreeze = colorMap.getChildByName('Freeze');
        const popupRoadFreeze = popupColorMap.getChildByName('Freeze');
        //判斷熱值
        let maxVal = colorPer[0];
        colorPer.forEach((value) => {
            if (value > maxVal)
                maxVal = value;
        });
        let maxIndex: number[] = [];
        colorPer.forEach((value, index) => {
            if (value === maxVal)
                maxIndex.push(index);
        })
        if (maxIndex.length > 1) {
            roadHot.active = false;
            popupRoadHot.active = false;
        } else {
            roadHot.active = true;
            roadHot.setPosition(colorMap.children[maxIndex[0]].getPosition());
            popupRoadHot.active = true;
            popupRoadHot.setPosition(popupColorMap.children[maxIndex[0]].getPosition());
        }
        //判斷冷值
        let minVal = colorPer[0];
        colorPer.forEach((value) => {
            if (value < minVal)
                minVal = value;
        });
        let minIndex: number[] = [];
        colorPer.forEach((value, index) => {
            if (value === minVal)
                minIndex.push(index);
        })
        if (minIndex.length > 1) {
            roadFreeze.active = false;
            popupRoadFreeze.active = false;
        } else {
            roadFreeze.active = true;
            roadFreeze.setPosition(colorMap.children[minIndex[0]].getPosition());
            popupRoadFreeze.active = true;
            popupRoadFreeze.setPosition(popupColorMap.children[minIndex[0]].getPosition());
        }
    }

    public roadMapPopupShow() {
        this.roadMapPopup.active = true;
        this.roadMap.getComponent(Button).interactable = false;
        this.roadMapPopup.getChildByName('BtnClose').getComponent(Button).interactable = true;
        this.roadMapPopup.getComponent(Animation).play('PopupShow');
    }

    public roadMapPopupHide() {
        this.roadMapPopup.getChildByName('BtnClose').getComponent(Button).interactable = false;
        this.roadMapPopup.getComponent(Animation).play('PopupHide');
        setTimeout(() => {
            this.roadMapPopup.active = false;
            this.roadMap.getComponent(Button).interactable = true;
        }, 200)
    }
}