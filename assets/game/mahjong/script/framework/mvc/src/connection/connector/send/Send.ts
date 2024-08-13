import { ClientSendAction, ClientSendActionParams, BaseSendActionParams } from "./ClientAction";
import { WebSocketCore } from "../../ws/WebSocketCore";




export class Send<SendMap extends BaseSendActionParams = ClientSendActionParams> {

    constructor(protected core?: WebSocketCore) {

    }

    /*
     * 發送訊息給server端 
     * @param action 發送的動作
     * @param data 發送的資料 可以不傳入 , 會自動合併 action 與 data
     */
    callServer<A extends keyof SendMap>(action: A, data?: SendMap[A]) {
        this?.core?.send({ action, ...data });
    }


}


