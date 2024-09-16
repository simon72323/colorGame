//本地玩家下注傳送
export interface BeginGame {
    // UserID: number | string;//下注者(對應籌碼id)
    betAreaID: number;//下注區id
    betCredit: number;//下注額度
    // BetChipID: number;//該注區下注籌碼id
}