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
    public colorPer: number[] = [0, 0, 0, 0, 0, 0];//前100局顏色比例
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
                    UserID: 123,
                    Avatar: 2,
                    Base: '',
                    DefaultBase: '',
                    Balance: 0,//用戶當前餘額
                    LoginName: 'simon',
                    AutoExchange: false,
                    Credit: 5000,
                    // WagersID: 0,
                    // RoundSerial: 0,
                    BetAreaCredit: [0, 0, 0, 0, 0, 0],
                    BetTotalCredit: 0,
                    Limit: 30000,//限額
                    BetTime: 12,//單局下注時間
                    ChipRange: [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],
                    GameState: GameState.BeginGame,
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
                    RoundSerial: 12415214,
                    Rank: [
                        { LoginName: 'john', Avatar: 10, Credit: 70000 },
                        { LoginName: 'kenny', Avatar: 11, Credit: 60000 },
                        { LoginName: 'simon', Avatar: 12, Credit: 50000 }
                    ],
                    OtherUserCount: 50,
                    RoadColors: Array.from({ length: 10 }, () => [
                        Math.floor(Math.random() * 6),
                        Math.floor(Math.random() * 6),
                        Math.floor(Math.random() * 6)
                    ]),
                    RoadColorPers: [10, 20, 20, 20, 20, 10],
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
                    GameState: GameState.BeginGame,
                    Countdown: 10,
                    BetAreaCredit: [0, 0, 0, 0, 0, 0],
                    OtherUserBetAreaCredit: [
                        { BetAreaCredit: [200, 0, 0, 500, 0, 0], Credit: 30000 },
                        { BetAreaCredit: [200, 0, 0, 500, 0, 0], Credit: 30000 },
                        { BetAreaCredit: [200, 0, 0, 500, 0, 0], Credit: 30000 },
                        { BetAreaCredit: [200, 0, 0, 500, 0, 0] }
                    ],
                    OtherUserCount: 50,
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
                    WagersID: 21547815,
                    PathID: Math.floor(Math.random() * 1000),
                    WinNumber: [
                        Math.floor(Math.random() * 6),
                        Math.floor(Math.random() * 6),
                        Math.floor(Math.random() * 6)
                    ],
                    UserWinCredit: { WinBetArea: [0, 2, 4], WinCredit: 200 },
                    OtherUserWinCredit: [
                        { WinBetArea: [0, 2, 4], WinCredit: 200 },
                        { WinBetArea: [0, 2, 4], WinCredit: 200 },
                        { WinBetArea: [0, 2, 4], WinCredit: 200 },
                        { WinBetArea: [0, 2, 4], WinCredit: 200 }
                    ],
                }
                this.rewardInfo = rewardData;
                this.pathData = CGPathManager.getInstance().allPathData[this.rewardInfo.PathID];//該回合路徑資料
                this.diceEuler = this.diceRotate(this.rewardInfo.WinNumber);//起始骰子角度
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
                    BetAreaID: 2,
                    BetCredit: 20,
                    CreditEnd: 2500,
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
        // console.log('表演的路徑id', id);
        // console.log('表演的路徑id結果編號', this.pathData[id].diceNumber);
        // console.log('希望的結果編號', winNumber);
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