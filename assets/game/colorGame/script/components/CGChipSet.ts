import { _decorator, Component, Node, Label, Sprite, Toggle, UIOpacity, EventHandler, sys } from 'cc';
import { UtilsKits } from '../tools/UtilsKits';
import { CGUtils } from '../tools/CGUtils';
import { CGGameManager } from './CGGameManager';

const { ccclass, property } = _decorator;
@ccclass('CGChipSet')
export class CGChipSet extends Component {
    @property({ type: Node, tooltip: "籌碼選擇區" })
    public touchChip: Node = null;
    @property({ type: Node, tooltip: "籌碼設置彈窗" })
    public chipSetPopup: Node = null;
    @property({ type: Node, tooltip: "籌碼Toggle" })
    public chipToggle: Node = null;

    public touchChipID: number = 1;//紀錄目前點選的籌碼()
    public chipSetID: number[];//玩家針對此遊戲設置的籌碼ID
    private defaultChipSetID: number[] = [0, 1, 2, 3, 4];//預設籌碼
    private chipSetIDing: number[] = [0, 1, 2, 3, 4];//暫存選擇中的籌碼


    private gameManager: CGGameManager = null;

    public init(gameManager: CGGameManager) {
        this.gameManager = gameManager;
        this.setupEventHandlers();
    }

    //按鈕觸發設置
    setupEventHandlers() {
        const scriptName = 'CGChipSet';
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
    }

    //更新籌碼設置
    private chipSet(event: Event, customEventData: string) {
        const id = parseInt(customEventData);
        const isChecked = this.chipToggle.children[id].getComponent(Toggle).isChecked;
        if (isChecked && this.chipSetIDing.length > 1)
            this.chipSetIDing.splice(this.chipSetIDing.indexOf(id), 1);
        else if (!isChecked)
            this.chipSetIDing.push(id);
        this.scheduleOnce(() => {
            this.updateChipSet();
        }, 0);
    }

    //籌碼設置按鈕確認(節點觸發)
    public chipSetConfirm() {
        this.saveChipSetID();//儲存籌碼配置
        this.updateTouchChip();//更新籌碼設置(設置頁面)
        this.chipSetPopupHide();//關閉視窗
    }

    //籌碼設置按鈕預設(節點觸發)
    public chipSetDefault() {
        this.chipSetIDing = [...this.defaultChipSetID];
        this.saveChipSetID();
        this.updateChipSet();//更新籌碼設置(設置頁面)
    }

    //顯示籌碼設置視窗(節點觸發)
    public chipSetPopupShow() {
        this.chipSetIDing = [...this.chipSetID];
        this.updateChipSet();//更新籌碼設置(設置頁面)
        CGUtils.popupShow(this.chipSetPopup);
    }
    //隱藏籌碼設置視窗(節點觸發)
    public chipSetPopupHide() {
        CGUtils.popupHide(this.chipSetPopup);
    }

    //更新籌碼設置(設置頁面)
    public updateChipSet() {
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

    //設置點選的籌碼位置
    private setTouchChipID(event: Event, touchPos: number) {
        this.touchChipID = this.chipSetID[touchPos];
    }

    // 存儲 chipSetID
    public saveChipSetID() {
        this.chipSetID = [...this.chipSetIDing];
        this.chipSetID.sort((a, b) => a - b);//小到大排列
        const chipSetIDString = JSON.stringify(this.chipSetID);
        sys.localStorage.setItem('chipSetID', chipSetIDString);
    }

    // 讀取 chipSetID
    public loadChipSetID() {
        const chipSetIDString = sys.localStorage.getItem('chipSetID');
        if (chipSetIDString)
            this.chipSetID = JSON.parse(chipSetIDString);
        else {
            this.chipSetIDing = [...this.defaultChipSetID];
            this.saveChipSetID();
        }
        // console.log("讀取籌碼值", this.chipSetID)
    }


    //更新點選的籌碼(籌碼選擇區)
    public updateTouchChip() {
        const chipRange = this.gameManager.dataModel.chipRange;
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
                    UtilsKits.NumDigits(chipRange[chipSetID[i]]);
            }
        }
        this.touchChipID = chipSetID[0];
        touchChipChildren[0].getComponent(Toggle).isChecked = true;
    }
}