import { _decorator, Component, Vec3, Quat, find, Animation, Node } from 'cc';
import { CGData } from '../CGData';
const { ccclass, property } = _decorator;

@ccclass('DiceRunSet')
export class DiceRunSet extends Component {
    @property([Node])
    dice: Node[] = [];
    @property(Node)
    frame: Node = null;
    private dataFrame = 0;//播放中的路徑影格
    private saveFrameTime = 0.033;
    // private winNumber = [1, 1, 1];
    @property(CGData)
    private gameData: CGData = null;//demo回合腳本


    //初始化骰子(隨機顏色)
    diceIdle() {
        // const pathData = this.gameData.pathData;//路徑表演資料
        // console.log(pathData)
        const firstPos = [
            new Vec3(-1.2, 4.77, -1.83),
            new Vec3(0, 4.77, -1.83),
            new Vec3(1.2, 4.77, -1.83)
        ];
        const firstRotate = [
            new Quat(0, 0.574, -0.819, 0),
            new Quat(0.406, 0.579, 0.406, 0.579),
            new Quat(0, 0.574, -0.819, 0)
        ];
        //初始化所有骰子位置
        for (let i = 0; i < this.dice.length; i++) {
            this.dice[i].setPosition(firstPos[i]);
            this.dice[i].setRotation(firstRotate[i]);
            const changeEuler = [
                [new Vec3(0, 0, 0), new Vec3(-90, 0, 0), new Vec3(0, 0, 90), new Vec3(0, 0, -90), new Vec3(90, 0, 0), new Vec3(180, 0, 0)],
                [new Vec3(90, 0, 0), new Vec3(0, 0, 0), new Vec3(0, -90, 0), new Vec3(0, 90, 0), new Vec3(0, 180, 0), new Vec3(-90, 0, 0)],
                [new Vec3(0, 0, -90), new Vec3(0, 90, 0), new Vec3(0, 0, 0), new Vec3(0, 180, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 90)],
                [new Vec3(0, 0, 90), new Vec3(0, -90, 0), new Vec3(0, 180, 0), new Vec3(0, 0, 0), new Vec3(0, 90, 0), new Vec3(0, 0, -90)],
                [new Vec3(-90, 0, 0), new Vec3(0, 180, 0), new Vec3(0, 90, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 0), new Vec3(90, 0, 0)],
                [new Vec3(180, 0, 0), new Vec3(90, 0, 0), new Vec3(0, 0, -90), new Vec3(0, 0, 90), new Vec3(-90, 0, 0), new Vec3(0, 0, 0)]
            ];
            this.dice[i].children[0].setRotationFromEuler(changeEuler[Math.floor(Math.random() * 6)][Math.floor(Math.random() * 6)]);
            this.dice[i].active = true;//顯示骰子
        }
    }

    //開骰表演(回傳表演結束)
    public diceStart(): Promise<void> {
        return new Promise<void>((resolve) => {
            // this.diceIdle();//初始化骰子
            const pathData = this.gameData.pathData;//路徑表演資料
            console.log('表演該回合路徑id', this.gameData.rewardInfo.pathID)
            console.log('表演該回合開骰結果', this.gameData.rewardInfo.winNumber)
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
                    resolve();
                }
            }, 0, frameLength - 1, 0.1)
        })
    }

    // 確保四元數一致性
    ensureQuaternionConsistency(q1: Quat, q2: Quat): Quat {
        if (Quat.dot(q1, q2) < 0) {
            q2 = new Quat(-q2.x, -q2.y, -q2.z, -q2.w);
        }
        return q2;
    }
}