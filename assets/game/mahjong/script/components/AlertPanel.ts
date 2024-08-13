import { AlertOptions, IfAlertPanel, log } from "../include";
import { AlertPanelEventMap } from "../include";
import { CCString, Component, Prefab, _decorator, instantiate, Node, Label, CCBoolean, EventHandler, Button, Input, CCObject, BlockInputEvents } from "cc";
const { ccclass, property, menu } = _decorator;
import { Emitter } from "strict-event-emitter";
import { UtilsKit } from "../lib/UtilsKit";
import { Localization, LocalizedStrKeys } from "../lib/Localization";

const AlertMessageSection = { name: 'AlertContent', style: 'section' };

export type MahjongAlertOptions = {
    cancelButtonVisible?: boolean;
    cancelButtonText?: string;
    confirmButtonVisible?: boolean;
    confirmButtonText?: string;
    iconButton?: boolean;
    closeButtonVisible?: boolean;
    //背景是否可以觸摸
    isTouchBackdrop?: boolean;
} & AlertOptions;

export enum DialogEventTypes {
    CLOSE,
    ACCEPT,
    CANCEL,
    BACKDROP,
    ESC,
    TIMEOUT,
    EMPTY,
    ABORT
}

export type MahjongAlertEvent = {
    state: DialogEventTypes,
    isAccept: boolean,
    isCancel: boolean
}

@ccclass('AlertPanel')
@menu('Mahjong/AlertPanel')
export class AlertPanel extends Component implements IfAlertPanel {

    @property({ type: CCString, tooltip: "標題", group: AlertMessageSection})
    public set title(value: string) {
        this.alertMessageOptions.title = value; 
    }
    public get title():string {
        return this.alertMessageOptions.title;
    }
    @property({ type: CCString, tooltip: "文字訊息", group: AlertMessageSection })
    public set message(value: string) {
        this.alertMessageOptions.message = value;
    }
    public get message():string {
        return this.alertMessageOptions.message;
    }
    @property( { type: CCBoolean, displayName: "ConfirmVisible", tooltip: "顯示確認按鈕", visible: function() { return !this.iconButton; }, group: AlertMessageSection })
    public set confirmButtonVisible(value: boolean) {
        this.alertMessageOptions.confirmButtonVisible = value;
    }
    public get confirmButtonVisible():boolean {
        return this.alertMessageOptions.confirmButtonVisible;
    }
    @property( { type: CCString, displayName: "ConfirmText", tooltip: "確認按鈕文字", visible: function() { return this.confirmButtonVisible && !this.iconButton; }, group: AlertMessageSection })
    public set confirmButtonText(value: string) {
        this.alertMessageOptions.confirmButtonText = value;
    }
    public get confirmButtonText():string {
        return this.alertMessageOptions.confirmButtonText;
    }
    @property( { type: CCBoolean, displayName: "CancelVisible", tooltip: "顯示取消按鈕", visible: function() { return !this.iconButton; }, group: AlertMessageSection })
    public set cancelButtonVisible(value: boolean) {
        this.alertMessageOptions.cancelButtonVisible = value;
    }
    public get cancelButtonVisible():boolean {
        return this.alertMessageOptions.cancelButtonVisible;
    }
    @property( { type: CCString, displayName: "CancelText", tooltip: "取消按鈕文字", visible: function() { return this.cancelButtonVisible && !this.iconButton; }, group: AlertMessageSection })
    public set cancelButtonText(value: string) {
        this.alertMessageOptions.cancelButtonText = value;
    }
    public get cancelButtonText():string {
        return this.alertMessageOptions.cancelButtonText;
    }
    @property( { type: CCBoolean, group: AlertMessageSection })
    public set iconButton(value: boolean) {
        this.alertMessageOptions.iconButton = value;
    }
    public get iconButton():boolean {
        return this.alertMessageOptions.iconButton;
    }

    @property({ type: CCBoolean, tooltip: "使用Perfab", displayName: "prefabEnabled" })
    protected prefabEnabled: boolean = false;

    @property({ type: Prefab, tooltip: "ALERT物件" , visible: function() { return this.prefabEnabled; } })
    protected alertPrefab: Prefab;

    @property( { type: CCObject, visible: false })
    protected alertMessageOptions: MahjongAlertOptions = {
        title: "系統訊息",
        message: "",
        confirmButtonText: "確定",
        confirmButtonVisible: false,
        cancelButtonText: "取消",
        cancelButtonVisible: false,
        iconButton: false,
        closeButtonVisible: false,
        isTouchBackdrop: true,
        duration: 0
    }
    /** alert物件子節點位置名稱 */
    protected subviewName: string = "systemView";
    /** 所有會用到的Alert Template */
    protected alertDialogs: string[] = ['alertBasicNone', 'alertBasic', 'alertDialog', 'iconAlertDialog', 'exchangeAlertDialog'];
    /** 子節點Node */
    protected subview: Node;
    /** 目前執行的 */
    protected current: BasicDialog = null;
    /** 預設: 無按鈕 */
    protected alertBasicNone: BasicDialog = null;
    /** 1個按鈕 */
    protected alertBasic: BasicDialog = null;
    /** 2個按鈕 */
    protected alertDialog: BasicDialog = null;
    /** ICON按鈕 */
    protected iconAlertDialog: BasicDialog = null; // speedAlertDialog
    /** 換洗分版型 */
    protected exchangeAlertDialog: BasicDialog = null;

    private static singleton: AlertPanel = null;
    
    public event: Emitter<AlertPanelEventMap>;

    @property({ type: Prefab, tooltip: "" })
    protected templateAlertPrefab: Prefab[] = [];

    constructor() {
        super();
        if (!AlertPanel.singleton) AlertPanel.singleton = this;
    }
    // 建構物件
    protected create() {
        const { alertPrefab } = this;
        if (this.prefabEnabled && alertPrefab) {
            this.subview = instantiate(this.alertPrefab);
            this.node.addChild(this.subview);
        } else {
            this.subview = this.node.getChildByName(this.subviewName);
        }

        const blackNode: Node = this.subview.getChildByName("black");
        if (blackNode) {
            this.subview.getChildByName("black").addComponent(BlockInputEvents);
        }
        
        log(`AlertPanel.loading.create()`);
        
    }
    // 呼叫
    public alert(options: MahjongAlertOptions): Promise<MahjongAlertEvent> {
        const localized = Localization.getInstance();
        this.abort();
        this.node.active = true; // 優先執行
        
        const { 
            title, 
            message,
            cancelButtonVisible, 
            cancelButtonText,
            confirmButtonVisible,
            confirmButtonText,
            iconButton,
            closeButtonVisible,
            isTouchBackdrop,
            duration
        } = options;
        if (title) 
            this.title = options.title;
        else
            this.title = localized.get(LocalizedStrKeys.SYSTEM_MESSAGE);
        if (message || message === '') this.message = options.message;
        if (cancelButtonVisible) {
            this.alertMessageOptions.cancelButtonVisible = cancelButtonVisible;
            this.alertMessageOptions.cancelButtonText = cancelButtonText;
        } else {
            this.alertMessageOptions.cancelButtonVisible = false;
            this.alertMessageOptions.cancelButtonText = '';
        }
        if (confirmButtonVisible) {
            this.alertMessageOptions.confirmButtonVisible = confirmButtonVisible;
            this.alertMessageOptions.confirmButtonText = confirmButtonText;
        } else {
            this.alertMessageOptions.confirmButtonVisible = false;
            this.alertMessageOptions.confirmButtonText = '';
        }
        this.alertMessageOptions.iconButton = (iconButton === true);
        
        if (Number.isInteger(duration)) {
            this.alertMessageOptions.duration = duration;
        } else {
            this.alertMessageOptions.duration = 0;
        }
        this.alertMessageOptions.isTouchBackdrop = !(isTouchBackdrop === false);
        if ((iconButton === true)) {
            this.current = this.iconAlertDialog;
        } else if (confirmButtonVisible && cancelButtonVisible) {
            this.current = this.alertDialog;
        } else if (confirmButtonVisible && closeButtonVisible) {
            this.current = this.exchangeAlertDialog;
        } else if (confirmButtonVisible) {
            this.current = this.alertBasic;
        } else {
            this.current = this.alertBasicNone;
        }
        const { alertMessageOptions } = this;
        return this.current.display(alertMessageOptions);
    }
    public abort() {
        if (this.node.active && this.current) {
            this.current.abort();
        }
    }
    protected onLoad(): void {
        this.create();
        const [alertBasicNone, alertBasic, alertDialog, iconAlertDialog, exchangeAlertDialog] = this.alertDialogs;
        this.alertBasicNone = new BasicDialog(this.node, this.subview.getChildByName(alertBasicNone));
        this.alertBasic = new BasicDialog(this.node, this.subview.getChildByName(alertBasic));
        this.alertDialog = new BasicDialog(this.node, this.subview.getChildByName(alertDialog));
        this.iconAlertDialog = new BasicDialog(this.node, this.subview.getChildByName(iconAlertDialog));
        this.exchangeAlertDialog = new BasicDialog(this.node, this.subview.getChildByName(exchangeAlertDialog));
        
    }
    protected start() {}
    /**
     * 清除
     */
    public clear() {
        this.alertBasicNone?.clear();
        this.alertBasic?.clear();
        this.alertDialog?.clear();
        this.iconAlertDialog?.clear();
        this.exchangeAlertDialog?.clear();
    }
    public release() {
        AlertPanel.singleton = null;
        this.clear();
    }
    public static getInstance(): AlertPanel {
        if (!AlertPanel.singleton) {
            // 由GUI實作時建立
        }
        return AlertPanel.singleton;
    }
}

export class BasicDialog {
    public endpoint: Node = null;
    public node: Node = null;
    public title: Label = null;
    public label: Label = null;
    protected backdrop: Node = null;
    protected closeButton: Node = null;
    protected confirmButton: Node = null;
    protected confirmButtonText: Label = null;
    protected cancelButton: Node = null;
    protected cancelButtonText: Label = null;
    protected accept: Node = null;
    protected reject: Node = null;
    protected resolve: any;
    constructor(endpoint: Node, dialogNode: Node) {
        this.endpoint = endpoint;
        this.node = dialogNode;
        this.title = this.node.getChildByName('title').getComponent(Label);
        this.label = this.node.getChildByName('label').getComponent(Label);
        this.closeButton = this.node.getChildByName('closeBtn');
        this.backdrop = this.node.parent.getChildByName('black');
        let text;
        if (this.confirmButton = this.node.getChildByName('confirmBtn')) {
            text = this.confirmButton.getChildByName('text');
            if (text) {
                this.confirmButtonText = text?.getComponent(Label);
            }
        }
        if (this.cancelButton = this.node.getChildByName('cancelBtn')) {
            text = this.cancelButton.getChildByName('text');
            if (text) {
                this.cancelButtonText = text?.getComponent(Label);
            }
        }

        

        // const event = new EventHandler();
        // event.target = endpoint;
        // event.component = 'AlertPanel';
        // event.handler = 'onclick';
        // let closeButton = this.node.getChildByName('closeBtn');
        // log(`closeButton`, closeButton);
        
        // closeButton.getComponent(Button).clickEvents.push(event);
        // closeButton.getComponent(Button).interactable = true;
    }
    /**
     * 初始化按鈕物件
     */
    setup(isTouchBackdrop: boolean = true) {
        let { closeButton, backdrop, confirmButton, cancelButton } = this;

        if (closeButton) {
            closeButton.on(Button.EventType.CLICK, () => this.onCloseClick());
        }
        if (backdrop && isTouchBackdrop) {
            backdrop.on(Input.EventType.TOUCH_END, () => this.onBackDropClick());
            
            backdrop.on(Input.EventType.MOUSE_UP, (event) => this.onBackDropClick());
        }
        
        if (confirmButton) {
            confirmButton.on(Button.EventType.CLICK, () => {
                this.onResolve({
                    state: DialogEventTypes.ACCEPT,
                    isAccept: true,
                    isCancel: false
                });
            });
        }
        if (cancelButton) {
            cancelButton.on(Button.EventType.CLICK, () => {
                this.onResolve({
                    state: DialogEventTypes.CANCEL,
                    isAccept: false,
                    isCancel: true
                });
            });
        }
    }
    /**
     * 背景關閉視窗
     */
    private onBackDropClick() {
        this.onResolve({ state: DialogEventTypes.BACKDROP, isAccept: false, isCancel: false });
    }
    /**
     * 關閉按鈕事件
     */
    private onCloseClick() {
        this.onResolve({ state: DialogEventTypes.CLOSE, isAccept: false, isCancel: false });
    }
    private onResolve(event: any) {
        if (this.resolve) {
            this.clear();
            this.resolve(event);
        }
        this.resolve = null;
    }
    /**
     * 顯示Alert
     * @param options 
     * @returns 
     */
    public display(options: MahjongAlertOptions):Promise<MahjongAlertEvent> {
        const { node, endpoint } = this;
        node.active = true;
        endpoint.active = true;
        log(`display`,this.node.name, options);
        
        const { title, label, cancelButtonText, confirmButtonText } = this;
        if ( title && options.title ) {
            title.string = options.title;
        }

        if ( label && options.message ) {
            label.string = options.message;
        }

        if (!options.iconButton && cancelButtonText) {
            cancelButtonText.string = options.cancelButtonText;
        }
        
        if (!options.iconButton && confirmButtonText) {
            confirmButtonText.string = options.confirmButtonText;
        }
        // MOUSE_UP, CLICK 相同按鈕事件會觸發該事件MOUSE_UP, 延遲註冊
        setTimeout(() => this.setup(options.isTouchBackdrop), 0);
        if (options.duration > 0) { 
            UtilsKit.Defer(options.duration).then(() => {
                this.onResolve({ state: DialogEventTypes.TIMEOUT, isAccept: false, isCancel: false });
            });
        }
        return new Promise((resolve) => {
            this.resolve = resolve;
        });
    }
    public abort(): void {
        if (this.resolve) {
            this.onResolve({ state: DialogEventTypes.ABORT, isAccept: false, isCancel: false });
        }
    }
    /**
     * 清除物件
     */
    public clear() {
        
        let { closeButton, backdrop, confirmButton, cancelButton } = this;
        if (closeButton) {
            closeButton.off(Button.EventType.CLICK);
        }
        if (backdrop) {
            backdrop.off(Input.EventType.MOUSE_UP);
            backdrop.off(Input.EventType.TOUCH_END);
        }
        if (confirmButton) {
            confirmButton.off(Button.EventType.CLICK);
        }
        if (cancelButton) {
            cancelButton.off(Button.EventType.CLICK);
        }
        this.node.active = false;
        this.endpoint.active = false;
    }
}