import { _decorator, Component, Label, Button, Sprite, Animation, UIOpacity, tween, Vec3, Color } from 'cc';
import { UtilsKitS } from '../../../../common/script/lib/UtilsKitS';
import { CGPathManager } from './CGPathManager';//非loading過程是暫時使用
import { CGGameManager } from './CGGameManager';
const { ccclass, property } = _decorator;

@ccclass('CGManager')
export class CGManager extends Component {


    private GM: CGGameManager = null;//初始化資源腳本

    public init(GM: CGGameManager) {
        this.GM = GM;
        //非loading過程是暫時使用
        CGPathManager.getInstance().node.on("completed", async () => {
            // await this.GM.Model.getOnLoadInfo();//獲取遊戲資料
            this.GM.ChipSet.loadChipSetID();//讀取籌碼設置資料
            this.GM.ChipSet.updateTouchChip();//更新點選的籌碼(每局更新)
            this.newRound();
        });

        //loading流程
        // await this.model.getOnLoadInfo();//獲取遊戲資料
        // this.model.loadChipSetID();//讀取籌碼設置資料
        // this.controller.updateTouchChip();//更新點選的籌碼(每局更新)
        // this.newRound();

        // await this.model.loadRoundData();//獲取新局資料
        //     // this.marquee.addText('----------這是公告~!這是公告~!這是公告~!');
        //     // this.marquee.run();
    }

    //新局開始(server觸發)
    public newRound() {
        const View = this.GM.View;
        const Model = this.GM.Model;
        const ChipController = this.GM.ChipController;
        const DiceRunSet = this.GM.DiceRunSet;
        // Model.getRoundData();//獲取新局資料
        // Model.getBetData();//獲取下注資料
        // model.getTopUserInfo();//獲取前三名玩家資料
        // model.getRoundData();//獲取本回合資料
        // model.getBetInfo();//獲取下注資料
        View.updateRoadMap();//更新路紙(每局更新)
        View.updateUICredit();//更新介面額度
        View.bgLight.getComponent(Animation).play('BgLightIdle');
        DiceRunSet.diceIdle();//初始化骰子(隨機顏色)
        ChipController.testRebet();//判斷是否執行續押
        View.btnRebet.getComponent(Button).interactable = ChipController.isNotAutoBet();//續押按鈕啟用
        for (let i = 0; i < 6; i++) {
            View.betInfo.children[i].getComponent(UIOpacity).opacity = 255;
        }
        this.betStart();//開始押注
    }

    //開始押注(server觸發，或newRound觸發)
    public async betStart() {
        const View = this.GM.View;
        // const Model = this.GM.Model;
        const Zoom = this.GM.Zoom;
        Zoom.zoomShowing();//放大鏡功能顯示
        View.stageTitle.children[0].active = true;//標題顯示
        View.betLight.active = true;//下注提示光
        this.btnState(true);//按鈕啟用
        await UtilsKitS.Delay(1);
        View.stageTitle.children[0].active = false;//標題隱藏

        // //模擬多人下注
        // this.schedule(() => {
        //     this.otherPlayerBet();
        // }, 0.2, 1, 1)

        // let time = Model.loadInfo.betTime;
        // this.setBetTime(time);//下注時間倒數
        // this.schedule(() => {
        //     time--;
        //     this.setBetTime(time);//模擬下注時間倒數
        // }, 1, Model.loadInfo.betTime - 1, 1)
    }

    //下注時間倒數(接收後端時間資料)
    public setBetTime(timer: number) {
        const View = this.GM.View;
        const Model = this.GM.Model;
        const betTimeNode = View.betTime;
        const labelNode = betTimeNode.getChildByName('Label');
        const comLabel = labelNode.getComponent(Label);
        comLabel.string = timer.toString();//顯示秒數
        if (timer === 0) {
            betTimeNode.active = false;
            this.betStop();//下注結束
            return;
        }
        labelNode.setScale(new Vec3(1, 1, 1));
        const lastUIOpacity = betTimeNode.getChildByName('Last').getComponent(UIOpacity);
        lastUIOpacity.opacity = 0;
        if (timer <= 5) {
            comLabel.color = new Color(255, 0, 0, 255);
            tween(betTimeNode).to(0.5, { scale: new Vec3(1.1, 1.1, 1) })
                .then(tween(betTimeNode).to(0.5, { scale: new Vec3(1, 1, 1) }))
                .start();
            tween(lastUIOpacity).to(0.5, { opacity: 255 })
                .then(tween(lastUIOpacity).to(0.5, { opacity: 0 }))
                .start();
        }
        else
            comLabel.color = new Color(0, 90, 80, 255);
        const betTotalTime = Model.loadInfo.betTime;
        const frameSprite = betTimeNode.getChildByName('Frame').getComponent(Sprite);
        frameSprite.fillRange = timer / betTotalTime;
        if (!betTimeNode.active)
            betTimeNode.active = true;
        tween(frameSprite).to(1, { fillRange: (timer - 1) / betTotalTime }).start();//進度條倒數
        tween(labelNode).to(0.2, { scale: new Vec3(1.4, 1.4, 1) }, { easing: 'sineOut' })
            .then(tween(labelNode).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }))
            .start();
    }

    //其他玩家押注
    private async otherPlayerBet() {
        const View = this.GM.View;
        const Model = this.GM.Model;
        const ChipController = this.GM.ChipController;
        const ChipSet = this.GM.ChipSet;
        await UtilsKitS.Delay(0.1 + Math.random() * 0.1);
        for (let i = 1; i < 5; i++) {
            if (Math.random() > 0.5) {
                const randomBetArea = Math.floor(Math.random() * 6);
                const randomChipID = Math.floor(Math.random() * Model.loadInfo.chipRange.length);
                ChipController.createChipToBetArea(randomBetArea, i, randomChipID, false);
                //判斷本地玩家是否跟注
                if (i < 4)
                    if (View.btnStopCall[i - 1].active) {
                        ChipController.createChipToBetArea(randomBetArea, 0, ChipSet.touchChipID, false);//玩家跟注
                    }
            }
        }
    }

    //停止押注
    private async betStop() {
        const View = this.GM.View;
        const Model = this.GM.Model;
        const ChipController = this.GM.ChipController;
        const Zoom = this.GM.Zoom;
        View.stageTitle.children[1].active = true;
        this.btnState(false);//按鈕禁用
        Zoom.zoomHideing();//放大鏡功能隱藏
        await UtilsKitS.Delay(1);
        View.stageTitle.children[1].active = false;
        ChipController.updateRebetData();//更新寫入續押資料
        // Model.getRewardInfo();//獲取開獎結果
        // this.runDice();
    }

    //按鈕啟用狀態
    private btnState(bool: boolean) {
        const View = this.GM.View;
        const ChipController = this.GM.ChipController;
        if (bool)
            ChipController.testRebet();//判斷是否執行續押
        for (let betBtn of View.betArea.children) {
            betBtn.getComponent(Button).interactable = bool;//下注按鈕狀態
        }
        View.btnRebet.getComponent(Button).interactable = bool;//續押按鈕狀態
    }

    //開骰表演(透過server接收後觸發)
    public async runDice() {
        const View = this.GM.View;
        const Model = this.GM.Model;
        const ChipController = this.GM.ChipController;
        const DiceRunSet = this.GM.DiceRunSet;
        let winNumber = Model.rewardInfo.winNumber;
        await DiceRunSet.diceStart(Model.pathData, Model.rewardInfo.winNumber);//骰子表演
        View.bgLight.getComponent(Animation).play('BgLightOpen');//背景燈閃爍
        View.betWin.active = true;
        let betCount = [0, 0, 0, 0, 0, 0];//每個注區的開獎數量
        for (let i of winNumber) {
            betCount[i]++;
        }
        let localWinCredit = 0;
        const winNum = new Set(winNumber);//過濾重複數字

        //中獎注區設置
        for (let i of winNum) {
            View.betWin.children[i].active = true;
            //判斷玩家是否有下注該中獎區
            if (Model.loadInfo.betAreaCredit[i] > 0) {
                Model.loadInfo.betAreaCredit[i] *= betCount[i] === 3 ? 10 : betCount[i] + 1;//注區額度變更(倍率)
                localWinCredit += Model.loadInfo.betAreaCredit[i];
                View.betInfo.children[i].getChildByName('BetCredit').getComponent(Label).string = UtilsKitS.NumDigits(Model.loadInfo.betAreaCredit[i]);
                View.mainPlayerWin.children[i].active = true;
                View.mainPlayerWin.children[i].children[0].getComponent(Sprite).spriteFrame = this.GM.winOddSF[betCount[i] - 1];
            }
        }

        //未中獎注區設置
        const diceNum = [0, 1, 2, 3, 4, 5];
        const loseNum = diceNum.filter(number => !winNumber.includes(number));
        for (let i of loseNum) {
            Model.loadInfo.betAreaCredit[i] = 0;
            View.betInfo.children[i].getChildByName('BetCredit').getComponent(Label).string = UtilsKitS.NumDigits(Model.loadInfo.betAreaCredit[i]);
            View.betInfo.children[i].getComponent(UIOpacity).opacity = 100;
        }
        //本地玩家勝利設置
        if (localWinCredit > 0) {
            const showWinCredit = () => {
                View.infoBar.getChildByName('Win').getChildByName('WinCredit').getChildByName('Label').getComponent(Label).string = UtilsKitS.NumDigits(localWinCredit);
                View.infoBar.getComponent(Animation).play('InfoBarWin');
            }
            //size===1代表開骰3顆骰子同一個id
            if (winNum.size === 1)
                await this.GM.BigWin.runCredit(localWinCredit);
            else
                // showWinCredit.bind(this)();
                await this.GM.BigWin.runCredit(localWinCredit);
        }
        //顯示結算彈窗
        View.result.active = true;
        for (let i = 0; i < 3; i++) {
            View.result.getChildByName(`Dice${i}`).getComponent(Sprite).spriteFrame = this.GM.resultColorSF[winNumber[i]];
        }
        // this.gameRoad.updateRoadMap(winNumber);//更新路紙
        await UtilsKitS.Delay(1);
        for (let i of loseNum) {
            ChipController.recycleChip(i);//回收未中獎的籌碼
        }
        await UtilsKitS.Delay(0.9);
        for (let i of winNum) {
            ChipController.createPayChipToBetArea(i, betCount[i] === 3 ? 9 : betCount[i]);//派彩
        }
        await UtilsKitS.Delay(2.1);
        if (localWinCredit > 0) {
            View.playerPos.children[0].children[0].getChildByName('Win').getComponent(Label).string = '+' + UtilsKitS.NumDigits(localWinCredit);
            View.playerPos.children[0].children[0].active = true;
            // this.model.localCredit += this.model.localWinCredit;//玩家現金額更新
        }
        View.comBtnCredits.getComponent(Animation).play();
        View.updateUICredit();//更新介面額度
        await UtilsKitS.Delay(2);
        View.betWin.active = false;
        for (let i of winNum) {
            View.betWin.children[i].active = false;
        }
        View.result.active = false;
        View.infoBar.getComponent(Animation).play('InfoBarTip');
        this.newRound();
    }
}