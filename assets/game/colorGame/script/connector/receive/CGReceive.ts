export interface onLogin {
    sid: string;
    userID: number | string;
    hallID: string;
    gameID: string;
    coID: string;
    // exchangeRate: string;
    // test: string;
    ip: string;
};

//獲取遊戲資料
export interface onLoadInfo {
    event: boolean;//操作是否成功的標誌
    userID: number | string;//用戶ID
    avatar: number;//頭像ID
    base: string;
    defaultBase: string;
    balance: number;//用戶當前餘額
    loginName: string;//登入名稱
    autoExchange: boolean;//自動兌換
    credit: number;//換分餘額
    // wagersID: number;//注單
    // roundSerial: number;//局號
    betAreaCredit: number[];//該用戶各注區目前下注Credit
    betTotalCredit: number;//該用戶目前總下注Credit
    limit: number; // 遊戲限額
    betTime: number; // 單局下注時間
    chipRange: number[]; // 籌碼分數範圍
    gameState: GameState;//遊戲目前狀態，等待中，新局開始下注，開獎中
    userSetting?: any;//玩家配置
    // exchangeRate: number;//兌換率
    // hallID: number;
}

export enum GameState {
    Waiting = "Waiting",//等待階段
    Betting = "Betting",//遊戲中(下注階段)
    Rewarding = "Rewarding"//遊戲結束(派獎階段)
}

//回合資料開始
export interface RoundInfo {
    roundSerial: number;//局號
    roadColors: number[][];//前10局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
    roadColorPers: number[];//前100局開獎百分比[顏色id]
}

//下注成功回傳資料
export interface onBeginGameInfo {
    isSuccess: boolean; // 操作是否成功的標誌
    betAreaID: number; // 下注區id
    betCredit: number; // 下注額度
    remainingCredit: number; // 剩餘額度
}

//下注資訊，伺服器每秒傳送
export interface BetInfo {
    countdown: number;//下注倒數時間(每秒更新)
    rank: RankInfo[];//前三名玩家資料(ID，名稱，頭像，餘額)，如果ID是本地玩家，不表演籌碼並取消跟注
    betAreaTotalCredit: number[];//各注區目前下注總分
    otherUserBetAreaCredit: number[][];//前三名玩家+其他玩家新增的下注資訊[玩家][下注金額]
    otherUserCount: number;//目前其他玩家人數
    // UserBetCredit:number[];//本地玩家各注區分數資料
}
export interface RankInfo {
    userID: number | string;//用戶ID
    loginName: string; // 登入名稱
    avatar: number; // 頭像
    credit: number; //換分餘額
}

//開獎資料
export interface RewardInfo {
    roundSerial: number;//局號
    wagersID?: number;//該玩家注單
    pathID: number;//該局表演路徑ID
    winNumber: number[];//該局勝利3顏色編號
    userWinCredit: WinBetCredit;//本地玩家贏分
    otherUserWinCredit: WinBetCredit[];//前三名玩家+其他玩家贏分資訊[玩家][注區贏分]
}

export interface WinBetCredit {
    winBetArea: number[];//勝利注區[0,2,4]
    winCredit: number;//贏得分數
}
