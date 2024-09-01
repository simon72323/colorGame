import { _decorator, Component, Node, find, Label, Button, Sprite, Animation, game, UIOpacity, utils } from 'cc';
// import PoolHandler from '../../../common/script/tools/PoolHandler';
import { Marquee } from '../../../common/script/components/Marquee';
import { DiceRunSet } from './path/DiceRunSet';
import { ColorGameChipControl } from './ColorGameChipControl';
import { CountDown } from './ui/CountDown';
import { ColorGameData } from './ColorGameData';
import { ColorGameResource } from './ColorGameResource';
import { ColorGameRoad } from './ColorGameRoad';
import { ColorGameZoom } from './ColorGameZoom';
import { UtilsKitS } from '../../../common/script/lib/UtilsKitS';
import { WorkOnBlur_Simon } from '../../../common/script/tools/WorkOnBlur_Simon';
import { WorkerTimeout_Simon } from '../../../common/script/lib/WorkerTimeout_Simon';
import { ColorGameBigWin } from './ui/ColorGameBigWin';
import { ColorGameChipSet } from './ColorGameChipSet';
// import { ColorGameData } from './ColorGameData';
// import { ColorGameInterfaceData } from './ColorGameInterfaceData';
// import { ColorGameChip } from './ui/ColorGameChip';
const { ccclass, property } = _decorator;

@ccclass('ColorGameMain')
export class ColorGameMain extends Component {

    @property({ type: Node, tooltip: "背景燈光" })
    public bgLight: Node = null;
    @property({ type: Node, tooltip: "資訊面板" })
    public infoBar: Node = null;
    @property({ type: Node, tooltip: "玩家位置" })
    public playerPos: Node = null;
    @property({ type: Node, tooltip: "下注按鈕區" })
    private betArea: Node = null;
    @property({ type: Node, tooltip: "下注勝利顯示區" })
    private betWin: Node = null;
    @property({ type: Node, tooltip: "下注區資訊" })
    public betInfo: Node = null;
    @property({ type: Node, tooltip: "下注提示光區" })
    private betLight: Node = null;
    @property({ type: Node, tooltip: "籌碼選擇區" })
    public selectChip: Node = null;
    @property({ type: Node, tooltip: "本地玩家贏分特效" })
    public mainPlayerWin: Node = null;
    @property({ type: Node, tooltip: "結算" })
    private result: Node = null;
    @property({ type: Node, tooltip: "大贏分" })
    private bigWin: Node = null;

    @property({ type: Node, tooltip: "3d盒子" })
    private box3D: Node = null;

    @property({ type: Node, tooltip: "時間倒數" })
    private countDown: Node = null;
    @property({ type: Node, tooltip: "'狀態標題(子物件):0=開始押注，1=停止押注，2=等待下局開始" })
    private stageTitle: Node = null;
    @property({ type: Marquee, tooltip: "跑馬燈" })
    private marquee: Marquee = null;

    @property({ type: Node, tooltip: "下注分數按鈕(公版)" })
    public comBtnBet: Node = null;
    @property({ type: Node, tooltip: "分數兌換按鈕(公版)" })
    public comBtnScores: Node = null;


    // private betState: Boolean = true;//可下注狀態

    //腳本
    // @property({ type: ColorGameChipControl, tooltip: "籌碼派發層" })
    private gameChipControl: ColorGameChipControl = null;
    private gameData: ColorGameData = null;
    private gameResource: ColorGameResource = null;
    private gameRoad: ColorGameRoad = null;
    private gameZoom: ColorGameZoom = null;
    public gameChipSet: ColorGameChipSet = null;

    onLoad() {
        //啟用後台運行(針對動畫、tween、schedule、spine等動畫)
        WorkOnBlur_Simon.getInstance();
        WorkerTimeout_Simon.getInstance().enable();

        //連結腳本
        this.gameData = find('Canvas/Scripts/ColorGameData').getComponent(ColorGameData);
        this.gameResource = find('Canvas/Scripts/ColorGameResource').getComponent(ColorGameResource);
        this.gameRoad = find('Canvas/Scripts/ColorGameRoad').getComponent(ColorGameRoad);
        this.gameZoom = find('Canvas/Scripts/ColorGameZoom').getComponent(ColorGameZoom);
        this.gameChipSet = find('Canvas/Scripts/ColorGameChipSet').getComponent(ColorGameChipSet);
        this.gameChipControl = find('Canvas/Scripts/ColorGameChipControl').getComponent(ColorGameChipControl);

        this.comBtnScores.getChildByName('Label').getComponent(Label).string = UtilsKitS.NumDigits(this.gameData.localScore);//顯示玩家分數
    }

    public async start() {
        // this.marquee.addText('----------這是公告~!這是公告~!這是公告~!');
        // this.marquee.run();
        await this.gameData.loadPathJson();
        this.gameChipSet.updataSelectChip();
        this.gameRoad.updataRoadMap();
        this.newRound();
    }

    //新局
    private async newRound() {
        await this.gameData.getRoundData();
        this.comBtnBet.getChildByName('Label').getComponent(Label).string = UtilsKitS.NumDigits(this.gameData.localBetTotal);//本地玩家下注分數歸0
        this.bgLight.getComponent(Animation).play('BgLightIdle');
        this.box3D.getComponent(DiceRunSet).diceIdle();//初始化骰子
        this.gameData.resetValue();
        for (let i = 0; i < 6; i++) {
            this.betInfo.children[i].getComponent(UIOpacity).opacity = 255;
        }
        this.betStart();
    }

    //開始押注
    private async betStart() {
        this.gameZoom.showing();
        this.stageTitle.children[0].active = true;
        this.betLight.active = true;//下注提示光
        this.btnState(true);
        await UtilsKitS.Delay(1);
        this.stageTitle.children[0].active = false;
        //模擬多人下注
        this.schedule(() => {
            this.otherPlayerBet();
        }, 0.2, 50, 1)
        await this.countDown.getComponent(CountDown).runCountDown(12);//等待時間倒數
        this.betStop();
    }

    //其他玩家押注
    private async otherPlayerBet() {
        await UtilsKitS.Delay(0.1 + Math.random() * 0.1);
        for (let i = 1; i < 5; i++) {
            if (Math.random() > 0.5) {
                const randomBetArea = Math.floor(Math.random() * 6);
                const randomChipID = Math.floor(Math.random() * this.gameData.betScoreRange.length);
                // const randomBetRange = this.gameData.betScoreRange[Math.floor(Math.random() * this.gameData.betScoreRange.length)];
                this.gameChipControl.createChipToBetArea(randomBetArea, i, randomChipID);
            }
        }
    }

    //停止押注
    private async betStop() {
        this.stageTitle.children[1].active = true;
        this.btnState(false);
        this.gameZoom.hideing();
        // this.gameChipControl.betStop();
        await UtilsKitS.Delay(1);
        this.stageTitle.children[1].active = false;
        this.gameChipControl.updataRebetData();//更新續押資料
        this.runDice();
    }

    private btnState(bool: boolean) {
        //案段按鈕狀態啟用，且續押階段是1(單次續押)，續押回歸初始狀態
        if (bool) {
            console.log('狀態2', this.gameChipControl.rebetState)
            if (this.gameChipControl.rebetState === 'onceBet')
                this.gameChipControl.setRebet(null, 'init');//初始化
            else if (this.gameChipControl.rebetState === 'autoBet')
                this.gameChipControl.runRebet();//執行續押
        }

        for (let betBtn of this.betArea.children) {
            betBtn.getComponent(Button).interactable = bool;//下注按鈕狀態
        }
        this.gameChipControl.btnRebet.getComponent(Button).interactable = bool;//續押按鈕狀態
    }

    //開骰表演
    private async runDice() {
        let winNumber = this.gameData.winNumber;
        await this.box3D.getComponent(DiceRunSet).diceStart();
        this.bgLight.getComponent(Animation).play('BgLightOpen');//背景燈閃爍
        this.betWin.active = true;
        let betCount = [0, 0, 0, 0, 0, 0];//每個注區的開獎數量
        for (let i of winNumber) {
            betCount[i]++;
        }
        this.gameData.localWinScore = 0;
        const winNum = new Set(winNumber);//過濾重複數字

        //中獎注區設置
        for (let i of winNum) {
            this.betWin.children[i].active = true;
            //判斷玩家是否有下注該中獎區
            if (this.gameData.localBetScore[i] > 0) {
                this.gameData.localBetScore[i] *= betCount[i] === 3 ? 10 : betCount[i] + 1;//注區分數變更(倍率)
                this.gameData.localWinScore += this.gameData.localBetScore[i];
                this.betInfo.children[i].getChildByName('BetScore').getComponent(Label).string = UtilsKitS.NumDigits(this.gameData.localBetScore[i]);
                this.mainPlayerWin.children[i].active = true;
                this.mainPlayerWin.children[i].children[0].getComponent(Sprite).spriteFrame = this.gameResource.winOddSF[betCount[i] - 1];
            }
        }

        //未中獎注區設置
        const diceNum = [0, 1, 2, 3, 4, 5];
        const loseNum = diceNum.filter(number => !winNumber.includes(number));
        for (let i of loseNum) {
            this.gameData.localBetScore[i] = 0;
            this.betInfo.children[i].getChildByName('BetScore').getComponent(Label).string = UtilsKitS.NumDigits(this.gameData.localBetScore[i]);
            this.betInfo.children[i].getComponent(UIOpacity).opacity = 100;
        }
        //本地玩家勝利設置
        if (this.gameData.localWinScore > 0) {
            const showWinScore = () => {
                this.infoBar.getChildByName('Win').getChildByName('WinScore').getChildByName('Label').getComponent(Label).string = UtilsKitS.NumDigits(this.gameData.localWinScore);
                this.infoBar.getComponent(Animation).play('InfoBarWin');
            }
            if (winNum.size > 0) {
                this.bigWin.active = true;
                this.bigWin.getComponent(ColorGameBigWin).runScore(this.gameData.localWinScore, () => {
                    showWinScore();
                });
                // showWinScore();
            } else
                showWinScore();
        }
        //顯示結算彈窗
        this.result.active = true;
        for (let i = 0; i < 3; i++) {
            this.result.getChildByName(`Dice${i}`).getComponent(Sprite).spriteFrame = this.gameResource.resultColorSF[winNumber[i]];
        }
        this.gameRoad.updataRoadMap(winNumber);//更新路紙
        await UtilsKitS.Delay(1);
        for (let i of loseNum) {
            this.gameChipControl.recycleChip(i);//回收未中獎的籌碼
        }
        await UtilsKitS.Delay(0.9);
        for (let i of winNum) {
            this.gameChipControl.createPayChipToBetArea(i, betCount[i] === 3 ? 9 : betCount[i]);//派彩
        }
        await UtilsKitS.Delay(2.1);
        // console.log("玩家贏", this.gameData.localWinScore)
        if (this.gameData.localWinScore > 0) {
            this.playerPos.children[0].children[0].getChildByName('Win').getComponent(Label).string = '+' + UtilsKitS.NumDigits(this.gameData.localWinScore);
            this.playerPos.children[0].children[0].active = true;
            this.gameData.localScore += this.gameData.localWinScore;//玩家現金額更新
        }
        this.comBtnScores.getComponent(Animation).play();
        this.gameData.updataUIScore();//更新介面分數
        await UtilsKitS.Delay(2);
        this.betWin.active = false;
        for (let i of winNum) {
            this.betWin.children[i].active = false;
        }
        this.result.active = false;
        this.infoBar.getComponent(Animation).play('InfoBarTip');
        this.newRound();
    }

    //等待下局
    // private waitRound() {
    //     this.countDown.getComponent(CountDown).runCountDown(12, () => {
    //         console.log("新局開始")
    //         this.resetRount();
    //     });
    // }

    update(deltaTime: number) {

    }


}


