import { UtilsKit } from "../lib/UtilsKit";

export interface FreeGameData {
    HitFree?: boolean;
    ElementID?: number;
    GridNum?: number;
    FreeGameTime?: number;
    Round?: number;
    Grids?: Array<number>;
}

export interface PayTypeData {
    Type?: Array<number>;
    TaiNum?: Array<number>;
    EyeCard?: number;
    TotalTai?: number;
    WinCard?: Array<number>;
    Flower?: Array<number>;
    AllEye?: Array<number>;
    IsHu?: boolean;
}

export class MockData
{
    public static lastElementID: number = 43; // 最後一個元件 id
    public static freeElementID: number = 43; // free 元件 id
    public static flowerElementIDRange: Array<number> = [35, 42];  // 花 元件 id range
    public static elementAmountPerWheel: number = 4; // 每一軸元件數量

    public static isFree: boolean = false; // 是否 Free Game 進行中
    public static freeGameTime: number = 0; // Free Game 剩餘次數

    public static arrBet: Array<number> = [1,2,3,4,5,6,7,8,9,10];
    public static credit: number = 5000;
    public static sn: number = 100000;
    public static betBase: string = "1:1";


    /**
     * Server 提供 beginGame Data
     * @param bet 注額
     * @returns beginGame Data
     */
    public static produceMockDataFromServer(): any {
        let data: any = 
        
    //     {
    //       "BetTotal": 1,
    //       "PayTotal": 66,
    //       "Lines": [
    //           [
    //               {
    //                   "ElementID": 9,
    //                   "GridNum": 4,
    //                   "Grids": [
    //                       4,
    //                       6,
    //                       19,
    //                       20
    //                   ],
    //                   "Payoff": 0,
    //                   "BrickNum": 0
    //               },
    //               {
    //                   "ElementID": 37,
    //                   "GridNum": 1,
    //                   "Grids": [
    //                       10
    //                   ],
    //                   "Payoff": 0,
    //                   "BrickNum": 0
    //               },
    //               {
    //                   "ElementID": 39,
    //                   "GridNum": 1,
    //                   "Grids": [
    //                       8
    //                   ],
    //                   "Payoff": 0,
    //                   "BrickNum": 0
    //               }
    //           ],
    //           [
    //               {
    //                   "ElementID": 33,
    //                   "GridNum": 3,
    //                   "Grids": [
    //                       3,
    //                       5,
    //                       15
    //                   ],
    //                   "Payoff": 0,
    //                   "BrickNum": 0
    //               }
    //           ],
    //           [
    //               {
    //                   "ElementID": 4,
    //                   "GridNum": 3,
    //                   "Grids": [
    //                       1,
    //                       8,
    //                       12
    //                   ],
    //                   "Payoff": 0,
    //                   "BrickNum": 0
    //               },
    //               {
    //                   "ElementID": 27,
    //                   "GridNum": 3,
    //                   "Grids": [
    //                       2,
    //                       10,
    //                       20
    //                   ],
    //                   "Payoff": 0,
    //                   "BrickNum": 0
    //               }
    //           ]
    //       ],
    //       "Cards": [
    //           [
    //               6,
    //               31,
    //               5,
    //               9,
    //               3,
    //               9,
    //               13,
    //               39,
    //               15,
    //               37,
    //               19,
    //               8,
    //               23,
    //               10,
    //               43,
    //               19,
    //               29,
    //               10,
    //               9,
    //               9
    //           ],
    //           [
    //               17,
    //               16,
    //               33,
    //               43,
    //               33,
    //               12,
    //               31,
    //               1,
    //               26,
    //               15,
    //               30,
    //               18,
    //               10,
    //               23,
    //               33,
    //               26,
    //               8,
    //               43,
    //               14,
    //               5
    //           ],
    //           [
    //               4,
    //               27,
    //               2,
    //               18,
    //               41,
    //               34,
    //               24,
    //               4,
    //               3,
    //               27,
    //               26,
    //               4,
    //               12,
    //               31,
    //               4,
    //               20,
    //               20,
    //               16,
    //               11,
    //               27
    //           ]
    //       ],
    //       "FreeGame": [],
    //       "FreeGameSpin": {
    //           "FreeGameTime": 0,
    //           "WagersID": 0,
    //           "FreeGamePayoffTotal": 0
    //       },
    //       "PayType": {
    //           "Type": [
    //               9
    //           ],
    //           "TaiNum": [
    //               4
    //           ],
    //           "EyeCard": 20,
    //           "TotalTai": 9,
    //           "WinCard": [
    //               4,
    //               4,
    //               4,
    //               9,
    //               9,
    //               9,
    //               9,
    //               27,
    //               27,
    //               27,
    //               33,
    //               33,
    //               33
    //           ]
    //       },
    //       "AxisLocation": "",
    //       "BBJackpot": null,
    //       "WagersID": 46815962,
    //       "Status": 0,
    //       "HitWagersID": 0,
    //       "Credit": 478.2,
    //       "Credit_End": 544.2
    //   }

        {"BetTotal":10,"PayTotal":288,"Lines":[[{"ElementID":39,"GridNum":1,"Grids":[8],"Payoff":0,"BrickNum":0}],[{"ElementID":16,"GridNum":3,"Grids":[5,8,10],"Payoff":0,"BrickNum":0}],[{"ElementID":37,"GridNum":1,"Grids":[10],"Payoff":0,"BrickNum":0}],[{"ElementID":30,"GridNum":3,"Grids":[3,6,12],"Payoff":0,"BrickNum":0}],[{"ElementID":40,"GridNum":1,"Grids":[11],"Payoff":0,"BrickNum":0},{"ElementID":41,"GridNum":1,"Grids":[8],"Payoff":0,"BrickNum":0}],[{"ElementID":21,"GridNum":3,"Grids":[9,11,20],"Payoff":0,"BrickNum":0}],[{"ElementID":10,"GridNum":3,"Grids":[6,8,20],"Payoff":0,"BrickNum":0},{"ElementID":17,"GridNum":3,"Grids":[3,16,19],"Payoff":0,"BrickNum":0}]],"Cards":[[32,34,12,27,24,11,16,39,28,16,33,23,4,9,14,13,5,28,17,29],[32,34,12,27,16,24,11,16,28,16,33,23,4,9,14,13,5,28,17,29],[25,2,30,8,26,30,11,25,1,37,8,30,3,14,28,15,5,20,32,11],[25,2,30,8,26,30,11,25,3,1,8,30,3,14,28,15,5,20,32,11],[15,26,26,18,23,34,9,41,2,21,40,2,11,3,22,7,22,12,4,21],[15,26,26,18,4,23,34,9,21,2,21,2,11,3,22,7,22,12,4,21],[29,33,17,42,31,10,14,10,14,2,27,29,31,9,27,17,25,9,17,10]],"FreeGame":[],"FreeGameSpin":{"FreeGameTime":0,"WagersID":0,"FreeGamePayoffTotal":0},"PayType":{"Type":[9],"TaiNum":[3],"EyeCard":9,"TotalTai":5,"WinCard":[10,10,10,16,16,16,21,21,21,30,30,30],"DiceNum":[5,2],"AllEye":[9,10,14,17,27,29,31],"IsHu":true},"AxisLocation":"","BBJackpot":null,"WagersID":47071870,"Status":0,"HitWagersID":0,"Credit":319064.6,"Credit_End":319352.6}
            
        // 天胡
        // {"BetTotal":10,"PayTotal":100,"Lines":[[{"ElementID":1,"GridNum":3,"Grids":[1,2,3],"Payoff":0,"BrickNum":0},{"ElementID":2,"GridNum":3,"Grids":[5,6,7],"Payoff":0,"BrickNum":0},{"ElementID":3,"GridNum":3,"Grids":[9,10,11],"Payoff":0,"BrickNum":0},{"ElementID":4,"GridNum":3,"Grids":[13,14,15],"Payoff":0,"BrickNum":0},{"ElementID":5,"GridNum":3,"Grids":[17,18,19],"Payoff":0,"BrickNum":0}]],"Cards":[[1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5]],"PayType":{"Type":[1,5,9],"TaiNum":[24,8,4],"EyeCard":1,"TotalTai":36,"WinCard":[2,2,2,3,3,3,4,4,4,5,5,5]},"AxisLocation":"","BBJackpot":null,"WagersID":0,"GambleTime":null,"Credit":0,"Credit_End":0}
        return data;
    }

    /**
     * 產生 beginGame Data
     * @param bet 注額
     * @returns beginGame Data
     */
    public static produceMockData(bet: number): any {

        if (!MockData.isFree) {
            MockData.credit -= bet;
        }

        MockData.sn++;

        let cardsPool: Array<number> = MockData.produceCardsPool();

        let arrPong:Array<number> = [];
        let arrKong:Array<number> = [];

        let payType: PayTypeData = {EyeCard: 0, TotalTai: 0, WinCard: null, Type: [], TaiNum: []};
        let mockData: any = {Cards: [], BetTotal: bet, PayTotal: 0, Lines: [], FreeGame: [], PayType: payType, Credit:  MockData.credit, Credit_End:  MockData.credit, WagersID: MockData.sn};
        let drawType: DrawType;
        let winScatter: boolean = false; // 中三張以上 scatter
        while (true) {
            let cards: Array<number>;
            if (mockData.Cards.length == 0) { // 第一盤
                cards = MockData.produceCards(cardsPool, 20);
            } else
            {
                let lastIndex: number = mockData.Cards.length - 1;
                let doFill: boolean = drawType == DrawType.NORMAL || drawType == DrawType.FLOWER || MockData.isFree;
                if (doFill) {
                    let freeGameDataGrids: Array<number> = [];
                    if (winScatter) {
                        freeGameDataGrids = mockData["FreeGame"][mockData["FreeGame"].length - 1]["Grids"];
                    }
                    cards = MockData.fillCards(cardsPool, mockData.Cards[lastIndex], mockData.Lines[lastIndex], freeGameDataGrids);
                } else {
                    cards = MockData.produceCards(cardsPool, 20);
                }
            }
            mockData.Cards.push(cards);

            let winningData : any = MockData.checkWinning(cards, arrPong, arrKong);
            let lines: any = winningData.Lines;
            let freeGame: any = winningData.FreeGame;
            let eyeCard: number = winningData.EyeCard;
            mockData.Lines.push(lines);
            drawType = winningData.DrawType;

            if (eyeCard > 0) {
                // just for test!
                mockData.PayType = {"Type":[1,5,9],"TaiNum":[24,8,4],"EyeCard":eyeCard,"TotalTai":36,"WinCard":[2,2,2,3,3,3,4,4,4,5,5,5]};
            }

            winScatter = false;
            if (freeGame) {
                let freeGameData: FreeGameData = {
                    HitFree: true,
                    ElementID: 43,
                    GridNum: freeGame["Grids"].length, 
                    FreeGameTime: freeGame["FreeGameTime"],
                    Round: mockData.Cards.length,
                    Grids: freeGame["Grids"]
                };
                mockData["FreeGame"].push(freeGameData);

                MockData.freeGameTime += freeGame["FreeGameTime"];
                winScatter = true;
            }

            if ((lines.length == 0 && !freeGame) || winningData.Winning) { // 此局結束
                if (MockData.isFree) {
                    MockData.freeGameTime--;
                    mockData["FreeGameSpin"] = {FreeGameTime: MockData.freeGameTime, FreeGamePayoffTotal: 1000};
                    if (MockData.freeGameTime == 0) {
                        MockData.isFree = false;
                    }
                } else {
                    if (mockData["FreeGame"].length > 0) {
                        MockData.isFree = true;
                    }
                }
                break;
            }
        }

        // 派彩假資料
        let multiplier: number = arrPong.length + arrKong.length;
        if (multiplier > 0) {
            mockData.PayTotal = Number((mockData.BetTotal * (multiplier * 30 * Math.random())).toFixed(2));
            MockData.credit += mockData.PayTotal;
        }

        if (mockData["FreeGameSpin"]) {
            mockData.BetTotal = 0;
        }

        mockData.Credit_End = MockData.credit;

        return mockData;
    }

    /**
     * 產生牌池
     * @returns 遊戲中所有牌
     */
    private static produceCardsPool(): Array<number> {
        let scatterAmount: number = 6;
        let cardsPool: Array<number> = [];
        for (let i:number = 1; i <= MockData.lastElementID; i++) {
            if (i < MockData.flowerElementIDRange[0]) { // 萬筒條東南西北中發白
                for (let j:number = 0; j < 4; j++) {
                    cardsPool.push(i);
                }
            } else if (i == MockData.freeElementID) { // free
                for (let j:number = 0; j < scatterAmount; j++) {
                    cardsPool.push(i);
                }
            } else { // 花
                cardsPool.push(i);
            }
        }
        return cardsPool;
    }

    /**
     * 經由牌池隨機產生牌
     * @param cardsPool 牌池
     * @param amount 張數
     * @returns 隨機產生特定張數的牌
     */
    private static produceCards(cardsPool: Array<number>, amount: number): Array<number> {

        let cards: Array<number> = [];
        for (let i:number = 0; i < amount; i++) {
            let index: number = Math.floor(Math.random() * cardsPool.length);
            cards.push(cardsPool.splice(index, 1)[0]);
        }
        return cards;
    }

    /**
     * 補牌(前一盤僅有花 或是 free game)
     * @param cardsPool 牌池
     * @param lastCards 上一盤的牌
     * @param lastLines 上一盤中線
     * @param lastLines 上一盤中 Free Game
     * @returns 下一盤的牌
     */
    private static fillCards(cardsPool: Array<number>, lastCards: Array<number>, lastLines: any, freeGameGrids: Array<number>): Array<number> {

        let arrWheelGrids: Array<Array<number>> = [[], [], [], [], []];
        let cards: Array<number> = [];

        let len :number = lastLines.length;
        for (let i:number = 0; i < len; i++) {
            let grids: Array<number> = lastLines[i]["Grids"];
            let gridsNum: number = lastLines[i]["GridNum"];
            for (let j:number = 0; j < gridsNum; j++) {
                let wheelID: number = Math.floor((grids[j] - 1) / MockData.elementAmountPerWheel);
                let indexInWheel: number = (grids[j] - 1) % MockData.elementAmountPerWheel;
                arrWheelGrids[wheelID].push(indexInWheel);
            }
        }

        let grids: Array<number> = freeGameGrids;
        let gridsNum: number = freeGameGrids.length;
        for (let j:number = 0; j < gridsNum; j++) {
            let wheelID: number = Math.floor((grids[j] - 1) / MockData.elementAmountPerWheel);
            let indexInWheel: number = (grids[j] - 1) % MockData.elementAmountPerWheel;
            arrWheelGrids[wheelID].push(indexInWheel);
        }

        len = arrWheelGrids.length;
        for (let i:number = 0; i < len; i++) {
            let newCards: Array<number> = lastCards.slice(i*4, (i+1)*4);
            arrWheelGrids[i].sort((a, b) => b - a);
            arrWheelGrids[i].forEach(index => {
                newCards.splice(index, 1);
            });

            while(newCards.length < MockData.elementAmountPerWheel) {
                let indexInCardsPool: number = Math.floor(Math.random() * cardsPool.length);
                newCards.unshift(cardsPool.splice(indexInCardsPool, 1)[0]);
            }

            cards = cards.concat(newCards);
        }
        return cards;
    }

    /**
     * 確認中獎資料
     * @param cards 牌
     * @param arrPong 目前碰牌
     * @param arrKong 目前聽牌
     * @returns 中獎資料
     */
    private static checkWinning(cards: Array<number>, arrPong:Array<number>, arrKong:Array<number>): any {

        let freeCollection: Array<number> = [];
        let flowerCollection: any = {};
        let otherCollection: any = {};

        let drawType: DrawType = DrawType.NONE;
        let pair:any;
        let winning: boolean = false;

        let freeGameData: any;

        let eyeCard: number = 0;

        let len: number = cards.length;
        for (let i:number = 0; i < len; i++) {
            if (cards[i] == MockData.freeElementID) { // free
                freeCollection.push(i + 1);
            } else if (cards[i] >= MockData.flowerElementIDRange[0]) { // 花
                if (flowerCollection[cards[i]]) {
                    flowerCollection[cards[i]].push(i + 1);
                } else {
                    flowerCollection[cards[i]] = [i + 1];
                }
            } else { // 萬筒條東南西北中發白
                if (otherCollection[cards[i]]) {
                    otherCollection[cards[i]].push(i + 1);
                } else {
                    otherCollection[cards[i]] = [i + 1];
                }
            }
        }

        let lines: Array<any> = [];
        let appendlines: Array<any> = [];

        let kongIsRegardedOfPong: Array<number> = []; // 蒐集槓的 line index
        for (let i in otherCollection) { // 萬筒條東南西北中發白 是否有 碰、槓或眼
            if (otherCollection[i].length >= 3) {
                drawType = DrawType.FLUSH;
                if (otherCollection[i].length == 4) { // 槓
                    kongIsRegardedOfPong.push(lines.length);
                    lines.push({ElementID: i, GridNum: 4, Grids: otherCollection[i], Payoff: 400});
                } else if (otherCollection[i].length == 3) { // 碰
                    lines.push({ElementID: i, GridNum: 3, Grids: otherCollection[i], Payoff: 300});
                }
            } else if (otherCollection[i].length == 1) {
                let len: number = arrPong.length;
                for (let j:number = 0; j < len; j++) {
                    if (Number(i) == arrPong[j]) { // 碰變成槓
                        appendlines.push({ElementID: i, GridNum: 1, Grids: otherCollection[i], Payoff: 400});
                    }
                }
            } else if (otherCollection[i].length == 2 && !pair) { // 眼
                pair = {ElementID: i, GridNum: 2, Grids: otherCollection[i], Payoff: 0};
            }
        }

        if (arrPong.length + arrKong.length + lines.length > 4) { // 胡
            winning = true;

            // just for test, randomly choose one to be pare
            eyeCard = (arrPong.length > 0)? arrPong[0]:arrKong[0];
        } else if (arrPong.length + arrKong.length + lines.length == 4) { // 聽
            if (pair) { // 胡
                eyeCard = pair.ElementID;
                winning = true;
            }
        }

        if (winning) {
            // 胡牌後將槓牌作為碰牌
            let len: number = kongIsRegardedOfPong.length;
            for (let i:number = 0; i < len; i++) {
                let index: number = kongIsRegardedOfPong[i];
                lines[index]["GridNum"] = 3;
                lines[index]["Grids"].length = 3;
            }

            len = lines.length;
            let lineData: any;
            for (let i:number = 0; i < len; i++) {
                lineData = lines[i];
                if (lineData["GridNum"] == 4) { // 槓
                    arrKong.push(Number(lineData["ElementID"]));
                } else if (lineData["GridNum"] == 3) { // 碰
                    arrPong.push(Number(lineData["ElementID"]));
                }
            }

            if (freeCollection.length >= 3) { // 中 Free Game
                freeGameData = {FreeGameTime: 8, Grids: freeCollection};
            }
        } else { // 沒有胡才能做以下動作
            let flowerlines: Array<any> = [];
            for (let i in flowerCollection) {
                flowerlines.push({ElementID: i, GridNum: flowerCollection[i].length, Grids: flowerCollection[i], Payoff: 0});
            }

            if (flowerlines.length > 0) { // 此局有花
                lines = flowerlines;
                drawType = DrawType.FLOWER;
            } else {
                let len: number = appendlines.length;
                let lineData: any;
                for (let i:number = 0; i < len; i++) {
                    lineData = appendlines[i];

                    let pongLen: number = arrPong.length;
                    for (let j:number = 0; j < pongLen; j++) {
                        let elementID: number = Number(lineData["ElementID"]);
                        if (elementID == arrPong[j]) { // 碰變成槓
                            arrPong.splice(j, 1);
                            arrKong.push(elementID);
                        }
                    }
                }

                len = lines.length;
                for (let i:number = 0; i < len; i++) {
                    lineData = lines[i];
                    if (lineData["GridNum"] == 4) { // 槓
                        arrKong.push(Number(lineData["ElementID"]));
                    } else if (lineData["GridNum"] == 3) { // 碰
                        arrPong.push(Number(lineData["ElementID"]));
                    }
                }

                lines = lines.concat(appendlines); // 補槓

                if (freeCollection.length >= 3) { // 中 Free Game
                    freeGameData = {FreeGameTime: 8, Grids: freeCollection};
                }

                if (drawType == DrawType.NONE && (lines.length > 0 || freeGameData)) {
                    drawType = DrawType.NORMAL;
                }
            }
        }

        return {Lines: lines, DrawType: drawType, Winning: winning, FreeGame: freeGameData, EyeCard: eyeCard};
    }
}

enum DrawType {
    NONE = "none", // 不進行補牌
    FLOWER = "flower", // 花牌補牌
    NORMAL = "normal", // 場上僅有 補槓牌、 scatter 中獎時 或 free game 進行中，進行空位填牌
    FLUSH = "flush", // main game 時，4張一樣槓牌 或是 碰牌，進行全刷補牌
}