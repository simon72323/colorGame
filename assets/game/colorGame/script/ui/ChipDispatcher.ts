import { _decorator, Component, Node, tween, Vec3, Label, Sprite, find, Animation, UITransform } from 'cc';
import { ColorGameMain } from '../ColorGameMain';
import { ColorGameResource } from '.././ColorGameResource';
import { ColorGameData } from '../ColorGameData';
import PoolHandler from '../../../../common/script/tools/PoolHandler';

const { ccclass, property } = _decorator;
@ccclass('ChipDispatcher')
export class ChipDispatcher extends Component {
    private gameMain: ColorGameMain = null;
    private gameResource: ColorGameResource = null;
    private gameData: ColorGameData = null;
    private pool: PoolHandler = new PoolHandler;
    @property({ type: Node, tooltip: "莊家位置" })
    public bankerPos: Node = null;

    onLoad() {
        this.gameMain = find('Canvas/Scripts/ColorGameMain').getComponent(ColorGameMain);
        this.gameResource = find('Canvas/Scripts/ColorGameResource').getComponent(ColorGameResource);
        this.gameData = find('Canvas/Scripts/ColorGameData').getComponent(ColorGameData);

        //預先生成pool
        let tempPool = [];
        for (let i = 0; i < 200; i++) {
            tempPool.push(this.pool.get(this.gameResource.betChipBlack));
            if (i > 80)
                tempPool.push(this.pool.get(this.gameResource.betChipColor));
        }
        for (let pool of tempPool) {
            this.pool.put(pool);
        }
        tempPool = [];
        // console.log(tempPool);
    }

    //生成籌碼到注區(注區id，下注人，籌碼分數?)
    public createChipToBetArea(betId: number, playerId: number, chipCredit?: number) {
        const betChip = this.node.children[betId];//下注區節點
        const betChipHeight = betChip.getComponent(UITransform).height;
        const betChipWidth = betChip.getComponent(UITransform).width;
        let poolBetChip: Node;//生成的籌碼
        // let chipParent: Node;//籌碼父節點
        let movePos: Vec3;//籌碼移動位置
        if (playerId === 0) {
            const selectChipID = this.gameData.selectChipID;
            poolBetChip = this.pool.get(this.gameResource.betChipColor);
            poolBetChip.getComponent(Sprite).spriteFrame = this.gameResource.chipSpriteFrame[selectChipID];//設置籌碼貼圖
            chipCredit = this.gameData.betCreditRange[selectChipID];
            poolBetChip.children[0].getComponent(Label).string = this.numberSpecification(chipCredit);//設置籌碼分數
            // chipParent = betChip.children[4];
            poolBetChip.parent = betChip;
            poolBetChip.position = this.gameMain.selectChip.children[selectChipID].getWorldPosition().subtract(betChip.worldPosition);
            // movePos = new Vec3(betChipWidth / 2 - Math.random() * betChipWidth, betChipHeight / 2 - Math.random() * betChipHeight, 0);
            //分數變化
            this.gameData.updataBetInfo(betId, playerId, chipCredit);
            // this.gameData.localBetTotal += chipCredit;//下注分數增加
            // this.gameMain.comBtnBet.getChildByName('Label').getComponent(Label).string = this.numberSpecification(this.gameData.localBetTotal);
            // this.gameMain.comBtnBet.getComponent(Animation).play();
            // this.gameData.localCredit -= chipCredit;//玩家金額減少
            // this.gameMain.comBtnCredits.getChildByName('Label').getComponent(Label).string = this.numberSpecification(this.gameData.localCredit);
        } else {
            this.gameMain.playerPos.children[playerId].getComponent(Animation).play();
            poolBetChip = this.pool.get(this.gameResource.betChipBlack)
            // const chipParent = this.node.getChildByName('ChipOtherPlayer');
            poolBetChip.parent = betChip;
            poolBetChip.position = this.gameMain.playerPos.children[playerId].getWorldPosition().subtract(betChip.worldPosition);
            // movePos = new Vec3(betChipWidth / 2 - Math.random() * betChipWidth, betChipHeight / 2 - Math.random() * betChipHeight, 0);
            // movePos = new Vec3(0, 0, 0);
            // if (playerId < 3) {
            //     this.gameData.otherPlayerCredit[playerId] -= chipCredit;
            //     this.gameMain.playerPos.children[playerId].children[0].getChildByName('Label').getComponent(Label).string = this.numberSpecification(this.gameData.otherPlayerCredit[playerId]);
            // }
        }
        movePos = new Vec3(betChipWidth / 2 - Math.random() * betChipWidth, betChipHeight / 2 - Math.random() * betChipHeight, 0);
        tween(poolBetChip).to(0.3, { position: movePos }, { easing: 'sineOut' })
            .call(() => {
                let betChipCredit = this.gameData.betCreditValue[betId] += chipCredit;//本地玩家下注總分數
                if (playerId === 0) {
                    this.gameMain.betCreditArea.children[betId].getComponent(Label).string = this.numberSpecification(betChipCredit);
                }
                else {
                    // this.pool.put(poolBetChip);
                    poolBetChip.children[0].getComponent(Label).string = this.numberSpecification(betChipCredit);
                }
                this.chipScale(poolBetChip);//籌碼縮放動態
            }).start();
    }

    //籌縮放動態
    chipScale(chip: Node) {
        tween(chip).to(0.03, { scale: new Vec3(1.05, 1.05, 1) })
            .then(tween(chip).to(0.15, { scale: new Vec3(1, 1, 1) }))
            .start();
    }

    //回收籌碼(失敗注區id)callback
    public recycleChip(betId: number) {
        //回收籌碼到莊家位置並清除
        // for (let i = 0; i < betId.length; i++) {
        const betChip = this.node.children[betId];//下注區節點
        // for (let childs of betChip.children) {
        const savePos = betChip.getPosition();
        const movePos = this.bankerPos.getWorldPosition().subtract(betChip.getWorldPosition()).add(savePos);
        tween(betChip).to(0.5, { position: movePos }, { easing: 'sineOut' })
            .call(() => {
                while (betChip.children.length > 0) {
                    this.pool.put(betChip.children[0]);//退還所有子節點
                }
                betChip.setPosition(savePos);//回到原位置
            }).start();
        // }
    }

    //生成派獎籌碼到注區(勝利注區id，倍率)
    public createPayChipToBetArea(betId: number, multiply: number) {
        if (multiply === 3)
            multiply = 9;
        let poolBetChip: Node;//生成的籌碼
        const betChip = this.node.children[betId];//下注區節點
        // for (let chipNode of betChip.children) {
        // const playerId = chipNode.getSiblingIndex();
        if (betChip.children.length > 0) {
            let payNode = new Node();
            //生成籌碼
            for (let i = 0; i < multiply; i++) {
                for (let j = 0; j < betChip.children.length; j++) {
                    // if (playerId > 3) {
                    poolBetChip = this.pool.get(this.gameResource.betChipColor);
                    poolBetChip.parent = payNode;
                    poolBetChip.getComponent(Sprite).spriteFrame = betChip.children[j].getComponent(Sprite).spriteFrame;
                    poolBetChip.children[0].getComponent(Label).string = betChip.children[j].children[0].getComponent(Label).string;
                    // poolBetChip.setPosition(new Vec3(0, (j + betChip.children.length * i) * 5, 0));
                    // }
                    // else {
                    //     poolBetChip = this.pool.get(this.gameResource.betChipBlack);
                    //     poolBetChip.parent = payNode;
                    //     poolBetChip.setPosition(new Vec3(0, (j + chipNode.children.length * i) * 4, 0));
                    // }
                }
            }
            payNode.parent = betChip;
            const startPos = this.bankerPos.getWorldPosition().subtract(betChip.getWorldPosition());
            payNode.position = startPos.add(betChip.position);
            // if (playerId < 4) {
            poolBetChip.children[0].getComponent(Label).string = this.numberSpecification((this.gameData.betCreditValue[betId] * multiply));//更新籌碼派彩分數
            // }
            payNode.setScale(new Vec3(0, 0, 0));
            tween(payNode).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' }).call(() => {
                const movePos = new Vec3(-65, -40, 0);
                this.scheduleOnce(() => {
                    tween(payNode).to(0.5, { position: movePos }, { easing: 'sineOut' }).call(() => {
                        // if (playerId < 4) {
                        //     while (payNode.children.length > 0) {
                        //         const child = payNode.children[0];
                        //         if (chipNode.children.length > 60) {
                        //             this.pool.put(child);//退還
                        //         } else {
                        //             child.parent = chipNode;
                        //             child.setPosition(new Vec3(0, (chipNode.children.length - 2) * 4, 0));
                        //         }
                        //     }
                        //     payNode.destroy();
                        //     this.gameData.betCreditValue[betId][playerId] *= multiply + 1;//更新注區籌碼得分
                        //     // this.gameData.otherPlayerWinCredit[playerId] += this.gameData.betCreditValue[betId][playerId];
                        //     chipNode.children[chipNode.children.length - 1].children[0].getComponent(Label).string = this.numberSpecification(this.gameData.betCreditValue[betId][playerId]);//更新籌碼派彩分數
                        // } else {
                        while (payNode.children.length > 0) {
                            const child = payNode.children[0];
                            child.parent = betChip;
                            child.position.add(new Vec3(-65, -40, 0));
                        }
                        payNode.destroy();
                        // this.gameMain.betCredit.children[betId].getComponent(Label).string = this.numberSpecification((this.gameData.betCreditValue[betId][4] * (multiply + 1)));
                        // }
                        this.chipScale(betChip);//籌碼縮放動態
                        this.scheduleOnce(() => {
                            // if (playerId < 5)
                            this.chipPayToPlayer(betId);
                            // this.gameData.betCreditValue[betId][childId] *= multiply + 1;//更新各注區籌碼得分
                        }, 0.4)
                    }).start();
                }, 0.4)
            }).start()
        }
        // }
    }

    //注區籌碼派彩給玩家(勝利注區id，籌碼位置id)
    private chipPayToPlayer(betId: number) {
        // console.log("贏注區", betId, "贏玩家", playerId)
        const betChip = this.node.children[betId];
        // const moveChip = betChip.children[playerId];//下注區節點
        const savePos = betChip.getPosition();
        let movePos: Vec3;
        // if (playerId < 4)
        // movePos = this.gameMain.playerPos.children[playerId].getWorldPosition().subtract(moveChip.getWorldPosition()).add(savePos);
        // else
        movePos = this.gameMain.playerPos.children[4].getWorldPosition().subtract(betChip.getWorldPosition()).add(savePos);
        tween(betChip).to(0.5, { position: movePos }, { easing: 'sineOut' }).call(() => {
            while (betChip.children.length > 0) {
                this.pool.put(betChip.children[0]);
            }
            betChip.setPosition(savePos);//籌碼位置回歸
        }).start();
    }

    /**規格化數值(取小數點後2位)*/
    private numberSpecification(num: number): string {
        return num.toLocaleString('zh', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
    }
}