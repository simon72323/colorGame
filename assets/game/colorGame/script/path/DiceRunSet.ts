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


    //初始化骰子
    diceIdle() {
        const pathData = this.gameData.pathData;//路徑表演資料
        console.log(pathData)
        const firstPos = pathData.pos[0];
        const firstRotate = pathData.rotate[0];
        //初始化所有骰子位置
        for (let i = 0; i < this.dice.length; i++) {
            this.dice[i].setPosition(new Vec3(firstPos[i * 3 + 0], firstPos[i * 3 + 1], firstPos[i * 3 + 2]));
            this.dice[i].setRotation(new Quat(firstRotate[i * 4 + 0], firstRotate[i * 4 + 1], firstRotate[i * 4 + 2], firstRotate[i * 4 + 3]));
            this.dice[i].children[0].setRotationFromEuler(this.gameData.diceEuler[i]);
            this.dice[i].active = true;//顯示骰子
        }
    }

    //開骰表演(回傳表演結束)
    public diceStart(): Promise<void> {
        return new Promise<void>((resolve) => {
            // this.diceIdle();//初始化骰子
            const pathData = this.gameData.pathData;//路徑表演資料
            console.log('表演該回合路徑id', this.gameData.onBeginGame.PathID)
            console.log('表演該回合開骰結果', this.gameData.onBeginGame.WinNumber)
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