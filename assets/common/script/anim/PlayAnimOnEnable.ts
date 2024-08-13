import { _decorator, Component, Animation, error, AnimationClip, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayAnimOnEnable')
export class PlayAnimOnEnable extends Component {
    @property({ tooltip: "[默認]或[第一個]動態播完後自動隱藏此節點" })
    private autoHide: boolean = false;
    @property({ tooltip: "是:執行起始+循環動態，否:執行單一動態" })
    private isInLoop: boolean = false;
    @property({
        type: AnimationClip,
        visible: function (this: PlayAnimOnEnable) {
            if (!this.isInLoop)
                this.inAnim = null
            return this.isInLoop;
        }, tooltip: "循環起始動態名稱"
    })

    private inAnim: AnimationClip = null;
    @property({
        type: AnimationClip,
        visible: function (this: PlayAnimOnEnable) {
            if (!this.isInLoop)
                this.loopAnim = null
            return this.isInLoop;
        }, tooltip: "循環動態名稱"
    })

    private loopAnim: AnimationClip = null;

    public onEnable(): void {
        const uiOpacity = this.getComponent(UIOpacity);
        if (uiOpacity)
            uiOpacity.opacity = 0;
        const anim = this.getComponent(Animation);
        if (this.isInLoop) {
            if (anim.clips.length === 0) {
                error(`[ERROR] ${this.node.name} has no clip to play!!!`)
                return;
            }
            anim.getState(this.inAnim.name).setTime(0);
            anim.play(this.inAnim.name);
            anim.on(Animation.EventType.FINISHED, () => {
                anim.getState(this.loopAnim.name).setTime(0);
                anim.play(this.loopAnim.name);
            })
        } else {
            if (anim.clips.length === 0) {
                error(`[ERROR] ${this.node.name} has no clip to play!!!`)
                return;
            }
            let name = '';
            if (anim.defaultClip)
                name = anim.defaultClip.name;//優先播放默認動態
            else
                name = anim.clips[0].name;
            anim.getState(name).setTime(0);
            anim.play(name);
            if (this.autoHide)
                anim.on(Animation.EventType.FINISHED, () => {
                    this.node.active = false;
                })
        }
    }

    public onDisable(): void {
        const anim = this.getComponent(Animation);
        if (anim.clips.length === 0) {
            return;
        }
        this.getComponent(Animation).stop();
    }
}