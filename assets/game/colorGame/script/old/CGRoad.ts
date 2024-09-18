// import { _decorator, Component, Node, Label, Sprite, Button, Animation } from 'cc';
// import { CGModel } from './CGModel';
// import { CGResource } from './CGResource';
// const { ccclass, property } = _decorator;

// @ccclass('CGRoad')
// export class CGRoad extends Component {
//     @property({ type: CGModel, tooltip: "遊戲資料腳本" })
//     private gameData: CGModel = null;
//     @property({ type: CGResource, tooltip: "遊戲資源腳本" })
//     private gameResource: CGResource = null;

//     @property({ type: Node, tooltip: "走勢" })
//     private roadMap: Node = null;
//     @property({ type: Node, tooltip: "走勢彈窗" })
//     private roadMapPopup: Node = null;

//     //更新路紙
//     public updateRoadMap(winNumber?: number[]) {
//         const colorPer = this.gameData.roundInfo.roadColorPers;//獲得前100局顏色比例
//         const colorMap = this.roadMap.getChildByName('ColorMap');
//         const popupColorMap = this.roadMapPopup.getChildByName('ColorMap');
//         for (let i = 0; i < 6; i++) {
//             colorMap.children[i].getComponent(Label).string = colorPer[i].toFixed(2) + '%';
//             popupColorMap.children[i].getComponent(Label).string = colorPer[i].toFixed(2) + '\n%';

//         }
//         for (let i = 0; i < 3; i++) {
//             this.roadMap.getChildByName('LastColor').children[i].getComponent(Sprite).spriteFrame =
//                 this.gameResource.roadColorSF[this.gameData.roundInfo.roadColors[0][i]];
//         }
//         for (let i = 0; i < 10; i++) {
//             for (let j = 0; j < 3; j++) {
//                 this.roadMapPopup.getChildByName('LastColor').children[i].children[j].getComponent(Sprite).spriteFrame =
//                     this.gameResource.roadColorSF[this.gameData.roundInfo.roadColors[i][j]];
//             }
//         }

//         //判斷冷熱數值
//         const roadHot = colorMap.getChildByName('Hot');
//         const popupRoadHot = popupColorMap.getChildByName('Hot');
//         const roadFreeze = colorMap.getChildByName('Freeze');
//         const popupRoadFreeze = popupColorMap.getChildByName('Freeze');
//         //判斷熱值
//         let maxVal = colorPer[0];
//         colorPer.forEach((value) => {
//             if (value > maxVal)
//                 maxVal = value;
//         });
//         let maxIndex: number[] = [];
//         colorPer.forEach((value, index) => {
//             if (value === maxVal)
//                 maxIndex.push(index);
//         })
//         if (maxIndex.length > 1) {
//             roadHot.active = false;
//             popupRoadHot.active = false;
//         } else {
//             roadHot.active = true;
//             roadHot.setPosition(colorMap.children[maxIndex[0]].getPosition());
//             popupRoadHot.active = true;
//             popupRoadHot.setPosition(popupColorMap.children[maxIndex[0]].getPosition());
//         }
//         //判斷冷值
//         let minVal = colorPer[0];
//         colorPer.forEach((value) => {
//             if (value < minVal)
//                 minVal = value;
//         });
//         let minIndex: number[] = [];
//         colorPer.forEach((value, index) => {
//             if (value === minVal)
//                 minIndex.push(index);
//         })
//         if (minIndex.length > 1) {
//             roadFreeze.active = false;
//             popupRoadFreeze.active = false;
//         } else {
//             roadFreeze.active = true;
//             roadFreeze.setPosition(colorMap.children[minIndex[0]].getPosition());
//             popupRoadFreeze.active = true;
//             popupRoadFreeze.setPosition(popupColorMap.children[minIndex[0]].getPosition());
//         }
//     }

//     public roadMapPopupShow() {
//         this.roadMapPopup.active = true;
//         this.roadMap.getComponent(Button).interactable = false;
//         this.roadMapPopup.getChildByName('BtnClose').getComponent(Button).interactable = true;
//         this.roadMapPopup.getComponent(Animation).play('PopupShow');
//     }

//     public roadMapPopupHide() {
//         this.roadMapPopup.getChildByName('BtnClose').getComponent(Button).interactable = false;
//         this.roadMapPopup.getComponent(Animation).play('PopupHide');
//         setTimeout(() => {
//             this.roadMapPopup.active = false;
//             this.roadMap.getComponent(Button).interactable = true;
//         }, 200)
//     }
// }