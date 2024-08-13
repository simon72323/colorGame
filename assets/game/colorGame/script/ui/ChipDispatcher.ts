import { _decorator, Component, Node, tween, Vec3, Label, Animation, Prefab, ToggleContainer, Toggle, instantiate, Sprite } from 'cc';
import { ColorGameResource } from '.././ColorGameResource';
import PoolHandler from '../../../../common/script/tools/PoolHandler';

const { ccclass, property } = _decorator;
@ccclass('ChipDispatcher')
export class ChipDispatcher extends Component {
    /**
     * 注區編號:0=黃，1=灰，2=紫，3=藍，4=紅，5=綠
     * 下注人:0=玩家1，1=玩家2，2=玩家3，3=其他玩家，4=本地玩家
     * 籌碼編號:0=藍，1=紅，2=黃，3=紫，4=綠，5=黑(別的玩家)
     */

    //目前玩家下注籌碼分數([注區][玩家分數])
    public betScore: number[][] = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ];

    // @property({ type: Node, tooltip: "籌碼下注區" })
    // private betArea: Node = null;
    @property({ type: Node, tooltip: "下注分數區" })
    private betScoreArea: Node = null;
    @property({ type: Node, tooltip: "籌碼選擇區" })
    private selectChipArea: Node = null;
    @property({ type: Node, tooltip: "玩家位置" })
    private playerPos: Node = null;
    @property({ type: ColorGameResource, tooltip: "資源" })
    private resource: ColorGameResource = null;
    // @property({ type: Node, tooltip: "籌碼移動層" })
    // private chipMoveing: Node = null;
    @property({ type: Node, tooltip: "莊家派彩位置" })
    private bankerPos: Node = null;
    private pool: PoolHandler = new PoolHandler;

    onLoad() {

    }

    //生成籌碼到注區(注區id，下注人，籌碼分數?)
    public createChipToBetArea(betId: number, playerId: number, chipScore?: number) {
        const betChip = this.node.children[betId];//下注區節點
        let poolBetChip: Node;//生成的籌碼
        let chipParent: Node;//籌碼父節點
        let movePos: Vec3;//籌碼移動位置
        if (playerId === 4) {
            let selectChipID: number;
            for (let i = 0; i < this.selectChipArea.children.length; i++) {
                if (this.selectChipArea.children[i].getComponent(Toggle).isChecked) {
                    selectChipID = i;
                    break;
                }
            }
            poolBetChip = this.pool.get(this.resource.betChipColor);
            poolBetChip.getComponent(Sprite).spriteFrame = this.resource.chipSpriteFrame[selectChipID];//設置籌碼貼圖
            const selectChipNode = this.selectChipArea.children[selectChipID];
            chipScore = Number(selectChipNode.getChildByName('Label').getComponent(Label).string);
            chipParent = betChip.children[4].children.length < 10 ? betChip.children[4] : betChip.children[5];
            poolBetChip.parent = chipParent;
            poolBetChip.position = selectChipNode.getWorldPosition().subtract(chipParent.worldPosition);
            movePos = new Vec3(0, (chipParent.children.length - 1) * 5, 0);
        } else {
            poolBetChip = this.pool.get(this.resource.betChipBlack)
            chipParent = betChip.children[playerId];
            poolBetChip.parent = chipParent;
            poolBetChip.position = this.playerPos.children[playerId].getWorldPosition().subtract(chipParent.worldPosition);
            movePos = new Vec3(0, (chipParent.children.length - 1) * 4, 0);
        }
        poolBetChip.children[0].getComponent(Label).string = chipScore.toString();//設置籌碼分數
        tween(poolBetChip).to(0.3, { position: movePos }, { easing: 'sineOut' })
            .call(() => {
                let betChipScore = this.betScore[betId][playerId] += chipScore;//該玩家總籌碼下注分數
                if (playerId === 4)
                    this.betScoreArea.children[betId].getComponent(Label).string = betChipScore.toString();
                else
                    poolBetChip.children[0].getComponent(Label).string = betChipScore.toString()
                this.chipScale(chipParent);//籌碼縮放動態
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
        for (let childs of betChip.children) {
            const savePos = childs.getPosition();
            const movePos = this.bankerPos.getWorldPosition().subtract(childs.getWorldPosition()).add(savePos);
            tween(childs).to(0.5, { position: movePos }, { easing: 'sineOut' })
                .call(() => {
                    while (childs.children.length > 0) {
                        this.pool.put(childs.children[0]);//退還所有子節點
                    }
                    childs.setPosition(savePos);//回到原位置
                }).start();
        }
    }

    //生成派獎籌碼到注區(勝利注區id，倍率)
    public createPayChipToBetArea(betId: number, multiply: number) {
        let poolBetChip: Node;//生成的籌碼
        const betChip = this.node.children[betId];//下注區節點
        for (let chipNode of betChip.children) {
            const childId = chipNode.getSiblingIndex();
            if (chipNode.children.length > 0) {
                let payNode = new Node();
                //生成籌碼
                for (let i = 0; i < multiply; i++) {
                    for (let j = 0; j < chipNode.children.length; j++) {
                        if (childId > 3) {
                            poolBetChip = this.pool.get(this.resource.betChipColor);
                            poolBetChip.parent = payNode;
                            poolBetChip.getComponent(Sprite).spriteFrame = chipNode.children[j].getComponent(Sprite).spriteFrame;
                            poolBetChip.children[0].getComponent(Label).string = chipNode.children[j].children[0].getComponent(Label).string;
                            poolBetChip.setPosition(new Vec3(0, (j + chipNode.children.length * i) * 5, 0));
                        }
                        else {
                            poolBetChip = this.pool.get(this.resource.betChipBlack);
                            poolBetChip.parent = payNode;
                            poolBetChip.setPosition(new Vec3(0, (j + chipNode.children.length * i) * 4, 0));
                        }
                    }
                }
                payNode.parent = chipNode;
                const startPos = this.bankerPos.getWorldPosition().subtract(chipNode.getWorldPosition());
                payNode.position = startPos.add(chipNode.position);
                if (childId < 4) {
                    poolBetChip.children[0].getComponent(Label).string = (this.betScore[betId][childId] * multiply).toString();//更新籌碼派彩分數
                }
                payNode.setScale(new Vec3(0, 0, 0));
                tween(payNode).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' }).call(() => {
                    const movePos = childId < 4 ? new Vec3(0, 0, 0) : new Vec3(-65, -40, 0);
                    this.scheduleOnce(() => {
                        tween(payNode).to(0.5, { position: movePos }, { easing: 'sineOut' }).call(() => {
                            if (childId < 4) {
                                while (payNode.children.length > 0) {
                                    const child = payNode.children[0];
                                    if (chipNode.children.length > 60) {
                                        this.pool.put(child);//退還
                                    } else {
                                        child.parent = chipNode;
                                        child.setPosition(new Vec3(0, (chipNode.children.length - 2) * 4, 0));
                                    }
                                }
                                payNode.destroy();
                                chipNode.children[chipNode.children.length - 1].children[0].getComponent(Label).string = (this.betScore[betId][childId] * (multiply + 1)).toString();//更新籌碼派彩分數
                            } else {
                                while (payNode.children.length > 0) {
                                    const child = payNode.children[0];
                                    child.parent = chipNode;
                                    child.position.add(new Vec3(-65, -40, 0));
                                }
                                payNode.destroy();
                                this.betScoreArea.children[betId].getComponent(Label).string = (this.betScore[betId][4] * (multiply + 1)).toString();
                            }
                            this.chipScale(chipNode);//籌碼縮放動態
                            this.scheduleOnce(() => {
                                if (childId < 5) { }
                                this.betScore[betId][childId] *= multiply + 1;//更新各注區籌碼得分
                                this.chipPayToPlayer(betId, childId);
                            }, 0.4)
                        }).start();
                    }, 0.4)
                }).start()
            }
        }
    }

    //注區籌碼派彩給玩家(勝利注區id，籌碼位置id)
    private chipPayToPlayer(betId: number, chipPosId: number) {
        const betChip = this.node.children[betId];
        const moveChip = betChip.children[chipPosId];//下注區節點
        const savePos = moveChip.getPosition();
        let movePos: Vec3;
        if (chipPosId < 4)
            movePos = this.playerPos.children[chipPosId].getWorldPosition().subtract(moveChip.getWorldPosition()).add(savePos);
        else
            movePos = this.playerPos.children[4].getWorldPosition().subtract(moveChip.getWorldPosition()).add(savePos);
        tween(moveChip).to(0.5, { position: movePos }, { easing: 'sineOut' }).call(() => {
            while (moveChip.children.length > 0) {
                this.pool.put(moveChip.children[0]);
            }
            moveChip.setPosition(savePos);//籌碼位置回歸
        }).start();
    }
}