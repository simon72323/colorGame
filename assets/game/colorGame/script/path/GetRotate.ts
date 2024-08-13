import { _decorator, Component, Node, Quat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GetRotate')
export class GetRotate extends Component {
    start() {
        this.node.children[0].setRotation(new Quat(0.707,0.707,0,0));
        // for (let i = 0; i < this.node.children.length; i++) {
        //     console.log(this.node.children[i].getRotation());
        // }
        // let new4 = this.ensureQuaternionConsistency(new Quat(0,0,-1,0), new Quat(0, 0.707, -0.707, 0))
        // console.log(new4)
        // this.node.children[0].setRotation(new4);
    }

    // 確保四元數一致性
    ensureQuaternionConsistency(q1: Quat, q2: Quat): Quat {
        if (Quat.dot(q1, q2) < 0) {
            q2 = new Quat(-q2.x, -q2.y, -q2.z, -q2.w);
        }
        return q2;
    }

    update(deltaTime: number) {

    }
}


