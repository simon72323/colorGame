export class CGDataService {
    private static readonly _instance: CGDataService = new CGDataService();

    public static getInstance(): CGDataService {
        return CGDataService._instance;
    }

    /**
     * 點選的籌碼ID
     */
    private _touchChipID: number = 1;
    public get touchChipID(): number {
        return this._touchChipID;
    }
    public set touchChipID(value: number) {
        this._touchChipID = value;
    }

    /**
     * 點選的籌碼位置ID
     */
    private _touchChipPosID: number = 1;
    public get touchChipPosID(): number {
        return this._touchChipPosID;
    }
    public set touchChipPosID(value: number) {
        this._touchChipPosID = value;
    }

    /**
     * 下注額度列表(固定值)
     */
    private _betCreditList: number[] = [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
    public get betCreditList(): number[] {
        return this._betCreditList;
    }
    public set betCreditList(value: number[]) {
        this._betCreditList = value;
    }

    /**
     * 下注限額
     */
    // private _limit: number = 70000;
    // public get limit(): number {
    //     return this._limit;
    // }
    // public set limit(value: number) {
    //     this._limit = value;
    // }
}