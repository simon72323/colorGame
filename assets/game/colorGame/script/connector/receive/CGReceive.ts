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

//登入資料
export interface onLoadInfo {
    event: boolean;//操作是否成功的標誌
    GameState: GameState;//遊戲目前狀態，等待中，新局開始下注，開獎中
    UserID: number;//用戶ID
    Avatar: number;//頭像ID
    // Base: string;
    // DefaultBase: string;
    Balance: number;//用戶當前餘額
    LoginName: string;//登入名稱
    // HallID: number;
    Credit: number;//換分餘額
    // WagersID: number;//注單
    // RoundSerial: number;//局號
    AutoExchange?: boolean;//自動兌換
    UserSetting?: any;//玩家配置
    // ExchangeRate: number;//兌換率
}

export enum GameState {
    GameReady = "gameReady",//準備中
    GameNewRound = "gameNewRound",//新局開始
    GameBetting = "gameBetting",//遊戲中(下注階段)
    GameReward = "gameReward"//遊戲結束(派獎階段)
}

//加入遊戲資料
export interface onJoinGame {
    event: boolean;//操作是否成功的標誌
    GameType: number;//遊戲編號
    GameState: GameState;//遊戲目前狀態
    UserID: number;//用戶ID
    RoundSerial: number;//局號
    Limit: number; // 遊戲限額
    BetTime: number; // 單局下注時間
    ChipRange: number[]; // 籌碼額度範圍
    RoadMap: number[][];//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
    RoadMapPer: number[];//前100局開獎百分比[顏色id]
    UserTotalBet: number;//該用戶目前總下注額
    UserBets: number[];//該用戶各注區目前下注額(需要中途出現籌碼)
    TotalBets: number[];//目前各注區的下注額(需要中途出現籌碼)
    Rankings: RankingInfo[];//前三名玩家資料(ID，名稱，頭像，餘額)，如果ID是本地玩家，不表演籌碼並取消跟注

    WagersID?: number;//該玩家注單
    PathID?: number;//該局表演路徑ID
    WinColor?: number[];//該局勝利3顏色編號
    UserPayoff?: PayoffInfo;//本地玩家贏分
    OtherPayoffs?: PayoffInfo[];//前三名玩家+其他玩家贏分資訊[玩家][注區贏分]
}

//更新資料(每秒傳送)
export interface UpdateData {
    // 遊戲狀態資訊
    GameState: GameState;//遊戲目前狀態
    RoundSerial?: number;//局號
    Countdown?: number;//下注倒數時間(每秒更新)
    UserCount?: number;//用戶人數
    // 路紙
    RoadMap?: number[][];//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
    RoadMapPer?: number[];//前100局開獎百分比[顏色id]

    // 排名與下注
    Rankings?: RankingInfo[];//前三名玩家資料(ID，名稱，頭像，餘額)，如果ID是本地玩家，不表演籌碼並取消跟注
    TotalBets?: number[];//目前各下注區總額
    NewBets?: number[][];//前三名玩家+其他玩家新增的下注資訊[玩家][下注金額]

    // 派彩
    WagersID?: number;//該玩家注單
    PathID?: number;//該局表演路徑ID
    WinColor?: number[];//該局勝利3顏色編號
    UserPayoff?: PayoffInfo;//本地玩家贏分
    OtherPayoffs?: PayoffInfo[];//前三名玩家+其他玩家贏分資訊[玩家][注區贏分]
}

export interface RankingInfo {
    userID: number;//用戶ID
    displayName: string; // 登入名稱
    avatar: number; // 頭像
    credit: number; //換分餘額
}

export interface PayoffInfo {
    winAreas: number[];//勝利注區[0,2,4]
    payoff: number;//贏得額度
}

//下注成功回傳資料
export interface BeginGameData {
    isSuccess: boolean; // 操作是否成功的標誌
    BetAreaID: number; // 下注區id
    BetCredit: number; // 下注額度
    Credit: number; // 剩餘額度
    UserTotalBet: number;//用戶目前總下注額
    UserBets: number[];//用戶目前各注區下注額
    TotalBets: number[];//目前各下注區總額
}


