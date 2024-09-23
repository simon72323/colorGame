
export interface PathInfo {
  pos: number[][];//路徑座標參數[第幾個frame][三顆骰子的座標]
  rotate: number[][];//路徑旋轉參數[第幾個frame][三顆骰子的座標]
  diceNumber: number[];//開獎點數[三顆骰子的點數](0~5)
}

export interface onLogin {
  UserID: number;
  Sid: string;
  HallID: string;
  GameID: string;
  COID: string;
  // Test: string;
  ExchangeRate: string;
  IP: string;
};

//登入資料(本地給遊戲版本跟server要)
export interface onLoadInfo {
  event: boolean;//操作是否成功的標誌
  data: {
    UserID: number;//用戶ID
    // Avatar: number;//頭像ID
    Balance: number, // 玩家擁有金額
    Base: string, // 目前換分比
    DefaultBase: string,  // default 換分比
    BetCreditList: number[], // 下注credit選項
    // DefaultBetCredit: number, // default 下注credit選項
    // UserAutoExchange: UserAutoExchange,
    Currency: string, // 幣別
    LoginName: string, // 玩家暱稱
    AutoExchange: boolean, // 是否自動換分
    Credit: number,  // 玩家目前在遊戲中有多少 credit
    // BetBase: string, // default 下注比例
    // isCash: boolean, // 是否現金支付
    // userSetting: userSetting, // 玩家設定
    // SingleBet: 100,// 未知欄位
  }
}

export enum GameState {
  Ready = "Ready",//準備中
  NewRound = "NewRound",//新局開始
  Betting = "Betting",//遊戲中(下注階段)
  Reward = "Reward"//遊戲結束(派獎階段)
}

//加入遊戲資料(本地給遊戲版本跟server要)
export interface onJoinGame {
  event: boolean;//操作是否成功的標誌
  data: {
    GameState: string;//遊戲目前狀態
    UserID: number;//用戶ID
    RoundSerial: number;//局號
    StartColor: number[];//該局起始顏色
    BetTime: number; // 單局下注時間
    RoadMap: number[][];//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
    RoadMapPer: number[];//前100局開獎百分比[顏色id]
    BetAreaTotal: number[];//目前各注區的下注額(需要中途出現籌碼)
    Rankings: Ranking[];//前三名玩家資料(ID，名稱，頭像，餘額)，如果ID是本地玩家，不表演籌碼並取消跟注
    LiveCount: number;//其他用戶人數
    PathID?: number;//該局表演路徑ID
    WinColor?: number[];//該局勝利3顏色編號
    OtherPayoffs?: Payoff[];//前三名玩家+其他玩家贏分資訊[玩家][注區贏分]
  }
}

//更新資料(server每秒傳送)
export interface onUpdate {
  event: boolean;//操作是否成功的標誌
  data: {
    // 遊戲狀態資訊
    GameState: string;//遊戲目前狀態
    RoundSerial?: number;//局號
    StartColor?: number[];//該局起始顏色
    Countdown?: number;//下注倒數時間(每秒更新)
    // 路紙
    RoadMap?: number[][];//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
    RoadMapPer?: number[];//前100局開獎百分比[顏色id]
    // 排名與下注
    Rankings?: Ranking[];//前三名玩家資料(ID，名稱，頭像，餘額)，如果ID是本地玩家，不表演籌碼並取消跟注
    LiveCount?: number;//其他用戶人數
    BetAreaTotal?: number[];//目前各下注區總額
    NewBets?: number[][];//前三名玩家+其他玩家新增的下注資訊[玩家][下注金額]
    // 派彩
    PathID?: number;//該局表演路徑ID
    WinColor?: number[];//該局勝利3顏色編號
    UserPayoff?: Payoff;//本地玩家贏分
    OtherPayoffs?: Payoff[];//前三名玩家+其他玩家贏分資訊[玩家][注區贏分]
  }
}

export interface Ranking {
  userID: number;//用戶ID
  displayName: string; // 登入名稱
  avatar: number; // 頭像
  credit: number; //換分餘額
}

export interface Payoff {
  winAreas: number[];//勝利注區[0,2,4]
  payoff: number;//贏得額度
}

//下注成功回傳資料
export interface onBetInfo {
  event: boolean; // 操作是否成功的標誌
  error?: string;//錯誤訊息
  data: {
    BetAreaID: number; // 下注區id
    BetCredit: number; // 下注額度
    Credit: number; // 剩餘額度
    BetTotal: number;//用戶目前總下注額
    // UserBets: number[];//用戶目前各注區下注額
    // BetAreaTotal: number[];//目前各下注區總額
  }
}




// export interface onBeginGame {
//   data:{
//     PayTotal: number; // 此局玩家贏了多少 credit
//     Lines: Lines[][]; // 中線相關資料
//     Cards: number[][][]; // 此次中線前所有 symbol 資料，中線後 symbol 消失，再次補牌後 symbol 資料
//     Scatter: Scatter; // 此次中 scatter 資料
//     FreeGame: FreeGame; // 當下中 freegame 資料
//     FreeGameSpin: FreeGameSpin; // freegame 中，每一次 freegame 資料
//     RollerNumber: number; // 輪帶代號
//     BBJackpot: {Pools: null}; // Jackpot 資料
//     WagersID: number; // 局號
//     Credit: number; // 此次特殊遊戲前，玩家 credit
//     Credit_End: number; // 此次特殊遊戲到目前此次slot，玩家 credit
//     Status: number;
//     HitWagersID: number; // 中 freegame 當下局號
//     RedWild: RedWild[][],     // 紅wild資料
//     GreenWild: GreenWild[][],   // 綠wild資料
//     Accumulate: number[][],  // 該局中線累積金額
//   },
//   event: boolean;
// }

// export interface onOnLoadInfo {
//     data: {
//       event: boolean,
//       Balance: number, // 玩家擁有金額
//       Base: string, // 目前換分比
//       DefaultBase: string,  // default 換分比
//       BetCreditList: number[], // 下注credit選項
//       DefaultBetCredit: number, // default 下注credit選項
//       Rates:{[key: string]: number[]}, // symbol 賠率表(顯示在symbol hint)
//       UserAutoExchange: UserAutoExchange,
//       Currency: string, // 幣別
//       LoginName: "Player", // 玩家暱稱
//       AutoExchange: boolean, // 是否自動換分
//       Credit: number,  // 玩家目前在遊戲中有多少 credit
//       BetBase: string, // default 下注比例
//       isCash: boolean, // 是否現金支付
//       userSetting: userSetting, // 玩家設定
//       SingleBet: 100,// 未知欄位
//     },
//     tokenId: '/3',
// }

// export interface onCreditExchange {
//   data : {
//     Balance: number, // 玩家還有多少錢
//     BetBase: string, // 換分比
//     Credit: number, // 玩家換了多少分
//     event: boolean;
//   },
//   event: boolean;
// }

// export interface Lines {
//   DoubleTime: number; // 倍數 X1, X2, X3, X5
//   Element: number[]; // 此次中線，每一個 slot 中線的 symbol 是什麼
//   ElementID: number; //  此次中線，每一個 slot 中線的 symbol 是哪一個
//   GridNum: number; // 此次中線是中了幾個格子
//   Grids: number[]; // 中線是中哪個格子的 symbol
//   Payoff: number; // 此次中線玩家得到多少 credit
// }

// export interface RoadMapData {
//   roadMap: number[][];//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
//   roadMapPer: number[];//前100局開獎百分比[顏色id]
// }

// export interface FreeGame {
//   FreeGamePayoffTotal: number; // 中 free game 當下，總共贏得多少 credit
//   FreeGameTime: number; // 中 freegame 當下，此次 freegame 給多少次免費 spin
//   HitFree: boolean;  // 當下此次 slot 是否中 free game
//   ID: number; // free game symbol 代號
// }

// export interface RedWild {
//   ID: number, // 紅色WILD ID
//   GridsNum: number, // 總共有幾個紅色WILD
//   Grids: number[], // 紅色WILD要吃掉的位置
//   MainGrid: number, // 紅色WILD 初始位置
// }

// export interface GreenWild {
//   ID: number, // 綠色WILD ID
//   GridsNum: number, // 總共有幾個綠色WILD
//   Grids: number[], // 綠色WILD位置
// }

// export interface FreeGameSpin {
//   FreeGameTime: number; // 此局還剩下 freespin 次數
//   FreeGamePayoffTotal: number; // 此次 freegame 拉到目前此數總共贏得多少 credit(累積)
//   WagersID: number; // freegame 局號
// }

// interface UserAutoExchange {
//   'IsAuto': boolean,  // 玩家是否自動換分
//   'Credit': number,   // 自動換分要換多少
//   'BetBase': string,  // 自動換分比例 2:1(代表2元換1分) , 1:2(1元換2分)
//   'Record': [] // 換分紀錄
// }

// interface userSetting {
//   autoCredit: number, // 自動開洗多少分
//   auto: boolean, // 自動開洗分
//   info: {},
//   rate: "1:1" // 自動開洗分比例
// }