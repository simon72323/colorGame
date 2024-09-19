//單一路徑資料(本機)
// export interface PathInfo {
//     Pos: number[][];//座標參數[第幾個frame][三顆骰子的座標]
//     Rotate: number[][];//旋轉參數[第幾個frame][三顆骰子的座標]
//     DiceNumber: number[];//開獎點數[三顆骰子的點數]
// }

//遊戲資料，進入時跟server索取一次
// export interface GameSet {
//     Limit: number; // 限額
//     BetTime: number; // 單局下注時間
//     ChipRange: number[]; // 籌碼分數範圍
// }

//籌碼設置，進入時跟server索取一次，更新時傳送更新值給server
// export interface ChipSet {
//     ChipSetID: number[];//該玩家設置的籌碼ID
// }

// //如果該玩家下注，server就會更新該玩家資料給所有人
// export interface PlayerInfo {
//     Rank: number;//排名(每回合刷新)
//     UserID: number | string;
//     PhotoID: number;//頭像ID
//     Credit: number;//玩家目前Credit
//     BetTotalCredit: number;//目前下注總Credit
//     ChipSetID: number[];//玩家設置的籌碼ID
// }

// export function createDefaultPlayerInfo(): PlayerInfo {
//     return {
//         Rank: 0,
//         UserID: '',
//         PhotoID: 1,
//         Credit: 0,
//         BetTotalCredit: 0,
//         ChipSetID: [1, 5, 10]
//     };
// }

// export enum GameState {
//     Betting = 0,//下注階段
//     Drawing = 1//派獎階段
// }

// //遊戲新局資料(跟server取)(每回一次)
// export interface RoundInfo {
//     WagersID: number;//局號
//     PathID: number;//該局表演路徑ID
//     WinNumber: number[];//該局勝利3顏色編號
//     RoadColors: number[][];//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
//     RoadColorPers: number[];//前100局開獎百分比[顏色id]
//     GameState: GameState;//遊戲目前狀態，0=新局，開始下注，1=開獎中(狀態切換時發送)
// }

//有人下注server就會傳送給玩家
//登入時進入如果是下注階段也會跟server索取
// export interface BetInfo {
//     Countdown: number;//下注倒數時間(每秒更新)
//     BetAreaDatas: BetAreaInfo[];//每個下注區目前資料
//     OtherPlayer: number;//目前其他玩家人數
// }
// export interface BetAreaInfo {
//     BetCredit: number;//該注區下注分數
//     BetChipIDs: number[];//該注區下注籌碼id
//     PlayerIDs: string[];//下注者(對應籌碼id)
// }


//傳送給server的下注資料(有下注就傳給server)
export interface PlayerBetInfo {
    BetAreaID: number;//下注區id
    BetCredit: number;//下注額度
    BetChipID: number;//該注區下注籌碼id
    PlayerID: string;//下注者(對應籌碼id)
}

//開獎資料(跟server取)(開講取一次)
// export interface RewardInfo {
//     PlayerIDs: string[];//贏家ID列表
//     WinCredits: number[];//對應贏家贏得的Credit
//     //每個玩家的輸贏分數
// }