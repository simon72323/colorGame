import { onBetInfo, onJoinGame, onLoadInfo, onUpdate } from "./CGInterface";

const GAME_TYPE = "5278";

//登入資料
export class LoadInfoData {
  private static _instance: LoadInfoData;
  private constructor() { };
  public static get Instance() {
    return this._instance;
  }
  private data: onLoadInfo = {
    "event": true,
    "gameType": GAME_TYPE,
    "data":
    {
      "userID": 33333,
      "balance": 100000,
      "base": "1:1",
      "defaultBase": "1:1",
      // "defaultBetCredit": 1,
      "currency": "RMB",
      "loginName": "Player",
      "autoExchange": false,
      "credit": 2000,
      // "betBase": "",
      // "isCash": false,
    }
  }
  public getData(): onLoadInfo {
    return this.data;
  }
}

//登入遊戲資料
export class JoinGameData {
  private static _instance: JoinGameData;
  private constructor() { };
  public static get Instance() {
    return this._instance;
  }
  private data: onJoinGame = {
    "action": "onJoinGame",
    "gameType": GAME_TYPE,
    "event": true,
    "data":
    {
      "gameState": Math.random() < 0.5 ? "Betting" : "Reward",//(下注中或開獎中?)"NewRound":新局開始，"Betting":下注中，"Reward":派獎中
      "roundSerial": 47378797,
      "avatarID": 10,//頭像ID (隨機0~31) 共32組
      "betCreditList": [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],//遊戲籌碼注額
      "startColor": Array.from({ length: 3 }, () => Math.floor(Math.random() * 36)),//該局起始顏色編號(0~35)
      "countdown": 5,//剩餘下注時間
      "betTotalTime": 12,//遊戲下注時間(彈性調整)
      //前100局路紙顏色[新到舊]
      "roadMap": Array.from({ length: 100 }, () => Array.from({ length: 3 }, () => Math.floor(Math.random() * 6))),
      // 該局有下注的用戶與注額分布與餘額
      "allBets": [
        { "userID": 11111, "betCredits": [200, 100, 0, 300, 400, 0], "credit": 2000 },
        { "userID": 22222, "betCredits": [0, 100, 50, 50, 100, 200], "credit": 2000 },
        { "userID": 33333, "betCredits": [0, 100, 50, 50, 100, 200], "credit": 2000 },
        { "userID": 44444, "betCredits": [100, 100, 100, 300, 200, 100], "credit": 2000 }
      ],
      //目前前三名，{用戶ID、顯示名稱、頭像ID、下注資料、餘額}
      "rankings": [
        { "userID": 11111, "displayName": 'john', "avatarID": 10, "betCredits": [200, 100, 0, 300, 400, 0],"credit": 70000 },
        { "userID": 22222, "displayName": 'kenny', "avatarID": 11, "betCredits": [200, 100, 0, 300, 400, 0],"credit": 60000 },
        { "userID": 33333, "displayName": 'simon', "avatarID": 12, "betCredits": [200, 100, 0, 300, 400, 0],"credit": 50000 }
      ],
      "liveCount": 3 + Math.ceil(Math.random() * 30),//其他用戶人數
      "pathID": Math.floor(Math.random() * 1000),//本局表演的路徑ID (隨機0~999) 
      "winColor": Array.from({ length: 3 }, () => Math.ceil(Math.random() * 6)),//該局開獎顏色編號(1~6)
      //該局有派彩的用戶，{userID，派彩額度}
      "winners": [
        { "userID": 11111, "payoff": 200 },
        { "userID": 22222, "payoff": 300 },
        { "userID": 33333, "payoff": 500 },
        { "userID": 44444, "payoff": 100 }
      ]
    }
  }
  public getData(): onJoinGame {
    return this.data;
  }
}

//更新下注資料(新局)
export class UpdateNewRoundData {
  private static _instance: UpdateNewRoundData;
  private constructor() { };
  public static get Instance() {
    return this._instance;
  }
  private data: onUpdate = {
    "action": "onUpdate",
    "event": true,
    "gameType": GAME_TYPE,
    "data":
    {
      "gameState": "NewRound",//新局開始
      "roundSerial": 47378797,
      "startColor": Array.from({ length: 3 }, () => Math.floor(Math.random() * 36)),//該局起始顏色編號(0~35)
    }
  }
  public getData(): onUpdate {
    return this.data;
  }
}

//每秒更新下注資料
export class UpdateBettingData {
  private static _instance: UpdateBettingData;
  private constructor() { };
  public static get Instance() {
    return this._instance;
  }
  private data: onUpdate = {
    "action": "onUpdate",
    "event": true,
    "gameType": GAME_TYPE,
    "data":
    {
      "gameState": "Betting",// 下注中
      "countdown": 10,//剩餘下注時間
      // 該局有下注的用戶與注額分布與餘額
      // "allBets": [
      //   { "userID": 11111, "betCredits": [200, 100, 0, 300, 400, 0], "credit": 2000 },
      //   { "userID": 22222, "betCredits": [0, 100, 50, 50, 100, 200], "credit": 2000 },
      //   { "userID": 33333, "betCredits": [0, 100, 50, 50, 100, 200], "credit": 2000 },
      //   { "userID": 44444, "betCredits": [100, 100, 100, 300, 200, 100], "credit": 2000 }
      // ],
      "totalBets": [1000, 200, 500, 300, 200, 700],//目前注區總注額
      //前三名+其他玩家新增的下注額度
      "newBets": [
        [200, 100, 0, 300, 400, 0],
        [0, 100, 50, 50, 100, 200],
        [100, 0, 0, 0, 0, 100],
        [500, 200, 150, 350, 500, 1200]
      ]
    }
  }
  public getData(countdown: number): onUpdate {
    this.data.data.countdown = countdown - 1;
    return this.data;
  }
}

//更新派彩資料
export class UpdateRewardData {
  private static _instance: UpdateRewardData;
  private constructor() { };
  public static get Instance() {
    return this._instance;
  }
  private data: onUpdate = {
    "action": "onUpdate",
    "event": true,
    "gameType": GAME_TYPE,
    "data":
    {
      "gameState": "Reward",//派獎中
      "pathID": Math.floor(Math.random() * 1000),//本局表演的路徑ID (隨機0~999) 
      "winColor": Array.from({ length: 3 }, () => Math.ceil(Math.random() * 6)),//該局開獎顏色編號(1~6)
      //該局有派彩的用戶，{userID，派彩額度}
      "winners": [
        { "userID": 11111, "payoff": 200 },
        { "userID": 22222, "payoff": 300 },
        { "userID": 33333, "payoff": 500 },
        { "userID": 44444, "payoff": 100 }
      ],
      //目前前三名，{用戶ID、顯示名稱、頭像ID、下注資料、餘額}
      "rankings": [
        { "userID": 11111, "displayName": 'john', "avatarID": 10, "betCredits": [200, 100, 0, 300, 400, 0],"credit": 70000 },
        { "userID": 22222, "displayName": 'kenny', "avatarID": 11, "betCredits": [200, 100, 0, 300, 400, 0],"credit": 60000 },
        { "userID": 33333, "displayName": 'simon', "avatarID": 12, "betCredits": [200, 100, 0, 300, 400, 0],"credit": 50000 }
      ],
      "liveCount": 3 + Math.ceil(Math.random() * 30),//線上用戶人數
    }
  }
  public getData(): onUpdate {
    return this.data;
  }
}

//接收玩家下注資料
export class BetData {
  private static _instance: BetData;
  private constructor() { };
  public static get Instance() {
    return this._instance;
  }
  private data: onBetInfo = {
    "event": true,
    "error": "餘額不足",
    "data":
    {
      "betCredits": [200, 0, 20, 500, 0, 0],// 用戶目前注額分布
      "credit": 2000,// 用戶剩餘額度
    }
  }
  public getData(): onBetInfo {
    return this.data;
  }
}