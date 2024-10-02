import { onBetInfo, onJoinGame, onLoadInfo, onUpdate } from "./CGInterface";

const GAME_TYPE = "5278";

//登入資料
export const LoadInfoData = new class {
  private msg: onLoadInfo = {
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
    return this.msg;
  }
}

//登入遊戲資料
export const JoinGameData = new class {
  private msg: onJoinGame = {
    "action": "onJoinGame",
    "gameType": GAME_TYPE,
    "event": true,
    "data":
    {
      "gameState": Math.random() < 0.5 ? "Betting" : "Reward",//(下注中或開獎中?)"NewRound":新局開始，"Betting":下注中，"Reward":派獎中
      "wagersID": 47378797,
      // "avatarID": 10,//頭像ID (隨機0~31) 共32組
      "betCreditList": [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],//遊戲籌碼注額
      "startColor": Array.from({ length: 3 }, () => Math.floor(Math.random() * 36)),//該局起始顏色編號(0~35)
      "countdown": 10,//剩餘下注時間
      "betTotalTime": 10,//遊戲下注時間(彈性調整)
      //前100局路子顏色[新到舊]
      "roadMap": Array.from({ length: 100 }, () => Array.from({ length: 3 }, () => Math.floor(Math.random() * 6))),
      // "betCredits": [200, 100, 0, 300, 400, 0], // 本地用戶各注區下注分
      "totalBetAreaCredits": [1000, 500, 500, 500, 2000, 700],//目前注區總注額
      //目前前三名，{用戶ID、顯示名稱、頭像ID、餘額、下注資料?}
      "rankings": [
        { "userID": 11111, "displayName": 'john', "avatarID": 10, "credit": 70000, "betCredits": [200, 100, 0, 300, 100, 0] },
        { "userID": 22222, "displayName": 'kenny', "avatarID": 11, "credit": 60000, "betCredits": [200, 100, 100, 200, 0, 0] },
        { "userID": 33333, "displayName": 'simon', "avatarID": 12, "credit": 50000, "betCredits": [200, 0, 100, 300, 200, 0] }
      ],
      "liveCount": 3 + Math.ceil(Math.random() * 30),//其他用戶人數
      // "pathID": Math.floor(Math.random() * 1000),//本局表演的路徑ID (隨機0~999) 
      "winColor": Array.from({ length: 3 }, () => Math.floor(Math.random() * 6)),//該局開獎顏色編號(0~5)
      // "userPayoff": { "payoff": Math.floor(Math.random() * 1000), "credit": 2000 },
      // "ranksPayoff": [
      //   { "payoff": Math.floor(Math.random() * 1000), "credit": 20000 },
      //   { "payoff": Math.floor(Math.random() * 1000), "credit": 20000 },
      //   { "payoff": Math.floor(Math.random() * 1000), "credit": 20000 }
      // ],
    }
  }
  public getData(): onJoinGame {
    return this.msg;
  }
}

//更新下注資料(新局)
export const UpdateNewRoundData = new class {
  private msg: onUpdate = {
    "action": "onUpdate",
    "event": true,
    "gameType": GAME_TYPE,
    "data":
    {
      "gameState": "NewRound",//新局開始
      "wagersID": 47378797,
      "startColor": Array.from({ length: 3 }, () => Math.floor(Math.random() * 36)),//該局起始顏色編號(0~35)
      //目前前三名，{用戶ID、顯示名稱、頭像ID、餘額}
      "rankings": [
        { "userID": 11111, "displayName": 'john', "avatarID": 10, "credit": 70000 },
        { "userID": 22222, "displayName": 'kenny', "avatarID": 11, "credit": 60000 },
        { "userID": 33333, "displayName": 'simon', "avatarID": 12, "credit": 50000 }
      ],
      "liveCount": 3 + Math.ceil(Math.random() * 30),//線上用戶人數
    }
  }
  public getData(): onUpdate {
    this.msg.data.startColor = Array.from({ length: 3 }, () => Math.floor(Math.random() * 36));
    return this.msg;
  }
}

//每秒更新下注資料
export const UpdateBettingData = new class {
  private msg: onUpdate = {
    "action": "onUpdate",
    "event": true,
    "gameType": GAME_TYPE,
    "data":
    {
      "gameState": "Betting",// 下注中
      "countdown": 10,//剩餘下注時間
      // "totalBetAreaCredits": [1000, 200, 500, 300, 200, 700],//目前注區總注額
      //目前前三名，{用戶ID、顯示名稱、頭像ID、餘額} (有更新才給)
      "rankings": [
        { "userID": 11111, "displayName": 'john', "avatarID": 10, "credit": 70000 },
        { "userID": 22222, "displayName": 'kenny', "avatarID": 11, "credit": 60000 },
        { "userID": 33333, "displayName": 'simon', "avatarID": 12, "credit": 50000 }
      ],
      "liveCount": 3 + Math.ceil(Math.random() * 30),//線上用戶人數
      //前三名+其他玩家新增的下注額度
      "newBets": [
        [200, 0, 0, 0, 400, 0],
        [0, 100, 0, 0, 100, 0],
        [100, 0, 0, 0, 0, 100],
        [0, 200, 0, 350, 0, 1200]
      ]
    }
  }
  public getData(countdown: number): onUpdate {
    this.msg.data.countdown = countdown - 1;
    return this.msg;
  }
}

//更新派彩資料
export const UpdateEndRoundData = new class {
  private msg: onUpdate = {
    "action": "onUpdate",
    "event": true,
    "gameType": GAME_TYPE,
    "data":
    {
      "gameState": "EndRound",//派獎中
      "pathID": Math.floor(Math.random() * 1000),//本局表演的路徑ID (隨機0~999) 
      "winColor": Array.from({ length: 3 }, () => Math.floor(Math.random() * 6)),//該局開獎顏色編號(0~5)
      "userPayoff": { "payoff": Math.floor(Math.random() * 1000), "credit": 2000 },
      "ranksPayoff": [
        { "payoff": Math.floor(Math.random() * 1000), "credit": 20000 },
        { "payoff": Math.floor(Math.random() * 1000), "credit": 20000 },
        { "payoff": Math.floor(Math.random() * 1000), "credit": 20000 }
      ],
      //該局有派彩的用戶，{userID，派彩額度}
      // "winners": [
      //   { "userID": 11111, "payoff": 200 },
      //   { "userID": 22222, "payoff": 300 },
      //   { "userID": 33333, "payoff": 500 },
      //   { "userID": 44444, "payoff": 100 }
      // ],
      //目前前三名，{用戶ID、顯示名稱、頭像ID、下注資料、餘額}
      "rankings": [
        { "userID": 11111, "displayName": 'john', "avatarID": 10, "betCredits": [200, 100, 0, 300, 400, 0], "credit": 70000 },
        { "userID": 22222, "displayName": 'kenny', "avatarID": 11, "betCredits": [200, 100, 0, 300, 400, 0], "credit": 60000 },
        { "userID": 33333, "displayName": 'simon', "avatarID": 12, "betCredits": [200, 100, 0, 300, 400, 0], "credit": 50000 }
      ],
      "liveCount": 3 + Math.ceil(Math.random() * 30),//線上用戶人數
    }
  }
  public getData(): onUpdate {
    this.msg.data.pathID = Math.floor(Math.random() * 1000);
    this.msg.data.winColor = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6));
    return this.msg;
  }
}

//接收玩家下注資料
export const BetData = new class {
  private msg: onBetInfo = {
    "event": true,
    "error": "餘額不足",
    "data":
    {
      "type": "newBet",//下注類型(新注或續押)
      // "betCredits": [200, 0, 20, 500, 0, 0],// 用戶目前注額分布
      "credit": 2000,// 用戶剩餘額度
    }
  }
  public getData(): onBetInfo {
    return this.msg;
  }
}