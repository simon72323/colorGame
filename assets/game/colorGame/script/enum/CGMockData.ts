import { onBetInfo, onJoinGame, onLoadInfo, onUpdate } from "./CGInterface";

//接收登入資料
export class LoadInfoData {
  private static _instance: LoadInfoData;
  private constructor() { };
  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
  private data: onLoadInfo = {
    "event": true,
    "data":
    {
      "userID": 3845147,
      // "avatar": 10,//頭像ID (隨機0~31) 共32組
      "bBalance": 100000,
      "base": "1:1",
      "defaultBase": "1:1",
      "betCreditList": [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000],//遊戲籌碼注額
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

//接收登入遊戲資料
export class JoinGameData {
  private static _instance: JoinGameData;
  private constructor() { };
  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  private data: onJoinGame = {
    "event": true,
    "data":
    {
      "gameState": 'Betting',//"Ready":準備中，"NewRound":新局開始，"Betting":下注中，"Reward":派獎
      // "userID": 3845147,
      "roundSerial": 47378797,
      "startColor": [1, 2, 3],//該局起始顏色編號(1~6，1=黃、2=灰、3=紫、4=藍、5=紅、6=綠)
      "countdown": 10,//剩餘下注時間
      "betTime": 12,//遊戲下注時間(彈性調整)
      //前10局路紙顏色[新到舊]
      "roadMap": [
        [1, 1, 2], [5, 1, 2], [1, 1, 2], [1, 4, 5], [5, 3, 4], [2, 2, 2], [3, 4, 4], [5, 6, 1], [5, 3, 4], [6, 5, 2]
      ],
      "roadMapPer": [16.3, 17.5, 16.2, 18.3, 15.4, 16.3],//前100局路紙顏色百分比[黃、灰、紫、藍、紅、綠]
      "totalBetAreaCredit": [2000, 1000, 2000, 1000, 1000, 2000],//總用戶目前各注區下注額
      //目前前三名，{用戶ID、顯示名稱、頭像ID、餘額}
      "rankings": [
        { "userID": 11111111, "displayName": 'john', "avatar": 10, "credit": 70000 },
        { "userID": 22222222, "displayName": 'kenny', "avatar": 11, "credit": 60000 },
        { "userID": 3845147, "displayName": 'simon', "avatar": 12, "credit": 50000 }
      ],
      "liveCount": 20,//其他用戶人數
      "pathID": 1,//本局表演的路徑ID (隨機0~999) 
      "winColor": [1, 2, 3],//該局開獎顏色編號(1~6，1=黃、2=灰、3=紫、4=藍、5=紅、6=綠)
      //前三名用戶+其他用戶派彩，{勝利注區(1~6)，派彩額度}
      "otherPayoffs": [
        { "winAreas": [1, 2, 3], "payoff": 200 },
        { "winAreas": [1, 2], "payoff": 300 },
        { "winAreas": [2, 3], "payoff": 500 },
        { "winAreas": [3], "payoff": 100 }
      ],
    }
  }
  public getData(): onJoinGame {
    return this.data;
  }
}

//每秒接收更新下注資料
export class UpdateData {
  private static _instance: UpdateData;
  private constructor() { };
  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
  private data: onUpdate = {
    "event": true,
    "data":
    {
      "gameState": 'Betting',//"Ready":準備中，"NewRound":新局開始，"Betting":下注中，"Reward":派獎
      "roundSerial": 47378797,
      "startColor": [1, 2, 3],//該局起始顏色編號(1~6，1=黃、2=灰、3=紫、4=藍、5=紅、6=綠)
      "countdown": 10,//剩餘下注時間
      //前10局路紙顏色[新到舊]
      "roadMap": [
        [1, 1, 2], [5, 1, 2], [1, 1, 2], [1, 4, 5], [5, 3, 4], [2, 2, 2], [3, 4, 4], [5, 6, 1], [5, 3, 4], [6, 5, 2]
      ],
      "roadMapPer": [16.3, 17.5, 16.2, 18.3, 15.4, 16.3],//前100局路紙顏色百分比[黃、灰、紫、藍、紅、綠]
      //目前前三名，{用戶ID、顯示名稱、頭像ID、餘額}
      "rankings": [
        { "userID": 11111111, "displayName": 'john', "avatar": 10, "credit": 70000 },
        { "userID": 22222222, "displayName": 'kenny', "avatar": 11, "credit": 60000 },
        { "userID": 33333333, "displayName": 'simon', "avatar": 12, "credit": 50000 }
      ],
      "liveCount": 20,//其他用戶人數
      "totalBetAreaCredit": [10, 100, 100, 200, 300, 400],//總用戶目前各注區下注額
      //前三名用戶+其他用戶各注區新增的注額
      "newBets": [
        [200, 0, 0, 0, 100, 0],
        [0, 100, 0, 0, 100, 100],
        [100, 100, 100, 300, 0, 0],
        [0, 0, 0, 500, 0, 0]
      ],
      "pathID": 1,//本局表演的路徑ID (隨機0~999) 
      "winColor": [1, 2, 3],//該局開獎顏色編號(1~6，1=黃、2=灰、3=紫、4=藍、5=紅、6=綠)
      "userPayoff": { "winAreas": [1, 2], "payoff": 200 },//本地用戶派彩，{勝利注區(1~6)，派彩額度}
      //前三名用戶+其他用戶派彩，{勝利注區(1~6)，派彩額度}
      "otherPayoffs": [
        { "winAreas": [1, 2, 3], "payoff": 200 },
        { "winAreas": [1, 2], "payoff": 300 },
        { "winAreas": [2, 3], "payoff": 500 },
        { "winAreas": [3], "payoff": 100 }
      ],
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
      "betAreaID": 1,// 下注區id
      "betCredit": 200,// 下注額度
      "credit": 2000,// 剩餘額度
      "betTotal": 500,//用戶目前總下注額
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
//     "StartColor": [1, 2, 3] // 假設這是起始顏色
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