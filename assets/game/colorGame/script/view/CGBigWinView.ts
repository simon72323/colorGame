import { _decorator, Component, Node, instantiate, tween, Vec3, Animation, UIOpacity, Label, Vec2 } from 'cc';
import { CGUtils } from '../tools/CGUtils';

const { ccclass, property } = _decorator;

@ccclass('CGBigWin')
export class CGBigWin extends Component {
    private chips: Node[] = [];
    @property({ type: Node, tooltip: "大贏節點" })
    private bigWin!: Node;
    @property({ type: Node, tooltip: "要噴的籌碼層" })
    private chipParent!: Node;

    /**
     * 在組件載入時初始化籌碼陣列
     * 遍歷 chipParent 的子節點，將它們添加到 chips 陣列中
     */
    protected onLoad(): void {
        for (const chip of this.chipParent.children)
            this.chips.push(chip);
    }

    /**
     * 運行大獎動畫並顯示獲勝金額
     * @param winCredit - 獲勝的金額
     * @returns 動畫完成後 resolve
     */
    public runBigWin(winCredit: number): Promise<void> {
        this.bigWin.active = true;
        return new Promise<void>(async (resolve) => {
            this.bigWin.getComponent(UIOpacity).opacity = 0;
            this.bigWin.getComponent(Animation).play('BigWinShow');
            const label = this.bigWin.getChildByName('WinCredit').getChildByName('Label').getComponent(Label);
            label.string = '0';
            CGUtils.runCredit(1.2, winCredit, label);
            this.chipRunAndDistroy(30, new Vec2(500, 300));//噴籌碼
            await CGUtils.Delay(1.1);
            this.bigWin.getComponent(Animation).play('BigWinHide');
            await CGUtils.Delay(0.6);
            this.scheduleOnce(() => {
                this.bigWin.active = false;
            }, 0.2)
            resolve();
        });
    }

    /**
     * 執行多個籌碼的生成和銷毀
     * @param count - 要生成的籌碼數量
     * @param size - 籌碼移動的範圍大小
     */
    private chipRunAndDistroy(count: number, size: Vec2) {
        for (let i = 0; i < count; i++) {
            this.scheduleOnce(() => this.createChip(size), Math.random() * 1.2);
        }
    }

    /**
     * 生成籌碼
     * @param size - 籌碼移動的範圍大小
     */
    private createChip(size: Vec2) {
        const instCoin = instantiate(this.chips[Math.floor(Math.random() * this.chips.length)]);
        const chipParent = new Node();
        chipParent.addChild(instCoin);
        this.chipParent.addChild(chipParent);

        // 計算籌碼的移動距離
        const moveX = size.x * (Math.random() * 2 - 1);
        let moveY = size.y + Math.random() * 100;
        moveY += Math.max(0, (size.x / 2 - Math.abs(moveX)) / 2);

        const moveTime = 0.8 + Math.random() * 0.2;// 設定移動時間

        // 設定父節點的水平移動動畫
        tween(chipParent)
            .to(moveTime, { position: new Vec3(moveX, 0, 0) }, { easing: 'sineOut' })
            .call(() => instCoin.destroy())
            .start();

        // 設定籌碼的垂直移動動畫
        tween(instCoin)
            .to(moveTime / 2, { position: new Vec3(0, moveY, 0) }, { easing: 'sineOut' })
            .then(tween(instCoin).to(moveTime / 2, { position: Vec3.ZERO }, { easing: 'sineIn' }))
            .start();
    }
}