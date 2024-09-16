export interface BaseSoundFilesDirectory {
    [key: string]: string;
}
export interface SoundFilesDirectory extends BaseSoundFilesDirectory {
    BasicMusic: string;
    FGBakcgroundMusic: string;
    DiceSeats: string;
    ButtonClick: string;
    Roll: string;
    RollStop: string;
    RollDrop: string;
    TileSet: string;
    TileMerge: string;
    TileSetup: string;
    Pong: string;
    Kong: string;
    ReadyHand: string;
    Mahjong: string;
    RollMoney: string;
    Miroll: string;
    Scatter: string;
    FGInto: string;
    FGAdd: string;
    FGGet: string;
    Win: string;
    BigWin: string;
    MegaWin: string;
    SuperWin: string;
    Mjslc: string;
    Huwin: string;
    WinHandsHeavenlyHand: string;
    WinHandsAllHonors: string;
    WinHandsBigFourWinds: string;
    WinHandsEarthlyHand: string;
    WinHandsAllOfOneSuit: string;
    WinHandsBigThreeDragons: string;
    WinHandsAllEightFlowers: string;
    WinHandsMixedOneSuit: string;
    WinHandsAllPongs: string;
    WinHandsFlowerKong: string;
    WinHandsWinningOnKong: string;
    WinHandsExposedKong: string;
    WinHandsFlowerTiles: string;
    WinHandsFlower: string;
    WinHandsHonorTiles: string;
    WinScore: string;
}

export const SoundFiles: SoundFilesDirectory = {
    // MG遊戲背景音
    BasicMusic: 'music/pph_bgm',
    // FG遊戲背景音
    FGBakcgroundMusic: 'music/pph_fgbgm',
    // 抓位
    DiceSeats: 'sound/pph_diceSeats',
    // 按鈕音效 
    ButtonClick: 'sound/pph_click',
    // 滾軸滾動音效
    Roll: 'sound/pph_roll',
    // 滾軸停止音效
    RollStop: 'sound/pph_rollstop',
    // 麻將掉落音效
    RollDrop: 'sound/pph_mjdrop',
    // 牌往上移動到算牌區音效
    TileSet: 'sound/pph_mjset',
    // 算牌區 碰/槓/眼 合牌音效
    TileMerge: 'sound/pph_merge',
    // 算牌區牌到定位音效
    TileSetup: 'sound/pph_mjsetup',
    // 碰牌語音
    Pong: 'sound/pph_pong',
    // 槓牌語音
    Kong: 'sound/pph_kong',
    // 聽牌語音
    ReadyHand: 'sound/ready_hand',
    // 胡牌語音
    Mahjong: 'sound/pph_mahjong',
    // 滾分金幣音效
    RollMoney: 'sound/pph_rollmoney',
    // 瞇牌滾軸音效
    Miroll: 'sound/pph_miroll',
    // FG Symbol出現音效
    Scatter: 'sound/pph_scatter',
    // 進入FG音效
    FGInto: 'sound/pph_intofg',
    // FG增加次數音效
    FGAdd: 'sound/pph_fgadd',
    // 再次獲得免費遊戲音效
    FGGet: 'sound/pph_fgGet',
    // 中獎音效
    Win: 'sound/Win',
    // 中獎音效
    BigWin: 'sound/BigWin',
    // 中獎音效
    MegaWin: 'sound/MegaWin',
    // 中獎音效
    SuperWin: 'sound/SuperWin',
    // 連線中獎音效
    Mjslc: 'sound/pph_mjslc',
    // 顯示胡牌贏得分數音效
    Huwin: 'sound/pph_huwin',
    // 牌型語音: 天胡 ID: 1
    WinHandsHeavenlyHand: 'sound/winningHands/heavenly_hand',
    // 牌型語音: 字一色 ID: 2
    WinHandsAllHonors: 'sound/winningHands/all_honors',
    // 牌型語音: 大四喜 ID: 3
    WinHandsBigFourWinds: 'sound/winningHands/big_four_winds',
    // 牌型語音: 地胡 ID: 4
    WinHandsEarthlyHand: 'sound/winningHands/earthly_hand',
    // 牌型語音: 清一色 ID: 5
    WinHandsAllOfOneSuit: 'sound/winningHands/all_of_one_suit',
    // 牌型語音: 大三元 ID: 6
    WinHandsBigThreeDragons: 'sound/winningHands/big_three_dragons',
    // 牌型語音: 八仙過海 ID: 7
    WinHandsAllEightFlowers: 'sound/winningHands/all_eight_flowers',
    // 牌型語音: 湊一色 ID: 8
    WinHandsMixedOneSuit: 'sound/winningHands/mixed_one_suit',
    // 牌型語音: 碰碰胡 ID: 9
    WinHandsAllPongs: 'sound/winningHands/all_pongs',
    // 牌型語音: 花槓 ID: 10
    WinHandsFlowerKong: 'sound/winningHands/flower_kong',
    // 牌型語音: 槓上開花 ID: 11
    WinHandsWinningOnKong: 'sound/winningHands/winning_on_a_kong',
    // 牌型語音: 槓牌
    WinHandsExposedKong: 'sound/winningHands/exposed_kong',
    // 牌型語音: 補花
    WinHandsFlowerTiles: 'sound/winningHands/flower_tiles',
    // 牌型語音: 花牌
    WinHandsFlower: 'sound/winningHands/flower',
    // 牌型語音: 字牌
    WinHandsHonorTiles: 'sound/winningHands/honor_tiles',
    // 共贏得分數音效
    WinScore: 'sound/pph_winScore',
};