import { _decorator, Component, resources, JsonAsset, Vec3 } from 'cc';
import { PathInfo, GameSet, PlayerInfo, RoundInfo, BetInfo, RewardInfo } from './enum/CGInterface';
const { ccclass, property } = _decorator;

//模擬後端給的資料
@ccclass('CGData')
export class CGData extends Component {
    // private numberShow = [0, 0, 0, 0, 0, 0];//開獎點數

    //跟後端要的資料
    public gameSet: GameSet;//遊戲配置資料
    public topPlayerData: PlayerInfo[] = [];//前三名玩家資料
    public localPlayerData: PlayerInfo;//本地玩家資料
    public roundData: RoundInfo;//回合資料
    // public roadData: RoadData = null;//遊戲紀錄資料
    public betInfo: BetInfo;//下注資訊


    //本地端資料
    public allPathData: PathInfo[] = [];//所有路徑資料
    public selectChipID: number = 1;//紀錄目前選擇的籌碼()
    public pathData: PathInfo = null;//該回合路徑資料
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

    //獲取遊戲資料(跟sever要)
    public getGameData(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.gameSet.Limit = 30000;//限額
            this.gameSet.BetTime = 12;//單局下注時間
            this.gameSet.ChipRange = [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
            resolve();
        })
    }

    //獲取玩家配置資料(跟sever要)
    public getLocalPlayerData(): Promise<void> {
        return new Promise<void>((resolve) => {
            //本地玩家
            this.localPlayerData.Rank = 10;
            this.localPlayerData.LoginName = 'simon';
            this.localPlayerData.PhotoID = 2;
            this.localPlayerData.Credit = 5000;
            this.localPlayerData.BetData = [];
            this.localPlayerData.BetCredit = [0, 0, 0, 0, 0, 0];
            this.localPlayerData.BetTotalCredit = 0;
            this.localPlayerData.WinCredit = 0;
            this.localPlayerData.ChipSetID = [0, 1, 2, 3, 4];
            resolve();
        })
    }

    //獲取前三名玩家配置資料(跟sever要)
    public getTopPlayerData(): Promise<void> {
        return new Promise<void>((resolve) => {
            //玩家1
            this.topPlayerData[0].Rank = 1;
            this.topPlayerData[0].LoginName = 'john';
            this.topPlayerData[0].PhotoID = 2;
            this.topPlayerData[0].Credit = 500000;
            this.topPlayerData[0].BetData = [];
            this.topPlayerData[0].BetCredit = [0, 0, 0, 0, 0, 0];
            this.topPlayerData[0].BetTotalCredit = 0;
            this.topPlayerData[0].WinCredit = 0;
            this.topPlayerData[0].ChipSetID = [0, 1, 2, 3, 4];
            //玩家2
            this.topPlayerData[0].Rank = 2;
            this.topPlayerData[0].LoginName = 'kenny';
            this.topPlayerData[0].PhotoID = 1;
            this.topPlayerData[0].Credit = 500000;
            this.topPlayerData[0].BetData = [];
            this.topPlayerData[0].BetCredit = [0, 0, 0, 0, 0, 0];
            this.topPlayerData[0].BetTotalCredit = 0;
            this.topPlayerData[0].WinCredit = 0;
            this.topPlayerData[0].ChipSetID = [0, 1, 2, 3, 4];
            //玩家3
            this.topPlayerData[0].Rank = 3;
            this.topPlayerData[0].LoginName = 'simon';
            this.topPlayerData[0].PhotoID = 3;
            this.topPlayerData[0].Credit = 500000;
            this.topPlayerData[0].BetData = [];
            this.topPlayerData[0].BetCredit = [0, 0, 0, 0, 0, 0];
            this.topPlayerData[0].BetTotalCredit = 0;
            this.topPlayerData[0].WinCredit = 0;
            this.topPlayerData[0].ChipSetID = [0, 1, 2, 3, 4];
            resolve();
        })
    }

    //獲取回合資料(跟sever要)
    public getRoundData(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.roundData.WagersID = 98765432;//局號
            this.roundData.PathID = Math.floor(Math.random() * 1000);//表演路徑ID
            this.roundData.WinNumber = [
                Math.floor(Math.random() * 6),
                Math.floor(Math.random() * 6),
                Math.floor(Math.random() * 6),
            ];
            this.roundData.Road100 = Array.from({ length: 100 }, () => [
                Math.floor(Math.random() * 6),
                Math.floor(Math.random() * 6),
                Math.floor(Math.random() * 6),
            ]);
            // this.roundData.GameState = 0;
            this.pathData = this.allPathData[this.roundData.PathID];//該回合路徑資料
            this.diceEuler = this.diceRotate(this.roundData.PathID, this.roundData.WinNumber);//起始骰子角度
            resolve();
        })
    }


    //獲取目前下注資料(跟sever要)
    public getBetInfo(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.betInfo.BetAreaTotal = [0, 0, 0, 0, 0, 0];//目前各下注區的總金額
            this.betInfo.OtherPlayer = 20;
            this.betInfo.Timer = 12;
            resolve();
        })
    }

    //持續接收遊戲狀態並派發
    public gameUpdata() {

    }

    public getColorPer() {
        let color = [0, 0, 0, 0, 0, 0];
        for (let i = 0; i < this.roundData.Road100.length; i++) {
            color[this.roundData.Road100[i][0]]++;
            color[this.roundData.Road100[i][1]]++;
            color[this.roundData.Road100[i][2]]++;
        }
        for (let i = 0; i < this.colorPer.length; i++) {
            this.colorPer[i] = color[i] / 3;//設置顏色百分比
        }
        return this.colorPer;
    }

    //模擬後端路徑與開獎三顏色之骰子校正旋轉值(路徑id，勝利的三顏色編號)，回傳3個子物件的旋轉值
    private diceRotate(id: number, winNumber: number[]) {
        // console.log('表演的路徑id', id);
        // console.log('表演的路徑id結果編號', this.pathData[id].diceNumber);
        // console.log('希望的結果編號', winNumber);
        const pathEndColor = this.allPathData[id].DiceNumber
        const changeEuler = [
            [new Vec3(0, 0, 0), new Vec3(-90, 0, 0), new Vec3(0, 0, 90), new Vec3(0, 0, -90), new Vec3(90, 0, 0), new Vec3(180, 0, 0)],
            [new Vec3(90, 0, 0), new Vec3(0, 0, 0), new Vec3(0, -90, 0), new Vec3(0, 90, 0), new Vec3(0, 180, 0), new Vec3(-90, 0, 0)],
            [new Vec3(0, 0, -90), new Vec3(0, 90, 0), new Vec3(0, 0, 0), new Vec3(0, 180, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 90)],
            [new Vec3(0, 0, 90), new Vec3(0, -90, 0), new Vec3(0, 180, 0), new Vec3(0, 0, 0), new Vec3(0, 90, 0), new Vec3(0, 0, -90)],
            [new Vec3(-90, 0, 0), new Vec3(0, 180, 0), new Vec3(0, 90, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 0), new Vec3(90, 0, 0)],
            [new Vec3(180, 0, 0), new Vec3(90, 0, 0), new Vec3(0, 0, -90), new Vec3(0, 0, 90), new Vec3(-90, 0, 0), new Vec3(0, 0, 0)]
        ]
        return [
            changeEuler[pathEndColor[0]][winNumber[0]],
            changeEuler[pathEndColor[1]][winNumber[1]],
            changeEuler[pathEndColor[2]][winNumber[2]]
        ]
    }
}