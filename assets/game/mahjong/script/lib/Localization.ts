import { Dict, log } from "../include";
export enum LocalizedStrKeys {
    SYSTEM_MESSAGE = "SYSTEM_MESSAGE",
    DISCONNECT = "DISCONNECT",
    RECONNECT = "RECONNECT",
    SCORE_EXCHANGE = "SCORE_EXCHANGE",
    CREDIT = "CREDIT",
    GAME_RULE = "GAME_RULE",
    GAME_EXCHANGE = "GAME_EXCHANGE",
    GAME_HISTORY = "GAME_HISTORY",
    GAME_HELP = "GAME_HELP",
    SETTING = "SETTING",
    AUTO_START = "AUTO_START",
    BET_OPTION = "BET_OPTION",
    GAME_CURRENT_SCORE = "GAME_CURRENT_SCORE",
    NOT_ENOUGH_AUTO_EXCHANGE = "NOT_ENOUGH_AUTO_EXCHANGE",
    EXCHANGE_SCORE_NOT_EMPTY = "EXCHANGE_SCORE_NOT_EMPTY",
    NOT_ENOUGH_AUTO_EXCHANGE_TOOLTIP = "NOT_ENOUGH_AUTO_EXCHANGE_TOOLTIP",
    START_GAME = "START_GAME",
    CONFIRM_LEAVE = "CONFIRM_LEAVE",
    EXITBTN = "EXITBTN",
    CONTINUE = "CONTINUE",
    NOT_ENOUGH_CREDIT = "NOT_ENOUGH_CREDIT_2023",
    OPEN_FASTWHEEL_ALERT = "OPEN_FASTWHEEL_ALERT",
    EXCHANGE_FILLED = "EXCHANGE_FILLED"
}

export enum DefaultLocalizedStrings {
    SYSTEM_MESSAGE = "SYSTEM MESSAGE",
    DISCONNECT = "Network disconnected! Please restart the game or check the connect status! (55650058)",
    RECONNECT = "Reconnect",
    SCORE_EXCHANGE = "Score exchange",
    CREDIT = "Balance",
    GAME_RULE = "Game Rule",
    GAME_EXCHANGE = "Exchange",
    GAME_HISTORY = "Bet Record",
    GAME_HELP = "Game Interface",
    SETTING = "Setting",
    AUTO_START = "Auto",
    BET_OPTION = "Bet Option",
    GAME_CURRENT_SCORE = "Credit",
    NOT_ENOUGH_AUTO_EXCHANGE = "Auto exchange credits",
    EXCHANGE_SCORE_NOT_EMPTY = "exchange credits cannot be 0",
    NOT_ENOUGH_AUTO_EXCHANGE_TOOLTIP = "when entering the game or when the balance is insufficient, it will automatically convert to preset credits.",
    START_GAME = "Start",
    CONFIRM_LEAVE = "Are you sure you want to exit?",
    EXITBTN = "Exit",
    CONTINUE = "Continue",
    NOT_ENOUGH_CREDIT_2023 = "Insufficient funds to place this bet.\r\nPlease fund your account or lower the total bet.\r\n(55650060)",
    OPEN_FASTWHEEL_ALERT = "Play faster by reducing total spin time. Do you want to enable the function?",
    EXCHANGE_FILLED = "Max"
}

/**
 * 多國語言
 */
export class Localization {

    private static singleton: Localization = null;

    public static readonly LocalizedStrKeys = LocalizedStrKeys;

    private _isSingleton:boolean = false;

    // 是否關閉將屬性當地語系化
    public nonLocalizable: boolean = false;

    public get isSingleton():boolean { return this._isSingleton; }
    
    constructor() {
    }
    public async reload(origin: string = 'localhost:3000', lang?: string) {
        log(`Localization.reload() origin: ${origin}, lang: ${lang}`);
        if (origin) Dict.origin = origin;
        if (lang) Dict.lang = lang;
        await Dict.start();
    }

    public get(key: string): string {
        if (Dict.has(key))
            return Dict.get(key);
        else
            return DefaultLocalizedStrings[key] || key;
    }
    public has(key: string): boolean {
        return Dict.has(key);
    }
    public release(): void {
        if (this.isSingleton) {
            Localization.singleton = null;
        }
    }
    public static getInstance(): Localization {
        if (!Localization.singleton) {
            Localization.singleton = new Localization();
            Localization.singleton._isSingleton = true;
        }
        return Localization.singleton;
    }
}
