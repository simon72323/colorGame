export interface onLogin {
    UserID: number | string;
    Sid: string;
    GameID: string;
    IP: string;
    HallID: string;
    COID: string;
    // ExchangeRate: string;
    // Test: string;
};

export interface onLoadInfo {
    event: boolean;//操作是否成功的標誌
    UserID: number | string;//用戶ID
    Base: string;
    DefaultBase: string;
    Balance: number;//用戶當前餘額
    LoginName: string;//登入名稱
    AutoExchange: boolean;//自動兌換
    Credit: number;
    WagersID: number;//注單
    roundSerial:number;//局號
    PhotoID: number;//頭像ID
    BetAreaCredit: number[];//該用戶各注區的下注分數
    BetTotalCredit: number;//目前總下注Credit
    Rank: string[];//前三名玩家資料
    // ChipSetID: number[];//玩家針對此遊戲設置的籌碼ID
    userSetting?: any;//玩家配置
    // ExchangeRate: number;//兌換率
    // HallID: number;
}

export enum GameState {
    Waitting = 0,//等待階段
    Betting = 1,//下注階段
    Drawing = 2//派獎階段
}
export interface onBeginGame {
    WagersID: number;//注單
    roundSerial:number;//局號
    PathID: number;//該局表演路徑ID
    WinNumber: number[];//該局勝利3顏色編號
    RoadColors: number[][];//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
    RoadColorPers: number[];//前100局開獎百分比[顏色id]
    GameState: GameState;//遊戲目前狀態，0=等待中，1=新局開始下注，2=開獎中
}

//下注過程資訊
export interface BetInfo {
    Countdown: number;//下注倒數時間(每秒更新)
    BetAreaCredit: number[];//各注區目前下注分數
    OtherUser: number;//目前其他玩家人數
}
// export interface BetAreaInfo {
    // BetCredit: number;//該注區下注分數
    // BetChipIDs: number[];//該注區下注籌碼id
    // UserIDs: number[] | string[];//下注者(對應籌碼id)
// }

//開獎資料
export interface RewardInfo {
    UserIDs: number[] | string[];//贏家ID列表
    WinCredits: number[];//對應贏家贏得的Credit
}

export interface GameSetInfo {
    Limit: number; // 限額
    BetTime: number; // 單局下注時間
    ChipRange: number[]; // 籌碼分數範圍
}