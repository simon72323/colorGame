import { _decorator, Component, sys, JsonAsset, Vec3 } from 'cc';
import { onLoadInfo, RankInfo, GameState, onJoinGame, onBetInfo, UserBets, UserPayoff } from '../enum/CGInterface';
import { CGPathManager } from '../manager/CGPathManager';

import { PathInfo } from '../enum/CGInterface';
const { ccclass, property } = _decorator;


//模擬後端給的資料
@ccclass('CGModel')
export class CGModel extends Component {



    //用戶資料(server給的)
    // public gameType: number;//遊戲編號
    public userID: number;//用戶ID
    public avatarID: number;//頭像ID
    public loginName: string;//登入名稱
    public credit: number;//餘額
    public balance: number;//用戶當前餘額

    //遊戲資料(server給的)
    public roundSerial: number;//局號
    public betTotalTime: number; // 單局下注時間
    // public betCreditList: number[]; // 下注額度列表
    public roadMap: number[][];//前100局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
    public allBets: UserBets[];// 該局有下注的用戶與注額分布與餘額
    public rankings: RankInfo[];//前三名用戶資料(ID，名稱，頭像，餘額)，如果ID是本地用戶，不表演籌碼並取消跟注
    public liveCount: number;// 目前線上人數

    public pathID: number;
    public winColor: number[];
    public winners: UserPayoff[];

    //下注資料(server給的)
    public betTotal: number;//該用戶目前總下注額
    public userBetAreaCredit: number[];//該用戶各注區目前下注額
    public totalBetAreaCredit: number[];//目前各注區的下注額(需要中途出現籌碼)


    //本地端資料
    // public touchChipID: number = 1;//紀錄目前點選的籌碼ID
    public pathData: PathInfo;//該回合路徑資料

    onLoad() {
        // this.setMockData();//暫時設置資料
    }
    //獲得數值更新資料
    public getCreditData() {
        return {
            betTotal: this.betTotal,//該用戶總下注額
            credit: this.credit,
            userBetAreaCredit: this.userBetAreaCredit,//該用戶各注區目前下注額
            totalBetAreaCredit: this.totalBetAreaCredit//目前各注區的下注額
        };
    }

    //獲得用戶排名資料
    public getRanksData() {
        return this.rankings;
    }

    //獲取路紙資料
    public getRoadMapData() {
        return this.roadMap
    }

    //設置路徑資料
    public setPathData(pathID: number): void {
        this.pathData = CGPathManager.getInstance().allPathData[pathID];
    }

    //計算勝利表演所需用參數
    public calculateWinData(winColor: number[]): { betOdds: number[], localWinArea: number[] } {
        let betOdds = [0, 0, 0, 0, 0, 0];//勝利注區與倍率
        let winColorCount = [0, 0, 0, 0, 0, 0];//每個注區的開獎數量
        let localWinArea = [];//本地勝利注區
        for (let i of winColor) {
            winColorCount[i]++;
        }
        //本地下注分數變更
        for (let i = 0; i < winColorCount.length; i++) {
            const count = winColorCount[i];
            if (count > 0) {
                const odds = this.calculateOdds(count);
                if (this.userBetAreaCredit[i] > 0) {
                    this.userBetAreaCredit[i] *= (odds + 1);//注區額度變更(倍率)
                    localWinArea.push(i);
                }
                betOdds[i] = odds;
            }
            else
                this.userBetAreaCredit[i] = 0;
        }
        return { localWinArea, betOdds };
    }

    //計算賠率
    public calculateOdds(odds: number): number {
        return odds === 3 ? 9 : odds;
    }


    //更新本地下注額度
    public updateBetCredit(betCredits: number[], credit: number) {
        this.credit = credit;//已被server更新
        const addCredit = betCredits.reduce((a, b) => a + b, 0);
        this.betTotal += addCredit;
        for (let i = 0; i < 6; i++) {
            this.userBetAreaCredit[i] += betCredits[i];
        }
        for (let i = 0; i < 6; i++) {
            this.totalBetAreaCredit[i] += betCredits[i];
        }
    }

    // const winNum = new Set(winColor);//過濾重複數字

    //中獎注區設置
    // for (let i of winNum) {
    //     // this.betWin.children[i].active = true;
    //     //判斷用戶是否有下注該中獎區
    //     if (this.userBetAreaCredit[i] > 0) {
    //         this.userBetAreaCredit[i] *= winColorCount[i] === 3 ? 10 : winColorCount[i] + 1;//注區額度變更(倍率)
    //         // localWinCredit += userBetAreaCredit[i];
    //         // view.betInfo.children[i].getChildByName('BetCredit').getComponent(Label).string = CGUtils.NumDigits(userBetAreaCredit[i]);
    //         // this.mainPlayerWin.children[i].active = true;
    //         // this.mainPlayerWin.children[i].children[0].getComponent(Sprite).spriteFrame = this.controller.winOddSF[winColorCount[i] - 1];
    //     }
    // }

    //未中獎注區設置
    // const diceNum = [0, 1, 2, 3, 4, 5];
    // const loseNum = diceNum.filter(number => !(winColor.indexOf(number) > -1) as boolean);
    // for (let i of loseNum) {
    //     userBetAreaCredit[i] = 0;
    //     view.betInfo.children[i].getChildByName('BetCredit').getComponent(Label).string = CGUtils.NumDigits(userBetAreaCredit[i]);
    //     view.betInfo.children[i].getComponent(UIOpacity).opacity = 100;
    // }
    //本地用戶勝利設置
    // if (localWinCredit > 0) {
    //     const showWinCredit = () => {
    //         this.infoBar.getChildByName('Win').getChildByName('WinCredit').getChildByName('Label').getComponent(Label).string = CGUtils.NumDigits(localWinCredit);
    //         this.infoBar.getComponent(Animation).play('InfoBarWin');
    //     }
    //     //size===1代表開骰3顆骰子同一個id
    //     if (winNum.size === 1)
    //         await this.controller.bigWin.runBigWin(localWinCredit);
    //     else
    //         showWinCredit.bind(this)();
    // }
    //顯示結算彈窗
    // this.result.active = true;
    // for (let i = 0; i < 3; i++) {
    //     this.result.getChildByName(`Dice${i}`).getComponent(Sprite).spriteFrame = this.controller.resultColorSF[winColor[i]];
    // }
    // }

    // public setMockData() {
    //     console.log("設置mock");
    //     this.gameType = 1234;
    //     this.gameState = GameState.GameReady;//遊戲目前狀態
    //     this.userID = 123;//用戶ID
    //     this.avatar = 2;//頭像ID
    //     this.credit = 5000;//餘額
    //     this.balance = 50000;//用戶當前餘額
    //     this.loginName = 'simon';//登入名稱

    //     this.roundSerial = 12345678;//局號
    //     this.limit = 30000; // 遊戲限額
    //     this.betTime = 3; // 單局下注時間
    //     this.chipRange = [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000]; // 籌碼額度範圍

    //     this.roadMap = Array.from({ length: 10 }, () => [
    //         Math.floor(Math.random() * 6),
    //         Math.floor(Math.random() * 6),
    //         Math.floor(Math.random() * 6)
    //     ]);//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
    //     this.roadMapPer = [10, 20, 20, 20, 20, 10];//前100局開獎百分比[顏色id]

    //     this.wagersID = 123456;//該用戶注單
    //     this.userTotalBet = 0;//該用戶目前總下注額
    //     this.userBets = [0, 0, 0, 0, 0, 0];//該用戶各注區目前下注額(需要中途出現籌碼)
    //     this.totalBets = [0, 0, 0, 0, 0, 0];//目前各注區的下注額(需要中途出現籌碼)
    //     this.rankings = [
    //         { userID: 11111111, displayName: 'john', avatar: 10, credit: 70000 },
    //         { userID: 22222222, displayName: 'kenny', avatar: 11, credit: 60000 },
    //         { userID: 33333333, displayName: 'simon', avatar: 12, credit: 50000 }
    //     ];//前三名用戶資料(ID，名稱，頭像，餘額)，如果ID是本地用戶，不表演籌碼並取消跟注

    //     this.pathID = 1;//該局表演路徑ID
    //     this.winColor = [
    //         Math.floor(Math.random() * 6),
    //         Math.floor(Math.random() * 6),
    //         Math.floor(Math.random() * 6)
    //     ];//該局勝利3顏色編號
    //     this.userPayoff = { winAreas: [0, 2, 4], payoff: 200 };//該用戶贏得分數
    //     this.otherPayoffs = [
    //         { winAreas: [0, 2, 4], payoff: 200 },
    //         { winAreas: [0, 2, 4], payoff: 200 },
    //         { winAreas: [0, 2, 4], payoff: 200 },
    //         { winAreas: [0, 2, 4], payoff: 200 }];//前三名用戶+其他用戶贏分資訊[用戶][注區贏分]

    //     this.countdown = 5;//下注倒數時間
    //     this.newBets = [
    //         [200, 100, 0, 300, 400, 0],
    //         [0, 100, 50, 50, 100, 200],
    //         [100, 100, 100, 300, 200, 100],
    //         [0, 0, 200, 500, 0, 400]
    //     ];//前三名用戶+其他用戶新增的下注資訊[用戶][下注金額]
    //     this.userCount = 50;//目前其他用戶人數
    // }

    // //回傳接收下注成功後的本地用戶資料
    // public setBeginGameInfo(data: BeginGameData) {
    //     this.beginGameInfo = data;
    //     /// 處理其他邏輯
    // }
}