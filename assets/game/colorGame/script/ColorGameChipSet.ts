import { _decorator, Component, find, Node, Label, Sprite, Button, Animation, color, Toggle, UIOpacity } from 'cc';
import { UtilsKitS } from '../../../common/script/lib/UtilsKitS';
import { ColorGameData } from './ColorGameData';
import { ColorGameMain } from './ColorGameMain';
// import { ColorGameValue } from './ColorGameValue';
// import { ColorGameResource } from './ColorGameResource';
const { ccclass, property } = _decorator;

@ccclass('ColorGameChipSet')
export class ColorGameChipSet extends Component {
    private gameData: ColorGameData = null;
    public gameMain: ColorGameMain = null;

    @property({ type: Node, tooltip: "籌碼設置彈窗" })
    public chipSetPopup: Node = null;

    private defaultChipSetID: number[] = [0, 1, 2, 3, 4];
    private saveChipSetID: number[] = [1, 2, 3, 4, 5]

    onLoad() {
        this.gameData = find('Canvas/Scripts/ColorGameData').getComponent(ColorGameData);
        this.gameMain = find('Canvas/Scripts/ColorGameMain').getComponent(ColorGameMain);
    }


    public selectChipSet(event: Event, data: string) {

        const id = Number(data)
        const chipToggle = this.chipSetPopup.getChildByName('Popup').getChildByName('ChipToggle');
        if (chipToggle.children[id].getComponent(Toggle).isChecked) {
            // console.log("刪除選擇的那一筆")
            this.gameData.chipSetID.splice(this.gameData.chipSetID.indexOf(id), 1);
            console.log(this.gameData.chipSetID)
        }

        else {
            if (this.gameData.chipSetID.length > 4) {
                // console.log("最多選5個")
                this.scheduleOnce(() => {
                    chipToggle.children[id].getComponent(Toggle).isChecked = false;
                }, 0.02)
            } else {
                // console.log("添加一筆")
                this.gameData.chipSetID.push(id);
                console.log(this.gameData.chipSetID)
            }
        }
        // const length = this.gameData.chipSetID.length;
        if (this.gameData.chipSetID.length === 0) {
            // console.log("至少選一個")
            this.scheduleOnce(() => {
                chipToggle.children[id].getComponent(Toggle).isChecked = true;
            }, 0.02)
            this.gameData.chipSetID.push(id);
            console.log(this.gameData.chipSetID)
        }
        this.scheduleOnce(() => {
            this.updataChipSet();
        }, 0.02)
    }

    //更新籌碼選擇
    public updataChipSet() {
        // let selectingID = this.gameData.chipSetID;//紀錄選擇中的籌碼ID
        console.log(this.gameData.chipSetID.length);
        const chipToggle = this.chipSetPopup.getChildByName('Popup').getChildByName('ChipToggle');
        if (this.gameData.chipSetID.length > 4) {
            for (let i = 0; i < chipToggle.children.length; i++) {
                if (this.gameData.chipSetID.indexOf(i) === -1) {
                    chipToggle.children[i].getComponent(Toggle).interactable = false;
                    chipToggle.children[i].getComponent(Toggle).isChecked = false;
                    chipToggle.children[i].getComponent(UIOpacity).opacity = 80;
                } else {
                    chipToggle.children[i].getComponent(Toggle).isChecked = true;
                    chipToggle.children[i].getComponent(UIOpacity).opacity = 255;
                }
            }
        } else {
            for (let i = 0; i < chipToggle.children.length; i++) {
                if (this.gameData.chipSetID.indexOf(i) === -1)
                    chipToggle.children[i].getComponent(Toggle).isChecked = false;
                else
                    chipToggle.children[i].getComponent(Toggle).isChecked = true;
                if (!chipToggle.children[i].getComponent(Toggle).interactable) {
                    chipToggle.children[i].getComponent(Toggle).interactable = true;
                    chipToggle.children[i].getComponent(UIOpacity).opacity = 255;
                }
            }
            // for (let i = 0; i < this.gameData.chipSetID.length; i++) {
            //     chipToggle.children[this.gameData.chipSetID[i]].getComponent(Toggle).isChecked = true;
            // }
        }
    }

    //更新選擇的籌碼
    public updataSelectChip() {
        const chipToggle = this.chipSetPopup.getChildByName('Popup').getChildByName('ChipToggle');
        const chipSetID = this.gameData.chipSetID;
        for (let i = 0; i < this.gameMain.selectChip.children.length; i++) {
            const selectChip = this.gameMain.selectChip.children[i];
            if (chipSetID.length > i) {
                selectChip.active = true;
                selectChip.getChildByName('Sprite').getComponent(Sprite).spriteFrame =
                    chipToggle.children[chipSetID[i]].getChildByName('Sprite').getComponent(Sprite).spriteFrame;
                selectChip.getChildByName('Checkmark').getComponent(Sprite).spriteFrame =
                    chipToggle.children[chipSetID[i]].getChildByName('Checkmark').getComponent(Sprite).spriteFrame;
                selectChip.getChildByName('Label').getComponent(Label).string =
                    UtilsKitS.NumDigits(this.gameData.betScoreRange[chipSetID[i]]);
            } else
                selectChip.active = false;
        }
        this.gameData.selectChipID = chipSetID[0];
        this.gameMain.selectChip.children[0].getComponent(Toggle).isChecked = true;
    }

    public chipSetPopupShow() {
        this.saveChipSetID = [...this.gameData.chipSetID];
        console.log('紀錄的id', this.saveChipSetID)
        this.updataChipSet();
        this.chipSetPopup.active = true;
        //紀錄開啟前的資料
        // this.saveSelectChipID = this.gameData.selectChipID;

        this.chipSetPopup.getChildByName('Popup').getChildByName('BtnClose').getComponent(Button).interactable = true;
        this.chipSetPopup.getComponent(Animation).play('PopupShow');
    }


    public btnConfirm() {
        this.gameData.chipSetID.sort((a, b) => a - b);//小到大排列
        // console.log(this.gameData.chipSetID);
        this.chipSetPopupHide();
        this.updataSelectChip();//重新設置籌碼
    }

    public btnCloce() {
        console.log('回歸紀錄前的id', this.saveChipSetID)
        this.gameData.chipSetID = [...this.saveChipSetID];//回歸設置前參數
        // this.gameData.chipSetID.sort((a, b) => a - b);//小到大排列
        // console.log(this.gameData.chipSetID);
        console.log('回歸紀錄的id', this.saveChipSetID)
        this.chipSetPopupHide();
        // this.updataSelectChip();//重新設置籌碼
    }

    public btnDefault() {
        this.gameData.chipSetID = [...this.defaultChipSetID];//回歸預設參數
        console.log(this.gameData.chipSetID);
        console.log('預設', this.defaultChipSetID);
        this.updataChipSet();
        // this.chipSetPopupHide();
        // this.updataSelectChip();//重新設置籌碼
    }

    public chipSetPopupHide() {
        this.chipSetPopup.getChildByName('Popup').getChildByName('BtnClose').getComponent(Button).interactable = false;
        this.chipSetPopup.getComponent(Animation).play('PopupHide');
        setTimeout(() => {
            this.chipSetPopup.active = false;
        }, 200)
    }
}