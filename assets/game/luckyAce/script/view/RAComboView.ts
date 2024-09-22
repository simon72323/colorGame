import { _decorator, Component, Node, Animation, Label, UIOpacity, find } from 'cc';
import { FreeGameSpin, FreeGame, Lines, onBeginGame } from '../enum/RAInterface';
import { RAMarquee } from './RAMarquee';
const { ccclass, property } = _decorator;

@ccclass('RAComboView')
export class RAComboView extends Component {

    @property({ type: Node, tooltip: "跑馬燈" }) // marquee_winScore
    private marquee: RAMarquee = null;

    @property({ type: Node, tooltip: "倍率文字" })
    private multipleNode: Node = null;
    @property({ type: Node, tooltip: "combo文字" })
    private comboNode: Node = null;
    // 分數
    @property({ type: Node, tooltip: "遊戲贏得分數資訊" })
    private winScoreInfo: Node = null;
    @property({ type: Node, tooltip: "跑馬燈分數資訊" })
    private winTotalScoreInfo: Node = null;
    // 分數特效
    // @property({ type: Node, tooltip: "贏得分數欄位底框" })
    // private winScoreBg: Node = null;
    // @property({ type: Node, tooltip: "贏得分數噴金幣特效" })
    // private spawnCoin: Node = null;

    // Free Game
    @property({ type: Node, tooltip: "free game文字背景" })
    private freeTopBg: Node = null;
    // @property({ type: Node, tooltip: "免費遊戲獲得" })
    // private freeGameGet: Node = null;
    // @property({ type: Node, tooltip: "免費遊戲結算" })
    // private totalWin: Node = null;
    // @property({ type: Node, tooltip: "免費遊戲剩餘次數介面" })
    // private freeGameTimes: Node = null;
    // @property({ type: Node, tooltip: "免費遊戲加局訊息" })
    // private freeGameAddition: Node = null;
    // @property({ type: Node, tooltip: "免費遊戲隱藏按鈕操作區" })
    // private controlBtns: Node = null;


    private multipleNormal = [1, 2, 3, 5]; // 一般遊戲時的倍率
    private multipleFree = [2, 4, 6, 10]; // 免費遊戲時的倍率
    private comboTimes: number = 0; // combo連跳次數
    private isFreeGame: boolean = false;
    private prevScore: number = 0;


    protected onLoad(): void {
        this.freeTopBg.active = false;
        this.setMultipleNormal();
    }


    start() {

    }

    update(deltaTime: number) {

    }

    /**
     * 設置 Normal Game 倍率文字
     */
    private setMultipleNormal(): void {
        this.freeTopBg.active = false;
        this.isFreeGame = false;
        const multipleNode = this.multipleNode.getChildByName('multipleLayout').children;

        for (let child = 0; child < multipleNode.length; child++) {
            // 更換底圖的字
            let topLabel = multipleNode[child].getComponent(Label);
            topLabel.string = `x${this.multipleNormal[child]}`

            // 更換亮燈的字
            let botLabel = multipleNode[child].getChildByName('label').getComponent(Label);
            botLabel.string = `x${this.multipleNormal[child]}`
        }
    }

    /**
     * Free game 模式
     * 更換 Free Game 背景 & 倍率文字
     * @param lineNum combo次數
     */

    public async setScatterWinInfo(): Promise<void> {
        this.isFreeGame = true;

        await this.waitMilliSeconds(4000);
        this.freeTopBg.active = true;

        const multipleNode = this.multipleNode.getChildByName('multipleLayout').children;

        for (let child = 0; child < multipleNode.length; child++) {
            // 更換底圖的字
            let topLabel = multipleNode[child].getComponent(Label);
            topLabel.string = `x${this.multipleFree[child]}`

            // 更換亮燈的字
            let botLabel = multipleNode[child].getChildByName('label').getComponent(Label);
            botLabel.string = `x${this.multipleFree[child]}`
        }
    }

    /**
     * Normal Game 中線演出
     * @param lineData Lines內所有Data
     * @param accumulateData 每次spin中線的累加金額
     * @param isfreeGameSpin 是否為Free Game
     */

    public async setLineWinInfo(lineData: Lines[], accumulateData: number[], isfreeGameSpin: boolean): Promise<void> {
        const lines = lineData[0].DoubleTime;

        await this.waitMilliSeconds(1500);

        let doubleTimeData: number = 0;
        doubleTimeData = lines;
        this.comboTimes++
        // 中線顯示倍率文字 & Combo文字
        this.showMultipleLabel(doubleTimeData, isfreeGameSpin);
        this.showComboLabel(this.comboTimes);


        /* 分數結算 */
        // 關閉正在跑的馬燈
        this.marquee.getComponent(UIOpacity).opacity = 0;

        // "此次spin中線分數" (上方大數字)
        // 播放動畫
        const winScoreAni = this.winScoreInfo.getComponent(Animation);
        winScoreAni.play('winScoreInfo')
        this.winScoreInfo.active = true;

        // 計算這次中線的分數
        let currentScore = accumulateData[0];
        const pricetag = this.calculateScore(this.prevScore, currentScore);
        this.prevScore = currentScore;

        const winscore = pricetag.toFixed(2);
        console.log('我是這次中線的分數=====', winscore)

        // 取得的 score 節點的 Label
        const winScoreInfoNode = find('score/label', this.winScoreInfo);
        // 將分數塞進 Label 裡
        let scoreLabel = winScoreInfoNode.getComponent(Label);
        scoreLabel.string = winscore;


        // "累加的加總金額" (下面跑馬燈)
        // 播放動畫
        const totalScoreAni = this.winTotalScoreInfo.getComponent(Animation);
        totalScoreAni.play('totalscoreShow')
        // 開啟跑馬燈分數加總
        this.winTotalScoreInfo.active = true;

        // 取得分數 payTotalData 塞進 Label
        let payTotalData = accumulateData[0];
        const totalMoney = payTotalData.toFixed(2);
        console.log('我是跑馬燈的分數~~~~~~~~~~~~~~~', payTotalData)

        // 取得的 scoreTotal 節點的 Label
        const winTotalScoreInfoNode = find('score/label', this.winTotalScoreInfo);
        // 將分數塞進 Label 裡
        let scoreTotalLabel = winTotalScoreInfoNode.getComponent(Label);
        scoreTotalLabel.string = totalMoney;
    }

    /**
     * 結算辣
     */
    private calculateScore(previous: number, current: number): number {
        return current - previous;
    }

    /**
     *
     * 重置所有狀態
     */
    public resetComboInfo(nowFreeGame: boolean): void {
        console.log('RESET')
        // 倍率文字背景切換一般模式 & 回到最低倍率
        let doubleTime: number = 0;

        this.showMultipleLabel(doubleTime, nowFreeGame);

        // 關閉combo文字 & 重置次數
        this.comboNode.active = false;
        this.comboTimes = 0;
        // 打開跑馬燈
        this.marquee.getComponent(UIOpacity).opacity = 255;
        // 關閉跑馬燈總得分
        this.winTotalScoreInfo.active = false;
        this.winScoreInfo.active = false;
        // 重置分數
        this.prevScore = 0;
    }

    /**
     * 顯示倍率文字
     * @param lineNum 中線資料
     */
    public showMultipleLabel(lineNum: number, freeGame: boolean) {
        this.isFreeGame = freeGame;
        // 判斷是否為 Free Game
        let multipleArray = this.multipleNormal
        if (this.isFreeGame) {
            multipleArray = this.multipleFree
        } else {
            multipleArray = this.multipleNormal;
            this.setMultipleNormal();
        }

        let currentLineNum = -1;
        currentLineNum = multipleArray.indexOf(lineNum);

        if (currentLineNum === -1) {
            currentLineNum = 0;
        }

        const multipleNode = this.multipleNode.getChildByName('multipleLayout').children;
        const nodeAnimation = multipleNode[currentLineNum].getComponent(Animation);

        multipleNode.forEach(node => {
            node.getChildByName('label').active = false;
            node.getChildByName('fx').active = false;
        });

        // 亮燈得地方
        multipleNode[currentLineNum].getChildByName('label').active = true;
        multipleNode[currentLineNum].getChildByName('fx').active = true;


        if (lineNum === 0) {
            nodeAnimation.play('multipleStay');
        } else {
            // 播放震動
            this.node.getComponent(Animation).play('shark')
            nodeAnimation.play('multipleChange');
            nodeAnimation.on(Animation.EventType.FINISHED, () => {
                nodeAnimation.play('multipleStay');
            }, this);
        }

    }

    /**
     * 顯示Combo文字
     * @param comboNum combo次數
     */
    private showComboLabel(comboNum: number) {
        this.comboNode.active = true;

        const comboAni = this.comboNode.getComponent(Animation);
        let comboStr = this.comboNode.getChildByName('label').getComponent(Label);

        setTimeout(() => {
            comboStr.string = comboNum.toString();
        }, 0.5);

        if (comboNum === 1) {
            comboAni.play('combo_show');
            comboAni.on(Animation.EventType.FINISHED, (state) => {
                comboAni.play('combo_loop')
            }, this)
        } else {
            comboAni.play('combo_change');
            comboAni.on(Animation.EventType.FINISHED, (state) => {
                comboAni.play('combo_loop')
            }, this)
        }
    }

    /**
     * 等待多少毫秒
     * @param ms
     * @returns
     */
    private waitMilliSeconds(ms: number): Promise<void> {
        return new Promise((r) => setTimeout(r, ms));
    }


    // NOTE：
    // spawnCoinFx
    // 贏得分數倍率 5~19倍出現
    //
    //
    // winScroeBg 贏得分數倍率計算方式 = 總贏得金額  / 下注金額 = 贏得分數倍率
    // winScroe_1: 贏得分數倍率 5倍以下
    // winScroe_2: 贏得分數倍率 5~20倍
    // winScroe_3: 贏得分數倍率 20倍以上
    //
    //
    // big win / mega win / super win
    // big win: 20倍~49倍
    // mega win: 50倍~99倍
    // super win: 100倍以上
    //
    //
}

