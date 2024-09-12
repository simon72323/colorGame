import { _decorator, Component, SpriteFrame, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CGResource')
export class CGResource extends Component {
    @property({ type: [SpriteFrame], tooltip: "下注籌碼貼圖" })
    public chipSF: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "結算區骰子顏色" })
    public resultColorSF: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "路紙區骰子顏色" })
    public roadColorSF: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "勝利倍率貼圖" })
    public winOddSF: SpriteFrame[] = [];
}