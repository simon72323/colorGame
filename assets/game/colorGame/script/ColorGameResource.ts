import { _decorator, Component, SpriteFrame, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ColorGameResource')
export class ColorGameResource extends Component {

    // @property({ type: [SpriteFrame], tooltip: "symbol圖" })
    // public symbolSF: SpriteFrame[] = [];
    // @property({ type: [SpriteFrame], tooltip: "symbol模糊圖" })
    // public symbolBlurSF: SpriteFrame[] = [];
    // @property({ type: [SpriteFrame], tooltip: "胡牌牌型語系貼圖" })
    // public huTypeSF: SpriteFrame[] = [];
    // @property({ type: [SpriteFrame], tooltip: "胡牌牌型標題語系貼圖" })
    // public huTypeTitleSF: SpriteFrame[] = [];

    @property({ type: Prefab, tooltip: "其他玩家下注籌碼" })
    public betChipBlack: Prefab = null;
    @property({ type: Prefab, tooltip: "本地玩家下注籌碼" })
    public betChipColor: Prefab = null;
    @property({ type: [SpriteFrame], tooltip: "籌碼貼圖，依照編號0~4:藍紅黃紫綠" })
    public chipSpriteFrame: SpriteFrame[] = [];

    // @property({ type: Prefab, tooltip: "籌碼黑" })
    // public chipBlack: Prefab = null;
    // @property({ type: [Prefab], tooltip: "籌碼顏色，依照編號0~4:藍紅黃紫綠" })
    // public chipColor: Prefab[] = [];


    start() {

    }

    update(deltaTime: number) {

    }
}


