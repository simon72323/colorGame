import { _decorator, Component, Label, Node } from 'cc';
import { UtilsKit } from '../lib/UtilsKit';
import { AudioManager } from "../../../colorGame/script/components/AudioManager";
import { SoundFiles } from "../../../colorGame/script/components/SoundFiles";
const { ccclass, property } = _decorator;

@ccclass('TotalWin')
export class TotalWin extends Component {
    
    start() {

    }

    running(payTotal: number): Promise<void> {
        return new Promise(async (resolve) => {
            AudioManager.getInstance().play(SoundFiles.Huwin);

            this.node.active = true; // 顯示免費遊戲結算
            this.node.getChildByName('label').getComponent(Label).string = UtilsKit.NumberSpecification(payTotal); // 設置免費遊戲總得分
            UtilsKit.PlayAnimation(this.node, "totalWinShow"); // 播放得分畫面

            const spineNode: Node = this.node.getChildByName("winSpine");
            await UtilsKit.SetSkeletonAnimation(spineNode, 0, 'total_win_begin', false, true);
            UtilsKit.SetSkeletonAnimation(spineNode, 0, 'total_win_loop', true);
            
            await UtilsKit.PlayAnimation(this.node, "totalWinExit", true);
            this.node.active = false; // 隱藏免費遊戲結算畫面

            resolve();
        })
    }
}

