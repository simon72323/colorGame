import { _decorator, Component, Node, EventHandler, Button, Event, Sprite, UITransform, SpriteFrame, find, sp, Vec3, Label, Animation } from 'cc';
// import { mahjong_TA } from './mahjong_TA';
// import { symbolResource_TA } from './symbolResource_TA';
// import { symbolSetting_TA } from './symbolSetting_TA';
const { ccclass, property } = _decorator;

@ccclass('symbolInfo_TA')
export class symbolInfo_TA extends Component {
//     @property({ type: Node, tooltip: "slot資訊按鈕節點" })
//     public symbolInfoBtns: Node = null;
//     @property({ type: Node, tooltip: "slot資訊顯示節點" })
//     public symbolInfoShow: Node = null;
//     openBtnId: number = -1;//紀錄打開的按鈕id

//     //symbolId對應的資訊賠率表
//     public symbolInfoID = {
//         1: "80\n50\n40\n30",
//         2: "50\n30\n25\n20",
//         3: "40\n30\n25\n10",
//         4: "30\n25\n15\n8",
//         5: "15\n12\n10\n6",
//         6: "15\n12\n10\n6",
//         11: "10\n8\n6\n4",
//         12: "10\n8\n6\n4",
//         13: "4\n3\n2\n1",
//         14: "4\n3\n2\n1",
//         15: "4\n3\n2\n1",
//     }

//     //腳本連結
//     @property({ type: mahjong_TA, tooltip: "主腳本(獲取slotRunSymbol節點資料)" })
//     public mahjongTA: mahjong_TA = null!;

//     onLoad() {
//         //設置按鈕功能
//         let thisScriptName = this.name.split('<')[1].split('>')[0];
//         //資訊按鈕
//         for (let i = 0; i < this.symbolInfoBtns.children.length; i++) {
//             const infoBtnsEventHandler = new EventHandler();
//             infoBtnsEventHandler.target = this.node;
//             infoBtnsEventHandler.component = thisScriptName;
//             infoBtnsEventHandler.handler = 'infoShow';
//             infoBtnsEventHandler.customEventData = i.toString();
//             this.symbolInfoBtns.children[i].getComponent(Button).clickEvents.push(infoBtnsEventHandler);
//         }
//     }

//     //顯示時配置按鈕狀態與尺寸
//     onEnable() {
//         for (let i = 0; i < this.mahjongTA.slotRun.length; i++) {
//             for (let j = 0; j < this.mahjongTA.slotRun[i].children[1].children.length; j++) {
//                 const symbol = this.mahjongTA.slotRun[i].children[1].children[j];
//                 const symbolWorldPos = symbol.getWorldPosition();
//                 this.symbolInfoBtns.children[i].position = symbolWorldPos.subtract(this.symbolInfoBtns.getWorldPosition());//同步世界座標位置
//                 this.symbolInfoBtns.children[i].getComponent(UITransform).contentSize = symbol.getComponent(UITransform).contentSize;//同步尺寸
//                 this.symbolInfoBtns.children[i].active = symbol.active;//同步顯示
//             }
//         }
//     }

//     infoClose() {
//         this.closeInfo();//關閉資訊
//     }

//     //顯示資訊(symbolID,左=0右=1位置)
//     showInfo(symbolID: number, pos: number) {
//         const symID = symbolID % 100;
//         if (symID > 92)
//             return;//93以上排除
//         const symbolSFTA = find('Canvas/TADemo/symbolResource_TA').getComponent(symbolResource_TA);//獲取場景內的symbolResource_TA腳本
//         const infoNode = this.symbolInfoShow.getChildByName('info');//資訊節點
//         const bgL = infoNode.getChildByName('bgL');
//         const bgR = infoNode.getChildByName('bgR');
//         const symbolImage = infoNode.getChildByName('symbolImage');//靜態圖節點
//         const symbolSpine = infoNode.getChildByName('symbolSpine');//spine動態節點
//         const odds = infoNode.getChildByName('odds');
//         const tx91 = infoNode.getChildByName('tx91');
//         const tx92 = infoNode.getChildByName('tx92');

//         //設置方向
//         switch (pos) {
//             case 0:
//                 bgL.position = new Vec3(110, 0, 0);
//                 bgR.position = new Vec3(110, 0, 0);
//                 odds.position = new Vec3(220, 0, 0);
//                 tx91.position = new Vec3(220, 0, 0);
//                 tx92.position = new Vec3(220, 0, 0);
//                 break;
//             case 1:
//                 bgL.position = new Vec3(-110, 0, 0);
//                 bgR.position = new Vec3(-110, 0, 0);
//                 odds.position = new Vec3(-220, 0, 0);
//                 tx91.position = new Vec3(-220, 0, 0);
//                 tx92.position = new Vec3(-220, 0, 0);
//                 break;
//         }

//         //事先關閉部分動態節點
//         symbolImage.active = false;
//         symbolSpine.active = false;
//         odds.active = true;
//         tx91.active = false;
//         tx92.active = false;

//         let symbolLevel = Math.floor(symbolID / 1000);//判斷symbol高度等級
//         if (symbolLevel === 0)
//             symbolLevel = 1;
//         //設置資訊背景貼圖
//         // bgL.getComponent(Sprite).spriteFrame = this.bgImages[symbolLevel - 1];
//         // bgR.getComponent(Sprite).spriteFrame = this.bgImages[symbolLevel - 1];
//         if (symID > 10 && symID < 16) {
//             symbolImage.active = true;
//             symbolImage.getComponent(Sprite).spriteFrame = symbolSFTA[`symbol${symbolLevel}X`][symID - 1];//設置靜態圖片
//         } else {
//             symbolSpine.active = true;
//             symbolSpine.getComponent(sp.Skeleton).skeletonData = symbolSFTA.symbolSpines[symID - 1];//設置spine物件
//             symbolSpine.getComponent(sp.Skeleton).setAnimation(0, 'win_1X' + symbolLevel.toString(), true);//播放動態
//         }
//         if (symID > 90) {
//             odds.active = false;
//             infoNode.getChildByName('tx' + symID.toString()).active = true;
//         } else
//             odds.children[1].getComponent(Label).string = this.symbolInfoID[symID];//設置odds參數
//         this.symbolInfoShow.getComponent(Animation).play();//播放資訊動態
//     }

//     //顯示symbol資訊
//     infoShow(event: Event, customEventData: string) {
//         let btnID = Number(customEventData);
//         //如果該資訊已顯示則關閉不執行
//         if (btnID === this.openBtnId) {
//             this.closeInfo();//關閉資訊
//             return;
//         }
//         //如果資訊顯示則關閉
//         if (this.symbolInfoShow.active)
//             this.closeInfo();//關閉資訊
//         this.openBtnId = btnID;//紀錄打開的按鈕id

//         const symbolID = this.mahjongTA.slotRun[Math.floor(btnID / 5)].children[btnID % 5].getComponent(symbolSetting_TA).symID;//獲取該symbolID
//         let pos = 0;
//         if (btnID < 4)
//             pos = btnID < 2 ? 1 : 0;
//         else
//             pos = btnID < 19 ? 0 : 1;
//         this.symbolInfoShow.getChildByName('info').position = this.symbolInfoBtns.children[btnID].position;//資訊顯示位置=按鈕位置
//         this.symbolInfoShow.active = true;//顯示symbol資訊
//         this.showInfo(symbolID, pos);//顯示資訊
//     }

//     //關閉symbol資訊
//     closeInfo() {
//         this.openBtnId = -1;//id位置回歸負數
//         this.symbolInfoShow.active = false;//關閉symbol資訊
//     }

//     onDisable() {
//         this.closeInfo();//關閉資訊內容
//     }
}