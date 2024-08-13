import { _decorator, Component, resources, JsonAsset, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

interface PathData {
    pos: number[][];
    rotate: number[][];
    diceNumber: number[];
}

//一回合的資料
export class awardGroup {
    public firstPos: number[] = [];//起始3骰子位置(9組數字)
    public firstRotate: number[] = [];//起始3骰子旋轉(12組數字)
    public diceEuler: Vec3[] = [];//起始骰子角度
    public pathID: number = 100;//路徑ID
    public winNumber: number[] = [];//勝利3顏色編號
}

@ccclass('ColorGameDemoData')
export class ColorGameDemoData extends Component {
    //***************仿gameInfo的腳本 ****************/
    // public antes: number[] = [10, 20, 50, 100, 200];
    /**押注的antes索引 */
    // public nowBetIndex = 0;
    /**每局下注金額 */
    // public betScore: number = 100;
    /**遊戲demo幾局 */
    public demoRound: number = 100;
    private rounder: number = -1;//表演中的回合
    /**遊戲開獎表演資料*/
    private roundDatas: Array<awardGroup> = [];
    public roundData: awardGroup;//目前回合資料

    public pathData: PathData[] = [];//路徑資料

    onLoad() {
        // 讀取 JSON 文件
        resources.load("colorGamePathData/ColorGamePath", JsonAsset, (err, jsonAsset) => {
            if (err) {
                console.error(err);
                return;
            }
            // 獲取json資料
            for (let i = 0; i < jsonAsset.json.length; i++) {
                this.pathData[i] = jsonAsset.json[i];
            }
            this.setRoundData();//設置回合表演資料
        });
    }

    public setDemoRound() {
        this.rounder++;//回合+1
        this.roundData = this.roundDatas[this.rounder];//設置回合表演內容
        console.log("後端資料", this.roundData)
    }

    //設置回合表演資料
    private setRoundData() {
        //模擬後端生成表演資料
        for (let i = 0; i < this.demoRound; i++) {
            const awardGroupData: awardGroup = new awardGroup();//本局參數
            awardGroupData.pathID = Math.floor(Math.random() * 1000);
            awardGroupData.firstPos = this.pathData[awardGroupData.pathID].pos[0];//起始位置
            awardGroupData.firstRotate = this.pathData[awardGroupData.pathID].rotate[0];//起始旋轉
            awardGroupData.winNumber = this.randomNumber();
            awardGroupData.diceEuler = this.diceRotate(awardGroupData.pathID, awardGroupData.winNumber);//起始骰子角度
            console.log("轉換的角度", awardGroupData.diceEuler)
            this.roundDatas.push(awardGroupData);//設置一般遊戲中獎表演資料
        }
        console.log("後端所有資料", this.roundDatas)
        // this.setDemoRound();
    }

    //模擬後端路徑與開獎三顏色之骰子校正旋轉值(路徑id，勝利的三顏色編號)，回傳3個子物件的旋轉值
    private diceRotate(id: number, winNumber: number[]) {
        const pathEndColor = this.pathData[id].diceNumber
        const changeEuler = [
            [new Vec3(0, 0, 0), new Vec3(-90, 0, 0), new Vec3(0, 0, 90), new Vec3(0, 0, -90), new Vec3(90, 0, 0), new Vec3(180, 0, 0)],
            [new Vec3(90, 0, 0), new Vec3(0, 0, 0), new Vec3(0, -90, 0), new Vec3(0, 90, 0), new Vec3(0, 180, 0), new Vec3(-90, 0, 0)],
            [new Vec3(0, 0, -90), new Vec3(0, 90, 0), new Vec3(0, 0, 0), new Vec3(0, 180, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 90)],
            [new Vec3(0, 0, 90), new Vec3(0, -90, 0), new Vec3(0, 180, 0), new Vec3(0, 0, 0), new Vec3(0, 90, 0), new Vec3(0, 0, -90)],
            [new Vec3(-90, 0, 0), new Vec3(0, 180, 0), new Vec3(0, 90, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 0), new Vec3(90, 0, 0)],
            [new Vec3(180, 0, 0), new Vec3(90, 0, 0), new Vec3(0, 0, -90), new Vec3(0, 0, 90), new Vec3(-90, 0, 0), new Vec3(0, 0, 0)]
        ]
        return [
            changeEuler[pathEndColor[0]][winNumber[0]],
            changeEuler[pathEndColor[1]][winNumber[1]],
            changeEuler[pathEndColor[2]][winNumber[2]]
        ]
    }

    private randomNumber() {
        const number1 = Math.floor(Math.random() * 6);
        const number2 = Math.floor(Math.random() * 6);
        const number3 = Math.floor(Math.random() * 6);
        return [number1, number2, number3];
    }
}