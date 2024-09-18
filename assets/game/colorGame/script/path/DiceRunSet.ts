import { _decorator, Component, Vec3, Quat, Animation, Node } from 'cc';
import { CGModel } from '../CGModel';
const { ccclass, property } = _decorator;

@ccclass('DiceRunSet')
export class DiceRunSet extends Component {
    @property([Node])
    private dice: Node[] = [];
    @property(Node)
    private frame: Node = null;
    private readonly FIRST_POSITIONS = [
        new Vec3(-1.25, 4.77, -1.83),
        new Vec3(0, 4.77, -1.83),
        new Vec3(1.25, 4.77, -1.83)
    ];
    private readonly CHANGE_EULER = [
        [new Vec3(0, 0, 0), new Vec3(-90, 0, 0), new Vec3(0, 0, 90), new Vec3(0, 0, -90), new Vec3(90, 0, 0), new Vec3(180, 0, 0)],
        [new Vec3(90, 0, 0), new Vec3(0, 0, 0), new Vec3(0, -90, 0), new Vec3(0, 90, 0), new Vec3(0, 180, 0), new Vec3(-90, 0, 0)],
        [new Vec3(0, 0, -90), new Vec3(0, 90, 0), new Vec3(0, 0, 0), new Vec3(0, 180, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 90)],
        [new Vec3(0, 0, 90), new Vec3(0, -90, 0), new Vec3(0, 180, 0), new Vec3(0, 0, 0), new Vec3(0, 90, 0), new Vec3(0, 0, -90)],
        [new Vec3(-90, 0, 0), new Vec3(0, 180, 0), new Vec3(0, 90, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 0), new Vec3(90, 0, 0)],
        [new Vec3(180, 0, 0), new Vec3(90, 0, 0), new Vec3(0, 0, -90), new Vec3(0, 0, 90), new Vec3(-90, 0, 0), new Vec3(0, 0, 0)]
    ];
    private dataFrame = 0;//播放中的路徑影格
    private model: CGModel = null;//demo回合腳本

    public onLoad(): void {
        this.model = CGModel.getInstance();
    }

    //初始化骰子(隨機角度)
    public diceIdle() {
        this.dice.forEach((dice, i) => {
            dice.setPosition(this.FIRST_POSITIONS[i]);
            dice.setRotationFromEuler(new Vec3(-20, 0, 0));
            const [randomRow, randomCol] = [Math.floor(Math.random() * 6), Math.floor(Math.random() * 6)];
            dice.children[0].setRotationFromEuler(this.CHANGE_EULER[randomRow][randomCol]);
            dice.active = true; // 顯示骰子
        });
    }

    //開骰表演(回傳表演結束)
    public async diceStart(): Promise<void> {
        return new Promise<void>((resolve) => {
            const diceEuler = this.diceRotate(this.model.rewardInfo.winNumber, this.model.pathData.diceNumber);//起始骰子角度
            // 四元數插值轉換(慢慢校正骰子方向)
            const targetRotations = diceEuler.map(euler => {
                const quat = new Quat();
                Quat.fromEuler(quat, euler.x, euler.y, euler.z);
                return quat;
            });
            const currentRotations = this.dice.map(dice => dice.children[0].rotation);

            this.frame.setRotationFromEuler(new Vec3(-90, 180, 0));//初始化翻板動畫
            this.frame.getComponent(Animation).play();//播放翻板動畫

            const pathData = this.model.pathData;//路徑表演資料
            const frameLength = pathData.pos.length;
            this.dataFrame = 0;
            this.schedule(() => {
                const posPath = pathData.pos[this.dataFrame];
                const rotatePath = pathData.rotate[this.dataFrame];
                const t = Math.min(this.dataFrame / 100, 1);//前100格校正角度

                this.dice.forEach((dice, i) => {
                    //慢慢地修正角度
                    let newRotation = new Quat();
                    Quat.slerp(newRotation, currentRotations[i], targetRotations[i], t);
                    dice.children[0].setRotation(newRotation);
                    // 移動骰子位置
                    const movePos = new Vec3(posPath[i * 3 + 0], posPath[i * 3 + 1], posPath[i * 3 + 2]);
                    const rotate = new Quat(rotatePath[i * 4 + 0], rotatePath[i * 4 + 1], rotatePath[i * 4 + 2], rotatePath[i * 4 + 3]);
                    const moveRotate = this.ensureQuaternionConsistency(dice.rotation, rotate);
                    dice.position = movePos;
                    dice.rotation = moveRotate;
                });
                this.dataFrame++;
                if (this.dataFrame >= frameLength) {
                    resolve();
                }
            }, 0, frameLength - 1, 0.1)
        })
    }

    // 確保四元數一致性
    ensureQuaternionConsistency(q1: Quat, q2: Quat): Quat {
        return Quat.dot(q1, q2) < 0 ? new Quat(-q2.x, -q2.y, -q2.z, -q2.w) : q2;
    }

    //路徑與開獎三顏色之骰子校正旋轉值(路徑id，勝利的三顏色編號)，回傳3個子物件的旋轉值
    private diceRotate(winNumber: number[], diceNumber: number[]): Vec3[] {
        return [
            this.CHANGE_EULER[diceNumber[0]][winNumber[0]],
            this.CHANGE_EULER[diceNumber[1]][winNumber[1]],
            this.CHANGE_EULER[diceNumber[2]][winNumber[2]]
        ];
    }
}