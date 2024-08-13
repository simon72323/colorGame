import { _decorator, Component, Node, Label, Vec3, Button } from 'cc';
// import PoolHandler from '../../../common/script/tools/PoolHandler';
import { Marquee } from '../../../common/script/components/Marquee';
import { DiceRunSet } from './path/DiceRunSet';
import { ChipDispatcher } from './ui/ChipDispatcher';
import { CountDown } from './ui/CountDown';
import { ColorGameDemoData } from './ColorGameDemoData';
// import { ColorGameDemoData } from './ColorGameDemoData';
// import { ColorGameInterfaceData } from './ColorGameInterfaceData';
// import { ChipDispatcher } from './ui/ChipDispatcher';
const { ccclass, property } = _decorator;

@ccclass('ColorGameMain')
export class ColorGameMain extends Component {
    //目前狀態參數
    // public selectChipID: number = 0;//目前選擇的籌碼id
    // public selectChipNode: Node = null;//目前選擇的籌碼節點
    // public selectChipScore: number = 0;//目前選擇的籌碼分數

    // private myPool: PoolHandler = null;//創建物件池
    // private selectChipData: SelectChipData;
    @property({ type: ChipDispatcher, tooltip: "籌碼派發層" })
    private chipDispatcher: ChipDispatcher = null;


    @property({ type: Node, tooltip: "下注按鈕區" })
    private betArea: Node = null;
    @property({ type: Node, tooltip: "下注勝利顯示區" })
    private betWin: Node = null;
    @property({ type: Node, tooltip: "下注分數區" })
    private betScore: Node = null;
    @property({ type: Node, tooltip: "下注提示光區" })
    private betLight: Node = null;

    @property({ type: Node, tooltip: "3d盒子" })
    private box3D: Node = null;

    @property({ type: Node, tooltip: "時間倒數" })
    private countDown: Node = null;
    @property({ type: Node, tooltip: "'狀態標題(子物件):0=開始押注，1=停止押注，2=等待下局開始" })
    private stageTitle: Node = null;
    @property({ type: Marquee, tooltip: "跑馬燈" })
    private marquee: Marquee = null;

    private betState: Boolean = true;//可下注狀態

    private betScoreRange: number[] = [10, 20, 50, 100, 200];
    @property({ type: ColorGameDemoData, tooltip: "demo回合腳本" })
    private demoData: ColorGameDemoData = null;

    onLoad() {

    }


    start() {
        this.marquee.addText('----------這是公告~!這是公告~!這是公告~!');
        this.marquee.run();

        this.scheduleOnce(() => {
            this.resetRount();
        }, 3)
    }

    //新局
    resetRount() {
        this.demoData.setDemoRound();//生成新回合
        this.box3D.getComponent(DiceRunSet).diceIdle();//初始化骰子
        this.betStart();
    }

    //開始押注
    private betStart() {
        this.stageTitle.children[0].active = true;
        this.betLight.active = true;//下注提示光
        this.btnState(true);
        this.scheduleOnce(() => {
            this.stageTitle.children[0].active = false;
            //模擬多人下注
            this.schedule(() => {
                this.otherPlayerBet();
            }, 0.1 + Math.random() * 0.3, 30, 1)
            //等待時間倒數
            this.countDown.getComponent(CountDown).runCountDown(12, () => {
                console.log("下注結束")
                this.betStop();
            });
        }, 1)
    }

    //其他玩家押注
    private otherPlayerBet() {
        // if (this.betState) {
        for (let i = 0; i < 4; i++) {
            if (Math.random() > 0.5)
                this.chipDispatcher.createChipToBetArea(Math.floor(Math.random() * 6), i, this.betScoreRange[Math.floor(Math.random() * 5)]);
        }
        // }
    }

    //停止押注
    private betStop() {
        this.stageTitle.children[1].active = true;
        this.scheduleOnce(() => {
            this.stageTitle.children[1].active = false;
            this.btnState(false);
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
        let winNumber = this.demoData.roundData.winNumber;
        this.box3D.getComponent(DiceRunSet).diceStart(() => {
            const diceNum = [0, 1, 2, 3, 4, 5];
            const loseNum = diceNum.filter(number => !winNumber.includes(number));
            for (let i of loseNum) {
                this.chipDispatcher.getComponent(ChipDispatcher).recycleChip(i);//回收未開獎的籌碼
            }
            let result = [0, 0, 0, 0, 0, 0];//每個注區的開獎數量
            for (let i of winNumber) {
                result[i]++;
            }
            const winNum = Array.from(new Set(winNumber));//勝利的注區(單一數字)
            this.betWin.active = true;
            for (let i of winNum) {
                this.betWin.children[i + 1].active = true;
            }
            this.scheduleOnce(() => {
                //派彩
                for (let i of winNum) {
                    this.chipDispatcher.getComponent(ChipDispatcher).createPayChipToBetArea(i, result[i]);
                }
                this.scheduleOnce(() => {
                    this.betWin.active = false;
                    for (let i of winNum) {
                        this.betWin.children[i + 1].active = false;
                    }
                    this.resetRount();
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


