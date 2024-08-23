import { _decorator, Component, resources, JsonAsset, Vec3, find, Label, Animation, UITransform } from 'cc';
import { ColorGameMain } from './ColorGameMain';
const { ccclass, property } = _decorator;

interface PathData {
    pos: number[][];
    rotate: number[][];
    diceNumber: number[];
}

//新局資料
export class awardGroup {
    public firstPos: number[] = [];//起始3骰子位置(9組數字)
    public firstRotate: number[] = [];//起始3骰子旋轉(12組數字)
    public diceEuler: Vec3[] = [];//起始骰子角度(******新局開始前會先跟後端要的資料******)
    public pathID: number = 100;//路徑ID
    public winNumber: number[] = [];//勝利3顏色編號
}
//每0.1秒傳送資料
export class timeData {
    public gameState: number = 0;//下注中，開獎中
    public betAreaPlayer: number[] = [0, 0, 0, 0, 0, 0];//目前各下注區的人數
    public betAreaTotal: number[] = [0, 0, 0, 0, 0, 0];//目前各下注區的總金額
    public roundTime: number[] = [0, 0, 0, 0, 0, 0];//目前各下注區的總金額
}

//開獎資料

//模擬後端給的資料

@ccclass('ColorGameData')
export class ColorGameData extends Component {
    public betAreaPercent: number[] = [0, 0, 0, 0, 0, 0];//各下注區分數百分比(前端計算)
    public betCreditRange: number[] = [10, 20, 50, 100, 200];
    public selectChipID: number = 1;//目前選擇的籌碼
    public localCredit: number = 250000;//本地玩家分數
    public localBetTotal: number = 0;//本地玩家下注總分
    public localWinCredit: number = 0;//本地玩家贏得分數
    // public betAreaPlayer: number[] = [0, 0, 0, 0, 0, 0];//各下注區人數
    //各下注區總分

    public colorPer: number[] = [0, 0, 0, 0, 0, 0];//100局顏色比例
    public chipSet: number[] = [0, 1, 2, 3, 4];//玩家配置的籌碼ID
    private gameMain: ColorGameMain = null;
    public betCreditValue: number[] = [0, 0, 0, 0, 0, 0];//目前玩家下注籌碼分數(注區)
    //***************仿gameInfo的腳本 ****************/
    // public antes: number[] = [10, 20, 50, 100, 200];
    /**押注的antes索引 */
    // public nowBetIndex = 0;
    /**每局下注金額 */
    // public betCredit: number = 100;
    /**遊戲demo幾局 */
    // public demoRound: number = 100;
    // private rounder: number = -1;//表演中的回合
    /**遊戲開獎表演資料*/
    // private roundDatas: Array<awardGroup> = [];
    public roundData: awardGroup;//目前回合資料
    /**遊戲前一百局資料*/
    public colorRoad: number[][] = [];
    // public colorPer: number[] = [0, 0, 0, 0, 0, 0];//前100局顏色比例


    public pathData: PathData[] = [];//路徑資料

    onLoad() {

        //生成100局資料(模擬用)
        for (let i = 0; i < 100; i++) {
            this.colorRoad.push([Math.floor(Math.random() * 6), Math.floor(Math.random() * 6), Math.floor(Math.random() * 6)]);
        }
        this.gameMain = find('Canvas/Scripts/ColorGameMain').getComponent(ColorGameMain);
        this.gameMain.comBtnCredits.getChildByName('Label').getComponent(Label).string = this.numberSpecification(this.localCredit);
    }

    //初始化分數(新局)
    public resetValue() {
        this.localBetTotal = 0;
        this.gameMain.comBtnBet.getChildByName('Label').getComponent(Label).string = this.numberSpecification(this.localBetTotal);
        this.localWinCredit = 0;
        // this.otherPlayerWinCredit = [0, 0, 0];
        this.betCreditValue = [0, 0, 0, 0, 0, 0];
    }
    //更新注區資訊(下注區,下注人,下注分數)
    public updataBetInfo(betId: number, playerId: number, score: number) {
        if (playerId === 0) {
            this.localBetTotal += score;
            this.gameMain.comBtnBet.getChildByName('Label').getComponent(Label).string = this.numberSpecification(this.localBetTotal);
            this.gameMain.comBtnBet.getComponent(Animation).play();
            this.localCredit -= score;
            this.gameMain.comBtnCredits.getChildByName('Label').getComponent(Label).string = this.numberSpecification(this.localCredit);
        }
        // this.betAreaTotal[betId] += score;
        //更新注區比例
    }
    //接收SelectChip按鈕事件
    // public setSelectChipID(event: Event, id: number) {
    //     this.selectChipID = id;
    // }

    // //更新下注區域分數比例
    // public updataBetAreaPrecent() {
    //     let total = 0;
    //     for (let i = 0; i < this.betAreaTotal.length; i++) {
    //         total += this.betAreaTotal[i];
    //     }
    //     for (let i = 0; i < this.betAreaTotal.length; i++) {
    //         this.betAreaPercent[i] = this.betAreaTotal[i] / total * 100;
    //         this.gameMain.betInfo.getChildByName('Percent').getChildByName('Label').getComponent(Label).string = this.betAreaPercent[i].toFixed(2) + '%';
    //         this.gameMain.betInfo.getChildByName('PercentBar').getComponent(UITransform).width = this.betAreaPercent[i];
    //     }
    // }


    //模擬每秒接收的資料數據


    public loadPathJson(callback: any) {
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
            callback();
        });
    }

    // public setDemoRound() {
    //     this.rounder++;//回合+1
    //     this.roundData = this.roundDatas[this.rounder];//設置回合表演內容
    //     console.log("後端資料", this.roundData)
    // }

    //獲取回合表演資料
    public getRoundData(callback?: any) {
        //模擬後端生成表演資料
        // for (let i = 0; i < this.demoRound; i++) {
        const awardGroupData: awardGroup = new awardGroup();//本局參數
        awardGroupData.pathID = Math.floor(Math.random() * 1000);
        awardGroupData.firstPos = this.pathData[awardGroupData.pathID].pos[0];//起始位置
        awardGroupData.firstRotate = this.pathData[awardGroupData.pathID].rotate[0];//起始旋轉
        awardGroupData.winNumber = this.randomNumber();
        awardGroupData.diceEuler = this.diceRotate(awardGroupData.pathID, awardGroupData.winNumber);//起始骰子角度
        this.roundData = awardGroupData;
        callback();
        // console.log("轉換的角度", awardGroupData.diceEuler)
        // this.roundDatas.push(awardGroupData);//設置一般遊戲中獎表演資料
        // }
        // console.log("後端所有資料", this.roundDatas)
        // this.setDemoRound();
    }

    // public updataColorRoad() {
    //     this.colorRoad.pop();
    //     this.colorRoad.unshift(this.roundData.winNumber);
    // }

    public getColorPer() {
        let color = [0, 0, 0, 0, 0, 0];
        for (let i = 0; i < this.colorRoad.length; i++) {
            color[this.colorRoad[i][0]]++;
            color[this.colorRoad[i][1]]++;
            color[this.colorRoad[i][2]]++;
        }
        for (let i = 0; i < this.colorPer.length; i++) {
            this.colorPer[i] = color[i] / 3;//設置顏色百分比
        }
        return this.colorPer;
        // callback();
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

    /**規格化數值(取小數點後2位)*/
    private numberSpecification(num: number): string {
        return num.toLocaleString('zh', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
    }
}