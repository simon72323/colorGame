import { _decorator, Component, Node, Label, Sprite, Toggle, UIOpacity, EventHandler, sys, Button } from 'cc';
import { CGUtils } from '../tools/CGUtils';
import { CGController } from '../controller/CGController';

const { ccclass, property } = _decorator;
@ccclass('CGChipSetView')
export class CGChipSetView extends Component {
    @property(Node)//籌碼選擇區
    private touchChip!: Node;
    @property(Node)//籌碼設置按鈕
    private btnChipSet!: Node;
    @property(Node)//籌碼預設按鈕
    private btnDefault!: Node;
    @property(Node)//籌碼確認按鈕
    private btnConfirm!: Node;
    @property(Node)//關閉彈窗按鈕
    private btnClose!: Node;
    @property(Node)//籌碼設置彈窗
    private chipSetPopup!: Node;
    @property(Node)//籌碼Toggle
    private chipToggle!: Node;

    private chipRange: number[] = [];//籌碼範圍
    private chipSetID: number[];//玩家針對此遊戲設置的籌碼ID
    private defaultChipSetID: number[] = [0, 1, 2, 3, 4];//預設籌碼
    private chipSetIDing: number[] = [0, 1, 2, 3, 4];//暫存選擇中的籌碼

    private controller: CGController;//遊戲控制器

    /**
     * 初始化籌碼設置視圖
     * @param controller 遊戲控制器實例
     */
    public init(controller: CGController) {
        this.controller = controller;
        this.loadChipSetID();//讀取籌碼設置資料
        this.updateTouchChip();//更新點選的籌碼(每局更新)
    }

    /**
     * 組件加載時初始化
     * 設置縮放按鈕和彈窗的事件監聽器
     */
    protected onLoad(): void {
        const scriptName = this.name.match(/<(.+)>/)?.[1] || '';
        //點選的籌碼觸發事件
        for (let i = 0; i < this.touchChip.children.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'setTouchChipID';
            eventHandler.customEventData = i.toString();
            this.touchChip.children[i].getComponent(Toggle).clickEvents.push(eventHandler);
        }

        //選擇籌碼按鈕觸發事件
        const chipToggleChildren = this.chipToggle.children;
        for (let i = 0; i < chipToggleChildren.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'chipSet';
            eventHandler.customEventData = i.toString();
            chipToggleChildren[i].getComponent(Toggle).clickEvents.push(eventHandler);
        }

        //顯示彈窗按鈕設置
        const openEventHandler = new EventHandler();
        openEventHandler.target = this.node;
        openEventHandler.component = scriptName;
        openEventHandler.handler = 'chipSetPopupShow';
        this.btnChipSet.getComponent(Button).clickEvents.push(openEventHandler);

        //確認按鈕設置
        const confirmEventHandler = new EventHandler();
        confirmEventHandler.target = this.node;
        confirmEventHandler.component = scriptName;
        confirmEventHandler.handler = 'chipSetConfirm';
        this.btnConfirm.getComponent(Button).clickEvents.push(confirmEventHandler);

        //預設按鈕設置
        const defaultEventHandler = new EventHandler();
        defaultEventHandler.target = this.node;
        defaultEventHandler.component = scriptName;
        defaultEventHandler.handler = 'chipSetDefault';
        this.btnConfirm.getComponent(Button).clickEvents.push(defaultEventHandler);

        //關閉彈窗按鈕設置
        const closeEventHandler = new EventHandler();
        closeEventHandler.target = this.node;
        closeEventHandler.component = scriptName;
        closeEventHandler.handler = 'chipSetPopupHide';
        this.btnClose.getComponent(Button).clickEvents.push(closeEventHandler);
    }

    /**
     * 設置籌碼範圍
     * @param range 籌碼範圍
     * @controller
     */
    public setChipRange(range: number[]) {
        this.chipRange = range;
    }

    /**
     * 更新籌碼設置
     * 當用戶選擇或取消選擇籌碼時調用此方法
     * @param event 觸發事件
     * @param selectChip 選擇的籌碼ID
     */
    private chipSet(event: Event, selectChip: string) {
        const id = parseInt(selectChip);
        const isChecked = this.chipToggle.children[id].getComponent(Toggle).isChecked;
        if (isChecked && this.chipSetIDing.length > 1)
            this.chipSetIDing.splice(this.chipSetIDing.indexOf(id), 1);
        else if (!isChecked)
            this.chipSetIDing.push(id);
        this.scheduleOnce(() => {
            this.updateChipSet();
        }, 0);
    }

    /**
     * 保存當前籌碼設置並更新顯示
     */
    private chipSetConfirm() {
        this.saveChipSetID();//儲存籌碼配置
        this.updateTouchChip();//更新籌碼設置(籌碼選擇區)
        this.chipSetPopupHide();//關閉視窗
    }

    /**
     * 籌碼設置使用預設值
     */
    private chipSetDefault() {
        this.chipSetIDing = [...this.defaultChipSetID];
        this.saveChipSetID();
        this.updateChipSet();//更新籌碼設置(設置頁面)
    }

    /**
     * 打開籌碼設置視窗
     */
    private chipSetPopupShow() {
        this.chipSetIDing = [...this.chipSetID];
        this.updateChipSet();//更新籌碼設置(設置頁面)
        CGUtils.popupShow(this.chipSetPopup);
    }

    /**
     * 關閉籌碼設置視窗
     */
    private chipSetPopupHide() {
        CGUtils.popupHide(this.chipSetPopup);
    }

    //更新籌碼設置(設置頁面)
    private updateChipSet() {
        const chipToggleChildren = this.chipToggle.children;
        chipToggleChildren.forEach((child, i) => {
            const isSelected = this.chipSetIDing.indexOf(i) > -1 as boolean;
            const toggle = child.getComponent(Toggle);
            const opacity = child.getComponent(UIOpacity);
            toggle.isChecked = isSelected;
            if (this.chipSetIDing.length > 4) {
                toggle.interactable = isSelected;
                opacity.opacity = isSelected ? 255 : 80;
            } else if (!toggle.interactable) {
                toggle.interactable = true;
                opacity.opacity = 255;
            }
        });
    }

    /**
     * 設置點選的籌碼位置
     * @param event 觸發事件
     * @param touchPos 被選中籌碼的位置索引
     */
    private setTouchChipID(event: Event, touchPos: string) {
        this.controller.setTouchChipID(this.chipSetID[parseInt(touchPos)]);
    }

    /**
     * 將當前選擇的籌碼設置保存到本地存儲
     */
    private saveChipSetID() {
        this.chipSetID = [...this.chipSetIDing];
        this.chipSetID.sort((a, b) => a - b);//小到大排列
        const chipSetIDString = JSON.stringify(this.chipSetID);
        sys.localStorage.setItem('chipSetID', chipSetIDString);
    }

    /**
     * 從本地存儲中讀取之前保存的籌碼設置
     * 如果沒有保存的設置,則使用默認設置
     */
    private loadChipSetID() {
        const chipSetIDString = sys.localStorage.getItem('chipSetID');
        if (chipSetIDString)
            this.chipSetID = JSON.parse(chipSetIDString);
        else {
            this.chipSetIDing = [...this.defaultChipSetID];
            this.saveChipSetID();
        }
    }

    /**
     * 更新點選的籌碼(籌碼選擇區)
     */
    private updateTouchChip() {
        const chipSetID = this.chipSetID;
        const touchChipChildren = this.touchChip.children;
        for (let i = 0; i < touchChipChildren.length; i++) {
            const touchChip = touchChipChildren[i];
            const isActive = i < chipSetID.length;
            touchChip.active = isActive;
            if (isActive) {
                const chipToggleChild = this.chipToggle.children[chipSetID[i]];
                touchChip.getChildByName('Sprite').getComponent(Sprite).spriteFrame =
                    chipToggleChild.getChildByName('Sprite').getComponent(Sprite).spriteFrame;
                touchChip.getChildByName('Checkmark').getComponent(Sprite).spriteFrame =
                    chipToggleChild.getChildByName('Checkmark').getComponent(Sprite).spriteFrame;
                touchChip.getChildByName('Label').getComponent(Label).string =
                    CGUtils.NumDigits(this.chipRange[chipSetID[i]]);
            }
        }
        this.controller.setTouchChipID(chipSetID[0]);//選擇籌碼回到第一顆
        touchChipChildren[0].getComponent(Toggle).isChecked = true;
    }
}