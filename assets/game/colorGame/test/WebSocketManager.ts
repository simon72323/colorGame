// import { _decorator, Component, Node } from 'cc';
// import { CGGameManager } from './components/CGGameManager';
// // import { CGMain } from './CGMain';
// const { ccclass, property } = _decorator;

// @ccclass('WebSocketManager')
// export class WebSocketManager {
//     private ws: WebSocket | null = null;
//     private gameManager: CGGameManager;

//     constructor(gameManager: CGGameManager) {
//         this.gameManager = gameManager;
//     }

//     public connect(url: string) {
//         // 創建 WebSocket 連接
//         // this.ws = new WebSocket('wss://ws.postman-echo.com/raw');
//         this.ws = new WebSocket(url);
//         // 監聽連接事件打開
//         this.ws.onopen = () => {
//             console.log('WebSocket 連接開啟');
//             // 向服務器發送一條消息
//             this.sendMessage({ type: 'greeting', content: 'Hello, Server!' });
//         };

//         // 監聽接收事件
//         this.ws.onmessage = (event) => {
//             console.log('WebSocket 接收訊息: ', event.data);
//             // 嘗試解析收到的消息為 JSON 對象
//             try {
//                 const message = JSON.parse(event.data);
//                 this.gameManager.handleServerMessage(message);
//                 //接收到消息，傳送到遊戲腳本
//                 // this.handleServerMessage(message);
//             } catch (e) {
//                 console.error('解析服務器消息失敗:', event.data);
//             }
//         };

//         // 監聽錯誤事件
//         this.ws.onerror = (error) => {
//             console.error('WebSocket 錯誤: ', error);
//         };

//         // 監聽連接關閉事件
//         this.ws.onclose = () => {
//             console.log('WebSocket 連接關閉');
//         };
//     }

//     // 發送給服務器消息
//     public sendMessage(message: object) {
//         if (this.ws && this.ws.readyState === WebSocket.OPEN) {
//             const messageStr = JSON.stringify(message);
//             this.ws.send(messageStr);
//             console.log('傳送訊息: ', messageStr);
//         } else {
//             console.warn('WebSocket 為連接，無法發送消息:', message);
//         }
//     }

//     onDestroy() {
//         if (this.ws) {
//             this.ws.close();
//         }
//     }
// }