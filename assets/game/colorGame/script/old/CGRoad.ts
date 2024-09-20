// import { _decorator, Component, Node, Label, Sprite, Button, Animation, SpriteFrame } from 'cc';
// import { CGUtils } from '../utils/CGUtils';
// import { CGGameManager } from './CGGameManager';
// const { ccclass, property } = _decorator;

// @ccclass('CGRoad')
// export class CGRoad extends Component {
//     @property({ type: Node, tooltip: "走勢" })
//     private roadMap: Node = null;
//     @property({ type: Node, tooltip: "走勢彈窗" })
//     private roadMapPopup: Node = null;
//     @property({ type: [SpriteFrame], tooltip: "路紙區骰子顏色" })
//     public roadColorSF: SpriteFrame[] = [];

//     private gameManager: CGGameManager = null;

//     public init(gameManager: CGGameManager) {
//         this.gameManager = main;
//     }
//     //更新路紙
//     public updateRoadMap(data: any, winColor?: number[]) {
//         const colorPer = data.roadColorPers;//獲得前100局顏色比例
//         const colorMap = this.roadMap.getChildByName('ColorMap');
//         const popupColorMap = this.roadMapPopup.getChildByName('ColorMap');
//         for (let i = 0; i < 6; i++) {
//             const percentage = colorPer[i].toFixed(2);
//             colorMap.children[i].getComponent(Label).string = percentage + '%';
//             popupColorMap.children[i].getComponent(Label).string = percentage + '\n%';
//         }
//         this.updateLastColors(data.roadColors);// 更新上局顏色
//         this.updateHotColdValues(colorPer, colorMap, popupColorMap);// 更新冷熱值
//     }

//     // 更新路紙，上局顏色
//     private updateLastColors(roadColors: number[][]) {
//         const lastColor = this.roadMap.getChildByName('LastColor');
//         const popupLastColor = this.roadMapPopup.getChildByName('LastColor');
//         for (let i = 0; i < 3; i++) {
//             lastColor.children[i].getComponent(Sprite).spriteFrame = this.roadColorSF[roadColors[0][i]];
//         }
//         for (let i = 0; i < 10; i++) {
//             for (let j = 0; j < 3; j++) {
//                 popupLastColor.children[i].children[j].getComponent(Sprite).spriteFrame = this.roadColorSF[roadColors[i][j]];
//             }
//         }
//     }

//     //更新路紙，冷熱值
//     private updateHotColdValues(colorPer: number[], colorMap: Node, popupColorMap: Node) {
//         const updateElement = (type: 'Hot' | 'Freeze') => {
//             const isHot = type === 'Hot';
//             const perValue = isHot ? Math.max(...colorPer) : Math.min(...colorPer);
//             const indices = colorPer.flatMap((value, index) => value === perValue ? index : []);//冷熱數值內容

//             [colorMap, popupColorMap].forEach(node => {
//                 const element = node.getChildByName(type);
//                 if (indices.length === 1) {
//                     element.active = true;
//                     element.setPosition(node.children[indices[0]].getPosition());
//                 } else {
//                     element.active = false;//代表有相同的冷/熱值
//                 }
//             });
//         };
//         updateElement('Hot');//更新熱值
//         updateElement('Freeze');//更新冷值
//     }

//     //路紙視窗顯示(節點觸發)
//     public roadMapPopupShow() {
//         CGUtils.popupShow(this.roadMapPopup);
//         this.roadMap.getComponent(Button).interactable = false;
//     }

//     //路紙視窗關閉(節點觸發)
//     public roadMapPopupHide() {
//         CGUtils.popupHide(this.roadMapPopup);
//         setTimeout(() => {
//             this.roadMap.getComponent(Button).interactable = true;
//         }, 200)
//     }
// }