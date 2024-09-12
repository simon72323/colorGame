export const GameSetData = {
    Limit: 30000,
    BetTime: 12,
    ChipRange: [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],
}

export const PlayerInfoData = {
    Rank: 1, // 目前排名
    LoginName: "PlayerName",
    PhotoID: 0,
    Credit: 0, // 玩家目前Credit
    BetData: Array(6).fill([]), // 該回合下注資料
    BetCredit: Array(6).fill(0), // 各注區下注Credit
    BetTotalCredit: 0, // 下注總Credit
    WinCredit: 0, // 該回合贏得Credit
    ChipSetID: [0, 1, 2, 3, 4], // 玩家下注的籌碼ID
}
