import { _decorator, Component, RigidBody, Vec3, Quat, Node, Animation, PhysicsSystem } from 'cc';
import { UtilsKitS } from '../../../../common/script/lib/UtilsKitS';
import { PathInfo } from '../components/CGPathManager';
const { ccclass, property } = _decorator;


@ccclass('SaveDiceData')
export class SaveDiceData extends Component {
    private pathData: PathInfo[] = [];
    private isRecording = false;
    // private timer = 0;
    private idNum = 0;
    private length = [];
    private point = [0, 0, 0, 0, 0, 0];//起始點數
    private numberShow = [0, 0, 0, 0, 0, 0];//開獎點數
    // private saveFrameTime = 0.02;
    private saveNum = 0;

    // @property(Node)
    // boxMove: Node = null;

    onLoad() {
    }
    async start() {
        PhysicsSystem.instance.gravity = new Vec3(0, -30, 0);
        this.isRecording = false;
        for (let i = 0; i < this.node.children.length; i++) {
            for (let j = 0; j < 3; j++) {
                this.node.children[i].children[j].getComponent(RigidBody).type = RigidBody.Type.DYNAMIC; // 啟用物理模拟
            }
        }
        // this.scheduleOnce(()=>{
        //     this.startRun();
        // },7)
        await UtilsKitS.Delay(7);
        this.startRun();
    }

    startRun() {
        this.pathData = [];//清空資料
        this.schedule(async () => {
            //初始化所有骰子位置
            for (let i = 0; i < this.node.children.length; i++) {
                let diceNode = this.node.children[i];
                for (let j = 0; j < 3; j++) {
                    this.node.children[i].children[j].getComponent(RigidBody).type = RigidBody.Type.KINEMATIC; // 停止物理模拟
                    diceNode.children[j].setPosition(new Vec3(j * 1.25 - 1.25, 4.77, -1.83));
                    // console.log("位置" + diceNode.children[j].position);
                    diceNode.children[j].setRotationFromEuler(new Vec3(-20, 0, 0));//固定起始為0,0,0
                    // let random = Math.floor(Math.random() * 6);
                    // this.point[random]++;
                    // switch (random) {
                    //     case 0:
                    //         diceNode.children[j].setRotationFromEuler(new Vec3(-20, 0, 0));
                    //         // diceNode.children[j].setRotation(new Quat(0, 0, 0, 1));
                    //         break;
                    //     case 1:
                    //         diceNode.children[j].setRotationFromEuler(new Vec3(270, 270, 20));
                    //         // diceNode.children[j].setRotation(new Quat(-0.5, -0.5, 0.5, 0.5));
                    //         break;
                    //     case 2:
                    //         diceNode.children[j].setRotationFromEuler(new Vec3(0, 90, 70));
                    //         // diceNode.children[j].setRotation(new Quat(0.5, 0.5, 0.5, 0.5));
                    //         break;
                    //     case 3:
                    //         diceNode.children[j].setRotationFromEuler(new Vec3(90, -90, -70));
                    //         // diceNode.children[j].setRotation(new Quat(-0.707, 0.707, 0, 0));
                    //         break;
                    //     case 4:
                    //         diceNode.children[j].setRotationFromEuler(new Vec3(110, 180, 0));
                    //         // diceNode.children[j].setRotation(new Quat(0, 0.707, 0.707, 0));
                    //         break;
                    //     case 5:
                    //         diceNode.children[j].setRotationFromEuler(new Vec3(180, 90, -20));
                    //         // diceNode.children[j].setRotation(new Quat(0.707, 0, 0.707, 0));
                    //         break;
                    // }
                }
                let newPos = this.roundVector3(diceNode.children[0].getPosition(), diceNode.children[1].getPosition(), diceNode.children[2].getPosition());
                let newRotate = this.roundQuat(diceNode.children[0].getRotation(), diceNode.children[1].getRotation(), diceNode.children[2].getRotation());
                let pathDataMain: PathInfo = { pos: [], rotate: [], diceNumber: [] }
                pathDataMain.pos.push(newPos);//寫入初始位置
                pathDataMain.rotate.push(newRotate);//寫入初始旋轉
                this.pathData.push(pathDataMain);

                let boxMove = this.node.children[i].getChildByName('box').getChildByName('lid').children[0];
                boxMove.setRotationFromEuler(new Vec3(-90, 180, 0));//初始化翻板動畫
                this.scheduleOnce(() => {
                    boxMove.getComponent(Animation).play();//播放翻板動畫
                }, 0.2)
            }
            // this.boxMove.setRotationFromEuler(new Vec3(-90, 180, 0));//初始化翻板動畫
            await UtilsKitS.Delay(0.3);
            // this.boxMove.getComponent(Animation).play();//播放翻板動畫
            this.isRecording = true;
            this.saveNum = 0;
            for (let i = 0; i < this.node.children.length; i++) {
                for (let j = 0; j < 3; j++) {
                    const mass = 1 + Math.random();
                    const downPower = -100 * mass - Math.random() * 10 * mass;//根據id設置力道
                    const lrPower = 30 * mass - Math.random() * 60 * mass;//根據id設置力道
                    const randomForce = new Vec3(lrPower, downPower, 0);
                    const randomAngular = new Vec3(10 - Math.random() * 20, 5 - Math.random() * 10, 5 - Math.random() * 10);
                    this.node.children[i].children[j].getComponent(RigidBody).type = RigidBody.Type.DYNAMIC; // 允许物理模拟
                    // console.log("執行物理")
                    this.node.children[i].children[j].getComponent(RigidBody).mass = mass;
                    this.node.children[i].children[j].getComponent(RigidBody).allowSleep = true;
                    this.node.children[i].children[j].getComponent(RigidBody).linearDamping = 0;
                    this.node.children[i].children[j].getComponent(RigidBody).angularDamping = 0;
                    this.node.children[i].children[j].getComponent(RigidBody).useGravity = true;
                    this.node.children[i].children[j].getComponent(RigidBody).linearFactor = new Vec3(1, 1, 1);
                    this.node.children[i].children[j].getComponent(RigidBody).angularFactor = new Vec3(1, 1, 1);
                    this.node.children[i].children[j].getComponent(RigidBody).applyForce(randomForce);
                    this.node.children[i].children[j].getComponent(RigidBody).setAngularVelocity(randomAngular);
                }
            }
            await UtilsKitS.Delay(4.7);
            this.stopRecording();
            for (let i = 0; i < this.node.children.length; i++) {
                let newNumber =
                    [
                        this.diceNumber(this.node.children[i].children[0], Math.floor(i / 10) * 10),
                        this.diceNumber(this.node.children[i].children[1], Math.floor(i / 10) * 10),
                        this.diceNumber(this.node.children[i].children[2], Math.floor(i / 10) * 10)
                    ];
                this.pathData[i + this.idNum].diceNumber = newNumber;//紀錄結果點數
                // console.log(this.idNum,newNumber)
                for (let j = 0; j < 3; j++) {
                    this.numberShow[newNumber[j]]++;
                }
                if (this.pathData[i + this.idNum].pos.length > 90)
                    this.length.push(this.pathData[i + this.idNum].pos.length);
            }
            // console.log(this.pathData)
            this.idNum += 100;
            if (this.idNum > 999)
                this.saveDataAsJson();
        }, 5.5, 9, 0.01)
    }

    // 確保四元數一致性
    ensureQuaternionConsistency(q1: Quat, q2: Quat): Quat {
        if (Quat.dot(q1, q2) < 0) {
            q2 = new Quat(-q2.x, -q2.y, -q2.z, -q2.w);
        }
        return q2;
    }

    //停止錄製
    stopRecording() {
        this.isRecording = false;
        for (let i = 0; i < this.node.children.length; i++) {
            for (let j = 0; j < 3; j++) {
                this.node.children[i].children[j].getComponent(RigidBody).type = RigidBody.Type.KINEMATIC; // 停止物理模拟
            }
        }
    }

    update(deltaTime: number) {
        if (this.isRecording) {
            // this.timer += deltaTime;
            // if (this.timer > this.saveFrameTime) {
            this.recordFrame();
            //     this.timer = 0;
            // }
        }
    }

    //紀錄路徑資訊
    recordFrame() {
        //間隔一次frame紀錄
        this.saveNum++;
        // if (this.saveNum % 2 != 1) {
        //     return;
        //     // this.saveNum = 0;
        // }
        // console.log(this.saveNum);
        for (let i = 0; i < this.node.children.length; i++) {
            let diceNode = this.node.children[i];
            let newPos = this.roundVector3(diceNode.children[0].getPosition(), diceNode.children[1].getPosition(), diceNode.children[2].getPosition());
            let newRotate = this.roundQuat(diceNode.children[0].getRotation(), diceNode.children[1].getRotation(), diceNode.children[2].getRotation());
            const pathDataLength = this.pathData[i + this.idNum].pos.length;
            // if (pathDataLength > 0) {
            let firstPos = this.pathData[i + this.idNum].pos[pathDataLength - 1];
            let firstRotate = this.pathData[i + this.idNum].rotate[pathDataLength - 1];
            if (!this.compareData(firstPos, firstRotate, newPos, newRotate)) {
                this.pathData[i + this.idNum].pos.push(newPos);
                this.pathData[i + this.idNum].rotate.push(newRotate);
                // this.pathData[i + this.idNum].push(pathData);//加到指定路徑資料內
            }
            // } 
            // else {
            //     this.pathData[i + this.idNum].pos.push(newPos);
            //     this.pathData[i + this.idNum].rotate.push(newRotate);
            //     // this.pathData[i + this.idNum].push(pathData);//加到指定路徑資料內
            // }
        }
    }

    //比對資料是否一致(Number)
    compareData(firstPos: Number[], firstRotate: Number[], newPos: Number[], newRotate: Number[]) {
        for (let i = 0; i < firstPos.length; i++) {
            if (firstPos[i] !== newPos[i])
                return false;
        }
        for (let i = 0; i < firstRotate.length; i++) {
            if (firstRotate[i] !== newRotate[i])
                return false;
        }
        return true;
    }

    //  -0 轉 0
    normalizeZero(value: number): number {
        return value === -0 ? 0 : value;
    }

    //朝上點數判斷(回傳點數)
    diceNumber(dice: Node, y: number) {
        for (let i = 0; i < 6; i++) {
            if (dice.children[0].children[i].getWorldPosition().y > (1.5 + y)) {
                return i;
            }
        }
    }

    //Vec3轉換至小數點第2位
    roundVector3(vec1: Vec3, vec2: Vec3, vec3: Vec3) {
        return [
            this.normalizeZero(Math.round(vec1.x * 100) / 100),
            this.normalizeZero(Math.round(vec1.y * 100) / 100),
            this.normalizeZero(Math.round(vec1.z * 100) / 100),
            this.normalizeZero(Math.round(vec2.x * 100) / 100),
            this.normalizeZero(Math.round(vec2.y * 100) / 100),
            this.normalizeZero(Math.round(vec2.z * 100) / 100),
            this.normalizeZero(Math.round(vec3.x * 100) / 100),
            this.normalizeZero(Math.round(vec3.y * 100) / 100),
            this.normalizeZero(Math.round(vec3.z * 100) / 100)
        ]
    }

    //Quat轉換至小數點第2位
    roundQuat(quat1: Quat, quat2: Quat, quat3: Quat) {
        return [
            this.normalizeZero(Math.round(quat1.x * 1000) / 1000),
            this.normalizeZero(Math.round(quat1.y * 1000) / 1000),
            this.normalizeZero(Math.round(quat1.z * 1000) / 1000),
            this.normalizeZero(Math.round(quat1.w * 1000) / 1000),
            this.normalizeZero(Math.round(quat2.x * 1000) / 1000),
            this.normalizeZero(Math.round(quat2.y * 1000) / 1000),
            this.normalizeZero(Math.round(quat2.z * 1000) / 1000),
            this.normalizeZero(Math.round(quat2.w * 1000) / 1000),
            this.normalizeZero(Math.round(quat3.x * 1000) / 1000),
            this.normalizeZero(Math.round(quat3.y * 1000) / 1000),
            this.normalizeZero(Math.round(quat3.z * 1000) / 1000),
            this.normalizeZero(Math.round(quat3.w * 1000) / 1000)
        ]
    }

    //保存json格式
    saveDataAsJson() {
        // console.log(this.length)
        // console.log('起始點數分佈:' + this.point)
        console.log('開獎點數分佈:' + this.numberShow)
        const jsonData = JSON.stringify(this.pathData, (key, value) => {
            if (value instanceof Vec3)
                return { x: value.x, y: value.y, z: value.z || undefined };
            else if (value instanceof Quat)
                return { x: value.x, y: value.y, z: value.z, w: value.w || undefined };
            return value;
        });
        const fileName = "ColorGamePath.json";
        this.saveToFile(jsonData, fileName);
    }

    //保存檔案
    saveToFile(data: string, fileName: string) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}