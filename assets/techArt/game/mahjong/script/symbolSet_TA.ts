import { _decorator, Component, find, UITransform, Vec3, UIOpacity, tween, Sprite, Layout, Vec2, Animation, Prefab, Node } from 'cc';
import { symbolResource_TA } from './symbolResource_TA';
import { PrefabInstancePoolManager } from '../../../../game/mahjong/script/tools/PrefabInstancePoolManager';
const { ccclass, property } = _decorator;

@ccclass('symbolSet_TA')
export class symbolSet_TA extends Component {
    public tileNum: number = 0;//牌型張數
    public symID: number = 0;//牌型編號

    private arrLightNode: Array<Node> = [];

    //初始化
    init(tileNum: number, symID: number) {
        this.tileNum = tileNum;
        this.symID = symID;
        this.node.getComponent(UIOpacity).opacity = 255;//設置透明度
    }

    //設置牌型與貼圖
    setType() {
        const symbolSFTA = find('Canvas/TADemo/symbolResource_TA').getComponent(symbolResource_TA);//獲取場景內的symbolResource_TA腳本
        //隱藏子牌，設置貼圖
        for (let i = 0; i < 4; i++) {
            this.node.children[i].active = false;
            this.node.children[i].getComponent(Sprite).spriteFrame = symbolSFTA.symbolSF[this.symID - 1];//設置貼圖
        }
        for (let i = 0; i < this.node.children.length; i++) {
            this.node.children[i].getComponent(UITransform).setAnchorPoint(new Vec2(0.5, 0.5));//校正中心點(因對退場動畫會控制這個參數)
        }
        //判斷張數配置牌型位置分布
        if (this.tileNum > 2) {
            this.node.getComponent(UITransform).width = 186;
            this.node.children[0].setPosition(new Vec3(-60, 0, 0));
            this.node.children[1].setPosition(new Vec3(0, 0, 0));
            this.node.children[2].setPosition(new Vec3(60, 0, 0));
            this.node.children[3].setPosition(new Vec3(4, 6, 0));
        }
        else if (this.tileNum == 2) {
            this.node.getComponent(UITransform).width = 120;
            this.node.children[0].setPosition(new Vec3(-30, 0, 0));
            this.node.children[1].setPosition(new Vec3(30, 0, 0));
        } else {
            this.node.getComponent(UITransform).width = 60;
            this.node.children[0].setPosition(new Vec3(0, 0, 0));
        }
        this.node.parent.getComponent(Layout).updateLayout();//更新layout
        // this.scheduleOnce(() => {
        //     for (let i = 0; i < this.tileNum; i++) {
        //         this.node.children[i].active = true;//顯示子牌
        //     }
        // }, 0.9)
    }

    //顯示子牌
    showChildren() {
        for (let i = 0; i < this.tileNum; i++) {
            this.node.children[i].active = true;
        }
    }

    //顯示掃光特效
    showLight(symbolLightPrefab: Prefab) {
        for (let i = 0; i < this.tileNum; i++) {
            this.node.children[i].active = true;

            let symbolLight: Node = PrefabInstancePoolManager.instance.takeOut(symbolLightPrefab);
            symbolLight.parent = this.node.children[i];
            symbolLight.active = true;
            this.arrLightNode.push(symbolLight);
        }
    }

    //退出牌型
    exitSet() {
        tween(this.node.getComponent(UIOpacity)).by(0.5, { opacity: 0 }).start();//淡出
        for (let i = 0; i < 4; i++) {
            tween(this.node.children[i]).by(0.5, { position: new Vec3(0, 5, 0) }).start();//持續上移
        }
    }

    clean() {
        while (this.arrLightNode.length > 0) {
            let symbolLight: Node = this.arrLightNode.pop();
            symbolLight.active = false;
            symbolLight.parent.removeChild(symbolLight);
            PrefabInstancePoolManager.instance.pushIn(symbolLight);
        }
    }
}