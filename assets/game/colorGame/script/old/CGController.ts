// import { _decorator, Component, Node, Toggle, Button, EventHandler } from 'cc';
// import { CGGameManager } from './CGGameManager';
// import { CGUtils } from '../utils/CGUtils';

// const { ccclass, property } = _decorator;

// @ccclass('CGController')
// export class CGController extends Component {
//     private gameManager: CGGameManager = null;

//     public init(gameManager: CGGameManager) {
//         this.gameManager = main;
//         this.setupEventHandlers();
//     }

    // private setupEventHandlers() {
    //     const scriptName = 'CGController'; // 改为 Controller 的脚本名
    //     //btnCall按鈕觸發事件設置
    //     for (let i = 0; i < this.gameManager.view.btnCall.length; i++) {
    //         const eventHandler = new EventHandler();
    //         eventHandler.target = this.node;
    //         eventHandler.component = scriptName;
    //         eventHandler.handler = 'btnCallDown';
    //         eventHandler.customEventData = i.toString();
    //         this.gameManager.view.btnCall[i].getComponent(Button).clickEvents.push(eventHandler);
    //     }
    //     //btnStopCall按鈕觸發事件設置
    //     for (let i = 0; i < this.gameManager.view.btnStopCall.length; i++) {
    //         const eventHandler = new EventHandler();
    //         eventHandler.target = this.node;
    //         eventHandler.component = scriptName;
    //         eventHandler.handler = 'btnStopCallDown';
    //         eventHandler.customEventData = i.toString();
    //         this.gameManager.view.btnStopCall[i].getComponent(Button).clickEvents.push(eventHandler);
    //     }
    // }

    // //跟注按鈕按下
    // public btnCallDown(event: Event, customEventData: string) {
    //     const id = parseInt(customEventData);
    //     // 在这里添加跟注逻辑
    //     // 例如：更新游戏状态，发送网络请求等
    //     this.gameManager.view.updateBetCallUI(id, true);//啟用跟注
    // }

    // //取消跟注按鈕按下
    // public btnStopCallDown(event: Event, customEventData: string) {
    //     const id = parseInt(customEventData);
    //     // 在这里添加取消跟注逻辑
    //     // 例如：更新游戏状态，发送网络请求等
    //     this.gameManager.view.updateBetCallUI(id, false);//停用跟注
    // }

    // //路紙視窗顯示(節點觸發)
    // public roadMapPopupShow() {
    //     CGUtils.popupShow(this.gameManager.view.roadMapPopup);
    // }

    // //路紙視窗關閉(節點觸發)
    // public roadMapPopupHide() {
    //     CGUtils.popupHide(this.gameManager.view.roadMapPopup);
    // }
// }