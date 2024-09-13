import { _decorator, Component, resources, JsonAsset, Vec3 } from 'cc';
import { GameSetInfo, onLoadInfo, onBeginGame, BetInfo, RewardInfo, GameState, BetAreaInfo } from './connector/receive/CGReceive';
const { ccclass, property } = _decorator;

//單一路徑資料(本機)
export interface PathInfo {
    pos: number[][];//座標參數[第幾個frame][三顆骰子的座標]
    rotate: number[][];//旋轉參數[第幾個frame][三顆骰子的座標]
    diceNumber: number[];//開獎點數[三顆骰子的點數]
}

//模擬後端給的資料
@ccclass('CGData')
export class CGData extends Component {
    // private numberShow = [0, 0, 0, 0, 0, 0];//開獎點數

    //跟後端要的資料
    public gameSetInfo: GameSetInfo;//遊戲配置資料
    public topUserInfos: onLoadInfo[] = [];//前三名玩家資料
    public userInfo: onLoadInfo;//本地玩家資料
    public onBeginGame: onBeginGame;//回合資料
    // public roadData: RoadData = null;//遊戲紀錄資料
    public betInfo: BetInfo;//下注資訊

    // private bet:BetAreaInfo
    //本地端資料
    public chipSetID: number[];//玩家針對此遊戲設置的籌碼ID
    public allPathData: PathInfo[] = [];//所有路徑資料
    public selectChipID: number = 1;//紀錄目前選擇的籌碼()
    public pathData: PathInfo;//該回合路徑資料
    public colorPer: number[] = [0, 0, 0, 0, 0, 0];//前100局顏色比例
    public betAreaPercent: number[] = [0, 0, 0, 0, 0, 0];//各下注區分數百分比(前端計算)
    public diceEuler: Vec3[] = [];//起始骰子角度(******新局開始前會先跟後端要的資料******)

    // 讀取 JSON 文件(loading頁時就要讀取)
    public loadPathJson(): Promise<void> {
        return new Promise<void>((resolve) => {
            resources.load("CGPathData/CGPath", JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error(err);
                    return;
                }
                // 獲取json資料
                for (let i = 0; i < jsonAsset.json.length; i++) {
                    this.allPathData[i] = jsonAsset.json[i];
                }
                // console.log("測試資料獲取", this.allPathData[980].diceNumber)
                // for (let i = 0; i < this.allPathData.length; i++) {
                //     for (let j = 0; j < this.allPathData[i].diceNumber.length; j++) {
                //         this.numberShow[this.allPathData[i].diceNumber[j]]++;
                //     }
                // }
                // console.log('開獎點數分佈:' + this.numberShow)
                resolve();
            });
        })
    }

    //獲取(sever)遊戲資料
    public getGameSetInfo(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const gameSetInfoData: GameSetInfo = {
                    Limit: 30000,//限額
                    BetTime: 12,//單局下注時間
                    ChipRange: [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],
                }
                this.gameSetInfo = gameSetInfoData;
                resolve();
            } catch (error) {
                console.error('獲取遊戲資料時出錯:', error);
                reject(error);
            }
        });
    }

    //獲取(sever)玩家配置資料
    public getUserInfo(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const userInfoData: onLoadInfo = {
                    event: true,
                    UserID: 123,
                    Base: '',
                    DefaultBase: '',
                    Balance: 0,//用戶當前餘額
                    LoginName: 'simon',
                    AutoExchange: false,
                    WagersID: 0,
                    Credit: 5000,
                    PhotoID: 2,
                    BetAreaCredit: [0, 0, 0, 0, 0, 0],
                    BetTotalCredit: 0,
                    Rank: 10,
                    ChipSetID: [0, 1, 2, 3, 4]
                }
                this.userInfo = userInfoData;
                resolve();
            } catch (error) {
                console.error('獲取本地玩家訊息時出錯:', error);
                reject(error);
            }
        });
    }

    //獲取(sever)前三名玩家配置資料
    public getTopUserInfo(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const topUserInfosData: onLoadInfo[] = [{
                    event: true,
                    UserID: 123,
                    Base: '',
                    DefaultBase: '',
                    Balance: 0,//用戶當前餘額
                    LoginName: 'john',
                    AutoExchange: false,
                    WagersID: 0,
                    Credit: 5000,
                    PhotoID: 2,
                    BetAreaCredit: [0, 0, 0, 0, 0, 0],
                    BetTotalCredit: 0,
                    Rank: 10,
                    ChipSetID: [0, 1, 2, 3, 4]
                },
                {
                    event: true,
                    UserID: 123,
                    Base: '',
                    DefaultBase: '',
                    Balance: 0,//用戶當前餘額
                    LoginName: 'kenny',
                    AutoExchange: false,
                    WagersID: 0,
                    Credit: 5000,
                    PhotoID: 2,
                    BetAreaCredit: [0, 0, 0, 0, 0, 0],
                    BetTotalCredit: 0,
                    Rank: 10,
                    ChipSetID: [0, 1, 2, 3, 4]
                },
                {
                    event: true,
                    UserID: 123,
                    Base: '',
                    DefaultBase: '',
                    Balance: 0,//用戶當前餘額
                    LoginName: 'simon',
                    AutoExchange: false,
                    WagersID: 0,
                    Credit: 5000,
                    PhotoID: 2,
                    BetAreaCredit: [0, 0, 0, 0, 0, 0],
                    BetTotalCredit: 0,
                    Rank: 10,
                    ChipSetID: [0, 1, 2, 3, 4]
                }
                ]
                this.topUserInfos = topUserInfosData;
                resolve();
            } catch (error) {
                console.error('獲取前三名玩家訊息時出錯:', error);
                reject(error);
            }
        });
    }

    //獲取(sever)回合資料
    public getRoundData(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const onBeginGameData: onBeginGame = {
                    WagersID: 98765432,
                    PathID: Math.floor(Math.random() * 1000),
                    WinNumber: [
                        Math.floor(Math.random() * 6),
                        Math.floor(Math.random() * 6),
                        Math.floor(Math.random() * 6)
                    ],
                    RoadColors: Array.from({ length: 10 }, () => [
                        Math.floor(Math.random() * 6),
                        Math.floor(Math.random() * 6),
                        Math.floor(Math.random() * 6)
                    ]),
                    RoadColorPers: [10, 20, 20, 20, 20, 10],
                    GameState: GameState.Betting
                }
                this.onBeginGame = onBeginGameData;
                this.pathData = this.allPathData[this.onBeginGame.PathID];//該回合路徑資料
                // this.diceEuler = this.diceRotate(this.onBeginGame.PathID, this.onBeginGame.WinNumber);//起始骰子角度
                this.diceEuler = this.diceRotate(this.onBeginGame.WinNumber);//起始骰子角度
                resolve();
            } catch (error) {
                console.error('獲取回合資料時出錯:', error);
                reject(error);
            }
        });
    }


    //獲取(sever)目前下注資料
    public getBetInfo(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const betInfoData: BetInfo = {
                    BetAreaData: [
                        { BetCredit: 0, BetChipIDs: [], UserIDs: [] },
                        { BetCredit: 0, BetChipIDs: [], UserIDs: [] },
                        { BetCredit: 0, BetChipIDs: [], UserIDs: [] },
                        { BetCredit: 0, BetChipIDs: [], UserIDs: [] },
                        { BetCredit: 0, BetChipIDs: [], UserIDs: [] },
                        { BetCredit: 0, BetChipIDs: [], UserIDs: [] }
                    ],
                    OtherUser: 20,
                    Countdown: 12,
                }
                this.betInfo = betInfoData;
                resolve();
            } catch (error) {
                console.error('獲取目前下注資料時出錯:', error);
                reject(error);
            }
        });
    }

    //收到下注資料，傳送給getBetInfo
    public gameUpdata() {

    }

    // public getColorPer() {
    //     let color = [0, 0, 0, 0, 0, 0];
    //     for (let i = 0; i < this.onBeginGameInfo.Road100.length; i++) {
    //         color[this.onBeginGameInfo.Road100[i][0]]++;
    //         color[this.onBeginGameInfo.Road100[i][1]]++;
    //         color[this.onBeginGameInfo.Road100[i][2]]++;
    //     }
    //     for (let i = 0; i < this.colorPer.length; i++) {
    //         this.colorPer[i] = color[i] / 3;//設置顏色百分比
    //     }
    //     return this.colorPer;
    // }

    //模擬後端路徑與開獎三顏色之骰子校正旋轉值(路徑id，勝利的三顏色編號)，回傳3個子物件的旋轉值
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