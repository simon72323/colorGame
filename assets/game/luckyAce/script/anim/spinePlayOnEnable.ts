import { _decorator, Component, sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('spinePlayOnEnable')
export class spinePlayOnEnable extends Component {
    @property({ tooltip: "是:執行起始+循環動態，否:執行單一動態" })
    private isInLoop: boolean = false;
    @property({
        visible: function (this: spinePlayOnEnable) {
            if (!this.isInLoop)
                this.inAnimName = '';
            return this.isInLoop;
        }, tooltip: "循環起始動態名稱"
    })
    private inAnimName: string = 'in'

    @property({
        visible: function (this: spinePlayOnEnable) {
            if (!this.isInLoop)
                this.loopAnimName = '';
            return this.isInLoop;
        }, tooltip: "循環動態名稱"
    })
    private loopAnimName: string = 'loop';

    public onEnable(): void {
        const skel = this.getComponent(sp.Skeleton)!;
        if (this.isInLoop) {
            skel.setAnimation(0, this.inAnimName, false);//播放進入動態
            skel.setCompleteListener(() => {
                skel.setAnimation(0, this.loopAnimName, true);//播放循環動態
            })
        } else {
            skel.setAnimation(0, skel.animation, skel.loop);//播放預設動態
        }
    }
}