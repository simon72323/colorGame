import { _decorator, Component, Node, Label, UITransform, Sprite, SpriteFrame } from 'cc';
import { CGUtils } from '../tools/CGUtils';

const { ccclass, property } = _decorator;
@ccclass('CGView')
export class CGView extends Component {
    @property({ type: Node, tooltip: "下注區資訊" })
    public betInfo: Node = null;

    @property({ type: Node, tooltip: "玩家位置" })
    public playerPos: Node = null;

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
    public updateUserRanks(name: string, credit: number, avatar: SpriteFrame) {
        for (let i = 1; i < 4; i++) {
            const node = this.playerPos.children[i].children[0];
            node.getChildByName('Name').getComponent(Label).string = name;//更新名稱
            node.getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(credit);//更新餘額
            node.getChildByName('Mask').children[0].getComponent(Sprite).spriteFrame = avatar;//更新頭像
        }
    }
}