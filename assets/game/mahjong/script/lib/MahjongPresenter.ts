import { MahjongView } from "../components/MahjongView";
import { BasePresenter } from "./BasePresenter";
import { MahjongDataModel, MahjongModel } from "./MahjongModel";

export class MahjongPresenter extends BasePresenter {

    get diceNum() {
        return (<MahjongDataModel>this.model.dataModel).diceNum;
    }

    get myFlowerID() {
        return (<MahjongDataModel>this.model.dataModel).myFlowerID;
    }

    get payRate() {
        return (<MahjongDataModel>this.model.dataModel).payRate;
    }

    get taiNum() {
        return (<MahjongDataModel>this.model.dataModel).taiNum;
    }

    constructor(model: MahjongModel, view: MahjongView) {
        super(model, view);
    }

}