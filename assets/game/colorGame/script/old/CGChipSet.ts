// import { _decorator, Component, find, Node, Label, Sprite, Button, Animation, Toggle, UIOpacity, EventHandler } from 'cc';
// import { UtilsKitS } from '../../../common/script/lib/UtilsKitS';
// import { CGModel } from './CGModel';
// import { CGView } from './CGView';

// const { ccclass, property } = _decorator;
// @ccclass('CGChipSet')
// export class CGChipSet extends Component {
//     // @property({ type: CGModel, tooltip: "遊戲資料腳本" })
//     public model: CGModel;
//     @property({ type: CGView, tooltip: "遊戲介面腳本" })
//     private gameView: CGView = null;

//     private defaultChipSetID: number[] = [0, 1, 2, 3, 4];//預設籌碼
//     private chipSetIDing: number[] = [0, 1, 2, 3, 4];//暫存選擇中的籌碼


//     onLoad() {
//         //按鈕觸發設置
//         const scriptName = this.name.split('<')[1].split('>')[0];
//         //選擇設置籌碼按鈕觸發事件設置
//         const chipToggleChildren = this.gameView.chipToggle.children;
//         for (let i = 0; i < chipToggleChildren.length; i++) {
//             const eventHandler = new EventHandler();
//             eventHandler.target = this.node;
//             eventHandler.component = scriptName;
//             eventHandler.handler = 'chipSet';
//             eventHandler.customEventData = i.toString();
//             chipToggleChildren[i].getComponent(Toggle).clickEvents.push(eventHandler);
//         }
//     }

//     //選擇籌碼
//     private chipSet(event: Event, data: string) {
//         const id = Number(data)
//         const chipToggleChildren = this.gameView.chipToggle.children;
//         if (chipToggleChildren[id].getComponent(Toggle).isChecked) {
//             if (this.chipSetIDing.length > 1)
//                 this.chipSetIDing.splice(this.chipSetIDing.indexOf(id), 1);//取消掉設置中ID(如果只有一組則不取消)
//         }
//         else
//             this.chipSetIDing.push(id);
//         this.scheduleOnce(() => {
//             this.updateChipSet();
//         }, 0)
//     }

//     //更新籌碼選擇(設置頁面)
//     public updateChipSet() {
//         const chipToggleChildren = this.gameView.chipToggle.children;
//         if (this.chipSetIDing.length > 4) {
//             for (let i = 0; i < chipToggleChildren.length; i++) {
//                 if (this.chipSetIDing.indexOf(i) === -1) {
//                     chipToggleChildren[i].getComponent(Toggle).interactable = false;
//                     chipToggleChildren[i].getComponent(Toggle).isChecked = false;
//                     chipToggleChildren[i].getComponent(UIOpacity).opacity = 80;
//                 } else {
//                     chipToggleChildren[i].getComponent(Toggle).interactable = true;
//                     chipToggleChildren[i].getComponent(Toggle).isChecked = true;
//                     chipToggleChildren[i].getComponent(UIOpacity).opacity = 255;
//                 }
//             }
//         } else {
//             for (let i = 0; i < chipToggleChildren.length; i++) {
//                 if (this.chipSetIDing.indexOf(i) === -1)
//                     chipToggleChildren[i].getComponent(Toggle).isChecked = false;
//                 else
//                     chipToggleChildren[i].getComponent(Toggle).isChecked = true;
//                 if (!chipToggleChildren[i].getComponent(Toggle).interactable) {
//                     chipToggleChildren[i].getComponent(Toggle).interactable = true;
//                     chipToggleChildren[i].getComponent(UIOpacity).opacity = 255;
//                 }
//             }
//         }
//     }

//     //更新選擇的籌碼(籌碼選擇區)
//     public updateSelectChip() {
//         const chipToggle = this.gameView.chipToggle;
//         const chipSetID = this.model.chipSetID;
//         const selectChipChildren = this.gameView.selectChip.children;
//         for (let i = 0; i < selectChipChildren.length; i++) {
//             const selectChip = selectChipChildren[i];
//             if (chipSetID.length > i) {
//                 selectChip.active = true;
//                 selectChip.getChildByName('Sprite').getComponent(Sprite).spriteFrame =
//                     chipToggle.children[chipSetID[i]].getChildByName('Sprite').getComponent(Sprite).spriteFrame;
//                 selectChip.getChildByName('Checkmark').getComponent(Sprite).spriteFrame =
//                     chipToggle.children[chipSetID[i]].getChildByName('Checkmark').getComponent(Sprite).spriteFrame;
//                 selectChip.getChildByName('Label').getComponent(Label).string =
//                     UtilsKitS.NumDigits(this.model.loadInfo.chipRange[chipSetID[i]]);
//             } else
//                 selectChip.active = false;
//         }
//         this.model.selectChipID = chipSetID[0];
//         selectChipChildren[0].getComponent(Toggle).isChecked = true;
//     }

//     //設置視窗顯示
//     public chipSetPopupShow() {
//         const chipSetPopup = this.gameView.chipSetPopup;
//         this.chipSetIDing = [...this.model.chipSetID];
//         this.updateChipSet();
//         chipSetPopup.active = true;
//         chipSetPopup.getChildByName('Popup').getChildByName('BtnClose').getComponent(Button).interactable = true;
//         chipSetPopup.getComponent(Animation).play('PopupShow');
//     }


//     public btnConfirm() {
//         this.model.saveChipSetID(this.chipSetIDing);//儲存資料
//         this.chipSetPopupHide();
//         this.updateSelectChip();//重新設置籌碼
//     }

//     public btnDefault() {
//         this.chipSetIDing = [...this.defaultChipSetID];
//         this.model.saveChipSetID(this.chipSetIDing);//儲存資料
//         this.updateChipSet();
//     }

//     public chipSetPopupHide() {
//         const chipSetPopup = this.gameView.chipSetPopup;
//         chipSetPopup.getChildByName('Popup').getChildByName('BtnClose').getComponent(Button).interactable = false;
//         chipSetPopup.getComponent(Animation).play('PopupHide');
//         setTimeout(() => {
//             chipSetPopup.active = false;
//         }, 200)
//     }
// }