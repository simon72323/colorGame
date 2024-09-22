import { _decorator, Component, Animation, error, AnimationClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('playAnimOnEnable')
export class playAnimOnEnable extends Component {
    @property({ tooltip: "是:執行起始+循環動態，否:執行單一動態" })
    private isInLoop: boolean = false;

    @property({
        type: AnimationClip,
        visible: function (this: playAnimOnEnable) {
            if (!this.isInLoop)
                this.inAnim = null //this.isInLoop沒勾選時，this.inAnim項目為空
            return this.isInLoop;  //this.isInLoop為勾選狀態時，顯示inAnim動畫片段欄位
        }, tooltip: "循環起始動態名稱"
    })
    private inAnim: AnimationClip = null;  //起始動畫

    // @property({  //註銷舊寫法
    //     type: AnimationClip,
    //     visible: function (this: playAnimOnEnable) {
    //         if (!this.isInLoop)
    //             this.loopAnim = null
    //         return this.isInLoop; //this.isInLoop為勾選狀態時，顯示loopAnim動畫片段欄位
    //     }, tooltip: "循環動態名稱"
    // })
    // private loopAnim: AnimationClip = null;

    @property({
        type: AnimationClip,
        visible() {  //與原寫法功能一樣
            return (this.isInLoop === true); //this.isInLoop為勾選狀態時，顯示loopAnim動畫片段欄位
        }, tooltip: "循環動態名稱"
    })
    private loopAnim: AnimationClip = null; //循環動畫

    public onEnable(): void { //不加void也可以
        const anim = this.getComponent(Animation);
        if (this.isInLoop) { //有勾選循環時
            if (anim.clips.length === 0) { //如果Animation組件的Clip列表是空的
                error(`[ERROR] ${this.node.name} has no clip to play!!!`)  //只在編輯器控制台內顯示報錯訊息
                return;
            }
            anim.getState(this.inAnim.name).setTime(0); //設定動畫跳至時間0的位置
            anim.play(this.inAnim.name);  //播放起始動畫
            anim.on(Animation.EventType.FINISHED, () => {  //動畫若播完執行以下工作
                anim.getState(this.loopAnim.name).setTime(0);
                anim.play(this.loopAnim.name);  //播放循環動畫
            });
        } else {  //沒勾選循環時
            if (anim.clips.length === 0) {
                error(`[ERROR] ${this.node.name} has no clip to play!!!`)
                return;
            }
            let name = '';
            if (anim.defaultClip) { //如有設定默認動畫優先播放
                // console.warn('anim.defaultClipl：' + anim.defaultClip);
                name = anim.defaultClip.name; //使用默認動畫
                // console.warn('anim.defaultClipl.name：' + anim.defaultClip.name);
            } else {
                name = anim.clips[0].name;  //使用動畫列表第一個動畫
            }
            anim.getState(name).setTime(0);  //設定動畫跳至時間0的位置
            anim.play(name);
        }
    }

    public onDisable(): void {
        const anim = this.getComponent(Animation);
        if (anim.clips.length === 0) { //@如果動畫列表內是空的就跳出，不寫這段會有問題？
            return;  //結束此涵式
        }
        this.getComponent(Animation).stop();  //停止動畫播放
    }
}