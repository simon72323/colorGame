import { Component, input, Input, KeyCode, EventKeyboard } from "cc";
import { GameManager } from "./GameManager";

// 定義事件參數
export type InputKeyboardEvents = {
    name: string;
    traget: Component;
    action: string | Function;
    keyCode: KeyCode;
    focus: boolean;
};

export interface IInputKeyboard {
    // 單ㄧ例
    isSingleton: boolean;
    //啟用
    enabled: boolean;
    // 增加事件
    pushEvent(event: InputKeyboardEvents);
    // 刪除事件
    removeEvent(name: string);
    // 觸發事件
    triggerEvent(event: InputKeyboardEvents);
    // 取得事件
    get(name: string);
    // 設定事件啟用
    setFocus(name: string, focus: boolean);
    // 事件是否啟用
    isFocus(name: string);
    // 移除
    release();

}

export enum InputOccuraction {
    SPACE_SPINE = 'space_spine',
}

export class InputKeyboard {

    private static singleton: InputKeyboard = null;

    private _enabled: boolean;

    // 事件名稱
    private handlers: Map<string, InputKeyboardEvents> = new Map();
    // 廣播用
    private keyCodeHandlers: Set<InputKeyboardEvents>[] = [];

    set enabled(value: boolean) { this._enabled = value; }
    get enabled() { return this._enabled; }

    constructor() {
        this.setup();
    }
    protected setup(): void {
        document.addEventListener("keydown", (event) => this.onKeyDown(event as any));
        document.addEventListener("keyup", (event) => this.onKeyUp(event as any));
        input.on(Input.EventType.KEY_PRESSING, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
    protected clear(): void {
        input.off(Input.EventType.KEY_PRESSING, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
    public pushEvent(event: InputKeyboardEvents) {
        this.handlers.set(event.name, event);
        if (!this.keyCodeHandlers[event.keyCode]) 
            this.keyCodeHandlers[event.keyCode] = new Set([event]); 
        this.keyCodeHandlers[event.keyCode].add(event);
    }
    public removeEvent(name: string) {
        const { keyCodeHandlers } = this;
        let event = this.get(name);
        this.handlers.delete(name);
        if (keyCodeHandlers[event.keyCode]) {
            keyCodeHandlers[event.keyCode].delete(event);
        }
    }
    public triggerEvent(event:InputKeyboardEvents):boolean {
       const { keyCode, traget, action, focus } = event;

        if (!focus) return false;

       const comp = traget;
       if (typeof action == 'string') {
            const handler = comp![action];
            handler.call(comp, keyCode);
            return true;
       } else if (action instanceof Function) {
            action.call(comp, keyCode);
            return true;
       }
       return false;
    }
    public get(name: string): InputKeyboardEvents {
        return this.handlers.get(name);
    }
    public setFocus(name: string, focus: boolean): boolean {
        if (this.handlers.has(name)) {
            this.handlers.get(name).focus = focus;
            return true;
        } else {
            return false;
        }
    }
    public isFocus(name: string): boolean {
        if (this.handlers.has(name)) {
            return this.handlers.get(name).focus;
        } else {
            return false;
        }
    }

    protected onKeyDown(event: EventKeyboard): void {
        const { keyCodeHandlers } = this;
        const handlers = keyCodeHandlers[event.keyCode];
        if (handlers) {
            for (const event of handlers.values()) {
                this.triggerEvent(event);
            }
        }
    }
    protected onKeyUp(event: EventKeyboard): void {
        
    }
    public release() {
        InputKeyboard.singleton = null;
        this.clear();
    }
    public static getInstance(): InputKeyboard {
        if (!InputKeyboard.singleton) {
            InputKeyboard.singleton = new InputKeyboard();
        } 
        return InputKeyboard.singleton;
    }

}