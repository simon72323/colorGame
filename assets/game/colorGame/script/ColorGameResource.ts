import { _decorator, Component, SpriteFrame, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ColorGameResource')
export class ColorGameResource extends Component {
    @property({ type: Prefab, tooltip: "其他玩家下注籌碼" })
    public betChipBlack: Prefab = null;
    @property({ type: Prefab, tooltip: "本地玩家下注籌碼" })
    public betChipColor: Prefab = null;
    @property({ type: [SpriteFrame], tooltip: "下注籌碼貼圖" })
    public chipSpriteFrame: SpriteFrame[] = [];
    // @property({ type: [SpriteFrame], tooltip: "按鈕籌碼貼圖" })
    // public btnChipSpriteFrame: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "結算區骰子顏色" })
    public resultColorSpriteFrame: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "路紙區骰子顏色" })
    public roadColorSpriteFrame: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "勝利倍率貼圖" })
    public winOddSpriteFrame: SpriteFrame[] = [];

    start() {

    }

    update(deltaTime: number) {

    }
}


