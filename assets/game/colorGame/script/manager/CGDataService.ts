// import { PathInfo, RankInfo } from "../enum/CGInterface";

// export class CGDataService {
//     private static readonly _instance: CGDataService = new CGDataService();

//     public static getInstance(): CGDataService {
//         return CGDataService._instance;
//     }

//     //用戶資料
//     public userID: number;//用戶ID
//     // public avatarID: number;//頭像ID
//     public loginName: string;//登入名稱
//     public credit: number;//餘額
//     public balance: number;//用戶當前餘額

//     //遊戲資料
//     public wagersID: number;//局號
//     public betTotalTime: number; // 單局下注時間
//     // public betCreditList: number[]; // 下注額度列表
//     public roadMap: number[][];//前100局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
//     // public allBets: UserBets[];// 該局有下注的用戶與注額分布與餘額
//     public rankings: RankInfo[];//前三名用戶資料(ID，名稱，頭像，餘額，下注總額分布)，如果ID是本地用戶，不表演籌碼並取消跟注
//     public liveCount: number;// 目前線上人數
//     public pathID: number;
//     public winColor: number[];

//     //下注資料
//     public betTotal: number;//該用戶目前總下注額
//     public userBetAreaCredits: number[];//該用戶各注區目前下注額
//     public totalBetAreaCredits: number[];//目前各注區的下注額(需要中途出現籌碼)

//     //本地端資料
//     public pathData: PathInfo;//該回合路徑資料

//     public touchChipID: number = 1;//點選的籌碼ID
//     public touchChipPosID: number = 1;//點選的籌碼位置ID
//     public betCreditList: number[] = [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];//下注額度列表(固定值)

//     private constructor() {
//         // 初始化数据
//     }

//     public setCredit(credit: number) {
//         this.credit = credit;
//     }

//     public updateRoadMap(newRoad: number[]) {
//         this.roadMap.pop();//刪除最後一個路子
//         this.roadMap.unshift(newRoad);//添加新路子到第一個
//     }

//     public getCredit() {
//         return this.credit;
//     }

//     public getRoadMap() {
//         return this.roadMap;
//     }

//     // public getRankings(): RankInfo[] {
//     //     return this.rankings;
//     // }

//     // public getUserID(): number {
//     //     return this.userID;
//     // }

//     // public getLiveCount(): number {
//     //     return this.liveCount;
//     // }

//     /**
//      * 下注資料初始化
//      */
//     public initBetData(): void {
//         this.betTotal = 0;
//         this.userBetAreaCredits = Array(6).fill(0);
//         this.totalBetAreaCredits = Array(6).fill(0);
//     }





//     /**
//      * 點選的籌碼ID
//      */
//     // private _touchChipID: number = 1;//點選的籌碼ID
//     // public get touchChipID(): number {
//     //     return this._touchChipID;
//     // }
//     // public set touchChipID(value: number) {
//     //     this._touchChipID = value;
//     // }
// }