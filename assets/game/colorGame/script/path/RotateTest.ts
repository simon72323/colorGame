import { _decorator, Component, Node, tween, Quat, easing } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RotateTest')
export class RotateTest extends Component {
    start() {
        let quat1 = new Quat(-0.022, 0.981, 0.191, -0.034);
        let quat2 = new Quat(0, 0.901, 0.434, -0.029);
        let quat3 = new Quat(0.009, 0.77, 0.637, -0.04);
        this.schedule(() => {
            this.node.setRotation(quat1);
            tween(this.node).to(1, { rotation: quat2 }, {
                onUpdate: () => {
                    //ss
                }
            }).start();
            this.scheduleOnce(() => {
                tween(this.node).to(1, { rotation: quat3 }).start();
            }, 1)
        }, 2, 100, 0.01)

        // console.log(this.Quat_lerp(quat1, quat2, 0.2));
        // console.log(this.Quat_lerp(quat1, quat2, 0.4));
        // console.log(this.Quat_lerp(quat1, quat2, 0.6));
        // console.log(this.Quat_lerp(quat1, quat2, 0.8));
        // console.log(this.Quat_lerp(quat1, quat2, 1));
        // let a = { t: 0 };
        // tween(a).to(10, { t: 1 }, {
        //     onUpdate: () => {
        //         let quat = this.Quat_lerp(quat1, quat2, a.t);
        //         console.log(a.t)
        //         console.log(quat)
        //         // this.node.setRotation(Quat.lerp(quat1, quat1, quat2, a.t));
        //         this.node.setRotation(quat);
        //     }
        // }).start();

        // console.log(this.Quat_lerp(new Quat(-0.022, 0.981, 0.191, -0.034), new Quat(0, 0.901, 0.434, -0.029), 0.5));
        // this.Quat_lerp(new Quat(-0.022, 0.981, 0.191, -0.034),new Quat(0, 0.901, 0.434, -0.029),0.5);
    }


    // 確保四元數一致性
    ensureQuaternionConsistency(q1: Quat, q2: Quat): Quat {
        if (Quat.dot(q1, q2) < 0) {
            q2 = new Quat(-q2.x, -q2.y, -q2.z, -q2.w);
        }
        return q2;
    }

    Quat_lerp(a: Quat, b: Quat, t: number, out: Quat = a) {
        if (Quat.dot(a, b) < 0.0) {
            b = new Quat(-b.x, -b.y, -b.z, -b.w);
        }
        Quat.lerp(out, a, b, this.clamp01(t));
        // Quat.normalize(out, out);
        return out;
    }

    // Quat_lerp(a: Quat, b: Quat, t: number, out: Quat = a) {
    //     Quat.lerp(out, a, b, this.clamp01(t));
    //     Quat.normalize(out, out);
    //     return out;
    // }

    clamp01(value: number): number {
        return Math.min(Math.max(value, 0), 1);
    }

    update(deltaTime: number) {

    }
}


