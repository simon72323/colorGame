import { _decorator, Component, Node } from 'cc';
// import { CGMain } from './CGMain';
const { ccclass, property } = _decorator;

@ccclass('WebSocketExample')
export class WebSocketExample extends Component {
    private ws: WebSocket | null = null;
    // @property({ type: CGMain, tooltip: "遊戲主腳本" })
    // private gameMain: CGMain = null;

    start() {
        // 創建 WebSocket 連接
        // this.ws = new WebSocket('wss://ws.postman-echo.com/raw');
        this.ws = new WebSocket('ws://localhost:8080');
        // 監聽連接事件打開
        this.ws.onopen = () => {
            console.log('WebSocket 連接開啟');
            // 向服務器發送一條消息
            this.sendMessage({ type: 'greeting', content: 'Hello, Server!' });
        };

        // 監聽接收事件
        this.ws.onmessage = (event) => {
            console.log('WebSocket 接收訊息: ', event.data);
            // 嘗試解析收到的消息為 JSON 對象
            try {
                const message = JSON.parse(event.data);
                // this.gameMain.setBetTime(12);
                //接收到消息，傳送到遊戲腳本
                // this.handleServerMessage(message);
            } catch (e) {
                console.error('Failed to parse server message:', event.data);
            }
        };

        // 監聽錯誤事件
        this.ws.onerror = (error) => {
            console.error('WebSocket error: ', error);
        };

        // 監聽連接關閉事件
        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
        };
    }

    // 發送給服務器消息
    public sendMessage(message: object) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const messageStr = JSON.stringify(message);
            this.ws.send(messageStr);
            console.log('傳送訊息: ', messageStr);
        } else {
            console.warn('WebSocket is not open. Cannot send message:', message);
        }
    }

    //模擬後端傳送接收資料

    // 接收服務器消息
    // public handleServerMessage(message: any) {
        // if (message.type === 'greeting') {
        //     console.log('接收 greeting:', message.content);
        // } else if (message.type === 'heartbeat') {
        //     console.log('接收心跳');
        // } else {
        //     console.log('Unknown message type:', message);
        // }
    // }

    onDestroy() {
        if (this.ws) {
            this.ws.close();
        }
    }
}