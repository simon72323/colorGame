import { _decorator, Component, Node, Label, UITransform, UIOpacity } from 'cc';
import { CGUtils } from '../tools/CGUtils';

const { ccclass, property } = _decorator;
@ccclass('CGView')
export class CGView extends Component {
    @property(Node)//下注區資訊
    public betInfo!: Node;
    @property(Node)//下注額度按鈕(公版)
    public comBtnBet!: Node;
    @property(Node)//額度兌換按鈕(公版)
    public comBtnCredits!: Node;

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
     * 更新本地用戶注額
     * @param userTotalBet 用戶總投注額
     * @param credit 用戶餘額
     * @controller
     */
    public updateUserBetCredit(userTotalBet: number, credit: number) {
        this.comBtnBet.getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(userTotalBet);//更新本地用戶總額
        this.comBtnCredits.getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(credit);//更新本地用戶餘額
    }

    /**
     * 更新本地用戶下注區注額
     * @param userBetAreaCredit 該用戶各注區目前下注額
     * @controller
     */
    public updateUserBetAreaCredit(userBetAreaCredit: number[]) {
        for (let i = 0; i < this.betInfo.children.length; i++) {
            const node = this.betInfo.children[i];
            node.getChildByName('BetCredit').getComponent(Label).string = CGUtils.NumDigits(userBetAreaCredit[i]);//更新本地注區的注額
        }
    }

    // /**
    //  * 設置投注資訊透明度
    //  */
    // public newRoundViewInit(){
    //     // this.bgLight.getComponent(Animation).play('BgLightIdle');
    //     for (let i = 0; i < 6; i++) {
    //         this.betInfo.children[i].getComponent(UIOpacity).opacity = 255;
    //     }
    // }
}