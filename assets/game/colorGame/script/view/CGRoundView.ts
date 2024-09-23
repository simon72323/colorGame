import { _decorator, Component, Label, Button, Sprite, Animation, UIOpacity, tween, Vec3, Color, Node } from 'cc';
import { CGUtils } from '../tools/CGUtils';
import { CGPathManager } from '../components/CGPathManager';//非loading過程是暫時使用
import { CGController } from '../controller/CGController';
const { ccclass, property } = _decorator;

@ccclass('CGRoundView')
export class CGRoundView extends Component {
    @property({ type: Node, tooltip: "背景燈光", group: { name: '基本介面', id: '1' } })
    public bgLight: Node = null;
    @property({ type: Node, tooltip: "資訊面板", group: { name: '基本介面', id: '1' } })
    public infoBar: Node = null;
    @property({ type: Node, tooltip: "結算", group: { name: '基本介面', id: '1' } })
    public result: Node = null;
    @property({ type: Node, tooltip: "'狀態標題", group: { name: '基本介面', id: '1' } })
    public stageTitle: Node = null;
    @property({ type: Node, tooltip: "3d盒子", group: { name: '基本介面', id: '1' } })
    public box3D: Node = null;

    @property({ type: Node, tooltip: "下注按鈕區", group: { name: '注區相關', id: '3' } })
    public betArea: Node = null;
    @property({ type: Node, tooltip: "下注勝利顯示區", group: { name: '注區相關', id: '3' } })
    public betWin: Node = null;
    @property({ type: Node, tooltip: "下注提示光區", group: { name: '注區相關', id: '3' } })
    public betLight: Node = null;
    @property({ type: Node, tooltip: "下注時間", group: { name: '注區相關', id: '3' } })
    public betTime: Node = null;
    
    @property({ type: Node, tooltip: "本地玩家贏分特效", group: { name: '玩家', id: '4' } })
    public mainPlayerWin: Node = null;

    private controller: CGController = null;//初始化資源腳本

    public init(controller: CGController) {
        this.controller = controller;
        //非loading過程是暫時使用
        CGPathManager.getInstance().node.on("completed", async () => {
            this.controller.model.setPathData();
            this.newRound();
        });

        //loading流程
        // await this.model.getOnLoadInfo();//獲取遊戲資料
        // this.newRound();

        // await this.model.loadRoundData();//獲取新局資料
        //     // this.marquee.addText('----------這是公告~!這是公告~!這是公告~!');
        //     // this.marquee.run();
    }

    //新局開始(server觸發)
    public newRound() {
        const view = this.controller.view;
        const chipDispatcher = this.controller.chipDispatcher;
        const diceRunSet = this.controller.diceRunView;
        // model.getRoundData();//獲取新局資料
        // model.getBetData();//獲取下注資料
        // model.getTopUserInfo();//獲取前三名玩家資料
        // model.getRoundData();//獲取本回合資料
        // model.getBetInfo();//獲取下注資料
        // view.updateRoadMap();//更新路紙(每局更新)
        // view.updateUICredit();//更新介面額度
        this.bgLight.getComponent(Animation).play('BgLightIdle');
        diceRunSet.diceIdle();//初始化骰子(隨機顏色)
        chipDispatcher.testRebet();//判斷是否執行續押
        // chipDispatcher.isNotAutoBet();//續押按鈕狀態
        for (let i = 0; i < 6; i++) {
            view.betInfo.children[i].getComponent(UIOpacity).opacity = 255;
        }
        this.betStart();//開始押注
    }

    //開始押注(server觸發，或newRound觸發)
    public async betStart() {
        const model = this.controller.model;
        const zoom = this.controller.zoomView;
        zoom.zoomShowing();//放大鏡功能顯示
        this.stageTitle.children[0].active = true;//標題顯示
        this.betLight.active = true;//下注提示光
        this.btnState(true);//按鈕啟用
        await CGUtils.Delay(1);
        this.stageTitle.children[0].active = false;//標題隱藏

        //模擬多人下注
        this.schedule(() => {
            this.otherPlayerBet();
        }, 0.2, 10, 1)

        let time = model.betTime;
        this.setBetTime(time);//下注時間倒數
        this.schedule(() => {
            time--;
            this.setBetTime(time);//模擬下注時間倒數
        }, 1, model.betTime - 1, 1)
    }

    //下注時間倒數(接收後端時間資料)
    public setBetTime(timer: number) {
        const model = this.controller.model;
        const betTimeNode = this.betTime;
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
        const betTotalTime = model.betTime;
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
        const model = this.controller.model;
        const chipDispatcher = this.controller.chipDispatcher;
        await CGUtils.Delay(0.1 + Math.random() * 0.1);
        for (let i = 1; i < 5; i++) {
            if (Math.random() > 0.5) {
                const randomBetArea = Math.floor(Math.random() * 6);
                const randomChipID = Math.floor(Math.random() * 10);
                chipDispatcher.createChipToBetArea(randomBetArea, i, randomChipID, false);
                //判斷本地玩家是否跟注
                if (i < 4)
                    if (chipDispatcher.btnStopCall[i - 1].active) {
                        chipDispatcher.createChipToBetArea(randomBetArea, 0, model.touchChipID, false);//玩家跟注
                    }
            }
        }
    }

    //停止押注
    private async betStop() {
        const chipDispatcher = this.controller.chipDispatcher;
        const zoom = this.controller.zoomView;
        this.stageTitle.children[1].active = true;
        this.btnState(false);//按鈕禁用
        zoom.zoomHideing();//放大鏡功能隱藏
        await CGUtils.Delay(1);
        this.stageTitle.children[1].active = false;
        chipDispatcher.updateRebetData();//更新寫入續押資料
        // model.getRewardInfo();//獲取開獎結果
        this.runReward();
    }

    //按鈕啟用狀態
    public btnState(bool: boolean) {
        const chipDispatcher = this.controller.chipDispatcher;
        if (bool)
            chipDispatcher.testRebet();//判斷是否執行續押
        for (let betBtn of this.betArea.children) {
            betBtn.getComponent(Button).interactable = bool;//下注按鈕狀態
        }
        chipDispatcher.btnRebet.getComponent(Button).interactable = bool;//續押按鈕狀態
    }

    //開獎表演(透過server接收後觸發)
    public async runReward() {
        const view = this.controller.view;
        const model = this.controller.model;
        const chipDispatcher = this.controller.chipDispatcher;
        const DiceRunSet = this.controller.diceRunView;
        let winColor = model.winColor;
        await DiceRunSet.diceStart(model.pathData, model.winColor);//骰子表演
        this.bgLight.getComponent(Animation).play('BgLightOpen');//背景燈閃爍
        this.betWin.active = true;
        let betCount = [0, 0, 0, 0, 0, 0];//每個注區的開獎數量
        for (let i of winColor) {
            betCount[i]++;
        }
        let localWinCredit = 0;
        const winNum = new Set(winColor);//過濾重複數字

        //中獎注區設置
        for (let i of winNum) {
            this.betWin.children[i].active = true;
            //判斷玩家是否有下注該中獎區
            if (model.userBets[i] > 0) {
                model.userBets[i] *= betCount[i] === 3 ? 10 : betCount[i] + 1;//注區額度變更(倍率)
                localWinCredit += model.userBets[i];
                view.betInfo.children[i].getChildByName('BetCredit').getComponent(Label).string = CGUtils.NumDigits(model.userBets[i]);
                this.mainPlayerWin.children[i].active = true;
                this.mainPlayerWin.children[i].children[0].getComponent(Sprite).spriteFrame = this.controller.winOddSF[betCount[i] - 1];
            }
        }

        //未中獎注區設置
        const diceNum = [0, 1, 2, 3, 4, 5];
        const loseNum = diceNum.filter(number => !(winColor.indexOf(number) > -1) as boolean);
        for (let i of loseNum) {
            model.userBets[i] = 0;
            view.betInfo.children[i].getChildByName('BetCredit').getComponent(Label).string = CGUtils.NumDigits(model.userBets[i]);
            view.betInfo.children[i].getComponent(UIOpacity).opacity = 100;
        }
        //本地玩家勝利設置
        if (localWinCredit > 0) {
            const showWinCredit = () => {
                this.infoBar.getChildByName('Win').getChildByName('WinCredit').getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(localWinCredit);
                this.infoBar.getComponent(Animation).play('InfoBarWin');
            }
            //size===1代表開骰3顆骰子同一個id
            if (winNum.size === 1)
                await this.controller.bigWin.runBigWin(localWinCredit);
            else
                showWinCredit.bind(this)();
        }
        //顯示結算彈窗
        this.result.active = true;
        for (let i = 0; i < 3; i++) {
            this.result.getChildByName(`Dice${i}`).getComponent(Sprite).spriteFrame = this.controller.resultColorSF[winColor[i]];
        }
        // this.gameRoad.updateRoadMap(winColor);//更新路紙
        await CGUtils.Delay(1);
        for (let i of loseNum) {
            chipDispatcher.recycleChip(i);//回收未中獎的籌碼
        }
        await CGUtils.Delay(0.9);
        for (let i of winNum) {
            chipDispatcher.createPayChipToBetArea(i, betCount[i] === 3 ? 9 : betCount[i]);//派彩
        }
        await CGUtils.Delay(2.1);
        if (localWinCredit > 0) {
            view.playerPos.children[0].children[0].getChildByName('Win').getComponent(Label).string = '+' + CGUtils.NumDigits(localWinCredit);
            view.playerPos.children[0].children[0].active = true;
            // this.model.localCredit += this.model.localWinCredit;//玩家現金額更新
        }
        view.comBtnCredits.getComponent(Animation).play();
        // view.updateUICredit();//更新介面額度
        await CGUtils.Delay(2);
        this.betWin.active = false;
        for (let i of winNum) {
            this.betWin.children[i].active = false;
        }
        this.result.active = false;
        this.infoBar.getComponent(Animation).play('InfoBarTip');
        this.newRound();
    }
}