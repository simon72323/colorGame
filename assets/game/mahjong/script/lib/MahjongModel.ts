import { onLoadInfo } from "../include";
import { BaseDataModel } from "./BaseDataModel";
import { BaseModel } from "./BaseModel";

/**
 * 資料Model模型
 */
export class MahjongModel extends BaseModel {

    constructor() {
        super();
    }

    // Event: 遊戲資訊
    protected onLoadInfo(data: onLoadInfo): void {
        if (data) {
            (<MahjongDataModel>this.dataModel).diceNum = data["DiceNum"];

            let count: number = 0;
            let len: number = data["DiceNum"].length;
            for (let i:number = 0; i < len; i++) {
                count += data["DiceNum"][i];
            }
            (<MahjongDataModel>this.dataModel).myFlowerID = data["FlowerDice"][count];

            (<MahjongDataModel>this.dataModel).payRate = data["PayRate"];

            (<MahjongDataModel>this.dataModel).taiNum = data["TaiNum"];
        }


        super.onLoadInfo(data);
    }

    // 初始化資料
    protected initDataModel(): MahjongDataModel {
        return new MahjongDataModel();
    }

}

export class MahjongDataModel extends BaseDataModel {
    diceNum = []; // 本花對應骰子點數
    myFlowerID = []; // 本花 ID
    payRate = []; // 賠率表
    taiNum = []; // 胡牌 ID 對應台數
}