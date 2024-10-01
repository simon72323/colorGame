import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Animation } from 'cc';
import { CGUtils } from '../tools/CGUtils';
import { Payoff, RankInfo } from '../enum/CGInterface';

const { ccclass, property } = _decorator;
@ccclass('CGRankView')
export class CGRankView extends Component {
    @property(Node)//用戶位置
    private userPos!: Node;
    @property([Node])
    private rankWinCredit: Node[] = [];//排名用戶贏分節點
    @property([SpriteFrame])//頭像貼圖
    private avatarPhoto: SpriteFrame[] = [];

    /**
     * 更新排名資料
     * @param rankings 排名資料
     * @param userID 本地用戶ID
     * @controller
     */
    public updateRanks(rankings: RankInfo[], userID: number) {
        for (let i = 0; i < 3; i++) {
            const rankUser = this.userPos.children[i + 1].children[0];
            rankUser.getChildByName('Name').getComponent(Label).string = rankings[i].displayName;//更新名稱
            rankUser.getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(rankings[i].credit);//更新餘額
            rankUser.getChildByName('Mask').children[0].getComponent(Sprite).spriteFrame = this.avatarPhoto[rankings[i].avatarID];//更新頭像
            const betCall = rankUser.parent.getChildByName('BtnCall');
            const betStopCall = rankUser.parent.getChildByName('BtnStopCall');
            if (rankings[i].userID === userID) {
                betCall.active = false;
                betStopCall.active = false;
            } else
                if (!betCall.active && !betStopCall.active)
                    betCall.active = true;
        }
    }

    /**
     * 更新線上人數
     * @param liveCount 線上人數
     */
    public updateLiveCount(liveCount: number) {
        this.userPos.children[4].children[0].getChildByName('Label').getComponent(Label).string = liveCount.toString();
    }

    //更新排名用戶餘額
    public updateRanksCredit(ranksPayoff: Payoff[]) {
        for (let i = 0; i < 3; i++) {
            //有贏分才更新
            if (ranksPayoff[i].payoff > 0) {
                this.rankWinCredit[i].getChildByName('Win').getComponent(Label).string = '+' + CGUtils.NumDigits(ranksPayoff[i].payoff);
                this.rankWinCredit[i].active = true;//顯示加分
                const node = this.userPos.children[i + 1].children[0];
                node.getComponent(Animation).play();//分數更新動態
                node.getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(ranksPayoff[i].credit);//更新餘額
            }
        }
    }

    /**
     * 判斷是否跟注
     * @param rankPosID 排名位置
     * @returns 
     */
    public testCall(rankPosID: number) {
        return this.userPos.children[rankPosID].getChildByName('BtnStopCall').active;
    }
}