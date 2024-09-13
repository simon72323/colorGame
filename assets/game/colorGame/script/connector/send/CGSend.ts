//傳送下注資料
export interface UserBetInfo {
    UserID: number | string;//下注者(對應籌碼id)
    BetAreaID: number;//下注區id
    BetCredit: number;//下注額度
    BetChipID: number;//該注區下注籌碼id

}