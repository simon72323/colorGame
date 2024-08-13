import { _decorator, Component, UITransform, tween, Vec3, Tween, Node, CCInteger, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('tipMove_TA')
export class tipMove_TA extends Component {
    @property(CCInteger)
    public mainTipNum: number = 4;//主tip數量
    @property(CCInteger)
    public freeGameTipId: number = 4;//免費遊戲tip編號
    @property(CCFloat)
    public tipStartXPos: number = 0;//tip的X軸起始位置
    @property(CCFloat)
    public tipExitXPos: number = 0;//tip的X軸結束位置
    private runTipId = 0;//紀錄執行中的主tip編號(0開頭)
    private waitRunTime = 1;//tip文字顯示時，等待移動的時間

    //tip跑動(免費模式狀態)(透過主腳本觸發)
    runTip(freeGameMode: Boolean) {
        for (let i = 0; i < this.node.children.length; i++) {
            this.node.children[i].active = false;//先隱藏所有tip
        }
        const runningTip = (tipNode: Node) => {
            const startXPos = (tipNode.getComponent(UITransform).width / 2) + this.tipStartXPos;//計算該tip的起點X座標
            if (startXPos < 0) {
                //如果起點座標小於0(代表該提示長度在顯示範圍內，等待4秒後切換下一條)
                tipNode.position = new Vec3(0, 0, 0);
                tween(this).delay(4)
                    .call(() => {
                        this.runTip(freeGameMode);//再次執行
                    }).tag(99).start();
            } else {
                //長度超過顯示範圍，會移動到退出畫面外，換下一條
                tipNode.position = new Vec3(startXPos, 0, 0);
                const endXPos = -(tipNode.getComponent(UITransform).width / 2) + this.tipExitXPos;//計算該tip的終點X座標
                const runTime = (startXPos - endXPos) / 100;//計算移動時間(每秒移動100單位)
                tween(tipNode).delay(this.waitRunTime).to(runTime, { position: new Vec3(endXPos, 0, 0) })
                    .call(() => {
                        this.runTip(freeGameMode);//再次執行
                    }).tag(99).start();
            }
            tipNode.active = true;//顯示該tip
        }
        if (freeGameMode) {
            const tipNode = this.node.children[this.freeGameTipId];
            runningTip(tipNode);
        } else {
            this.runTipId = this.runTipId < this.mainTipNum ? this.runTipId : 0;//判斷執行中的tipId
            const tipNode = this.node.children[this.runTipId];
            runningTip(tipNode);
            this.runTipId++;//下一個執行的編號
        }
    }

    //隱藏時
    onDisable() {
        Tween.stopAllByTag(99);//停止編號99的itween動態
    }
}