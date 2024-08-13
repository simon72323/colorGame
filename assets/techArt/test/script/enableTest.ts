import { _decorator, Component, Node, Animation, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('enableTest')
export class enableTest extends Component {
    @property({ type: Node })
    private coins: Node = null;

    start() {
        this.scheduleOnce(() => {
            this.coins.active = true;
            this.scheduleOnce(() => {
                this.coins.active = false;
                this.scheduleOnce(() => {
                    this.coins.active = true;
                    this.scheduleOnce(() => {
                        this.coins.active = false;
                        this.scheduleOnce(() => {
                            this.coins.active = true;
                            this.scheduleOnce(() => {
                                this.coins.active = false;
                                this.scheduleOnce(() => {
                                    this.coins.active = true;
                                    this.scheduleOnce(() => {
                                        this.coins.active = false;
                                    }, 4)
                                }, 2)
                            }, 4)
                        }, 2)
                    }, 4)
                }, 2)
            }, 4)
        }, 2)
        // this.loopRun();
        // for (let i = 0; i < 2; i++) {
        //     const instcoin = instantiate(this.coins);
        //     instcoin.parent = this.node;
        // }
    }

    // private loopRun() {
    //     tween(this.node).to(1, { position: new Vec3(10, 10, 0) }).call(() => {
    //         console.log("結束動態2");
    //         this.loopRun();
    //     }).tag(123).start();//執行動態
    // }
}


