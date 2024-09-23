import { _decorator, Component, Node, Label, UITransform, Sprite, SpriteFrame } from 'cc';
import { CGUtils } from '../tools/CGUtils';
import { RankInfo } from '../enum/CGInterface';

const { ccclass, property } = _decorator;
@ccclass('CGView')
export class CGView extends Component {
    @property({ type: Node, tooltip: "下注區資訊" })
    public betInfo: Node = null;

    @property({ type: Node, tooltip: "玩家位置" })
    public playerPos: Node = null;
    @property({ type: [SpriteFrame], tooltip: "頭像貼圖", group: { name: '貼圖資源', id: '2' } })
    public avatarPhoto: SpriteFrame[] = [];

    @property({ type: Node, tooltip: "下注額度按鈕(公版)" })
    public comBtnBet: Node = null;
    @property({ type: Node, tooltip: "額度兌換按鈕(公版)" })
    public comBtnCredits: Node = null;

    /**
     * 更新總投注額
     * @param totalBets 所有注區的總投注額[]
     * @contorller
     */
    public updateTotalBets(totalBets: number[]) {
        for (let i = 0; i < 6; i++) {
            const node = this.betInfo.children[i];
            node.getChildByName('TotalCredit').getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(totalBets[i]);//更新所有注區注額
        }
        //下注區額度比例更新
        const total = totalBets.reduce((a, b) => a + b, 0);
        totalBets.forEach((credit, i) => {
            const per = total === 0 ? 0 : Math.trunc(credit / total * 100);
            const percentNode = this.betInfo.children[i].getChildByName('Percent');
            percentNode.getChildByName('Label').getComponent(Label).string = per + '%';
            percentNode.getChildByName('PercentBar').getComponent(UITransform).width = per;
        });
    }

    /**
     * 更新本地用戶投注額
     * @param userTotalBet 用戶總投注額
     * @param credit 用戶餘額
     * @param userBets 用戶在各注區的投注額[]
     * @controller
     */
    public updateUserBetCredit(userTotalBet: number, credit: number, userBets: number[]) {
        this.comBtnBet.getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(userTotalBet);//更新本地用戶總額
        this.comBtnCredits.getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(credit);//更新本地用戶餘額
        for (let i = 0; i < 6; i++) {
            const node = this.betInfo.children[i];
            node.getChildByName('BetCredit').getComponent(Label).string = CGUtils.NumDigits(userBets[i]);//更新本地用戶各注區的注額
        }
    }

    /**
     * 更新用戶排名
     * @param name 用戶名稱
     * @param credit 用戶餘額
     * @param avatar 用戶頭像
     * @controller
     */
    public updateUserRanks(rankings: RankInfo[], userID: number, liveCount: number) {
        for (let i = 0; i < 3; i++) {
            const node = this.playerPos.children[i + 1].children[0];
            node.getChildByName('Name').getComponent(Label).string = rankings[i].displayName;//更新名稱
            node.getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(rankings[i].credit);//更新餘額
            node.getChildByName('Mask').children[0].getComponent(Sprite).spriteFrame = this.avatarPhoto[rankings[i].avatar];//更新頭像
            if (rankings[i].userID === userID)
                console.log("排名有本地玩家，隱藏該欄位跟注功能")
        }

    }
}