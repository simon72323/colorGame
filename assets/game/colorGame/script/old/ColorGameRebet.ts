import { _decorator, Component, find, Node, Label, Sprite, Button, Animation, color, Toggle, UIOpacity } from 'cc';
// import { CGUtils } from '../../../common/script/lib/CGUtils';
// import { ColorGameData } from './ColorGameData';
// import { ColorGameMain } from './ColorGameMain';
// import { ColorGameValue } from './ColorGameValue';
// import { ColorGameResource } from './ColorGameResource';
const { ccclass, property } = _decorator;

//續押與自動投注控制
@ccclass('ColorGameReBet')
export class ColorGameReBet extends Component {
    // private gameData: ColorGameData = null;
    // public gameMain: ColorGameMain = null;
    // @property({ type: Node, tooltip: "續押按鈕" })
    // public btnReBet: Node = null;
    // @property({ type: Node, tooltip: "自動投注按鈕" })
    // public btnAuto: Node = null;
    // @property({ type: Node, tooltip: "停止自動投注按鈕" })
    // public btnAutoStop: Node = null;

    onLoad() {
        // this.gameData = find('Canvas/Scripts/ColorGameData').getComponent(ColorGameData);
        // this.gameMain = find('Canvas/Scripts/ColorGameMain').getComponent(ColorGameMain);
    }

    //啟動續押(需要有上局下注紀錄)


}