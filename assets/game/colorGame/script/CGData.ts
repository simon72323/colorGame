import { _decorator, Component, sys, JsonAsset, Vec3 } from 'cc';
import { onLoadInfo, onBeginGameInfo, BetInfo, RankInfo, GameState, RewardInfo, RoundInfo } from './connector/receive/CGReceive';
import { CGPathManager } from './components/CGPathManager';
import { PathInfo } from './components/CGPathManager';
const { ccclass, property } = _decorator;

//模擬後端給的資料
@ccclass('CGData')
export class CGData extends Component {
    // private numberShow = [0, 0, 0, 0, 0, 0];//開獎點數

    //跟後端要的資料
    // public gameSetInfo: GameSetInfo;//遊戲配置資料
    // public topUserInfos: onLoadInfo[] = [];//前三名玩家資料
    public loadInfo: onLoadInfo;//本地玩家資料
    public roundInfo: RoundInfo;//新局資料
    public betInfo: BetInfo;//每秒下注資料
    public rewardInfo: RewardInfo;//開獎資料
    public beginGameInfo: onBeginGameInfo;

    // private bet:BetAreaInfo
    //本地端資料
    public chipSetID: number[];//玩家針對此遊戲設置的籌碼ID
    public selectChipID: number = 1;//紀錄目前選擇的籌碼()
    public pathData: PathInfo;//該回合路徑資料
    public betAreaPercent: number[] = [0, 0, 0, 0, 0, 0];//各下注區分數百分比(前端計算)
    public diceEuler: Vec3[] = [];//起始骰子角度(******新局開始前會先跟後端要的資料******)

    // 存儲 chipSetID
    public saveChipSetID(saveData?: number[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (saveData)
                this.chipSetID = saveData;
            this.chipSetID.sort((a, b) => a - b);//小到大排列
            const chipSetIDString = JSON.stringify(this.chipSetID);
            sys.localStorage.setItem('chipSetID', chipSetIDString);
            resolve();
        });
    }

    // 讀取 chipSetID
    public loadChipSetID(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const chipSetIDString = sys.localStorage.getItem('chipSetID');
            if (chipSetIDString) {
                this.chipSetID = JSON.parse(chipSetIDString);
            } else {
                // 如果本地沒有存檔資料，使用默認值
                this.chipSetID = [0, 1, 2, 3, 4];
                this.saveChipSetID();
            }
            resolve();
        });
    }

    // //獲取(sever)遊戲資料
    // public getGameSetInfo(): Promise<void> {
    //     return new Promise<void>((resolve, reject) => {
    //         try {
    //             const gameSetInfoData: GameSetInfo = {
    //                 Limit: 30000,//限額
    //                 BetTime: 12,//單局下注時間
    //                 ChipRange: [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],
    //             }
    //             this.gameSetInfo = gameSetInfoData;
    //             resolve();
    //         } catch (error) {
    //             console.error('獲取遊戲資料時出錯:', error);
    //             reject(error);
    //         }
    //     });
    // }

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
                    betTime: 12,//單局下注時間
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
                this.diceEuler = this.diceRotate(this.rewardInfo.winNumber);//起始骰子角度
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

    //路徑與開獎三顏色之骰子校正旋轉值(路徑id，勝利的三顏色編號)，回傳3個子物件的旋轉值
    private diceRotate(winNumber: number[]) {
        const pathEndColor = this.pathData.diceNumber;
        const changeEuler = [
            [new Vec3(0, 0, 0), new Vec3(-90, 0, 0), new Vec3(0, 0, 90), new Vec3(0, 0, -90), new Vec3(90, 0, 0), new Vec3(180, 0, 0)],
            [new Vec3(90, 0, 0), new Vec3(0, 0, 0), new Vec3(0, -90, 0), new Vec3(0, 90, 0), new Vec3(0, 180, 0), new Vec3(-90, 0, 0)],
            [new Vec3(0, 0, -90), new Vec3(0, 90, 0), new Vec3(0, 0, 0), new Vec3(0, 180, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 90)],
            [new Vec3(0, 0, 90), new Vec3(0, -90, 0), new Vec3(0, 180, 0), new Vec3(0, 0, 0), new Vec3(0, 90, 0), new Vec3(0, 0, -90)],
            [new Vec3(-90, 0, 0), new Vec3(0, 180, 0), new Vec3(0, 90, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 0), new Vec3(90, 0, 0)],
            [new Vec3(180, 0, 0), new Vec3(90, 0, 0), new Vec3(0, 0, -90), new Vec3(0, 0, 90), new Vec3(-90, 0, 0), new Vec3(0, 0, 0)]
        ];
        return [
            changeEuler[pathEndColor[0]][winNumber[0]],
            changeEuler[pathEndColor[1]][winNumber[1]],
            changeEuler[pathEndColor[2]][winNumber[2]]
        ]
    }
}