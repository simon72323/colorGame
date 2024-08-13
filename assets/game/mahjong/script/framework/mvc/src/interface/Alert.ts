import { Emitter, EventMap } from 'strict-event-emitter';

export interface AlertPanelEventMap extends EventMap {
    /** 關閉 alert */
    close: [];
    /** 點擊panel 按鈕 */
    buttonClick: [{ type?: string, message: string; }];
};

export type AlertOptions = {
    /**
     * 要顯示的訊息
     */
    message: string;
    /**
     * alert panel 的標題
     */
    title?: string;

    /**
     * 顯示多少秒自動關閉(ms)
     */
    duration?: number;
};

export interface IfAlertPanel {

    alert(options: AlertOptions): void;

    event: Emitter<AlertPanelEventMap>;
}