import { _decorator, Component, Node, Animation, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('creat')
export class creat extends Component {
    @property({ type: Node })
    private coins: Node = null;

    start() {
        this.show();
        // this.scheduleOnce(() => {
        //     this.coins.getComponent(coinDropAnim).readyHide();
        // }, 3)
        // this.loopRun();
        // for (let i = 0; i < 2; i++) {
        //     const instcoin = instantiate(this.coins);
        //     instcoin.parent = this.node;
        // }
    }

    show() {
        this.scheduleOnce(() => {
            this.coins.active = true;
            this.scheduleOnce(() => {
                this.coins.active = false;
                this.show();
            }, 3.2)
        }, 1)
    }

    // private loopRun() {
    //     tween(this.node).to(1, { position: new Vec3(10, 10, 0) }).call(() => {
    //         console.log("結束動態2");
    //         this.loopRun();
    //     }).tag(123).start();//執行動態
    // }
}


