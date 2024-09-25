import { onBetInfo, onJoinGame, onLoadInfo, onUpdate } from "./CGInterface";

//登入資料
export class LoadInfoData {
  private static _instance: LoadInfoData;
  private constructor() { };
  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
  private data: onLoadInfo = {
    "event": true,
    "gameType": "5278",
    "data":
    {
      "userID": 3845147,
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
    return this._instance || (this._instance = new this());
  }

  private data: onJoinGame = {
    "action": "onJoinGame",
    "gameType": "5278",
    "event": true,
    "data":
    {
      "gameState": Math.random() < 0.5 ? "Betting" : "Reward",//(下注中或開獎中?)"NewRound":新局開始，"Betting":下注中，"Reward":派獎中
      "avatarID": 10,//頭像ID (隨機0~31) 共32組
      "betCreditList": [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],//遊戲籌碼注額
      "roundSerial": 47378797,
      "startColor": Array.from({ length: 3 }, () => Math.floor(Math.random() * 36)),//該局起始顏色編號(0~35)
      "countdown": 5,//剩餘下注時間
      "betTotalTime": 12,//遊戲下注時間(彈性調整)
      //前100局路紙顏色[新到舊]
      "roadMap": Array.from({ length: 100 }, () =>
        Array.from({ length: 3 }, () => Math.floor(Math.random() * 6))
      ),
      "totalBetAreaCredit": Array.from({ length: 6 }, () => Math.floor(Math.random() * 2000)),//總用戶目前各注區下注額
      //目前前三名，{用戶ID、顯示名稱、頭像ID、餘額}
      "rankings": [
        { "userID": 11111111, "displayName": 'john', "avatarID": 10, "credit": 70000 },
        { "userID": 22222222, "displayName": 'kenny', "avatarID": 11, "credit": 60000 },
        { "userID": 3845147, "displayName": 'simon', "avatarID": 12, "credit": 50000 }
      ],
      "liveCount": Math.ceil(Math.random() * 30),//其他用戶人數
      // "pathID": 1,//本局表演的路徑ID (隨機0~999) 
      // "winColor": [1, 2, 3],//該局開獎顏色編號(1~6，1=黃、2=灰、3=紫、4=藍、5=紅、6=綠)
      // //前三名用戶+其他用戶派彩，{勝利注區(0~5)，派彩額度}
      // "otherPayoffs": [
      //   { "winAreas": [1, 2, 3], "payoff": 200 },
      //   { "winAreas": [1, 2], "payoff": 300 },
      //   { "winAreas": [2, 3], "payoff": 500 },
      //   { "winAreas": [3], "payoff": 100 }
      // ],
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
    return this._instance || (this._instance = new this());
  }
  private data: onUpdate = {
    "action": "onUpdate",
    "event": true,
    "gameType": "5278",
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
    return this._instance || (this._instance = new this());
  }
  private data: onUpdate = {
    "action": "onUpdate",
    "event": true,
    "gameType": "5278",
    "data":
    {
      "gameState": "Betting",// 下注中
      "countdown": 10,//剩餘下注時間
      "totalBetAreaCredit": Array.from({ length: 6 }, () => Math.floor(Math.random() * 2000)),//總用戶目前各注區下注額
      //前三名用戶+其他用戶各注區新增的注額
      "newBets": Array.from({ length: 4 }, () =>
        Array.from({ length: 6 }, () => Math.floor(Math.random() * 1000))
      ),
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
    return this._instance || (this._instance = new this());
  }
  private winColor = Array.from({ length: 3 }, () => Math.ceil(Math.random() * 6));
  private getWinAreas(): number[] {
    const uniqueColors = Array.from(new Set(this.winColor));//排除重複值
    const winAreas: number[] = [];
    uniqueColors.forEach(color => {
      if (Math.random() < 0.5) {
        winAreas.push(color);
      }
    });
    return winAreas;
  }

  private data: onUpdate = {
    "action": "onUpdate",
    "event": true,
    "gameType": "5278",
    "data":
    {
      "gameState": "Reward",//派獎中
      "pathID": Math.floor(Math.random() * 1000),//本局表演的路徑ID (隨機0~999) 
      "winColor": this.winColor,//該局開獎顏色編號(1~6)
      "userPayoff": { "winAreas": this.getWinAreas(), "payoff": 200 },//本地用戶派彩，{勝利注區(1~6)，派彩額度}
      //前三名用戶+其他用戶派彩，{勝利注區(1~6)，派彩額度}
      "otherPayoffs": [
        { "winAreas": this.getWinAreas(), "payoff": 200 },
        { "winAreas": this.getWinAreas(), "payoff": 300 },
        { "winAreas": this.getWinAreas(), "payoff": 500 },
        { "winAreas": this.getWinAreas(), "payoff": 100 }
      ],
      //目前前三名，{用戶ID、顯示名稱、頭像ID、餘額}
      "rankings": [
        { "userID": 11111111, "displayName": 'john', "avatarID": 10, "credit": 70000 },
        { "userID": 22222222, "displayName": 'kenny', "avatarID": 11, "credit": 60000 },
        { "userID": 33333333, "displayName": 'simon', "avatarID": 12, "credit": 50000 }
      ],
      "liveCount": Math.ceil(Math.random() * 30),//其他用戶人數
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
    return this._instance || (this._instance = new this());
  }
  private data: onBetInfo = {
    "event": true,
    "error": "餘額不足",
    "data":
    {
      "betCredits": [200, 0, 20, 500, 0, 0],// 新增各區下注額度
      // "credit": 2000,// 剩餘額度
      // "betTotal": 500,//用戶目前總下注額
      // "userBetAreaCredit": [10, 90, 100, 100, 100, 100],//用戶目前各注區下注
      // "totalBetAreaCredit": [200, 290, 300, 300, 300, 300],//目前各下注區總額
    }
  }
  public getData(): onBetInfo {
    return this.data;
  }
}


//   //接收到準備消息
//   private updateReady = {
//   "action": "update",
//   "gameType": "5270",
//   "data": {
//     "GameState": "Ready",
//   }
// }

//   //接收到新局消息
//   private NewRoundMessage = {
//   "action": "update",
//   "gameType": "5270",
//   "data": {
//     "GameState": "NewRound",
//     "RoundSerial": 488670,
//     "StartColor": [1, 2, 3] // 起始顏色
//   }
// }

//   //接收到下注中(每秒更新)
//   private BettingMessage = {
//   "action": "update",
//   "gameType": "5270",
//   "data": {
//     "GameState": "Betting",
//     "Countdown": 10,//剩餘下注時間
//     "LiveCount": 20,//其他用戶人數
//     "TotalBets": [10, 100, 100, 200, 300, 400],//總用戶目前各注區下注額
//     //前三名用戶+其他用戶各注區新增的注額
//     "NewBets": [
//       [200, 100, 0, 300, 400, 0],
//       [0, 100, 50, 50, 100, 200],
//       [100, 100, 100, 300, 200, 100],
//       [0, 0, 200, 500, 0, 400]
//     ],
//   }
// }

//   //接收到開獎派彩訊息
//   private RewardMessage = {
//   "action": "update",
//   "gameType": "5270",
//   "data": {
//     "GameState": "Reward",
//     "PathID": 1,//本局表演的路徑ID (隨機0~999)
//     "WinColor": [1, 2, 3],//該局開獎顏色編號(1~6，1=黃、2=灰、3=紫、4=藍、5=紅、6=綠)
//     "UserPayoff": { "winAreas": [1, 2, 4], "payoff": 200 },//本地用戶派彩，{勝利注區(1~6)，派彩額度}
//     //前三名用戶+其他用戶派彩，{勝利注區(1~6)，派彩額度}
//     "OtherPayoffs": [
//       { "winAreas": [1, 2, 4], "payoff": 200 },
//       { "winAreas": [1, 2, 4], "payoff": 200 },
//       { "winAreas": [1, 2, 4], "payoff": 200 },
//       { "winAreas": [1, 2, 4], "payoff": 200 }
//     ],
//     "RoadMap": [[0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 1, 2]],
//     "RoadMapPer": [10, 20, 20, 20, 20, 10],
//     "Rankings": [
//       { "userID": 11111111, "displayName": 'john', "avatar": 10, "credit": 70000 },
//       { "userID": 22222222, "displayName": 'kenny', "avatar": 11, "credit": 60000 },
//       { "userID": 33333333, "displayName": 'simon', "avatar": 12, "credit": 50000 }
//     ],
//     "LiveCount": 20,//其他用戶人數
//   }
// }