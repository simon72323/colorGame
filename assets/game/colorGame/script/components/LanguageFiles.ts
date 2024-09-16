export interface BaseLanguageFilesDirectory {
    [key: string]: any;
}
export interface LanguageFilesDirectory extends BaseLanguageFilesDirectory {
    StartBet: string;
    StopBet: string;
    YouWin: string;
    Info_1: string;
}

export const LanguageFiles: LanguageFilesDirectory = {
    // 共贏得
    StartBet: 'tx_startBet/spriteFrame',
    // 免費遊戲
    StopBet: 'tx_stopBet/spriteFrame',
    // 剩餘免費次數
    YouWin: 'tx_youWin/spriteFrame',
    // 免費遊戲(小)
    Info_1: 'tx_info_1/spriteFrame',
};