import { ValuesType } from 'utility-types';
import { Emitter } from 'strict-event-emitter';

export interface WebsocketCoreConfig {

    /** 
     * websocket 連線協定
     */
    protocol?: string | Array<string>;

    /**
     * A serializer used for messages sent to the server. Defaults to JSON.stringify.
     */
    serializer?: (value: any) => string | ArrayBuffer | Blob | ArrayBufferView;
    /**
     * A deserializer used for messages arriving on the socket from the
     * server. Defaults to JSON.parse.
     */
    deserializer?: (e: MessageEvent) => any;

    /**
     * A WebSocket constructor to use. This is useful for situations like using a
     * WebSocket impl in Node (WebSocket is a DOM API), or for mocking a WebSocket
     * for testing purposes
     */
    WebSocketCtor?: { new(url: string, protocols?: string | string[]): WebSocket; };
    /** Sets the `binaryType` property of the underlying WebSocket. */
    binaryType?: 'blob' | 'arraybuffer';
    
    encrypt?: (value: any) => string;

    decrypt?: (value: any) => string;
    
    encryptionEnabled?: boolean;
}

const DEFAULT_WEBSOCKET_CONFIG: WebsocketCoreConfig = {
    deserializer: (e: MessageEvent) => JSON.parse(e.data),
    serializer: (value: any) => JSON.stringify(value),
    WebSocketCtor: WebSocket,
};

/**
 * Websocket 連線核心事件
 */
export type WebSocketCoreEvent<Message = any> = {
    'open': [event: Event];
    'close': [event: CloseEvent];
    /** 這裡的error 會包含 websocket error event 跟其他runtime error  */
    'error': [event: ErrorEvent | Error | any];
    'message': [message: Message];
};





/**
 * Websocket 連線核心
 * 
 * @template ServerMessageMap 伺服器訊息格式
 * @template ClientMessageMap 客戶端訊息格式
 * 
 */
export class WebSocketCore<
    ServerMessageMap extends Record<string, any> = any,
    ClientMessageMap extends Record<string, any> = any
> extends Emitter<WebSocketCoreEvent> {

    get ws() { return this._ws; }
    get manualClose() { return this._manualClose; }

    protected _ws: WebSocket | null = null;
    protected config: WebsocketCoreConfig = DEFAULT_WEBSOCKET_CONFIG;

    protected _manualClose: boolean = false;

    protected onopenBinder = this.onOpen.bind(this);
    protected oncloseBinder = this.onClose.bind(this);
    protected onerrorBinder = this.onError.bind(this);
    protected onmessageBinder = this.onMessage.bind(this);


    protected _url: string = '';

    constructor() {
        super();
        //將傳入的 config 覆蓋到預設的 config
    }


    connect(url: string, config: WebsocketCoreConfig = DEFAULT_WEBSOCKET_CONFIG): Promise<boolean> {

        return new Promise((resolve, reject) => {

            this.config = { ...this.config, ...config };
            this._url = url;

            //如果已經有連線，先關閉連線
            if (this.ws) this.reset();

            this.connectSocket((this.config.binaryType == 'arraybuffer'));


            const off = () => {
                this.off('open', onopen);
                this.off('error', onerror);
                this.off('close', onclose);
            };
            const onopen = (e: Event) => {
                off();
                resolve(true);
            };

            const onerror = (e: ErrorEvent) => {
                off();
                reject(e);
            };

            const onclose = (e: CloseEvent) => {
                off();
                reject(e);
            };

            // once has be leak !?
            this.on('open', onopen);

            this.once('error', onerror);

            this.once('close', onclose);

        });
    }


    close() {
        if (!this._ws) return;
        if (this._ws?.readyState === WebSocket.CLOSED) return;
        this._manualClose = true;
        this._ws?.close();
    }


    send(message: ValuesType<ClientMessageMap>) {
        const { _ws: ws, config } = this;

        if (!ws) {
            throw new Error('[WebsocketCore] Can not send data if no connection is established');
        }
        if (ws.readyState !== WebSocket.OPEN) {
            throw new Error('[WebsocketCore] Can not send data if connection is not open');
        }
        try {
            if (config.encryptionEnabled) {
                let ciphertext = config.encrypt(message);
                ws.send(config.serializer!(ciphertext));
            } else {
                ws.send(config.serializer!(message));
            }
            
        } catch (e) {
            this.emit("error", e);
        }
    }

    protected connectSocket(binary: boolean = false) {

        const binaryType = binary ? 'arraybuffer' : undefined;
        const { WebSocketCtor, protocol } = this.config;
        const { _url: url } = this;

        let socket: WebSocket | null;

        try {
            socket = protocol ? new WebSocketCtor!(url, protocol) : new WebSocketCtor!(url);
            this._ws = socket;
            if (binaryType) this._ws.binaryType = binaryType;
        }
        catch (e) {
            this.emit('error', e);
            return;
        }


        socket.onopen = this.onopenBinder;
        socket.onclose = this.oncloseBinder;
        socket.onerror = this.onerrorBinder;
        socket.onmessage = this.onmessageBinder;

    }

    protected onOpen(e: Event) {
        const { _ws: ws } = this;
        if (!ws) return;
        this._manualClose = false;
        this.emit('open', e);
    }

    protected onClose(e: CloseEvent) {
        const { _ws: ws } = this;
        if (!ws) return;
        this.reset();
        this.emit('close', e);
    }

    protected onError(e: Event) {

        const { _ws: ws } = this;
        if (!ws) return;
        this.emit('error', e);

    }

    protected onMessage(e: MessageEvent) {
        const { deserializer, decrypt } = this.config;
        try {
            if (decrypt) {
                let ciphertext: string = deserializer(e as ServerMessageMap[keyof ServerMessageMap]);
                let plaintext = decrypt(ciphertext);
                
                this.emit('message', JSON.parse(plaintext));
            } else {
                if (deserializer) {
                    const msg = deserializer(e) as ServerMessageMap[keyof ServerMessageMap];
                    this.emit('message', msg);
                }
            }
            
        } catch (e) {
            console.error(e);
            this.emit('error', e);
        }
    }

    private reset() {
        const ws = this._ws;
        this._ws = null;

        ws?.onclose && (ws.onclose = null);
        ws?.onerror && (ws.onerror = null);
        ws?.onmessage && (ws.onmessage = null);
        ws?.onopen && (ws.onopen = null);

        if (ws && ws.readyState !== WebSocket.CLOSED) {
            ws.close();
        }
    }
}