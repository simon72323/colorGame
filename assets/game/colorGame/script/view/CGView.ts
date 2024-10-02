import { _decorator, Component, Node, Label, UITransform, Animation } from 'cc';
import { CGUtils } from '../tools/CGUtils';

const { ccclass, property } = _decorator;
@ccclass('CGView')
export class CGView extends Component {
    @property(Node)//下注區資訊
    private betInfo!: Node;
    @property(Node)//下注額度按鈕(公版)
    private comBtnBet!: Node;
    @property(Node)//額度兌換按鈕(公版)
    private comBtnCredits!: Node;

    /**
     * 更新注區分數顯示
     * @param totalBetAreaCredits 所有注區的總投注額
     * @param betTotal 用戶總投注額
     * @param userBetAreaCredits 該用戶各注區目前下注額
     * @contorller
     */
    public updateBetAreaCredits(totalBetAreaCredits: number[],betTotal?: number, userBetAreaCredits?: number[]) {
        for (let i = 0; i < 6; i++) {
            const node = this.betInfo.children[i];
            node.getChildByName('TotalCredit').getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(totalBetAreaCredits[i]);//更新所有注區注額
        }
        //下注區額度比例更新
        const total = totalBetAreaCredits.reduce((a, b) => a + b, 0);
        totalBetAreaCredits.forEach((credit, i) => {
            const per = total === 0 ? 0 : Math.trunc(credit / total * 100);
            const percentNode = this.betInfo.children[i].getChildByName('Percent');
            percentNode.getChildByName('Label').getComponent(Label).string = per + '%';
            percentNode.getChildByName('PercentBar').getComponent(UITransform).width = per;
        });
        if (betTotal)
            this.comBtnBet.getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(betTotal);//更新本地用戶下注總額
        if (userBetAreaCredits) {
            //本地用戶注額更新
            for (let i = 0; i < this.betInfo.children.length; i++) {
                const node = this.betInfo.children[i];
                node.getChildByName('BetCredit').getComponent(Label).string = CGUtils.NumDigits(userBetAreaCredits[i]);//更新本地注區的注額
            }
        }
    }

    /**
     * 更新本地用戶餘額
     * @param credit 用戶餘額
     * @controller
     */
    public updateUserCredit(credit: number) {
        this.comBtnCredits.getComponent(Animation).play();
        this.comBtnCredits.getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(credit);//更新本地用戶餘額
    }

    // /**
    //  * 更新本地用戶下注區注額
    //  * @param userBetAreaCredit 該用戶各注區目前下注額
    //  * @controller
    //  */
    // public updateUserBetAreaCredit(userBetAreaCredit: number[]) {
    //     for (let i = 0; i < this.betInfo.children.length; i++) {
    //         const node = this.betInfo.children[i];
    //         node.getChildByName('BetCredit').getComponent(Label).string = CGUtils.NumDigits(userBetAreaCredit[i]);//更新本地注區的注額
    //     }
    // }

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