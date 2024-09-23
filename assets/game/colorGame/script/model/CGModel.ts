import { _decorator, Component, sys, JsonAsset, Vec3 } from 'cc';
import { onLoadInfo, Ranking, GameState, onJoinGame, Payoff, BetData } from '../enum/CGInterface';
import { CGPathManager } from '../components/CGPathManager';
import { PathInfo } from '../enum/CGInterface';
const { ccclass, property } = _decorator;


//模擬後端給的資料
@ccclass('CGModel')
export class CGModel extends Component {

    //遊戲基本資料


    //用戶資料
    public userID: number;//用戶ID
    public avatar: number;//頭像ID
    public loginName: string;//登入名稱
    public credit: number;//餘額
    public balance: number;//用戶當前餘額

    //遊戲資料
    public roundSerial: number;//局號
    public startColor: number[];// 起始顏色
    // public limit: number; // 遊戲限額
    // public betTotalTime: number; // 單局下注時間
    public betCreditList: number[]; // 下注額度列表

    //路紙
    public roadMap: number[][];//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
    public roadMapPer: number[];//前100局開獎百分比[顏色id]

    //下注資料
    public totalBet: number;//該用戶目前總下注額
    public userBetAreaCredit: number[];//該用戶各注區目前下注額(需要中途出現籌碼)
    public totalBetAreaCredit: number[];//目前各注區的下注額(需要中途出現籌碼)
    public rankings: Ranking[];//前三名玩家資料(ID，名稱，頭像，餘額)，如果ID是本地玩家，不表演籌碼並取消跟注

    public pathID: number;//該局表演路徑ID
    public winColor: number[];//該局勝利3顏色編號
    public userPayoff: Payoff;//該用戶贏得分數
    public otherPayoffs?: Payoff[];//前三名玩家+其他玩家贏分資訊[玩家][注區贏分]

    public countdown: number;//下注倒數時間
    public newBets: number[][];//前三名玩家+其他玩家新增的下注資訊[玩家][下注金額]
    public liveCount: number;//其他線上人數

    //跟後端要的資料
    // public loadInfo: onLoadInfo;//玩家基本資料
    // public joinGame: onJoinGame;//加入遊戲
    // public roundInfo: RoundInfo;//新局資料
    // public betInfo: BetInfo;//每秒下注資料
    // public rewardInfo: RewardInfo;//開獎資料
    public beginGameInfo: BeginGameData;//下注成功資料


    public touchChipID: number = 1;//紀錄目前點選的籌碼ID

    //本地端資料
    public pathData: PathInfo;//該回合路徑資料

    onLoad() {
        this.setMockData();//暫時設置資料
    }
    //獲得數值更新資料
    public getCreditData() {
        return {
            userTotalBet: this.userTotalBet,//該用戶各注區目前下注額
            credit: this.credit,
            totalBets: this.totalBets,//目前各注區的下注額
            userBets: this.userBets//該用戶各注區目前下注額
        };
    }

    //獲得用戶排名資料
    public getRanksData() {
        return this.rankings;
    }

    //獲取路紙資料
    public getRoadMapData() {
        return {
            roadColorPers: this.roadMapPer,
            roadColors: this.roadMap
        };
    }

    public setMockData() {
        console.log("設置mock");
        this.gameType = 1234;
        this.gameState = GameState.GameReady;//遊戲目前狀態
        this.userID = 123;//用戶ID
        this.avatar = 2;//頭像ID
        this.credit = 5000;//餘額
        this.balance = 50000;//用戶當前餘額
        this.loginName = 'simon';//登入名稱

        this.roundSerial = 12345678;//局號
        this.limit = 30000; // 遊戲限額
        this.betTime = 3; // 單局下注時間
        this.chipRange = [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000]; // 籌碼額度範圍

        this.roadMap = Array.from({ length: 10 }, () => [
            Math.floor(Math.random() * 6),
            Math.floor(Math.random() * 6),
            Math.floor(Math.random() * 6)
        ]);//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
        this.roadMapPer = [10, 20, 20, 20, 20, 10];//前100局開獎百分比[顏色id]

        this.wagersID = 123456;//該玩家注單
        this.userTotalBet = 0;//該用戶目前總下注額
        this.userBets = [0, 0, 0, 0, 0, 0];//該用戶各注區目前下注額(需要中途出現籌碼)
        this.totalBets = [0, 0, 0, 0, 0, 0];//目前各注區的下注額(需要中途出現籌碼)
        this.rankings = [
            { userID: 11111111, displayName: 'john', avatar: 10, credit: 70000 },
            { userID: 22222222, displayName: 'kenny', avatar: 11, credit: 60000 },
            { userID: 33333333, displayName: 'simon', avatar: 12, credit: 50000 }
        ];//前三名玩家資料(ID，名稱，頭像，餘額)，如果ID是本地玩家，不表演籌碼並取消跟注

        this.pathID = 1;//該局表演路徑ID
        this.winColor = [
            Math.floor(Math.random() * 6),
            Math.floor(Math.random() * 6),
            Math.floor(Math.random() * 6)
        ];//該局勝利3顏色編號
        this.userPayoff = { winAreas: [0, 2, 4], payoff: 200 };//該用戶贏得分數
        this.otherPayoffs = [
            { winAreas: [0, 2, 4], payoff: 200 },
            { winAreas: [0, 2, 4], payoff: 200 },
            { winAreas: [0, 2, 4], payoff: 200 },
            { winAreas: [0, 2, 4], payoff: 200 }];//前三名玩家+其他玩家贏分資訊[玩家][注區贏分]

        this.countdown = 5;//下注倒數時間
        this.newBets = [
            [200, 100, 0, 300, 400, 0],
            [0, 100, 50, 50, 100, 200],
            [100, 100, 100, 300, 200, 100],
            [0, 0, 200, 500, 0, 400]
        ];//前三名玩家+其他玩家新增的下注資訊[玩家][下注金額]
        this.userCount = 50;//目前其他玩家人數
    }

    public setPathData() {
        this.pathData = CGPathManager.getInstance().allPathData[this.pathID];//該回合路徑資料
    }


    // Setter 方法
    public setOnLoadInfo(data: onLoadInfo) {
        this.gameState = data.GameState;
        this.userID = data.UserID;
        this.avatar = data.Avatar;
        this.balance = data.Balance;
        this.loginName = data.LoginName;
        this.credit = data.Credit;
    }

    public setOnJoinGame(data: onJoinGame) {
        this.gameType = data.GameType;
        this.gameState = data.GameState;
        this.userID = data.UserID;
        this.roundSerial = data.RoundSerial;
        this.limit = data.Limit;
        this.betTime = data.BetTime;
        this.chipRange = data.ChipRange;
        this.roadMap = data.RoadMap;
        this.roadMapPer = data.RoadMapPer;
        this.userTotalBet = data.UserTotalBet;
        this.userBets = data.UserBets;
        this.totalBets = data.TotalBets;
        this.rankings = data.Rankings;
        this.wagersID = data.WagersID;
        this.pathID = data.PathID;
        this.winColor = data.WinColor;
        this.userPayoff = data.UserPayoff;
        this.otherPayoffs = data.OtherPayoffs;
    }

    // public setRoundData(data: RoundInfo) {
    //     this.gameState = data.GameState;
    //     this.roundSerial = data.RoundSerial;
    //     this.roadMap = data.RoadMap;
    //     this.roadMapPer = data.RoadMapPer;
    // }

    // //每秒接收各用戶下注資料
    // public setBetData(data: BetInfo) {
    //     this.gameState = data.GameState;
    //     this.countdown = data.Countdown;
    //     this.rankings = data.Rankings;
    //     this.totalBets = data.TotalBets;
    //     this.newBets = data.NewBets;
    //     this.userCount = data.UserCount;
    // }

    // //接收開獎資料
    // public setRewardInfo(data: RewardInfo) {
    //     this.roundSerial = data.RoundSerial;
    //     this.wagersID = data.WagersID;
    //     this.pathID = data.PathID;
    //     this.winColor = data.WinColor;
    //     this.userPayoff = data.UserPayoff;
    //     this.otherPayoffs = data.OtherPayoffs;
    //     this.pathData = CGPathManager.getInstance().allPathData[this.pathID];//該回合路徑資料
    // }

    //回傳接收下注成功後的本地用戶資料
    public setBeginGameInfo(data: BeginGameData) {
        this.beginGameInfo = data;
        /// 處理其他邏輯
    }
}