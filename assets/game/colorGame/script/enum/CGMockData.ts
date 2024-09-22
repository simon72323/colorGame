import { onBeginGame } from "./RAInterface";

export class beginGameData{
  private static _instance: beginGameData;

  private constructor(){};

  public static get Instance(){
    return this._instance || (this._instance = new this());
  }

  private index: number = -1;

  private data: onBeginGame[] = [
    {"data":
      {"PayTotal":2340,
        "Lines":[
          [{"GridNum":4,"Grids":[3,5,10,15],"Payoff":30,"Element":[9,18,18,9],"ElementID":9,"DoubleTime":1},
          {"GridNum":4,"Grids":[3,5,12,15],"Payoff":30,"Element":[9,18,18,9],"ElementID":9,"DoubleTime":1}],
          
          [{"GridNum":3,"Grids":[1,5,10],"Payoff":20,"Element":[7,0,0],"ElementID":7,"DoubleTime":2},
          {"GridNum":3,"Grids":[1,5,12],"Payoff":20,"Element":[7,0,0],"ElementID":7,"DoubleTime":2},
          {"GridNum":3,"Grids":[1,7,10],"Payoff":20,"Element":[7,7,0],"ElementID":7,"DoubleTime":2},
          {"GridNum":3,"Grids":[1,7,12],"Payoff":20,"Element":[7,7,0],"ElementID":7,"DoubleTime":2},
          {"GridNum":3,"Grids":[2,5,10],"Payoff":20,"Element":[7,0,0],"ElementID":7,"DoubleTime":2},
          {"GridNum":3,"Grids":[2,5,12],"Payoff":20,"Element":[7,0,0],"ElementID":7,"DoubleTime":2},
          {"GridNum":3,"Grids":[2,7,10],"Payoff":20,"Element":[7,7,0],"ElementID":7,"DoubleTime":2},
          {"GridNum":3,"Grids":[2,7,12],"Payoff":20,"Element":[7,7,0],"ElementID":7,"DoubleTime":2},
          {"GridNum":3,"Grids":[3,5,10],"Payoff":20,"Element":[7,0,0],"ElementID":7,"DoubleTime":2},
          {"GridNum":3,"Grids":[3,5,12],"Payoff":20,"Element":[7,0,0],"ElementID":7,"DoubleTime":2},
          {"GridNum":3,"Grids":[3,7,10],"Payoff":20,"Element":[7,7,0],"ElementID":7,"DoubleTime":2},
          {"GridNum":3,"Grids":[3,7,12],"Payoff":20,"Element":[7,7,0],"ElementID":7,"DoubleTime":2},
          {"GridNum":5,"Grids":[4,5,10,14,18],"Payoff":300,"Element":[4,0,0,4,4],"ElementID":4,"DoubleTime":2},
          {"GridNum":5,"Grids":[4,5,11,14,18],"Payoff":300,"Element":[4,0,4,4,4],"ElementID":4,"DoubleTime":2},
          {"GridNum":5,"Grids":[4,5,12,14,18],"Payoff":300,"Element":[4,0,0,4,4],"ElementID":4,"DoubleTime":2}],
          []],
          
          "Cards":[
            [[7,7,9,4],[18,6,7,6],[17,18,4,18],[2,4,9,8],[3,4,5,6]],
            [[7,7,7,4],[0,6,7,6],[17,0,4,0],[2,4,8,8],[3,4,5,6]],
            [[4,7,1,4],[1,6,3,6],[17,1,4,9],[2,7,8,8],[3,5,5,6]]
          ],
          "Scatter":{"ID":1,"GridNum":3,"Grids":[3,5,10]},
          "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
          "FreeGameSpin":{"FreeGameTime":0,"FreeGamePayoffTotal":0,"WagersID":0},
          "RollerNumber":0,
          "BBJackpot":{"Pools":null},
          "WagersID":47378797,
          "Credit":49000,
          "Credit_End":51340,
          "Status":0,
          "HitWagersID":0,
          "RedWild":[[],[],[]],
          "GreenWild":[[],[{"ID":0,"GridsNum":3,"Grids":[5,10,12]}],[]],
          "Accumulate":[[60],[2340],[2340]]
        },"event":true}
    // 中scatter
    // {"event":true,
    //   "data":{
    //     "PayTotal":0,
    //     "Lines":[[]],
    //     "RedWild":[[]],
    //     "GreenWild":[[]],
    //     "Cards":[[[24,26,27,24],[22,33,31,20],[27,10,26,34],[25,24,10,32],[27,26,10,26]]],
    //     "Scatter":{"ID":10,"GridNum":3,"Grids":[10,15,19]},
    //     "FreeGame":{"HitFree":true,"ID":10,"FreeGameTime":12,"FreeGamePayoffTotal":0},
    //     "FreeGameSpin":{"FreeGameTime":0,"FreeGamePayoffTotal":0,"WagersID":0},
    //     "RollerNumber":0,
    //     "BBJackpot":{"Pools":null},
    //     "WagersID":47369340,
    //     "Credit":1154.2,
    //     "Credit_End":1154.2,
    //     "AxisLocation":"47-125-138-41-15",
    //     "Status":1,
    //     "HitWagersID":0
    //   }},
    // 免費第1筆
    // {"event":true,
    //   "data":{
    //     "PayTotal":0,
    //     "Lines":[[]],
    //     "RedWild":[[]],
    //     "GreenWild":[[]],
    //     "Cards":[[[25,23,27,23],[30,32,24,23],[34,27,20,26],[22,25,25,27],[26,27,22,26]]],
    //     "Scatter":{"ID":0,"GridNum":0,"Grids":null},
    //     "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
    //     "FreeGameSpin":{"FreeGameTime":11,"FreeGamePayoffTotal":0,"WagersID":47369340},
    //     "RollerNumber":1,
    //     "BBJackpot":{"Pools":null},
    //     "WagersID":47369341,
    //     "Credit":1154.2,
    //     "Credit_End":1154.2,
    //     "AxisLocation":"17-74-46-25-115",
    //     "Status":3,"HitWagersID":47369340
    //   }},
    // 免費第2筆
    // {"event":true,
    //   "data":{
    //     "PayTotal":36,
    //     "Lines":[
    //       [{"GridNum":4,"Grids":[1,5,12,15],"Payoff":2,"Element":[22,22,30,22],"ElementID":22,"DoubleTime":2}],
    //       [{"GridNum":5,"Grids":[1,5,12,15,18],"Payoff":4,"Element":[23,23,1,23,23],"ElementID":23,"DoubleTime":4},{"GridNum":5,"Grids":[1,7,12,15,18],"Payoff":4,"Element":[23,23,1,23,23],"ElementID":23,"DoubleTime":4}],
    //       []],
    //       "RedWild":[[],[]],
    //       "GreenWild":[[{"ID":2,"GridsNum":1,"Grids":[12]}], []],
    //       "Cards":[
    //         [[22,26,27,24],[22,25,23,20],[27,26,27,30],[25,23,22,24],[26,23,26,20]],
    //         [[23,26,27,24],[23,25,23,20],[27,26,27,2],[22,25,23,24],[26,23,26,20]],
    //         [[26,26,27,24],[25,22,25,20],[26,27,26,27],[25,22,25,24],[20,26,26,20]]
    //       ],
    //       "Scatter":{"ID":0,"GridNum":0,"Grids":null},
    //       "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
    //       "FreeGameSpin":{"FreeGameTime":10,"FreeGamePayoffTotal":36,"WagersID":47369340},
    //       "RollerNumber":1,
    //       "BBJackpot":{"Pools":null},
    //       "WagersID":47369342,
    //       "Credit":1154.2,
    //       "Credit_End":1190.2,
    //       "AxisLocation":"28-64-57-53-131",
    //       "Status":3,
    //       "HitWagersID":47369340
    //   }},
    // 免費第3筆
    // {"event":true,
    //   "data":{
    //     "PayTotal":0,
    //     "Lines":[[]],
    //     "RedWild":[[]],
    //     "GreenWild":[[]],
    //     "Cards":[[[27,23,26,27],[23,29,25,23],[27,20,26,33],[24,20,24,23],[23,22,26,20]]],
    //     "Scatter":{"ID":0,"GridNum":0,"Grids":null},
    //       "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
    //       "FreeGameSpin":{"FreeGameTime":9,"FreeGamePayoffTotal":36,"WagersID":47369340},
    //       "RollerNumber":1,
    //       "BBJackpot":{"Pools":null},
    //       "WagersID":47369343,
    //       "Credit":1190.2,
    //       "Credit_End":1190.2,
    //       "AxisLocation":"19-77-126-144-77",
    //       "Status":3,
    //       "HitWagersID":47369340
    //     }},
    // 免費第4筆
    // {"event":true,
    //   "data":{
    //     "PayTotal":1.6,
    //     "Lines":[
    //       [{"GridNum":3,"Grids":[3,5,12],"Payoff":0.4,"Element":[24,24,24],"ElementID":24,"DoubleTime":2},
    //       {"GridNum":3,"Grids":[3,7,12],"Payoff":0.4,"Element":[24,24,24],"ElementID":24,"DoubleTime":2}]
    //       ,[]
    //     ],
    //     "RedWild":[[],[]],
    //     "GreenWild":[[], []],
    //     "Cards":[
    //       [[27,10,24,21],[24,25,24,10],[30,27,26,24],[31,23,21,26],[27,20,26,27]],
    //       [[27,10,24,21],[33,31,25,10],[20,30,27,26],[31,23,21,26],[27,20,26,27]]
    //     ],
    //     "Scatter":{"ID":0,"GridNum":0,"Grids":null},
    //     "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
    //     "FreeGameSpin":{"FreeGameTime":8,"FreeGamePayoffTotal":37.6,"WagersID":47369340},
    //     "RollerNumber":1,
    //     "BBJackpot":{"Pools":null},
    //     "WagersID":47369345,
    //     "Credit":1190.2,
    //     "Credit_End":1191.8,
    //     "AxisLocation":"62-30-60-88-123",
    //     "Status":3,
    //     "HitWagersID":47369340
    //   }},
    // 免費第5筆
    // {"event":true,
    //   "data":{
    //     "PayTotal":0,
    //     "Lines":[[]],
    //     "RedWild":[[]],
    //     "GreenWild":[[]],
    //     "Cards":[[[26,27,24,22],[25,23,32,23],[27,34,27,21],[23,25,24,10],[27,20,26,27]]],
    //     "Scatter":{"ID":0,"GridNum":0,"Grids":null},
    //     "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
    //     "FreeGameSpin":{"FreeGameTime":7,"FreeGamePayoffTotal":37.6,"WagersID":47369340},
    //     "RollerNumber":1,
    //     "BBJackpot":{"Pools":null},
    //     "WagersID":47369346,
    //     "Credit":1191.8,
    //     "Credit_End":1191.8,
    //     "AxisLocation":"21-44-13-40-101",
    //     "Status":3,
    //     "HitWagersID":47369340
    //   }},
    // 免費第6筆
    // {"event":true,
    //   "data":{
    //     "PayTotal":0.8,
    //     "Lines":[[{"GridNum":3,"Grids":[1,8,12],"Payoff":0.2,"Element":[26,34,26],"ElementID":26,"DoubleTime":2},{"GridNum":3,"Grids":[3,8,12],"Payoff":0.2,"Element":[26,34,26],"ElementID":26,"DoubleTime":2}],[]],
    //     "RedWild":[[{"ID":1,"GridsNum":1,"Grids":[8],"MainGrid":8}]],
    //     "GreenWild":[[]],
    //     "Cards":[[[26,24,26,23],[25,20,25,34],[27,29,27,26],[25,23,27,25],[22,26,20,22]],[[20,24,24,23],[25,20,25,1],[27,27,29,27],[25,23,27,25],[22,26,20,22]]],
    //     "Scatter":{"ID":0,"GridNum":0,"Grids":null},
    //     "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
    //     "FreeGameSpin":{"FreeGameTime":6,"FreeGamePayoffTotal":38.4,"WagersID":47369340},
    //     "RollerNumber":1,
    //     "BBJackpot":{"Pools":null},
    //     "WagersID":47369347,
    //     "Credit":1191.8,
    //     "Credit_End":1192.6,
    //     "AxisLocation":"89-146-76-13-78",
    //     "Status":3,"HitWagersID":47369340
    //   }},
    // 免費第7筆
    // {"event":true,
    //   "data":{
    //     "PayTotal":0,
    //     "Lines":[[]],
    //     "RedWild":[[]],
    //     "GreenWild":[[]],
    //     "Cards":[[[27,21,26,24],[25,24,30,25],[21,27,26,27],[24,25,22,25],[21,26,21,20]]],
    //     "Scatter":{"ID":0,"GridNum":0,"Grids":null},
    //     "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
    //     "FreeGameSpin":{"FreeGameTime":5,"FreeGamePayoffTotal":38.4,"WagersID":47369340},
    //     "RollerNumber":1,
    //     "BBJackpot":{"Pools":null},
    //     "WagersID":47369348,
    //     "Credit":1192.6,
    //     "Credit_End":1192.6,
    //     "AxisLocation":"87-88-52-84-71",
    //     "Status":3,
    //     "HitWagersID":47369340
    //   }},
    // 免費第8筆
    // {"event":true,
    //   "data":{
    //     "PayTotal":15.4,
    //     "Lines":[
    //       [{"GridNum":4,"Grids":[2,7,11,13],"Payoff":1.5,"Element":[23,23,31,23],"ElementID":23,"DoubleTime":2}],
    //       [{"GridNum":3,"Grids":[2,5,11],"Payoff":0.4,"Element":[25,25,1],"ElementID":25,"DoubleTime":4},{"GridNum":3,"Grids":[2,8,11],"Payoff":0.4,"Element":[25,25,1],"ElementID":25,"DoubleTime":4},{"GridNum":3,"Grids":[3,5,11],"Payoff":0.4,"Element":[25,25,1],"ElementID":25,"DoubleTime":4},{"GridNum":3,"Grids":[3,8,11],"Payoff":0.4,"Element":[25,25,1],"ElementID":25,"DoubleTime":4}],
    //       [{"GridNum":4,"Grids":[4,5,10,14],"Payoff":1,"Element":[24,24,32,32],"ElementID":24,"DoubleTime":6}],[]],
    //     "RedWild":[[], [], [], []],
    //     "GreenWild":[[{"ID":2,"GridsNum":1,"Grids":[11]}] , [], [{"ID":2,"GridsNum":2,"Grids":[10,14]}], []],
    //     "Cards":[
    //       [[25,23,25,24],[25,22,23,25],[32,32,31,26],[23,32,27,21],[27,26,21,27]],
    //       [[26,25,25,24],[25,20,22,25],[32,32,2,26],[10,32,27,21],[27,26,21,27]],
    //       [[27,21,26,24],[24,10,20,22],[27,32,26,26],[10,32,27,21],[27,26,21,27]],
    //       [[23,27,21,26],[25,10,20,22],[27,2,26,26],[10,2,27,21],[27,26,21,27]]],
    //     "Scatter":{"ID":0,"GridNum":0,"Grids":null},
    //     "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
    //     "FreeGameSpin":{"FreeGameTime":4,"FreeGamePayoffTotal":53.8,"WagersID":47369340},
    //     "RollerNumber":1,
    //     "BBJackpot":{"Pools":null},
    //     "WagersID":47369349,
    //     "Credit":1192.6,
    //     "Credit_End":1208,
    //     "AxisLocation":"36-67-43-68-98",
    //     "Status":3,"HitWagersID":47369340
    //   }},
    // 免費第9筆
    // {"event":true,
    //   "data":{
    //     "PayTotal":0,
    //     "Lines":[[]],
    //     "RedWild":[[]],
    //     "GreenWild":[[]],
    //     "Cards":[[[24,21,25,21],[25,34,20,35],[26,27,10,27],[24,22,25,25],[26,27,25,26]]],
    //     "Scatter":{"ID":0,"GridNum":0,"Grids":null},
    //     "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
    //     "FreeGameSpin":{"FreeGameTime":3,"FreeGamePayoffTotal":53.8,"WagersID":47369340},
    //     "RollerNumber":1,
    //     "BBJackpot":{"Pools":null},
    //     "WagersID":47369350,
    //     "Credit":1208,
    //     "Credit_End":1208,
    //     "AxisLocation":"64-1-38-24-107",
    //     "Status":3,
    //     "HitWagersID":47369340
    //   }},
    // 免費第10筆
    // {"event":true,
    //   "data":{
    //     "PayTotal":4,
    //     "Lines":[[
    //       {"GridNum":4,"Grids":[2,5,12,13],"Payoff":1,"Element":[24,24,24,24],"ElementID":24,"DoubleTime":2},
    //       {"GridNum":4,"Grids":[2,8,12,13],"Payoff":1,"Element":[24,24,24,24],"ElementID":24,"DoubleTime":2}],[]],
    //     "RedWild":[[]],
    //     "GreenWild":[[]],
    //     "Cards":[
    //       [[27,24,27,21],[24,33,31,24],[27,20,33,24],[24,23,25,23],[22,27,22,27]],
    //       [[27,27,27,21],[20,22,33,31],[24,27,20,33],[22,23,25,23],[22,27,22,27]]],
    //     "Scatter":{"ID":0,"GridNum":0,"Grids":null},
    //     "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
    //     "FreeGameSpin":{"FreeGameTime":2,"FreeGamePayoffTotal":57.8,"WagersID":47369340},
    //     "RollerNumber":1,
    //     "BBJackpot":{"Pools":null},
    //     "WagersID":47369351,
    //     "Credit":1208,
    //     "Credit_End":1212,
    //     "AxisLocation":"49-136-142-118-12",
    //     "Status":3,
    //     "HitWagersID":47369340
    //   }},
    // 免費第11筆
    // {"event":true,
    //   "data":{
    //     "PayTotal":0,
    //     "Lines":[[]],
    //     "RedWild":[[]],
    //     "GreenWild":[[]],
    //     "Cards":[[[22,26,27,26],[24,20,25,22],[27,26,27,28],[25,24,24,25],[22,26,27,23]]],
    //     "Scatter":{"ID":0,"GridNum":0,"Grids":null},
    //     "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
    //     "FreeGameSpin":{"FreeGameTime":1,"FreeGamePayoffTotal":57.8,"WagersID":47369340},
    //     "RollerNumber":1,
    //     "BBJackpot":{"Pools":null},
    //     "WagersID":47369352,
    //     "Credit":1212,
    //     "Credit_End":1212,
    //     "AxisLocation":"12-107-53-82-66",
    //     "Status":3,
    //     "HitWagersID":47369340
    //   }},
    // 免費第12筆
    // {"event":true,
    //   "data":{
    //     "PayTotal":0,
    //     "Lines":[[]],
    //     "RedWild":[[]],
    //     "GreenWild":[[]],
    //     "Cards":[[[25,23,21,23],[23,24,25,24],[27,28,27,26],[10,25,34,23],[26,24,27,21]]],
    //     "Scatter":{"ID":0,"GridNum":0,"Grids":null},
    //     "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
    //     "FreeGameSpin":{"FreeGameTime":0,"FreeGamePayoffTotal":57.8,"WagersID":47369340},
    //     "RollerNumber":1,
    //     "BBJackpot":{"Pools":null},
    //     "WagersID":47369353,
    //     "Credit":1212,
    //     "Credit_End":1212,
    //     "AxisLocation":"2-118-55-98-24",
    //     "Status":3,
    //     "HitWagersID":47369340
    //   }}
  ]

  public getData():  onBeginGame{
    return this.data[this.addCount()];
  }

  private addCount(): number{
    if(this.index === (this.data.length - 1)){
      this.index = -1;
    }
    return this.index += 1;
  }

  
}

// export const onBeginGameData = {
//   "event":true,
//   "data":{
//     "PayTotal":10,
//     "Lines":[
//       [
//           {"GridNum":3,"Grids":[3,5,9],"Payoff":4,"Element":[25,33,33],"ElementID":25,"DoubleTime":1},
//           {"GridNum":3,"Grids":[3,5,10],"Payoff":4,"Element":[25,33,33],"ElementID":25,"DoubleTime":1},
//           {"GridNum":3,"Grids":[3,5,11],"Payoff":4,"Element":[25,33,33],"ElementID":25,"DoubleTime":1},
//           {"GridNum":3,"Grids":[3,6,9],"Payoff":4,"Element":[25,33,25],"ElementID":25,"DoubleTime":1},
//           {"GridNum":3,"Grids":[3,6,10],"Payoff":4,"Element":[25,33,25],"ElementID":25,"DoubleTime":1},
//           {"GridNum":3,"Grids":[3,6,11],"Payoff":4,"Element":[25,33,25],"ElementID":25,"DoubleTime":1}
//       ],[
//           {"GridNum":5,"Grids":[2,5,11,15,20],"Payoff":4,"Element":[22,2,22,22,22],"ElementID":22,"DoubleTime":1},
//           {"GridNum":5,"Grids":[2,6,11,15,20],"Payoff":4,"Element":[22,2,22,22,22],"ElementID":22,"DoubleTime":1},

//           {"GridNum":3,"Grids":[3,5,9],"Payoff":4,"Element":[20,2,20],"ElementID":20,"DoubleTime":1},
//           {"GridNum":3,"Grids":[3,5,12],"Payoff":4,"Element":[20,2,28],"ElementID":20,"DoubleTime":1},
//           {"GridNum":3,"Grids":[3,6,9],"Payoff":4,"Element":[20,2,20],"ElementID":20,"DoubleTime":1},
//           {"GridNum":3,"Grids":[3,6,12],"Payoff":4,"Element":[20,2,28],"ElementID":20,"DoubleTime":1}
//       ],[
//           {"GridNum":5,"Grids":[3,6,9,16,18],"Payoff":4,"Element":[23,23,23,1,1],"ElementID":23,"DoubleTime":1},
//           {"GridNum":5,"Grids":[3,6,9,16,19],"Payoff":4,"Element":[23,23,23,1,23],"ElementID":23,"DoubleTime":1},

//           {"GridNum":5,"Grids":[3,6,12,16,18],"Payoff":4,"Element":[23,23,1,1,1],"ElementID":23,"DoubleTime":1},
//           {"GridNum":5,"Grids":[3,6,12,16,19],"Payoff":4,"Element":[23,23,1,1,23],"ElementID":23,"DoubleTime":1},

//           {"GridNum":5,"Grids":[3,7,9,16,18],"Payoff":4,"Element":[23,23,23,1,1],"ElementID":23,"DoubleTime":1},
//           {"GridNum":5,"Grids":[3,7,9,16,19],"Payoff":4,"Element":[23,23,23,1,23],"ElementID":23,"DoubleTime":1},

//           {"GridNum":5,"Grids":[3,7,12,16,18],"Payoff":4,"Element":[23,23,1,1,1],"ElementID":23,"DoubleTime":1},
//           {"GridNum":5,"Grids":[3,7,12,16,19],"Payoff":4,"Element":[23,23,1,1,23],"ElementID":23,"DoubleTime":1}
//       ],[]
//     ],

//     "RedWild":[[],[{"ID":1,"GridsNum":3,"Grids":[12,16,18],"MainGrid":12}],[]],
//     "GreenWild":[[{"ID":2,"GridsNum":2,"Grids":[5,6]}],[],[]],
//     "Cards":[
//           [[26,22,25,24],[33,33,23,10],[25,25,25,31],[21,21,22,27],[21,25,23,22]],
//           [[26,22,23,24],[2,2,23,10],[23,27,22,31],[21,21,22,27],[21,25,23,22]],
//           [[26,20,23,24],[22,23,23,10],[23,27,21,1],[21,21,21,27],[21,25,23,20]],
//           [[26,20,22,24],[22,27,31,10],[23,27,21,26],[21,21,21,35],[21,21,23,23]]
//       ],
//     "Scatter":{"ID":0,"GridNum":0,"Grids":null},
//     "FreeGame":{"HitFree":false,"ID":0,"FreeGameTime":0,"FreeGamePayoffTotal":0},
//     "FreeGameSpin":{"FreeGameTime":0,"FreeGamePayoffTotal":0,"WagersID":0},
//     "RollerNumber":0,
//     "BBJackpot":{"Pools":null},"WagersID":39,"Credit":9960,"Credit_End":9970,"AxisLocation":"1-64-28-59-128","Status":0,"HitWagersID":0}
// }
