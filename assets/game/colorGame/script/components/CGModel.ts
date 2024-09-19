import { _decorator, Component, sys, JsonAsset, Vec3 } from 'cc';
import { onLoadInfo, onBeginGameInfo, BetInfo, RankInfo, GameState, RewardInfo, RoundInfo } from '../connector/receive/CGReceive';
import { CGPathManager } from './CGPathManager';
import { PathInfo } from '../components/CGPathManager';
const { ccclass, property } = _decorator;


//模擬後端給的資料
@ccclass('CGModel')
export class CGModel {
    private static singleton: CGModel = null;
    public static getInstance(): CGModel {
        if (!CGModel.singleton) {
            CGModel.singleton = new CGModel();
        }
        return CGModel.singleton;
    }

    // 私有構造函數，防止直接實例化
    private constructor() {
        // 初始化代碼
    }

    //跟後端要的資料
    public loadInfo: onLoadInfo;//本地玩家資料
    public roundInfo: RoundInfo;//新局資料
    public betInfo: BetInfo;//每秒下注資料
    public rewardInfo: RewardInfo;//開獎資料
    public beginGameInfo: onBeginGameInfo;

    //本地端資料
    public pathData: PathInfo;//該回合路徑資料
    public betAreaPercent: number[] = [0, 0, 0, 0, 0, 0];//各下注區分數百分比(前端計算)

    //獲得數值更新資料
    public getScoreData() {
        return {
            betTotalCredit: this.loadInfo.betTotalCredit,
            credit: this.loadInfo.credit,
            rank: this.betInfo.rank,
            betAreaTotalCredit: this.betInfo.betAreaTotalCredit,
            betAreaCredit: this.loadInfo.betAreaCredit
        };
    }

    //獲取路紙資料
    public getRoadMapData() {
        return {
            roadColorPers: this.roundInfo.roadColorPers,
            roadColors: this.roundInfo.roadColors
        };
    }

    //獲取遊戲資料onLoadInfo
    public getOnLoadInfo(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const loadInfoData: onLoadInfo = {
                    event: true,
                    userID: 123,
                    avatar: 2,
                    base: '',
                    defaultBase: '',
                    balance: 0,//用戶當前餘額
                    loginName: 'simon',
                    autoExchange: false,
                    credit: 5000,
                    // wagersID: 0,
                    // roundSerial: 0,
                    betAreaCredit: [0, 0, 0, 0, 0, 0],
                    betTotalCredit: 0,
                    limit: 30000,//限額
                    betTime: 1,//單局下注時間
                    chipRange: [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],
                    gameState: GameState.Betting,
                }
                this.loadInfo = loadInfoData;
                resolve();
            } catch (error) {
                console.error('獲取遊戲資料時出錯:', error);
                reject(error);
            }
        });
    }

    //獲取(sever)新回合資料
    public getRoundData(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const RoundData: RoundInfo = {
                    // GameState: GameState.BeginGame,
                    roundSerial: 12415214,
                    roadColors: Array.from({ length: 10 }, () => [
                        Math.floor(Math.random() * 6),
                        Math.floor(Math.random() * 6),
                        Math.floor(Math.random() * 6)
                    ]),
                    roadColorPers: [10, 20, 20, 20, 20, 10],
                }
                this.roundInfo = RoundData;
                resolve();
            } catch (error) {
                console.error('獲取回合資料時出錯:', error);
                reject(error);
            }
        });
    }

    //獲取(sever)每秒接送下注資料
    public getBetData(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const BetData: BetInfo = {
                    // GameState: GameState.BeginGame,
                    countdown: 10,
                    rank: [
                        { userID: 11111111, loginName: 'john', avatar: 10, credit: 70000 },
                        { userID: 22222222, loginName: 'kenny', avatar: 11, credit: 60000 },
                        { userID: 33333333, loginName: 'simon', avatar: 12, credit: 50000 }
                    ],
                    betAreaTotalCredit: [0, 0, 0, 0, 0, 0],
                    otherUserBetAreaCredit: [
                        [200, 100, 0, 300, 400, 0],
                        [0, 100, 50, 50, 100, 200],
                        [100, 100, 100, 300, 200, 100],
                        [0, 0, 200, 500, 0, 400]
                    ],
                    otherUserCount: 50,
                }
                this.betInfo = BetData;
                resolve();
            } catch (error) {
                console.error('獲取回合資料時出錯:', error);
                reject(error);
            }
        });
    }

    //獲取(sever)開獎資料
    public getRewardInfo(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const rewardData: RewardInfo = {
                    roundSerial: 12415214,
                    wagersID: 21547815,
                    pathID: Math.floor(Math.random() * 1000),
                    winNumber: [
                        Math.floor(Math.random() * 6),
                        Math.floor(Math.random() * 6),
                        Math.floor(Math.random() * 6)
                    ],
                    userWinCredit: { winBetArea: [0, 2, 4], winCredit: 200 },
                    otherUserWinCredit: [
                        { winBetArea: [0, 2, 4], winCredit: 200 },
                        { winBetArea: [0, 2, 4], winCredit: 200 },
                        { winBetArea: [0, 2, 4], winCredit: 200 },
                        { winBetArea: [0, 2, 4], winCredit: 200 }
                    ],
                }
                this.rewardInfo = rewardData;
                this.pathData = CGPathManager.getInstance().allPathData[this.rewardInfo.pathID];//該回合路徑資料
                resolve();
            } catch (error) {
                console.error('獲取目前下注資料時出錯:', error);
                reject(error);
            }
        });
    }

    //收到下注資料，傳送給getBetInfo
    public getOnBeginGame(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const beginGameData: onBeginGameInfo = {
                    isSuccess: true,
                    betAreaID: 2,
                    betCredit: 20,
                    remainingCredit: 2500,
                }
                this.beginGameInfo = beginGameData;
                resolve();
            } catch (error) {
                console.error('獲取玩家下注資料時出錯:', error);
                reject(error);
            }
        });
    }
}