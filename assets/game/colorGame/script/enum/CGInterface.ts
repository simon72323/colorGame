//單一路徑資料
export interface PathInfo {
    Pos: number[][];//座標參數[第幾個frame][三顆骰子的座標]
    Rotate: number[][];//旋轉參數[第幾個frame][三顆骰子的座標]
    DiceNumber: number[];//開獎點數[三顆骰子的點數]
}

//遊戲配置資料
export interface GameSet {
    Limit: number; // 限額
    BetTime: number; // 單局下注時間
    ChipRange: number[]; // 籌碼分數範圍
}

//玩家資料(如果本地玩家是其中一位，就不顯示跟注)
export interface PlayerInfo {
    Rank: number;//目前排名
    LoginName: string;
    PhotoID: number;
    Credit: number;//玩家目前Credit
    BetData: number[][];//該回合下注資料
    BetCredit: number[];//各注區下注Credit
    BetTotalCredit: number;//下注總Credit
    WinCredit: number;//該回合贏得Credit
    ChipSetID: number[];//玩家下注的籌碼ID
}

//遊戲回合資料(新局開始-跟後端索取)
export interface RoundInfo {
    WagersID: number;//局號
    PathID: number;//該局表演路徑ID
    WinNumber: number[];//勝利3顏色編號
    Road100: number[][];//前100局開獎紀錄
    // GameState: number;//遊戲目前狀態，0=新局，開始下注，1=開獎中(狀態切換時發送)
}

//下注資訊
export interface BetInfo {
    Timer: number;//剩餘下注時間
    BetAreaTotal: number[];//目前各下注區的總金額
    OtherPlayer: number;//其他玩家人數
}

//開獎資料
export interface RewardInfo {
    // PathID: number;//該局表演路徑ID
    // WinNumber: number[];//勝利3顏色編號
    // GameState: number;//遊戲目前狀態，0=新局，開始下注，1=開獎中(狀態切換時發送)
    //每個玩家的輸贏分數
}