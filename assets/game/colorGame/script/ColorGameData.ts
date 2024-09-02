import { _decorator, Component, resources, JsonAsset, Vec3, find, Label, Animation, UITransform, Toggle, Sprite, assetManager, SpriteFrame } from 'cc';
// import { PahtData } from './path/PahtData';
import { ColorGameMain } from './ColorGameMain';

// import { ColorGameResource } from './ColorGameResource';
import { UtilsKitS } from '../../../common/script/lib/UtilsKitS';
const { ccclass, property } = _decorator;

//路徑資料
interface PathData {
    pos: number[][];
    rotate: number[][];
    diceNumber: number[];
}

//新局接收資料
// export class newRoundData {

// }
//每0.1秒接收資料
// export class timeData {

// }

//開獎資料
// export class awardData {

// }

//模擬後端給的資料

@ccclass('ColorGameData')
export class ColorGameData extends Component {
    public firstPos: number[] = [];//起始3骰子位置(9組數字)
    public firstRotate: number[] = [];//起始3骰子旋轉(12組數字)
    public diceEuler: Vec3[] = [];//起始骰子角度(******新局開始前會先跟後端要的資料******)
    public pathID: number = 100;//路徑ID
    public winNumber: number[] = [];//勝利3顏色編號

    public gameState: number = 0;//0=下注中，1=開獎中
    // public betAreaPlayer: number[] = [0, 0, 0, 0, 0, 0];//目前各下注區的人數
    public betAreaTotal: number[] = [0, 0, 0, 0, 0, 0];//目前各下注區的總金額
    public roundTime: number = 12;//回合時間

    public betAreaPercent: number[] = [0, 0, 0, 0, 0, 0];//各下注區分數百分比(前端計算)
    public betScoreRange: number[] = [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
    public selectChipID: number = 1;//目前選擇的籌碼
    public chipSetID: number[] = [0, 1, 2, 3, 4];//玩家配置的籌碼ID
    public localScore: number = 250000;//本地玩家分數
    public localBetTotal: number = 0;//本地玩家下注總分
    public localWinScore: number = 0;//本地玩家贏得分數
    public otherPlayerScore: number[] = [0, 0, 0];//前三名玩家分數
    public limit: number = 2000;//投注限額

    //各下注區總分
    public colorPer: number[] = [0, 0, 0, 0, 0, 0];//100局顏色比例
    // public chipSet: number[] = [0, 1, 2, 3, 4];//玩家配置的籌碼ID數量
    public localBetScore: number[] = [0, 0, 0, 0, 0, 0];//目前玩家下注籌碼分數(注區)

    /**遊戲前一百局資料*/
    public colorRoad: number[][] = [];
    // public colorPer: number[] = [0, 0, 0, 0, 0, 0];//前100局顏色比例
    public pathData: PathData[] = [];//路徑資料

    public gameMain: ColorGameMain = null;

    // public gameResource: ColorGameResource = null;

    private numberShow = [0, 0, 0, 0, 0, 0];//開獎點數

    onLoad() {
        this.gameMain = find('Canvas/Scripts/ColorGameMain').getComponent(ColorGameMain);

        // this.gameResource = find('Canvas/Scripts/ColorGameResource').getComponent(ColorGameResource);
        //獲取後端資料
        //生成100局資料(模擬用)
        for (let i = 0; i < 100; i++) {
            this.colorRoad.push([Math.floor(Math.random() * 6), Math.floor(Math.random() * 6), Math.floor(Math.random() * 6)]);
        }
        //設置籌碼參數
        // let checkID = this.chipSet.length > 1 ? 1 : 0;
        // this.selectChipID = this.chipSet[checkID];

        // for (let i = 0; i < this.chipSet.length; i++) {
        //     const selectChip = this.gameMain.selectChip.children[i];
        //     selectChip.active = true;
        //     selectChip.getChildByName('Label').getComponent(Label).string = this.betScoreRange[this.chipSet[i]].toString();
        // }
        // this.gameMain.selectChip.children[checkID].getComponent(Toggle).isChecked = true;

    }

    //初始化資料(新局)
    public resetValue() {
        this.localBetTotal = 0;
        this.localWinScore = 0;
        this.localBetScore = [0, 0, 0, 0, 0, 0];//注區分數歸0
        this.betAreaTotal = [0, 0, 0, 0, 0, 0];//目前各下注區的總金額
        //接收新局資料
        this.localScore = 250000;
        this.updataUIScore();

    }

    //模擬每秒接收的資料數據

    // 讀取 JSON 文件
    public loadPathJson(): Promise<void> {
        return new Promise<void>((resolve) => {
            resources.load("colorGamePathData/ColorGamePath", JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error(err);
                    return;
                }
                // 獲取json資料
                for (let i = 0; i < jsonAsset.json.length; i++) {
                    this.pathData[i] = jsonAsset.json[i];
                }
                for (let i = 0; i < this.pathData.length; i++) {
                    for (let j = 0; j < this.pathData[i].diceNumber.length; j++) {
                        this.numberShow[this.pathData[i].diceNumber[j]]++;
                    }
                    // this.pathData[i].diceNumber
                }
                console.log('開獎點數分佈:' + this.numberShow)
                resolve();
            });
        })

    }

    //更新分數
    public updataUIScore() {
        this.gameMain.comBtnBet.getChildByName('Label').getComponent(Label).string = UtilsKitS.NumDigits(this.localBetTotal);
        this.gameMain.comBtnScores.getChildByName('Label').getComponent(Label).string = UtilsKitS.NumDigits(this.localScore);

        for (let i = 1; i < 4; i++) {
            this.gameMain.playerPos.children[i].children[0].getChildByName('Label').getComponent(Label).string = UtilsKitS.NumDigits(this.otherPlayerScore[i - 1]);
        }
        for (let i = 0; i < 6; i++) {
            this.gameMain.betInfo.children[i].getChildByName('Credit').getChildByName('Label').getComponent(Label).string = UtilsKitS.NumDigits(this.betAreaTotal[i]);
            this.gameMain.betInfo.children[i].getChildByName('BetScore').getComponent(Label).string = UtilsKitS.NumDigits(this.localBetScore[i]);
        }
        this.updataBetPercent();//更新下注比例
    }

    //下注區分數比例更新
    public updataBetPercent() {
        let allScroe = 0;
        for (let i = 0; i < this.betAreaTotal.length; i++) {
            allScroe += this.betAreaTotal[i];
        }
        for (let i = 0; i < this.betAreaTotal.length; i++) {
            let per = 0;
            if (allScroe === 0)
                per = 0;
            else
                per = Math.trunc(this.betAreaTotal[i] / allScroe * 100);
            this.gameMain.betInfo.children[i].getChildByName('Percent').getChildByName('Label').getComponent(Label).string = per + '%';
            this.gameMain.betInfo.children[i].getChildByName('Percent').getChildByName('PercentBar').getComponent(UITransform).width = per;
        }
    }

    //獲取回合表演資料
    public getRoundData(): Promise<void> {
        return new Promise<void>((resolve) => {
            //模擬後端生成表演資料
            this.pathID = Math.floor(Math.random() * 1000);
            this.firstPos = this.pathData[this.pathID].pos[0];//起始位置
            this.firstRotate = this.pathData[this.pathID].rotate[0];//起始旋轉
            this.winNumber = this.randomNumber();
            this.diceEuler = this.diceRotate(this.pathID, this.winNumber);//起始骰子角度
            resolve();
            // console.log("轉換的角度", awardGroupData.diceEuler)
            // this.roundDatas.push(awardGroupData);//設置一般遊戲中獎表演資料
            // }
            // console.log("後端所有資料", this.roundDatas)
            // this.setDemoRound();
        })

    }

    public setSelectChipID(event: Event, id: number) {
        this.selectChipID = this.chipSetID[id];
    }

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
    }

    //模擬後端路徑與開獎三顏色之骰子校正旋轉值(路徑id，勝利的三顏色編號)，回傳3個子物件的旋轉值
    private diceRotate(id: number, winNumber: number[]) {
        // console.log('表演的路徑id', id);
        // console.log('表演的路徑id結果編號', this.pathData[id].diceNumber);
        // console.log('希望的結果編號', winNumber);
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