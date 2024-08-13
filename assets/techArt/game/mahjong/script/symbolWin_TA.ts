import { _decorator, Component, Sprite, find, sp, Animation, Node, Vec3, UIOpacity, Color } from 'cc';
import { symbolResource_TA } from './symbolResource_TA';
const { ccclass } = _decorator;

@ccclass('symbolWin_TA')
export class symbolWin_TA extends Component {

    private targetSymbol: Node = null;

    //設置要執行的symbolWin表演(symID，聽牌狀態，輪軸的symbol節點)
    setSymbolWinData(symID: number, scatterReady: boolean, symbolNode: Node) {
        this.targetSymbol = symbolNode;
        this.getComponent(UIOpacity).opacity = 255;
        this.node.scale = new Vec3(1, 1, 1);//尺寸初始化
        const scatter = this.node.getChildByName('scatter');
        const stayFx = this.node.getChildByName('stayFx');
        const symbol = this.node.getChildByName('symbol');
        const frame = this.node.getChildByName('frame');
        scatter.active = false;
        stayFx.active = false;
        symbol.active = false;
        frame.active = false;
        const symbolSFTA = find('Canvas/TADemo/symbolResource_TA').getComponent(symbolResource_TA);//獲取場景內的symbolResource_TA腳本
        this.node.position = symbolNode.getPosition().add(symbolNode.parent.parent.getPosition());//中獎顯示的世界座標位置
        symbolNode.active = false;//隱藏輪軸的symbol
        if (symID === 43) {
            scatter.getChildByName('scatterSpine').setScale(new Vec3(1, 1, 1,));
            scatter.getChildByName('scatterSpine').getComponent(sp.Skeleton).color = new Color(255, 255, 255, 255);
            scatter.getChildByName('scatterHideFx').getComponent(UIOpacity).opacity = 0;
            scatter.active = true;
            if (scatterReady) {
                stayFx.active = true;
                scatter.getChildByName('scatterSpine').getComponent(sp.Skeleton).setAnimation(0, 'stay', true);//播放scatter聽牌動態
            }
            else
                scatter.getChildByName('scatterSpine').getComponent(sp.Skeleton).setAnimation(0, 'win', true);//播放scatter贏牌動態
        } else {
            symbol.active = true;
            frame.active = true;
            this.node.getComponent(Animation).play();//播放動態
            symbol.getComponent(Sprite).spriteFrame = symbolSFTA.symbolSF[symID - 1];//設置貼圖
        }
    }

    update() {
        if (this.targetSymbol) {
            const targetPos = this.targetSymbol.getPosition().add(this.targetSymbol.parent.parent.getPosition());
            if (this.node.position.y != targetPos.y)
                this.node.position = targetPos;//中獎顯示的世界座標位置
        }
    }
    //scatter牌消除
    scatterRemove() {
        this.node.getChildByName('scatter').getComponent(Animation).play();//播放消除動態
    }

    resetTarget() {
        this.targetSymbol = null;
    }

    onDisable() {
        this.resetTarget();
    }
}