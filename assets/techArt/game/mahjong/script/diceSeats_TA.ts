import { _decorator, Component, Node, AudioSource, UIOpacity, Sprite, Animation, SpriteFrame, BlockInputEvents } from 'cc';
import { UtilsKit } from '../../../../game/mahjong/script/lib/UtilsKit';
import { AudioManager } from '../../../../game/mahjong/script/components/AudioManager';
import { SoundFiles } from '../../../../game/mahjong/script/components/SoundFiles';
import { LanguageManager } from '../../../../game/mahjong/script/LanguageManager';
import { LanguageFiles } from '../../../../game/mahjong/script/LanguageFiles';
import { symbolResource_TA } from './symbolResource_TA';
import { log } from '../../../../game/mahjong/script/include';
const { ccclass, property } = _decorator;

@ccclass('diceSeats_TA')
export class diceSeats_TA extends Component {
    private dice1: number = 0;//骰子1點數
    private dice2: number = 0;//骰子2點數
    @property({ type: Node, tooltip: "左骰子" })
    private diceL: Node = null;
    @property({ type: Node, tooltip: "右骰子" })
    private diceR: Node = null;
    @property({ type: Node, tooltip: "左花" })
    private symL: Node = null;
    @property({ type: Node, tooltip: "右花" })
    private symR: Node = null;
    @property({ type: symbolResource_TA, tooltip: "symbol資源" })
    private symbolResourceTA: symbolResource_TA = null;

    //隨機獲取某區間的整數
    // private getRandomNumber(min: number, max: number) {
    //     const range: number = max - min + 1;
    //     const scaledNumber: number = Math.floor(Math.random() * range) + min;
    //     return scaledNumber;
    // }

    //執行抓位骰子表演
    public async runDiceSeats(diceNum: Array<number>, myFlowerID: Array<number>): Promise<void> {
        log("runDiceSeats", diceNum, myFlowerID);
        AudioManager.getInstance().play(SoundFiles.DiceSeats); // 播放音效
        LanguageManager.getInstance().setSpriteFrame(this.node.getChildByName('tx').getComponent(Sprite), LanguageFiles.PickingSeats);

        return new Promise(async (resolve) => {
            this.dice1 = diceNum[0];
            this.dice2 = diceNum[1];
            this.diceL.active = false;
            this.diceR.active = false;

            //根據點數設置花牌貼圖
            this.symL.getComponent(Sprite).spriteFrame = this.symbolResourceTA.symbolSF[myFlowerID[0] - 1];
            this.symR.getComponent(Sprite).spriteFrame = this.symbolResourceTA.symbolSF[myFlowerID[1] - 1];

            this.node.getComponent(UIOpacity).opacity = 0;
            await UtilsKit.PlayAnimation(this.node, null, true); // 播放動態

            resolve();
        })
    }

    //顯示骰子(接收動態事件)
    private showDice() {
        this.diceL.active = true;
        this.diceR.active = true;
        //播放骰子點數動態
        this.diceL.getComponent(Animation).play('diceL_' + this.dice1.toString());
        this.diceR.getComponent(Animation).play('diceR_' + this.dice2.toString());
    }

    public showMyFlower(b: boolean) {
        let opacity: number = b? 255:0
        this.node.getComponent(UIOpacity).opacity = opacity;
    }
}