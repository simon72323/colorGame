import { _decorator, Animation, Component, Label, Node } from 'cc';
import { symbolSet_TA } from '../../../../techArt/game/mahjong/script/symbolSet_TA';
import { UtilsKit } from '../lib/UtilsKit';
const { ccclass, property } = _decorator;

@ccclass('Multiple')
export class Multiple extends Component {

    private currentMultiple = -1; // 目前倍率

    static myFlowerID: Array<number> = []; // 本花 ID
    static payRate: number[] = [0, 0.2, 0.6, 1.8, 5.8, 12.4]; // 賠率表
    static taiNum: Array<number> = [0, 24, 16, 16, 16, 8, 8, 12, 4, 3, 3, 2]; // 胡牌 ID 對應台數


    static calculateMultiple(arrSet: Array<symbolSet_TA>, arrFlower: Array<symbolSet_TA>): number {
        // 元件編號
        // 1~9:萬牌, 10~18:筒牌, 19~27:條牌, 28:東, 29:南, 30:西. 31:北, 32:中, 33:發, 34:白
        // 35:春, 36:夏, 37:秋, 38:冬, 39:梅. 40:蘭 41:竹 42:菊 43:free

        // 槓牌 +1台 (含萬筒條)
        // 花槓 （梅蘭菊竹， 春夏秋冬） +3台
        // 本花 +1台
        // 東南西北 碰+1台 槓+2台
        // 中發白 碰+2台 槓+3台

        let multipleLevel: number = arrSet.length;
        let points: number = 0;

        for (let i:number = 0; i < multipleLevel; i++) {
            let symID: number = arrSet[i].symID;
            let tileNum: number = arrSet[i].tileNum;
            if (symID <= 27) { // 萬筒條
                if (tileNum == 4) {
                    points++;
                }
            } else if (symID <= 31) { // 東南西北
                if (tileNum == 3) {
                    points++;
                } else if (tileNum == 4) {
                    points+=2;
                }
            } else if (symID <= 34) { // 中發白
                if (tileNum == 3) {
                    points+=2;
                } else if (tileNum == 4) {
                    points+=3;
                }
            }
        }

        // 要有碰或槓才計算花牌
        if (multipleLevel > 0) {
            let myFlowerIDLen: number = Multiple.myFlowerID.length;
            let len: number = arrFlower.length;
            let flowerType1Amount: number = 0;
            let flowerType2Amount: number = 0;
            let flowerType1Points: number = 0;
            let flowerType2Points: number = 0;
            for (let i:number = 0; i < len; i++) {
                if (arrFlower[i].symID < 39) {
                    flowerType1Amount++;

                    for (let k:number = 0; k < myFlowerIDLen; k++) {
                        if (arrFlower[i].symID == Multiple.myFlowerID[k]) {
                            flowerType1Points++;
                            break;
                        }
                    }
                } else {
                    flowerType2Amount++;

                    for (let k:number = 0; k < myFlowerIDLen; k++) {
                        if (arrFlower[i].symID == Multiple.myFlowerID[k]) {
                            flowerType2Points++;
                            break;
                        }
                    }
                }
            }
            if (flowerType1Amount == 4) { // 春夏秋冬 花槓
                flowerType1Points = Multiple.taiNum[10];
            }
            if (flowerType2Amount == 4) { // 梅蘭菊竹 花槓
                flowerType2Points = Multiple.taiNum[10];
            }
            points += flowerType1Points + flowerType2Points;
        }

        return Number(UtilsKit.NumberSpecification((1 + points) * Multiple.payRate[multipleLevel]));
    }

    static calculateWinningMultiple(payoff: number, bet: number): number {
        return Number(UtilsKit.NumberSpecification(payoff / bet));
    }
    
    updateMultiple(n: number) {
        if (this.currentMultiple != n) {
            this.currentMultiple = n;
            const multipleFx: Node = this.node.getChildByName('multipleFx');
            if (n > 0) {
                this.node.getChildByName('label').getComponent(Label).string = n.toString() + 'x';
                this.node.getComponent(Animation).play(); // 播放倍率切換動態
                multipleFx.active = true;
            } else {
                this.node.getChildByName('label').getComponent(Label).string = ""; // 清空倍率
                multipleFx.active = false;
            }
        }
    }
}

