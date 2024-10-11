import { _decorator, Component, Vec3, Quat, Animation, Node } from 'cc';
import { CGPathManager } from '../manager/CGPathManager';
const { ccclass, property } = _decorator;

@ccclass('CGDiceRunView')
export class CGDiceRunView extends Component {
    @property([Node])//3顏色骰子
    private dice!: Node[];
    @property(Node)//3D開骰節點
    private frame!: Node;

    //3顆骰子起點位置
    private readonly FIRST_POSITIONS = [
        new Vec3(-1.25, 4.77, -1.83),
        new Vec3(0, 4.77, -1.83),
        new Vec3(1.25, 4.77, -1.83)
    ];
    //骰子子物件顏色方位校正值
    private readonly CHANGE_EULER = [
        [new Vec3(0, 0, 0), new Vec3(-90, 0, 0), new Vec3(0, 0, 90), new Vec3(0, 0, -90), new Vec3(90, 0, 0), new Vec3(180, 0, 0)],
        [new Vec3(90, 0, 0), new Vec3(0, 0, 0), new Vec3(0, -90, 0), new Vec3(0, 90, 0), new Vec3(0, 180, 0), new Vec3(-90, 0, 0)],
        [new Vec3(0, 0, -90), new Vec3(0, 90, 0), new Vec3(0, 0, 0), new Vec3(0, 180, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 90)],
        [new Vec3(0, 0, 90), new Vec3(0, -90, 0), new Vec3(0, 180, 0), new Vec3(0, 0, 0), new Vec3(0, 90, 0), new Vec3(0, 0, -90)],
        [new Vec3(-90, 0, 0), new Vec3(0, 180, 0), new Vec3(0, 90, 0), new Vec3(0, -90, 0), new Vec3(0, 0, 0), new Vec3(90, 0, 0)],
        [new Vec3(180, 0, 0), new Vec3(90, 0, 0), new Vec3(0, 0, -90), new Vec3(0, 0, 90), new Vec3(-90, 0, 0), new Vec3(0, 0, 0)]
    ];

    //骰子子物件起始顏色方位值
    private readonly START_EULER = [
        new Vec3(0, 0, 0), new Vec3(0, 90, 0), new Vec3(0, 180, 0), new Vec3(0, -90, 0),
        new Vec3(-90, 0, 0), new Vec3(-90, 90, 0), new Vec3(-90, 180, 0), new Vec3(-90, -90, 0),
        new Vec3(0, 0, 90), new Vec3(0, 90, 90), new Vec3(0, 180, 90), new Vec3(0, -90, 90), 
        new Vec3(0, 0, -90), new Vec3(0, 90, -90), new Vec3(0, 180, -90), new Vec3(0, -90, -90),
        new Vec3(90, 0, 0), new Vec3(90, 90, 0), new Vec3(90, 180, 0), new Vec3(90, -90, 0),
        new Vec3(180, 0, 0), new Vec3(180, 90, 0), new Vec3(180, 180, 0), new Vec3(180, -90, 0)
    ];

    /**
     * 初始化骰子方位
     * @startColor 骰子方位參數[](0~23)
     * @controller
     */
    public diceIdle(startColor: number[]) {
        this.dice.forEach((dice, i) => {
            dice.setPosition(this.FIRST_POSITIONS[i]);
            dice.setRotationFromEuler(new Vec3(-20, 0, 0));
            dice.children[0].setRotationFromEuler(this.START_EULER[startColor[i]]);
            dice.active = true; // 顯示骰子
        });
    }

    /**
     * 開骰表演
     * @param pathID 路徑ID
     * @param winColor 獲勝顏色數組
     * @returns 回傳表演結束
     */
    public async diceStart(pathID: number, winColor: number[]): Promise<void> {
        return new Promise<void>((resolve) => {
            const pathData = CGPathManager.getInstance().allPathData[pathID];
            const diceEuler = this.diceRotate(winColor, pathData.diceNumber);//起始骰子角度
            // 四元數插值轉換(慢慢校正骰子方向)
            const targetRotations = diceEuler.map(euler => {
                const quat = new Quat();
                Quat.fromEuler(quat, euler.x, euler.y, euler.z);
                return quat;
            });
            const currentRotations = this.dice.map(dice => dice.children[0].rotation);

            this.frame.setRotationFromEuler(new Vec3(-90, 180, 0));//初始化翻板動畫
            this.frame.getComponent(Animation).play();//播放翻板動畫

            const frameLength = pathData.pos.length;
            let dataFrame = 0;//播放中的路徑影格
            this.schedule(() => {
                const posPath = pathData.pos[dataFrame];
                const rotatePath = pathData.rotate[dataFrame];
                const t = Math.min(dataFrame / 100, 1);//前100格校正角度
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
                dataFrame++;
                if (dataFrame >= frameLength)
                    resolve();
            }, 0, frameLength - 1, 0.1)
        })
    }

    /**
     * 確保四元數一致性
     * @param q1 第一個四元數
     * @param q2 第二個四元數
     * @returns 確保一致性後的四元數
     */
    private ensureQuaternionConsistency(q1: Quat, q2: Quat): Quat {
        return Quat.dot(q1, q2) < 0 ? new Quat(-q2.x, -q2.y, -q2.z, -q2.w) : q2;
    }

    /**
     * 計算骰子校正旋轉值
     * @param winColor 開獎顏色編號
     * @param diceNumber 路徑原本的開獎顏色編號
     * @returns 三個骰子子物件的旋轉值陣列
     */
    private diceRotate(winColor: number[], diceNumber: number[]): Vec3[] {
        return [
            this.CHANGE_EULER[diceNumber[0]][winColor[0]],
            this.CHANGE_EULER[diceNumber[1]][winColor[1]],
            this.CHANGE_EULER[diceNumber[2]][winColor[2]]
        ];
    }
}