
export interface onLoadInfo {
    event: boolean;
    Currency: string;
    UserID: number;
    Balance: number;
    Base: string;
    DefaultBase: string;
    AxisCards: string[];
    AxisLocation?: string;
    ExchangeRate: number;
    LoginName: string;
    HallID: number;
    AutoExchange?: boolean;
    Test: boolean;
    Credit: number;
    BetBase: string;
    WagersID: number;
    noExchange?:boolean
    BetCreditList?: number[];
    DefaultBetCredit?: number|string;
    LevelList?: number[];
    BetEachLevel?: number;
    isCash: boolean;
    userSetting: any;
    SingleBet: number;
    UserName?: string;
    GameCode?: string|number;
}



// {
//     "action":"onOnLoadInfo2",
//     "result":{
//        "event":true,
//        "data":{
//           "event":true,
//           "Balance":152014567.85,
//           "Base":"1:1",
//           "DefaultBase":"1:1",
//           "BetCreditList":[
//              2,
//              6,
//              8,
//              10,
//              20,
//              40,
//              100,
//              200,
//              300,
//              400,
//              500,
//              600,
//              1000,
//              1400,
//              1600
//           ],
//           "DefaultBetCredit":6,
//           "Normal":[
//              [
//                 1,
//                 8,
//                 7,
//                 2,
//                 10,
//                 4,
//                 7,
//                 8,
//                 13,
//                 9,
//                 10,
//                 8,
//                 2,
//                 9,
//                 5,
//                 6,
//                 3,
//                 8,
//                 10,
//                 4,
//                 9,
//                 3,
//                 6,
//                 4,
//                 8,
//                 1,
//                 9,
//                 5,
//                 8,
//                 9,
//                 5,
//                 10,
//                 7,
//                 3,
//                 8,
//                 2,
//                 9,
//                 4,
//                 6,
//                 2,
//                 9,
//                 5,
//                 6,
//                 3,
//                 8,
//                 10,
//                 4,
//                 9,
//                 5,
//                 6,
//                 4,
//                 8,
//                 3,
//                 9,
//                 5,
//                 8,
//                 9,
//                 1,
//                 10,
//                 5,
//                 6
//              ],
//              [
//                 1,
//                 6,
//                 7,
//                 3,
//                 7,
//                 6,
//                 12,
//                 7,
//                 8,
//                 13,
//                 9,
//                 10,
//                 8,
//                 1,
//                 9,
//                 10,
//                 5,
//                 9,
//                 6,
//                 7,
//                 12,
//                 8,
//                 6,
//                 2,
//                 8,
//                 5,
//                 9,
//                 3,
//                 6,
//                 4,
//                 8,
//                 2,
//                 6,
//                 5,
//                 9,
//                 2,
//                 10,
//                 3,
//                 6,
//                 4,
//                 10,
//                 5,
//                 9,
//                 6,
//                 7,
//                 12,
//                 8,
//                 6,
//                 4,
//                 7,
//                 9,
//                 5,
//                 6,
//                 7,
//                 12,
//                 8,
//                 9,
//                 2,
//                 10,
//                 3,
//                 7,
//                 9
//              ],
//              [
//                 1,
//                 10,
//                 6,
//                 5,
//                 9,
//                 6,
//                 7,
//                 12,
//                 10,
//                 8,
//                 13,
//                 9,
//                 10,
//                 8,
//                 12,
//                 9,
//                 10,
//                 5,
//                 8,
//                 2,
//                 10,
//                 7,
//                 12,
//                 8,
//                 6,
//                 9,
//                 4,
//                 10,
//                 3,
//                 9,
//                 2,
//                 7,
//                 1,
//                 8,
//                 4,
//                 9,
//                 5,
//                 8,
//                 7,
//                 3,
//                 10,
//                 5,
//                 8,
//                 2,
//                 10,
//                 7,
//                 12,
//                 6,
//                 10,
//                 5,
//                 6,
//                 4,
//                 7,
//                 4,
//                 10,
//                 5,
//                 9,
//                 3,
//                 8
//              ],
//              [
//                 1,
//                 8,
//                 5,
//                 9,
//                 4,
//                 6,
//                 7,
//                 12,
//                 10,
//                 8,
//                 13,
//                 9,
//                 10,
//                 2,
//                 8,
//                 9,
//                 5,
//                 7,
//                 3,
//                 9,
//                 4,
//                 8,
//                 5,
//                 10,
//                 7,
//                 12,
//                 8,
//                 10,
//                 5,
//                 6,
//                 1,
//                 10,
//                 8,
//                 13,
//                 9,
//                 10,
//                 4,
//                 7,
//                 3,
//                 10,
//                 7,
//                 4,
//                 10,
//                 8,
//                 1,
//                 9,
//                 10,
//                 7,
//                 12,
//                 8,
//                 10,
//                 5,
//                 6,
//                 8,
//                 12,
//                 9,
//                 10,
//                 2,
//                 7,
//                 3,
//                 9
//              ],
//              [
//                 1,
//                 7,
//                 4,
//                 10,
//                 3,
//                 6,
//                 5,
//                 10,
//                 8,
//                 13,
//                 9,
//                 10,
//                 1,
//                 8,
//                 9,
//                 3,
//                 7,
//                 2,
//                 10,
//                 6,
//                 3,
//                 10,
//                 8,
//                 13,
//                 9,
//                 10,
//                 4,
//                 6,
//                 3,
//                 7,
//                 5,
//                 9,
//                 10,
//                 4,
//                 6,
//                 5,
//                 10,
//                 2,
//                 7,
//                 4,
//                 8
//              ]
//           ],
//           "Free":[
//              [
//                 4,
//                 5,
//                 3,
//                 2,
//                 1,
//                 13,
//                 4,
//                 4,
//                 4,
//                 5,
//                 5,
//                 5,
//                 3,
//                 3,
//                 3,
//                 2,
//                 4,
//                 2,
//                 12,
//                 1,
//                 1,
//                 1,
//                 4,
//                 5,
//                 3,
//                 4,
//                 5,
//                 2,
//                 4,
//                 5,
//                 4,
//                 2,
//                 3,
//                 4,
//                 2,
//                 1,
//                 3,
//                 12,
//                 5,
//                 2,
//                 5,
//                 4,
//                 1,
//                 2,
//                 3,
//                 4,
//                 5,
//                 3,
//                 4,
//                 5,
//                 3
//              ],
//              [
//                 4,
//                 5,
//                 3,
//                 2,
//                 3,
//                 13,
//                 5,
//                 4,
//                 4,
//                 5,
//                 12,
//                 5,
//                 3,
//                 3,
//                 3,
//                 2,
//                 4,
//                 2,
//                 5,
//                 1,
//                 4,
//                 5,
//                 3,
//                 4,
//                 5,
//                 3,
//                 4,
//                 5,
//                 1,
//                 5,
//                 4,
//                 2,
//                 3,
//                 4,
//                 2,
//                 1,
//                 3,
//                 4,
//                 5,
//                 2,
//                 5,
//                 4,
//                 1,
//                 2,
//                 3,
//                 1,
//                 4,
//                 5,
//                 3,
//                 4
//              ],
//              [
//                 4,
//                 5,
//                 3,
//                 2,
//                 5,
//                 3,
//                 1,
//                 4,
//                 5,
//                 2,
//                 5,
//                 3,
//                 3,
//                 3,
//                 1,
//                 4,
//                 2,
//                 3,
//                 5,
//                 1,
//                 1,
//                 4,
//                 5,
//                 3,
//                 4,
//                 5,
//                 3,
//                 2,
//                 3,
//                 5,
//                 2,
//                 3,
//                 4,
//                 2,
//                 5,
//                 4,
//                 4,
//                 5,
//                 2,
//                 4,
//                 4,
//                 13,
//                 4,
//                 3,
//                 12,
//                 2,
//                 4,
//                 1,
//                 5,
//                 4
//              ],
//              [
//                 4,
//                 5,
//                 3,
//                 2,
//                 4,
//                 12,
//                 2,
//                 4,
//                 4,
//                 5,
//                 5,
//                 5,
//                 3,
//                 4,
//                 3,
//                 2,
//                 2,
//                 2,
//                 5,
//                 1,
//                 1,
//                 1,
//                 4,
//                 5,
//                 3,
//                 1,
//                 5,
//                 3,
//                 4,
//                 5,
//                 4,
//                 1,
//                 3,
//                 4,
//                 2,
//                 1,
//                 5,
//                 13,
//                 4,
//                 2,
//                 5,
//                 4,
//                 1,
//                 2,
//                 3,
//                 5,
//                 4,
//                 1,
//                 4,
//                 5,
//                 3
//              ],
//              [
//                 1,
//                 5,
//                 3,
//                 2,
//                 2,
//                 13,
//                 1,
//                 3,
//                 4,
//                 5,
//                 5,
//                 5,
//                 3,
//                 1,
//                 3,
//                 2,
//                 4,
//                 2,
//                 12,
//                 4,
//                 5,
//                 1,
//                 4,
//                 5,
//                 3,
//                 4,
//                 5,
//                 3,
//                 4,
//                 5,
//                 4,
//                 2,
//                 3,
//                 4,
//                 2,
//                 1,
//                 5,
//                 12,
//                 5,
//                 2,
//                 4,
//                 4,
//                 1,
//                 2,
//                 3,
//                 4,
//                 1,
//                 4,
//                 1,
//                 5,
//                 4
//              ]
//           ],
//           "LoginName":"penguin",
//           "AutoExchange":false,
//           "Credit":0,
//           "BetBase":"",
//           "isCash":true,
//           "userSetting":{
             
//           },
//           "SingleBet":100
//        },
//        "tokenId":"/3"
//     }
//  }