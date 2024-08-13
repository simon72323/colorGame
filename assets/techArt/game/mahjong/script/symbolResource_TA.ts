import { _decorator, Component, SpriteFrame, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('symbolResource_TA')
export class symbolResource_TA extends Component {
    @property({ type: [SpriteFrame], tooltip: "symbol圖" })
    public symbolSF: SpriteFrame[] = []!;
    @property({ type: [SpriteFrame], tooltip: "symbol模糊圖" })
    public symbolBlurSF: SpriteFrame[] = []!;
    @property({ type: [SpriteFrame], tooltip: "胡牌牌型語系貼圖" })
    public huTypeSF: SpriteFrame[] = []!;
    @property({ type: [SpriteFrame], tooltip: "胡牌牌型標題語系貼圖" })
    public huTypeTitleSF: SpriteFrame[] = []!;

    @property({ type: Prefab, tooltip: "symbol靜態節點" })
    public symbolNode: Prefab = null!;
    @property({ type: Prefab, tooltip: "符號中獎" })
    public symbolWin: Prefab = null!;

    //symbolId對應資源array位置
    // public symbolArrayID = {
    //     1: 0,
    //     2: 1,
    //     3: 2,
    //     4: 3,
    //     5: 4,
    //     6: 5,
    //     7: 6,
    //     8: 7,
    //     9: 8,
    //     10: 9,
    //     11: 10,
    //     12: 11,
    //     13: 12,
    //     14: 13,
    //     15: 14,
    //     16: 15,
    //     17: 16,
    //     18: 17,
    //     19: 18,
    //     20: 19,
    //     21: 20,
    //     22: 21,
    //     23: 22,
    //     24: 23,
    //     25: 24,
    //     26: 25,
    //     27: 26,
    //     28: 27,
    //     29: 28,
    //     30: 29,
    //     31: 30,
    //     32: 31,
    //     33: 32,
    //     34: 33,
    //     35: 34,
    //     36: 35,
    //     37: 36,
    //     38: 37,
    //     39: 38,
    //     40: 39,
    //     41: 40,
    //     42: 41,
    //     43: 42,
    // }
}


