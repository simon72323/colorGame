import { ServerSendActionEventMap } from "./SeverAction";
import { WebSocketCore } from "../../ws/WebSocketCore";
import { Emitter, EventMap } from "strict-event-emitter";



/**
 * 針對伺服器端發送的訊息進行監聽 並將轉換成事件送出
 */
export class Receive<Map extends EventMap = ServerSendActionEventMap> extends Emitter<Map> {

    constructor(protected core: WebSocketCore) {
        super();
        this.core.on('message', this.onMessage.bind(this));
    }

    protected onMessage(data: any) {
        const { action, result } = data;
        if (action) {
            //@ts-ignore
            this.emit(action, data);
        }
    }


}