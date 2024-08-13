import { Device } from "./Device";

export interface IfAIOBridge {
    /** 遊戲 loading 完成 */
    onLoaded(): void;
    /** 離開遊戲 */
    exitGame(): void;
    /** 離開遊戲 - 維護中 */
    maintaining(): void;
    /** 離開遊戲 - 帳號停權  */
    accountSuspended(): void;
    /** 離開遊戲 - 登出 */
    logout(): void;
    /** 顯示不支援webgl */
    showWebGLAlert(): void;
}

export type AIOExitMethod = Exclude<keyof IfAIOBridge, 'onLoaded' | 'showWebGLAlert'>;


class NativeBridge {

    callbacksCount: number = 1;
    callbacks: { [key: number]: Function; } = {};


    resultForCallback(callbackId: number, args: any[]): void {
        try {
            const callback = this.callbacks[callbackId];
            if (!callback) {
                return;
            }
            callback.apply(null, args);
        } catch (e) {
            alert(e);
        }
    }

    call(functionName: string, args: any[], callback: Function): void {
        const hasCallback = callback && typeof callback == "function";
        const callbackId = hasCallback ? this.callbacksCount++ : 0;

        if (hasCallback) {
            this.callbacks[callbackId] = callback;
        }
        let iframe: HTMLIFrameElement | null = <HTMLIFrameElement>document.createElement("IFRAME");
        if (iframe) {
            iframe.setAttribute("src", `js-frame:${functionName}:${callbackId}:${encodeURIComponent(JSON.stringify(args))}`);
            document.documentElement.appendChild(iframe);
            iframe.parentNode?.removeChild(iframe);
            iframe = null;
        }

    }
}


export class AIOBridgeClass implements IfAIOBridge {

    private nativeBridge: NativeBridge;

    constructor() {
        this.nativeBridge = new NativeBridge();
    }

    private iosAppToJsMessage = (response: string) => { };
    // private androidAppToJsMessage = (message: string) => { };


    private androidJsToAppMessage(message: string): void {
        (<any>window)['MyHandler']?.JsToAppMessage(message);
    }

    private iosJsToAppMessage(message: string) {
        this.nativeBridge.call("JsToAppMessage", [message], this.iosAppToJsMessage);
    }


    private jsToAppMessage(message: string) {
        const device = {
            isiPad: navigator.userAgent.match(/iPad/i) !== null,
            isiPhone: navigator.userAgent.match(/iPhone/i) !== null,
            isandroid: navigator.userAgent.match(/Android/i) !== null,
        };

        if (Device.aio) {
            if (device.isiPad || device.isiPhone) {
                this.iosJsToAppMessage(message);
            } else if (device.isandroid) {
                this.androidJsToAppMessage(message);
            }
        }
    }

    public onLoaded() {
        this.jsToAppMessage('{ event : "LOADED", "data":"" }');
    }

    // Back to AIO
    public exitGame() {
        this.jsToAppMessage('{"event":"EXIT", "data":""}');
    }

    // Back to AIO's Login Panel
    public logout() {
        this.jsToAppMessage('{"event":"SESSION_INVALIDATE", "data":""}');
    }

    public accountSuspended() {
        this.jsToAppMessage('{"event":"ACCOUNT_SUSPENDED", "data":""}');
    }

    public maintaining() {
        this.jsToAppMessage('{"event":"MAINTAINING", "data":""}');
    }

    // if webgl not support
    public showWebGLAlert() {
        this.jsToAppMessage('{"event":"EVENT_WEBGL_NOTSUPPORT", "data":""}');
    }
}

/**
 * AIO 相關功能接口
 */
export const AIOBridge = new AIOBridgeClass();






