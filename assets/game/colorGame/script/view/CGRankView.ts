import { _decorator, Component, Node, Label, Sprite, SpriteFrame } from 'cc';
import { CGUtils } from '../tools/CGUtils';
import { RankInfo } from '../enum/CGInterface';

const { ccclass, property } = _decorator;
@ccclass('CGRankView')
export class CGRankView extends Component {
    @property([SpriteFrame])//頭像貼圖
    public avatarPhoto!: SpriteFrame[];

    /**
     * 更新用戶排名
     * @param userPos 用戶節點
     * @param rankings 排名資料
     * @param userID 用戶ID
     * @param liveCount 其他線上人數
     * @controller
     */
    public updateUserRanks(userPos: Node, rankings: RankInfo[], userID: number, liveCount: number) {
        for (let i = 0; i < 3; i++) {
            const node = userPos.children[i + 1].children[0];
            node.getChildByName('Name').getComponent(Label).string = rankings[i].displayName;//更新名稱
            node.getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(rankings[i].credit);//更新餘額
            node.getChildByName('Mask').children[0].getComponent(Sprite).spriteFrame = this.avatarPhoto[rankings[i].avatarID];//更新頭像
            if (rankings[i].userID === userID)
                console.log("排名有本地用戶，隱藏該欄位跟注功能")
        }
        userPos.children[4].children[0].getChildByName('Label').getComponent(Label).string = liveCount.toString();//更新其他人數
    }
}