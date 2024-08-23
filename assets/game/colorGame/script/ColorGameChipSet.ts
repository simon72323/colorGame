import { _decorator, Component, find, Node, Label, Sprite, Button, Animation, color, Toggle } from 'cc';
import { ColorGameData } from './ColorGameData';
// import { ColorGameValue } from './ColorGameValue';
// import { ColorGameResource } from './ColorGameResource';
const { ccclass, property } = _decorator;

@ccclass('ColorGameChipSet')
export class ColorGameChipSet extends Component {
    private gameData: ColorGameData = null;
    // private gameResource: ColorGameResource = null;

    // @property({ type: Node, tooltip: "走勢" })
    // private roadMap: Node = null;
    @property({ type: Node, tooltip: "籌碼設置彈窗" })
    private chipSetPopup: Node = null;

    onLoad() {
        this.gameData = find('Canvas/Scripts/ColorGameData').getComponent(ColorGameData);
        // this.gameResource = find('Canvas/Scripts/GameResource').getComponent(ColorGameResource);
    }


    public selectChipSet(event: Event, id: number) {
        if (this.gameData.chipSet.indexOf(id) === -1) {
            this.gameData.chipSet[4]
        }

    }

    //更新籌碼選擇
    public updataChipSet() {
        const chipToggle = this.chipSetPopup.getChildByName('Popup').getChildByName('ChipToggle');
        for (let i = 0; i < chipToggle.children.length; i++) {
            chipToggle.children[i].getComponent(Toggle).isChecked = false;
        }
        for (let i = 0; i < this.gameData.chipSet.length; i++) {
            chipToggle.children[this.gameData.chipSet[i]].getComponent(Toggle).isChecked = true;
        }
    }

    public chipSetPopupShow() {
        this.chipSetPopup.active = true;
        this.chipSetPopup.getChildByName('Popup').getChildByName('BtnClose').getComponent(Button).interactable = true;
        this.chipSetPopup.getComponent(Animation).play('PopupShow');
    }

    public chipSetPopupHide() {
        this.chipSetPopup.getChildByName('Popup').getChildByName('BtnClose').getComponent(Button).interactable = false;
        this.chipSetPopup.getComponent(Animation).play('PopupHide');
        setTimeout(() => {
            this.chipSetPopup.active = false;
        }, 200)
    }
}