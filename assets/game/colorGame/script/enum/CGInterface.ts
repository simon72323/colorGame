
export interface PathInfo {
  pos: number[][];//路徑座標參數[第幾個frame][三顆骰子的座標]
  rotate: number[][];//路徑旋轉參數[第幾個frame][三顆骰子的座標]
  diceNumber: number[];//開獎點數[三顆骰子的點數](0~5)
}

export interface onLogin {
  userID: number;
  sid: string;
  hallID: string;
  gameID: string;
  coID: string;
  // test: string;
  exchangeRate: string;
  ip: string;
};

//登入資料(本地給遊戲版本跟server要)
export interface onLoadInfo {
  event: boolean;//操作是否成功的標誌
  gameType: string;
  data: {
    userID: number;//用戶ID
    balance: number, // 玩家擁有金額
    base: string, // 目前換分比
    defaultBase: string,  // default 換分比
    // defaultBetCredit: number, // default 下注credit選項
    // userAutoExchange: UserAutoExchange,
    currency: string, // 幣別
    loginName: string, // 玩家暱稱
    autoExchange: boolean, // 是否自動換分
    credit: number,  // 玩家目前在遊戲中有多少 credit
    // betBase: string, // default 下注比例
    // isCash: boolean, // 是否現金支付
    // userSetting: userSetting, // 玩家設定
    // singleBet: 100,// 未知欄位
  }
}

export enum GameState {
  NewRound = "NewRound",//新局開始
  Betting = "Betting",//遊戲中(下注階段)
  Reward = "Reward"//遊戲結束(派獎階段)
}

//加入遊戲資料(本地給遊戲版本跟server要)
export interface onJoinGame {
  action: string;//動作
  event: boolean;//操作是否成功的標誌
  gameType: string;
  data: {
    gameState: string;//遊戲目前狀態
    avatarID: number;//頭像ID
    roundSerial: number;//局號
    betCreditList: number[], // 下注credit選項
    startColor: number[];//該局起始顏色
    countdown: number;//剩餘下注時間
    betTotalTime: number; // 單局下注時間
    roadMap: number[][];//前100局開獎顏色紀錄(顯示下注紀錄顏色)[局數][顏色]
    allBets: UserBets[];//該局有下注的用戶與注額分布與餘額
    rankings: RankInfo[];//前三名玩家資料(ID，名稱，頭像，餘額)，如果ID是本地玩家，不表演籌碼並取消跟注
    liveCount: number;//其他用戶人數
    pathID: number;//該局表演路徑ID
    winColor: number[];//該局勝利3顏色編號
    winners: UserPayoff[];//該局有派彩的用戶
  }
}

//更新資料(server每秒傳送)
export interface onUpdate {
  action: string;
  event: boolean;//操作是否成功的標誌
  gameType: string;
  data: {
    // 遊戲狀態資訊
    gameState: string;//遊戲目前狀態
    roundSerial?: number;//局號
    startColor?: number[];//該局起始顏色
    countdown?: number;//下注倒數時間(每秒更新)
    totalBets?: number[];
    allBets?: UserBets[];//該局有下注的用戶與注額分布與餘額
    newBets?: number[][];//排名玩家新增的下注
    // 派彩
    pathID?: number;//該局表演路徑ID
    winColor?: number[];//該局勝利3顏色編號
    winners?: UserPayoff[];//該局有派彩的用戶
    // 排名
    rankings?: RankInfo[];//前三名玩家資料(ID，名稱，頭像，餘額)，如果ID是本地玩家，不表演籌碼並取消跟注
    liveCount?: number;//其他用戶人數
  }
}

//用戶新增下注額
export interface UserBets {
  userID: number;//用戶ID
  betCredits: number[];//各注區新增下注額
  credit: number; // 用戶剩餘額度
}



export interface RankInfo {
  userID: number;//用戶ID
  displayName: string; // 登入名稱
  avatarID: number; // 頭像
  betCredits:number[];//下注資料
  credit: number; //換分餘額
}

export interface UserPayoff {
  userID: number;//用戶ID
  payoff: number;//贏得額度
}

//下注成功回傳資料s
export interface onBetInfo {
  event: boolean; // 操作是否成功的標誌
  error?: string;//錯誤訊息
  data: {
    betCredits: number[]; // 各注區新增的注額
    credit: number; // 用戶剩餘額度
    // betTotal: number;//用戶目前總下注額
    // userBetAreaCredit: number[];//用戶目前各注區下注額
    // totalBetAreaCredit: number[];//目前各下注區總額
  }
}