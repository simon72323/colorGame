import { _decorator, Component, Node, Animation, Vec3, Button, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ColorGameValue')
export class ColorGameValue extends Component {
    /**
         * 注區編號:0=黃，1=灰，2=紫，3=藍，4=紅，5=綠
         * 下注人:0=玩家1，1=玩家2，2=玩家3，3=其他玩家，4=本地玩家
         * 籌碼編號:0=藍，1=紅，2=黃，3=紫，4=綠，5=黑(別的玩家)
         */
    public betCreditRange: number[] = [10, 20, 50, 100, 200];
    public selectChipID: number = 1;//目前選擇的籌碼

    public PlayerCredit: number = 0;//本地玩家分數
    public otherPlayerCredit: number[] = [0, 0, 0];//其他3位顯示玩家分數

    public colorPer: number[] = [0, 0, 0, 0, 0, 0];//100局顏色比例

    //目前玩家下注籌碼分數([注區][玩家分數])
    public betCreditValue: number[][] = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ];

    public resetBetCredit() {
        this.betCreditValue = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
    }

    onLoad() {

    }

    //接收SelectChip按鈕事件
    public setSelectChipID(event: Event, id: number) {
        this.selectChipID = id;
    }
}


