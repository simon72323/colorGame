import { _decorator } from 'cc';
import { RankInfo } from '../enum/CGInterface';
import { CGPathManager } from '../manager/CGPathManager';

import { PathInfo } from '../enum/CGInterface';
const { ccclass, property } = _decorator;

@ccclass('CGModel')
export class CGModel {
    private static readonly _instance: CGModel = new CGModel();
    public static getInstance(): CGModel {
        return CGModel._instance;
    }

    //用戶資料
    public userID: number;//用戶ID
    // public avatarID: number;//頭像ID
    public loginName: string;//登入名稱
    public credit: number;//餘額
    public balance: number;//用戶當前餘額

    //遊戲資料
    public wagersID: number;//局號
    public betTotalTime: number; // 單局下注時間
    // public betCreditList: number[]; // 下注額度列表
    public roadMap: number[][];//前100局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
    // public allBets: UserBets[];// 該局有下注的用戶與注額分布與餘額
    public rankings: RankInfo[];//前三名用戶資料(ID，名稱，頭像，餘額，下注總額分布)，如果ID是本地用戶，不表演籌碼並取消跟注
    public liveCount: number;// 目前線上人數
    public pathID: number;
    public winColor: number[];

    //下注資料
    public betTotal: number;//該用戶目前總下注額
    public userBetAreaCredits: number[];//該用戶各注區目前下注額
    public totalBetAreaCredits: number[];//目前各注區的下注額(需要中途出現籌碼)

    //本地端資料
    public pathData: PathInfo;//該回合路徑資料

    public touchChipID: number = 1;//點選的籌碼ID
    public touchChipPosID: number = 1;//點選的籌碼位置ID
    public betCreditList: number[] = [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];//下注額度列表(固定值)

    private constructor() {
        // 初始化数据
    }

    onLoad() {
        // this.dataInit();
        //非loading時暫時使用
        // CGPathManager.getInstance().node.on("completed", async () => {
        //     console.log("路徑加載完畢，開始模擬遊戲")
        // });
        // this.setMockData();//暫時設置資料
    }



    public setCredit(credit: number) {
        this.credit = credit;
    }

    public updateRoadMap(newRoad: number[]) {
        this.roadMap.pop();//刪除最後一個路子
        this.roadMap.unshift(newRoad);//添加新路子到第一個
    }

    public getCredit() {
        return this.credit;
    }

    public getRoadMap() {
        return this.roadMap;
    }

    /**
     * 下注資料初始化
     */
    public initBetData(): void {
        this.betTotal = 0;
        this.userBetAreaCredits = Array(6).fill(0);
        this.totalBetAreaCredits = Array(6).fill(0);
    }

    /**
     * 獲得數值更新資料
     * @returns 
     */
    public getCreditData() {
        return {
            betTotal: this.betTotal,//該用戶總下注額
            credit: this.credit,
            userBetAreaCredit: this.userBetAreaCredits,//該用戶各注區目前下注額
            totalBetAreaCredit: this.totalBetAreaCredits//目前各注區的下注額
        };
    }

    /**
     * 計算勝利表演所需用參數
     * @param winColor 開獎顏色編號
     * @returns 
     */
    public calculateWinData(winColor: number[]): { betOdds: number[], localWinArea: number[] } {
        let betOdds: number[] = Array(6).fill(0);//勝利注區與倍率
        let winColorCount: number[] = Array(6).fill(0);//每個注區的開獎數量
        let localWinArea: number[] = [];//本地勝利注區
        for (let i of winColor) {
            winColorCount[i]++;
        }
        //判斷勝利注區
        for (let i = 0; i < winColorCount.length; i++) {
            const count = winColorCount[i];
            if (count > 0) {
                if (this.userBetAreaCredits[i] > 0)//如果用戶該區有下注
                    localWinArea.push(i);
                betOdds[i] = count === 3 ? 14 : count;//設置賠率
            }
        }
        return { localWinArea, betOdds };
    }

    /**
     * 更新其他玩家下注注區額度
     * @param betCredits 注區額度
     * @param rankID 名次
     */
    public updateTotalBetArea(betCredits: number[], rankID: number) {
        for (let i = 0; i < 6; i++) {
            this.totalBetAreaCredits[i] += betCredits[i];
        }
        const addCredit = betCredits.reduce((a, b) => a + b, 0);//注額加總
        if (rankID < 3)
            this.rankings[rankID].credit -= addCredit;//排名玩家額度減少
    }

    /**
     * 更新本地下注注區額度
     * @param betCredits 本地下注注區額度
     * @param credit 餘額
     */
    public updateBetCredit(betCredits: number[], credit: number) {
        this.credit = credit;
        const addCredit = betCredits.reduce((a, b) => a + b, 0);//注額加總
        this.betTotal += addCredit;
        for (let i = 0; i < 6; i++) {
            this.userBetAreaCredits[i] += betCredits[i];
        }
        for (let i = 0; i < 6; i++) {
            this.totalBetAreaCredits[i] += betCredits[i];
        }
    }
}