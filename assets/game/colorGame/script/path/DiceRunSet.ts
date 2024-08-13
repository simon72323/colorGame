import { _decorator, Component, Vec3, Quat, tween, Animation, Node } from 'cc';
import { ColorGameDemoData } from '../ColorGameDemoData';
const { ccclass, property } = _decorator;

@ccclass('DiceRunSet')
export class DiceRunSet extends Component {
    @property([Node])
    dice: Node[] = [];
    @property(Node)
    frame: Node = null;

    // private pathData: PathData[] = [];
    // private isRecording = false;
    // private isPlaying = false;
    private dataFrame = 0;//播放中的路徑影格
    private saveFrameTime = 0.033;
    // private winNumber = [1, 1, 1];
    @property({ type: ColorGameDemoData, tooltip: "demo回合腳本" })
    private demoData: ColorGameDemoData = null;

    // onLoad() {
    // 讀取 JSON 文件
    // resources.load("colorGamePathData/ColorGamePath30", JsonAsset, (err, jsonAsset) => {
    //     if (err) {
    //         console.error(err);
    //         return;
    //     }
    //     // 獲取json資料
    //     for (let i = 0; i < jsonAsset.json.length; i++) {
    //         this.pathData[i] = jsonAsset.json[i];
    //     }
    // });
    // }

    //初始化骰子
    diceIdle() {
        const roundData = this.demoData.roundData;
        console.log("資料", roundData)
        //初始化所有骰子位置
        for (let i = 0; i < this.dice.length; i++) {
            this.dice[i].setPosition(new Vec3(roundData.firstPos[i * 3 + 0], roundData.firstPos[i * 3 + 1], roundData.firstPos[i * 3 + 2]));
            this.dice[i].setRotation(new Quat(roundData.firstRotate[i * 4 + 0], roundData.firstRotate[i * 4 + 1], roundData.firstRotate[i * 4 + 2], roundData.firstRotate[i * 4 + 3]));
            this.dice[i].children[0].setRotationFromEuler(roundData.diceEuler[i]);
            this.dice[i].active = true;//顯示骰子
        }
    }

    // //初始化骰子(初始3骰子座標，初始3骰子角度，初始三骰子子節點旋轉角度)
    // diceIdle(firstPos: number[], firstRotate: number[], diceEuler: Vec3[]) {
    //     //初始化所有骰子位置
    //     for (let i = 0; i < this.dice.length; i++) {
    //         this.dice[i].setPosition(new Vec3(firstPos[i * 3 + 0], firstPos[i * 3 + 1], firstPos[i * 3 + 2]));
    //         this.dice[i].setRotation(new Quat(firstRotate[i * 4 + 0], firstRotate[i * 4 + 1], firstRotate[i * 4 + 2], firstRotate[i * 4 + 3]));
    //         this.dice[i].children[0].setRotationFromEuler(diceEuler[i]);
    //         this.dice[i].active = true;//顯示骰子
    //     }

    // }

    //開骰表演(回傳表演結束)
    diceStart(callback: any) {
        // this.diceIdle();//初始化骰子
        const pathData = this.demoData.pathData[this.demoData.roundData.pathID];//路徑表演資料
        this.frame.setRotationFromEuler(new Vec3(-90, 180, 0));//初始化翻板動畫
        this.frame.getComponent(Animation).play();//播放翻板動畫

        const frameLength = pathData.pos.length;
        this.dataFrame = 0;
        this.schedule(() => {
            let posPath = pathData.pos[this.dataFrame];
            let rotatePath = pathData.rotate[this.dataFrame];
            //移動骰子位置
            for (let i = 0; i < this.dice.length; i++) {
                let movePos = new Vec3(posPath[i * 3 + 0], posPath[i * 3 + 1], posPath[i * 3 + 2]);
                let rotate = new Quat(rotatePath[i * 4 + 0], rotatePath[i * 4 + 1], rotatePath[i * 4 + 2], rotatePath[i * 4 + 3])
                let moveRotate = this.ensureQuaternionConsistency(this.dice[i].rotation, rotate);
                // tween(this.dice[i]).to(this.saveFrameTime, { position: movePos, rotation: moveRotate }).start();
                this.dice[i].position = movePos;
                this.dice[i].rotation = moveRotate;
            }
            this.dataFrame++;

            if (this.dataFrame >= frameLength) {
                //播放結束
                // this.isPlaying = false;
                callback();
                // this.scheduleOnce(() => {
                //     this.diceStart();//再次播放
                // }, 1)
            }
        }, 0, frameLength - 1, 0)
    }

    //模擬後端路徑與開獎三顏色之骰子校正旋轉值(路徑id，勝利的三顏色編號)，回傳3個子物件的旋轉值
    // diceRotate(id: number, winNumber: number[]) {
    //     const pathEndColor = this.demoData.pathData[id].diceNumber
    //     const changeEuler = [
    //         [new Vec3(0, 0, 0), new Vec3(-90, 0, 0), new Vec3(0, 0, 90), new Vec3(0, 0, -90), new Vec3(90, 0, 0), new Vec3(180, 0, 0)],
    //         [new Vec3(90, 0, 0), new Vec3(0, 0, 0), new Vec3(0, -90, 0), new Vec3(0, 90, 0), new Vec3(0, 180, 0), new Vec3(-90, 0, 0)],
    //         [new Vec3(0, 0, -90), new Vec3(0, 90, 0), new Vec3(0, 0, 0), new Vec3(0, 180, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 90)],
    //         [new Vec3(0, 0, 90), new Vec3(0, -90, 0), new Vec3(0, 180, 0), new Vec3(0, 0, 0), new Vec3(0, 90, 0), new Vec3(0, 0, -90)],
    //         [new Vec3(-90, 0, 0), new Vec3(0, 180, 0), new Vec3(0, 90, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 0), new Vec3(90, 0, 0)],
    //         [new Vec3(180, 0, 0), new Vec3(90, 0, 0), new Vec3(0, 0, -90), new Vec3(0, 0, 90), new Vec3(-90, 0, 0), new Vec3(0, 0, 0)]
    //     ]
    //     return [
    //         changeEuler[pathEndColor[0]][winNumber[0]],
    //         changeEuler[pathEndColor[1]][winNumber[1]],
    //         changeEuler[pathEndColor[2]][winNumber[2]]
    //     ]
    // }

    // 確保四元數一致性
    ensureQuaternionConsistency(q1: Quat, q2: Quat): Quat {
        if (Quat.dot(q1, q2) < 0) {
            q2 = new Quat(-q2.x, -q2.y, -q2.z, -q2.w);
        }
        return q2;
    }

    // update(deltaTime: number) {
    // if (this.isPlaying) {
    //     this.timer += deltaTime;
    //     if (this.timer > this.saveFrameTime) {
    //         this.playFrame();
    //         this.timer = 0;
    //     }
    // }
    // }

    //播放路徑動態
    // playFrame() {
    //     // let pos = new Vec3(posPath0[0], posPath0[1], posPath0[2])
    //     // this.pathDataList[this.dataFrame].pos
    //     let posPath = this.pathDataList.pos[this.dataFrame];
    //     let rotatePath = this.pathDataList.rotate[this.dataFrame];
    //     //移動骰子位置
    //     for (let i = 0; i < this.dice.length; i++) {
    //         let movePos = new Vec3(posPath[i * 3 + 0], posPath[i * 3 + 1], posPath[i * 3 + 2]);
    //         let rotate = new Quat(rotatePath[i * 4 + 0], rotatePath[i * 4 + 1], rotatePath[i * 4 + 2], rotatePath[i * 4 + 3])
    //         let moveRotate = this.ensureQuaternionConsistency(this.dice[i].rotation, rotate);
    //         // this.dice[i].setPosition(movePos);
    //         // this.dice[i].setRotation(moveRotate)
    //         // if (i == 1) {
    //         //     console.log(movePos, moveRotate)
    //         // }
    //         // if (this.dataFrame >= this.pathDataList.pos.length - 4) {
    //         //     tween(this.dice[i]).to(this.saveFrameTime, { position: movePos, rotation: moveRotate }, { easing: 'sineOut' }).start();
    //         //     console.log("back")
    //         // }
    //         // else
    //         tween(this.dice[i]).to(this.saveFrameTime, { position: movePos, rotation: moveRotate }).start();
    //     }
    //     // console.log(this.dataFrame)
    //     this.dataFrame++;

    //     if (this.dataFrame >= this.pathDataList.pos.length) {
    //         //播放結束
    //         this.isPlaying = false;
    //         // this.scheduleOnce(() => {
    //         //     this.diceStart();//再次播放
    //         // }, 1)
    //     }
    // }
}