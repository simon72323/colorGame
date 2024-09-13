import { _decorator, Component, find, Node, Label, Sprite, Button, Animation, Toggle, UIOpacity, EventHandler } from 'cc';
import { UtilsKitS } from '../../../common/script/lib/UtilsKitS';
import { CGData } from './CGData';
import { CGUI } from './CGUI';
// import { CGValue } from './CGValue';
// import { CGResource } from './CGResource';

const { ccclass, property } = _decorator;
@ccclass('CGChipSet')
export class CGChipSet extends Component {
    @property({ type: CGData, tooltip: "遊戲資料腳本" })
    public gameData: CGData;
    @property({ type: CGUI, tooltip: "遊戲介面腳本" })
    private gameUI: CGUI = null;
    @property({ type: Node, tooltip: "籌碼設置彈窗" })
    public chipSetPopup: Node = null;

    private defaultChipSetID: number[] = [0, 1, 2, 3, 4];//預設籌碼
    private chipSetIDing: number[] = [0, 1, 2, 3, 4];//暫存選擇中的籌碼
    private chipToggle: Node = null;

    onLoad() {
        //按鈕觸發設置
        const scriptName = this.name.split('<')[1].split('>')[0];
        //選擇設置籌碼按鈕觸發事件設置
        this.chipToggle = this.chipSetPopup.getChildByName('Popup').getChildByName('ChipToggle');
        for (let i = 0; i < this.chipToggle.children.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'selectChipSet';
            eventHandler.customEventData = i.toString();
            this.chipToggle.children[i].getComponent(Toggle).clickEvents.push(eventHandler);
        }
    }

    //選擇籌碼
    private selectChipSet(event: Event, data: string) {
        const id = Number(data)
        if (this.chipToggle.children[id].getComponent(Toggle).isChecked) {
            if (this.chipSetIDing.length > 1)
                this.chipSetIDing.splice(this.chipSetIDing.indexOf(id), 1);//取消掉設置中ID(如果只有一組則不取消)
        }
        else
            this.chipSetIDing.push(id);
        this.scheduleOnce(() => {
            this.updataChipSet();
        }, 0)
    }

    //更新籌碼選擇
    public updataChipSet() {
        if (this.chipSetIDing.length > 4) {
            for (let i = 0; i < this.chipToggle.children.length; i++) {
                if (this.chipSetIDing.indexOf(i) === -1) {
                    this.chipToggle.children[i].getComponent(Toggle).interactable = false;
                    this.chipToggle.children[i].getComponent(Toggle).isChecked = false;
                    this.chipToggle.children[i].getComponent(UIOpacity).opacity = 80;
                } else {
                    this.chipToggle.children[i].getComponent(Toggle).isChecked = true;
                    this.chipToggle.children[i].getComponent(UIOpacity).opacity = 255;
                }
            }
        } else {
            for (let i = 0; i < this.chipToggle.children.length; i++) {
                if (this.chipSetIDing.indexOf(i) === -1)
                    this.chipToggle.children[i].getComponent(Toggle).isChecked = false;
                else
                    this.chipToggle.children[i].getComponent(Toggle).isChecked = true;
                if (!this.chipToggle.children[i].getComponent(Toggle).interactable) {
                    this.chipToggle.children[i].getComponent(Toggle).interactable = true;
                    this.chipToggle.children[i].getComponent(UIOpacity).opacity = 255;
                }
            }
        }
    }

    //更新選擇的籌碼
    public updataSelectChip() {
        const chipSetID = this.gameData.userInfo.ChipSetID;
        for (let i = 0; i < this.gameUI.selectChip.children.length; i++) {
            const selectChip = this.gameUI.selectChip.children[i];
            if (chipSetID.length > i) {
                selectChip.active = true;
                selectChip.getChildByName('Sprite').getComponent(Sprite).spriteFrame =
                    this.chipToggle.children[chipSetID[i]].getChildByName('Sprite').getComponent(Sprite).spriteFrame;
                selectChip.getChildByName('Checkmark').getComponent(Sprite).spriteFrame =
                    this.chipToggle.children[chipSetID[i]].getChildByName('Checkmark').getComponent(Sprite).spriteFrame;
                selectChip.getChildByName('Label').getComponent(Label).string =
                    UtilsKitS.NumDigits(this.gameData.gameSetInfo.ChipRange[chipSetID[i]]);
            } else
                selectChip.active = false;
        }
        this.gameData.selectChipID = chipSetID[0];
        this.gameUI.selectChip.children[0].getComponent(Toggle).isChecked = true;
    }

    //設置視窗顯示
    public chipSetPopupShow() {
        this.chipSetIDing = [...this.gameData.userInfo.ChipSetID];
        this.updataChipSet();
        this.chipSetPopup.active = true;
        this.chipSetPopup.getChildByName('Popup').getChildByName('BtnClose').getComponent(Button).interactable = true;
        this.chipSetPopup.getComponent(Animation).play('PopupShow');
    }


    public btnConfirm() {
        console.log("選擇的籌碼", this.chipSetIDing)
        this.gameData.userInfo.ChipSetID = this.chipSetIDing;
        this.gameData.userInfo.ChipSetID.sort((a, b) => a - b);//小到大排列
        this.chipSetPopupHide();
        this.updataSelectChip();//重新設置籌碼
    }

    public btnDefault() {
        this.chipSetIDing = this.defaultChipSetID;
        this.updataChipSet();
    }

    public chipSetPopupHide() {
        this.chipSetPopup.getChildByName('Popup').getChildByName('BtnClose').getComponent(Button).interactable = false;
        this.chipSetPopup.getComponent(Animation).play('PopupHide');
        setTimeout(() => {
            this.chipSetPopup.active = false;
        }, 200)
    }
}