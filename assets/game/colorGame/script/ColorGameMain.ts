import { _decorator, Component, Node, find, Label, Button, Sprite, Animation, game, UIOpacity, utils } from 'cc';
// import PoolHandler from '../../../common/script/tools/PoolHandler';
import { Marquee } from '../../../common/script/components/Marquee';
import { DiceRunSet } from './path/DiceRunSet';
import { ChipDispatcher } from './ui/ChipDispatcher';
import { CountDown } from './ui/CountDown';
import { ColorGameData } from './ColorGameData';
import { ColorGameResource } from './ColorGameResource';
import { ColorGameRoad } from './ColorGameRoad';
import { ColorGameZoom } from './ColorGameZoom';
import { UtilsKit_Simon } from '../../../common/script/lib/UtilsKit_Simon';
import { WorkOnBlur_Simon } from '../../../common/script/tools/WorkOnBlur_Simon';
import { WorkerTimeout_Simon } from '../../../common/script/lib/WorkerTimeout_Simon';
// import { ColorGameData } from './ColorGameData';
// import { ColorGameInterfaceData } from './ColorGameInterfaceData';
// import { ChipDispatcher } from './ui/ChipDispatcher';
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
    @property({ type: Node, tooltip: "下注分數區" })
    public betScoreArea: Node = null;
    @property({ type: Node, tooltip: "下注提示光區" })
    private betLight: Node = null;
    @property({ type: Node, tooltip: "籌碼選擇區" })
    public selectChip: Node = null;
    @property({ type: Node, tooltip: "本地玩家贏分特效" })
    public mainPlayerWin: Node = null;
    @property({ type: Node, tooltip: "結算" })
    private result: Node = null;

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
    @property({ type: ChipDispatcher, tooltip: "籌碼派發層" })
    private chipDispatcher: ChipDispatcher = null;
    private gameData: ColorGameData = null;
    private gameResource: ColorGameResource = null;
    private gameRoad: ColorGameRoad = null;
    private gameZoom: ColorGameZoom = null;

    onLoad() {
        //啟用後台運行(針對動畫、tween、schedule、spine等動畫)
        WorkOnBlur_Simon.getInstance();
        WorkerTimeout_Simon.getInstance().enable();

        //連結腳本
        this.gameData = find('Canvas/Scripts/ColorGameData').getComponent(ColorGameData);
        this.gameResource = find('Canvas/Scripts/ColorGameResource').getComponent(ColorGameResource);
        this.gameRoad = find('Canvas/Scripts/ColorGameRoad').getComponent(ColorGameRoad);
        this.gameZoom = find('Canvas/Scripts/ColorGameZoom').getComponent(ColorGameZoom);
        this.comBtnScores.getChildByName('Label').getComponent(Label).string = UtilsKit_Simon.FormatNumber(this.gameData.localScore);//顯示玩家分數

    }


    // 顯示共贏得分數
    // async showWinTotalScore(score: number): Promise<void> {
    //     return new Promise(async (resolve) => {
    //         // AudioManager.getInstance().play(SoundFiles.WinScore);

    //         // this.winTotalScoreNode.getChildByName('score').getChildByName('label').getComponent(Label).string = UtilsKit.NumberSpecification(score); // 共贏分設置

    //         await this.playWinTotalScoreAnimation();
    //         console.log("呼叫動畫播放3")
    //         resolve();
    //     })
    // }

    // private playWinTotalScoreAnimation(): Promise<void> {
    //     return new Promise(async (resolve) => {
    //         console.log("呼叫動畫播放1")
    //         UtilsKit.PlayAnimation(this.testAnim); // 顯示共贏得
    //         // const animationComponent: Animation = this.testAnim.getComponent(Animation);
    //         // animationComponent.getState("scoreShow").speed = 2;
    //         console.log("呼叫動畫播放2")
    //         // await UtilsKit2.DeferByScheduleOnce(700);
    //         // animationComponent.pause();

    //         resolve();
    //     })
    // }


    start() {
        this.marquee.addText('----------這是公告~!這是公告~!這是公告~!');
        this.marquee.run();
        this.gameData.loadPathJson(() => {
            this.gameRoad.updataRoadMap();
            this.newRound();
        })
    }

    //新局
    newRound() {
        this.gameData.getRoundData(() => {
            this.comBtnBet.getChildByName('Label').getComponent(Label).string = UtilsKit_Simon.FormatNumber(this.gameData.localBetTotal);//本地玩家下注分數歸0
            this.bgLight.getComponent(Animation).play('BgLightIdle');
            this.box3D.getComponent(DiceRunSet).diceIdle();//初始化骰子
            this.gameData.resetValue();
            for (let i = 0; i < 6; i++) {
                this.betInfo.children[i].getComponent(UIOpacity).opacity = 255;
            }
            this.betStart();
        });
    }

    //開始押注
    private betStart() {
        this.gameZoom.showing();
        this.stageTitle.children[0].active = true;
        this.betLight.active = true;//下注提示光
        this.btnState(true);
        this.scheduleOnce(() => {
            this.stageTitle.children[0].active = false;
            //模擬多人下注
            this.schedule(() => {
                this.otherPlayerBet();
            }, 0.2, 50, 1)
            //等待時間倒數
            this.countDown.getComponent(CountDown).runCountDown(12, () => {
                console.log("下注結束")
                this.betStop();
            });
        }, 1)
    }

    //其他玩家押注
    private otherPlayerBet() {
        this.scheduleOnce(() => {
            for (let i = 1; i < 5; i++) {
                if (Math.random() > 0.5)
                    this.chipDispatcher.createChipToBetArea(Math.floor(Math.random() * 6), i, this.gameData.betScoreRange[Math.floor(Math.random() * 5)]);
            }
        }, 0.1 + Math.random() * 0.1)
    }

    //停止押注
    private betStop() {
        this.stageTitle.children[1].active = true;
        this.scheduleOnce(() => {
            this.stageTitle.children[1].active = false;
            this.btnState(false);
            this.gameZoom.hideing();
            this.runDice();
        }, 1)
    }

    private btnState(bool: boolean) {
        for (let betBtn of this.betArea.children) {
            betBtn.getComponent(Button).interactable = bool;//禁用下注按鈕
        }
    }

    //開骰表演
    private runDice() {
        let winNumber = this.gameData.winNumber;
        this.box3D.getComponent(DiceRunSet).diceStart(() => {
            this.bgLight.getComponent(Animation).play('BgLightOpen');
            const diceNum = [0, 1, 2, 3, 4, 5];
            const loseNum = diceNum.filter(number => !winNumber.includes(number));
            for (let i of loseNum) {
                this.chipDispatcher.getComponent(ChipDispatcher).recycleChip(i);//回收未開獎的籌碼
                this.betScoreArea.children[i].getComponent(Label).string = '0';
                this.betInfo.children[i].getComponent(UIOpacity).opacity = 100;
                // this.gameData.localBetScore[i] = 0;
            }
            let betCount = [0, 0, 0, 0, 0, 0];//每個注區的開獎數量
            for (let i of winNumber) {
                betCount[i]++;
            }
            const winNum = Array.from(new Set(winNumber));//勝利的注區(單一數字)
            this.betWin.active = true;
            this.gameData.localWinScore = 0;
            for (let i of winNum) {
                this.betWin.children[i].active = true;
                //判斷玩家是否有下注中獎區
                if (this.gameData.localBetScore[i] > 0) {
                    this.gameData.localBetScore[i] *= betCount[i] === 3 ? 10 : betCount[i] + 1;//注區分數變更(倍率)
                    this.gameData.localWinScore += this.gameData.localBetScore[i];
                    this.betScoreArea.children[i].getComponent(Label).string = UtilsKit_Simon.FormatNumber(this.gameData.localBetScore[i]);
                    this.mainPlayerWin.children[i].active = true;
                    this.mainPlayerWin.children[i].children[0].getComponent(Sprite).spriteFrame = this.gameResource.winOddSpriteFrame[betCount[i] - 1];
                }
            }
            if (this.gameData.localWinScore > 0) {
                this.infoBar.getChildByName('Win').getChildByName('WinScore').getChildByName('Label').getComponent(Label).string = UtilsKit_Simon.FormatNumber(this.gameData.localWinScore);
                this.infoBar.getComponent(Animation).play('InfoBarWin');
            }
            //顯示結算區
            this.result.active = true;
            for (let i = 0; i < 3; i++) {
                this.result.getChildByName(`Dice${i}`).getComponent(Sprite).spriteFrame = this.gameResource.resultColorSpriteFrame[winNumber[i]];
            }
            this.gameData.colorRoad.pop();//清除走勢
            this.gameData.colorRoad.unshift(winNumber);//新增走勢
            this.gameRoad.updataRoadMap();//更新路紙
            this.scheduleOnce(() => {
                //派彩
                for (let i of winNum) {
                    this.chipDispatcher.getComponent(ChipDispatcher).createPayChipToBetArea(i, betCount[i] === 3 ? 9 : betCount[i]);
                }
                this.scheduleOnce(() => {
                    console.log("玩家贏", this.gameData.localWinScore)
                    if (this.gameData.localWinScore > 0) {
                        this.playerPos.children[0].children[0].getChildByName('Win').getComponent(Label).string = '+' + UtilsKit_Simon.FormatNumber(this.gameData.localWinScore);
                        this.playerPos.children[0].children[0].active = true;
                        this.gameData.localScore += this.gameData.localWinScore;//玩家現金額更新
                    }
                    this.comBtnScores.getComponent(Animation).play();
                    this.gameData.updataUIScore();//更新介面分數
                }, 2.1)
                this.scheduleOnce(() => {
                    this.betWin.active = false;
                    for (let i of winNum) {
                        this.betWin.children[i].active = false;
                    }
                    this.result.active = false;
                    this.infoBar.getComponent(Animation).play('InfoBarTip');
                    this.newRound();
                }, 4)
            }, 1)
        })
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


