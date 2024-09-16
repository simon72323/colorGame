export interface onLogin {
    Sid: string;
    UserID: number | string;
    HallID: string;
    GameID: string;
    COID: string;
    // ExchangeRate: string;
    // Test: string;
    IP: string;
};

//獲取遊戲資料
export interface onLoadInfo {
    event: boolean;//操作是否成功的標誌
    UserID: number | string;//用戶ID
    Avatar: number;//頭像ID
    Base: string;
    DefaultBase: string;
    Balance: number;//用戶當前餘額
    LoginName: string;//登入名稱
    AutoExchange: boolean;//自動兌換
    Credit: number;//換分餘額
    // WagersID: number;//注單
    // RoundSerial: number;//局號
    BetAreaCredit: number[];//該用戶各注區的下注Credit
    BetTotalCredit: number;//目前總下注Credit
    // OtherUserBetAreaCredit: UserBetCredit[];//其他玩家累積下注資料[前三名玩家+其他玩家]
    Limit: number; // 遊戲限額
    BetTime: number; // 單局下注時間
    ChipRange: number[]; // 籌碼分數範圍
    GameState: GameState;//遊戲目前狀態，0=等待中，1=新局開始下注，2=開獎中
    // Rank: RankInfo[];//前三名玩家資料(名稱，頭像，餘額)
    // OtherUserCount: number;//目前其他玩家人數
    // RoadColors: number[][];//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
    // RoadColorPers: number[];//前100局開獎百分比[顏色id]
    userSetting?: any;//玩家配置
    // ExchangeRate: number;//兌換率
    // HallID: number;
}



export interface RankInfo {
    LoginName: string; // 登入名稱
    Avatar: number; // 頭像
    Credit: number; //換分餘額
}

export enum GameState {
    Waitting = "Waiting",//等待階段
    BeginGame = "BeginGame",//遊戲中(下注階段)
    EndedGame = "EndedGame"//遊戲結束(派獎階段)
}

//回合資料開始
export interface RoundInfo {
    // action: 'beginGame'
    // GameState: GameState;//遊戲目前狀態新
    RoundSerial: number;//局號
    Rank: RankInfo[];//前三名玩家資料(名稱，頭像，餘額)
    OtherUserCount: number;//目前其他玩家人數
    RoadColors: number[][];//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
    RoadColorPers: number[];//前100局開獎百分比[顏色id]
}

//下注成功回傳資料
export interface onBeginGameInfo {
    BetAreaID: number;//下注區id
    BetCredit: number;//下注額度
    CreditEnd: number;//剩餘額度
}
// export interface BeginGame {
// action: 'beginGame'
// WagersID: number;//注單
// RoundSerial: number;//局號
// RoadColors: number[][];//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
// RoadColorPers: number[];//前100局開獎百分比[顏色id]
//     GameState: GameState;//遊戲目前狀態，0=等待中，1=新局開始下注，2=開獎中
// }


//下注階段伺服器每秒傳送資料
export interface BetInfo {
    GameState: GameState;//遊戲目前狀態
    Countdown: number;//下注倒數時間(每秒更新)
    BetAreaCredit: number[];//各注區目前下注總分
    OtherUserBetAreaCredit: UserBetCredit[];//其他玩家累積下注資料與餘額[前三名玩家+其他玩家]
    OtherUserCount: number;//目前其他玩家人數
}
export interface UserBetCredit {
    // BetUser:number;//下注者排名
    BetAreaCredit: number[];//各注區目前下注總分
    Credit?: number;//換分餘額
}

//開獎資料
export interface RewardInfo {
    WagersID?: number;//注單
    PathID: number;//該局表演路徑ID
    WinNumber: number[];//該局勝利3顏色編號
    UserWinCredit: WinBetCredit;
    OtherUserWinCredit: WinBetCredit[];//其他玩家勝利注區得分
}

export interface WinBetCredit {
    WinBetArea: number[];//勝利注區[0,2,4]
    WinCredit: number;//贏得分數
}

// export interface GameSetInfo {
//     Limit: number; // 限額
//     BetTime: number; // 單局下注時間
//     ChipRange: number[]; // 籌碼分數範圍
// }