import { _decorator, Component, Label, Button, Sprite, Animation, UIOpacity, tween, Vec3, Color } from 'cc';
import { Marquee } from '../../../common/script/components/Marquee';
import { DiceRunSet } from './path/DiceRunSet';
import { CGChipControl } from './CGChipControl';
import { CGData } from './CGData';
import { CGResource } from './CGResource';
import { CGRoad } from './CGRoad';
import { CGZoom } from './CGZoom';
import { UtilsKitS } from '../../../common/script/lib/UtilsKitS';
import { WorkOnBlur_Simon } from '../../../common/script/tools/WorkOnBlur_Simon';
import { WorkerTimeout_Simon } from '../../../common/script/lib/WorkerTimeout_Simon';
import { CGBigWin } from './CGBigWin';
import { CGChipSet } from './CGChipSet';
import { CGView } from './CGView';
const { ccclass, property } = _decorator;

@ccclass('CGMain')
export class CGMain extends Component {

    //腳本
    @property({ type: Marquee, tooltip: "跑馬燈腳本" })
    private marquee: Marquee = null;
    @property({ type:  CGView, tooltip: "遊戲介面腳本" })
    private gameView: CGView = null;
    @property({ type: CGData, tooltip: "遊戲資料腳本" })
    private gameData: CGData = null;
    @property({ type: CGResource, tooltip: "遊戲資源腳本" })
    private gameResource: CGResource = null;
    @property({ type: CGChipSet, tooltip: "籌碼設置腳本" })
    private gameChipSet: CGChipSet = null;
    @property({ type: CGRoad, tooltip: "路紙腳本" })
    private gameRoad: CGRoad = null;
    @property({ type: CGZoom, tooltip: "縮放腳本" })
    private gameZoom: CGZoom = null;
    @property({ type: CGChipControl, tooltip: "籌碼控制腳本" })
    private gameChipControl: CGChipControl = null;

    onLoad() {
        //啟用後台運行(針對動畫、tween、schedule、spine等動畫)
        WorkOnBlur_Simon.getInstance();
        WorkerTimeout_Simon.getInstance().enable();
        //讀取本地端設置資料

    }

    public async start() {
        await this.gameData.getOnLoadInfo();//獲取遊戲資料
        await this.gameData.loadChipSetID();//讀取籌碼設置資料
        this.gameChipSet.updataSelectChip();//更新選擇籌碼(每局更新)
        // await this.gameData.loadRoundData();//獲取新局資料
        //     // this.marquee.addText('----------這是公告~!這是公告~!這是公告~!');
        //     // this.marquee.run();
        this.newRound();
    }

    //新局開始
    public newRound() {
        this.gameData.getRoundData();//獲取新局資料
        this.gameData.getBetData();//獲取下注資料
        // this.gameData.getTopUserInfo();//獲取前三名玩家資料
        // this.gameData.getRoundData();//獲取本回合資料
        // this.gameData.getBetInfo();//獲取下注資料
        this.gameRoad.updataRoadMap();//更新路紙(每局更新)
        this.gameView.updataUIScore();//更新介面分數
        this.gameView.bgLight.getComponent(Animation).play('BgLightIdle');
        this.gameView.box3D.getComponent(DiceRunSet).diceIdle();//初始化骰子(隨機顏色)
        if (this.gameChipControl.rebetState !== 'autoBet')
            this.gameView.btnRebet.getComponent(Button).interactable = true;//續押按鈕啟用
        for (let i = 0; i < 6; i++) {
            this.gameView.betInfo.children[i].getComponent(UIOpacity).opacity = 255;
        }
        this.betStart();//開始押注
    }

    //開始押注
    private async betStart() {
        this.gameZoom.showing();//放大鏡功能顯示
        this.gameView.stageTitle.children[0].active = true;//標題顯示
        this.gameView.betLight.active = true;//下注提示光
        this.btnState(true);//按鈕啟用
        await UtilsKitS.Delay(1);
        this.gameView.stageTitle.children[0].active = false;//標題隱藏

        //模擬多人下注
        this.schedule(() => {
            this.otherPlayerBet();
        }, 0.2, 50, 1)

        let time = this.gameData.loadInfo.betTime;
        this.setBetTime(time);//下注時間倒數
        this.schedule(() => {
            time--;
            this.setBetTime(time);//模擬下注時間倒數
        }, 1, this.gameData.loadInfo.betTime - 1, 1)
    }

    //下注時間倒數(接收後端時間資料)
    public setBetTime(timer: number) {
        const betTimeNode = this.gameView.betTime;
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
        const betTotalTime = this.gameData.loadInfo.betTime;
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
        await UtilsKitS.Delay(0.1 + Math.random() * 0.1);
        for (let i = 1; i < 5; i++) {
            if (Math.random() > 0.5) {
                const randomBetArea = Math.floor(Math.random() * 6);
                const randomChipID = Math.floor(Math.random() * this.gameData.loadInfo.chipRange.length);
                this.gameChipControl.createChipToBetArea(randomBetArea, i, randomChipID, false);
                //判斷本地玩家是否跟注
                if (i < 4)
                    if (this.gameView.btnStopCall[i - 1].active) {
                        this.gameChipControl.createChipToBetArea(randomBetArea, 0, this.gameData.selectChipID, false);//玩家跟注
                    }
            }
        }
    }

    //停止押注
    private async betStop() {
        this.gameView.stageTitle.children[1].active = true;
        this.btnState(false);//按鈕禁用
        this.gameZoom.hideing();//放大鏡功能隱藏
        await UtilsKitS.Delay(1);
        this.gameView.stageTitle.children[1].active = false;
        this.gameChipControl.updataRebetData();//更新寫入續押資料
        this.runDice();
    }

    //按鈕啟用狀態
    private btnState(bool: boolean) {
        if (bool) {
            if (this.gameChipControl.rebetState === 'onceBet')
                this.gameChipControl.setRebet(null, 'init');//初始化
            else if (this.gameChipControl.rebetState === 'autoBet')
                this.gameChipControl.runRebet();//執行續押
        }
        for (let betBtn of this.gameView.betArea.children) {
            betBtn.getComponent(Button).interactable = bool;//下注按鈕狀態
        }
        this.gameView.btnRebet.getComponent(Button).interactable = bool;//續押按鈕狀態
    }

    //開骰表演
    private async runDice() {
        let winNumber = this.gameData.rewardInfo.winNumber;
        await this.gameView.box3D.getComponent(DiceRunSet).diceStart();//骰子表演
        this.gameView.bgLight.getComponent(Animation).play('BgLightOpen');//背景燈閃爍
        this.gameView.betWin.active = true;
        let betCount = [0, 0, 0, 0, 0, 0];//每個注區的開獎數量
        for (let i of winNumber) {
            betCount[i]++;
        }
        let localWinScore = 0;
        const winNum = new Set(winNumber);//過濾重複數字

        //中獎注區設置
        for (let i of winNum) {
            this.gameView.betWin.children[i].active = true;
            //判斷玩家是否有下注該中獎區
            if (this.gameData.loadInfo.betAreaCredit[i] > 0) {
                this.gameData.loadInfo.betAreaCredit[i] *= betCount[i] === 3 ? 10 : betCount[i] + 1;//注區分數變更(倍率)
                localWinScore += this.gameData.loadInfo.betAreaCredit[i];
                this.gameView.betInfo.children[i].getChildByName('BetScore').getComponent(Label).string = UtilsKitS.NumDigits(this.gameData.loadInfo.betAreaCredit[i]);
                this.gameView.mainPlayerWin.children[i].active = true;
                this.gameView.mainPlayerWin.children[i].children[0].getComponent(Sprite).spriteFrame = this.gameResource.winOddSF[betCount[i] - 1];
            }
        }

        //未中獎注區設置
        const diceNum = [0, 1, 2, 3, 4, 5];
        const loseNum = diceNum.filter(number => !winNumber.includes(number));
        for (let i of loseNum) {
            this.gameData.loadInfo.betAreaCredit[i] = 0;
            this.gameView.betInfo.children[i].getChildByName('BetScore').getComponent(Label).string = UtilsKitS.NumDigits(this.gameData.loadInfo.betAreaCredit[i]);
            this.gameView.betInfo.children[i].getComponent(UIOpacity).opacity = 100;
        }
        //本地玩家勝利設置
        if (localWinScore > 0) {
            const showWinScore = () => {
                this.gameView.infoBar.getChildByName('Win').getChildByName('WinScore').getChildByName('Label').getComponent(Label).string = UtilsKitS.NumDigits(localWinScore);
                this.gameView.infoBar.getComponent(Animation).play('InfoBarWin');
            }
            //size===1代表開骰3顆骰子同一個id
            if (winNum.size === 1) {
                this.gameView.bigWin.active = true;
                await this.gameView.bigWin.getComponent(CGBigWin).runScore(localWinScore);
            } else
                showWinScore.bind(this)();
        }
        //顯示結算彈窗
        this.gameView.result.active = true;
        for (let i = 0; i < 3; i++) {
            this.gameView.result.getChildByName(`Dice${i}`).getComponent(Sprite).spriteFrame = this.gameResource.resultColorSF[winNumber[i]];
        }
        // this.gameRoad.updataRoadMap(winNumber);//更新路紙
        await UtilsKitS.Delay(1);
        for (let i of loseNum) {
            this.gameChipControl.recycleChip(i);//回收未中獎的籌碼
        }
        await UtilsKitS.Delay(0.9);
        for (let i of winNum) {
            this.gameChipControl.createPayChipToBetArea(i, betCount[i] === 3 ? 9 : betCount[i]);//派彩
        }
        await UtilsKitS.Delay(2.1);
        if (localWinScore > 0) {
            this.gameView.playerPos.children[0].children[0].getChildByName('Win').getComponent(Label).string = '+' + UtilsKitS.NumDigits(localWinScore);
            this.gameView.playerPos.children[0].children[0].active = true;
            // this.gameData.localScore += this.gameData.localWinScore;//玩家現金額更新
        }
        this.gameView.comBtnScores.getComponent(Animation).play();
        this.gameView.updataUIScore();//更新介面分數
        await UtilsKitS.Delay(2);
        this.gameView.betWin.active = false;
        for (let i of winNum) {
            this.gameView.betWin.children[i].active = false;
        }
        this.gameView.result.active = false;
        this.gameView.infoBar.getComponent(Animation).play('InfoBarTip');
        this.newRound();
    }
}