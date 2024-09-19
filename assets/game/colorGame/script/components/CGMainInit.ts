import { _decorator, Component, SpriteFrame, Prefab } from 'cc';
import { CGView } from './CGView';
import { CGModel } from './CGModel';
import { CGZoom } from './CGZoom';
import { CGChipController } from './CGChipController';
import { CGManager } from './CGManager';
import { CGChipSet } from './CGChipSet';
import { CGBigWin } from './CGBigWin';
import { CGDiceRunSet } from './CGDiceRunSet';
import { WorkOnBlur_Simon } from '../../../../common/script/tools/WorkOnBlur_Simon';
import { WorkerTimeout_Simon } from '../../../../common/script/lib/WorkerTimeout_Simon';
import { Marquee } from '../../../../common/script/components/Marquee';
const { ccclass, property } = _decorator;

@ccclass('CGMainInit')
export class CGMainInit extends Component {
    //組件腳本
    @property({ type: CGView, tooltip: "遊戲介面腳本", group: { name: '遊戲腳本', id: '1' } })
    public View: CGView = null;
    @property({ type: CGZoom, tooltip: "縮放腳本", group: { name: '遊戲腳本', id: '1' } })
    public Zoom: CGZoom = null;
    @property({ type: CGChipController, tooltip: "籌碼控制腳本", group: { name: '遊戲腳本', id: '1' } })
    public ChipController: CGChipController = null;
    @property({ type: CGManager, tooltip: "遊戲流程腳本", group: { name: '遊戲腳本', id: '1' } })
    public Manager: CGManager = null;
    @property({ type: CGChipSet, tooltip: "遊戲流程腳本", group: { name: '遊戲腳本', id: '1' } })
    public ChipSet: CGChipSet = null;
    @property({ type: CGBigWin, tooltip: "大獎表演", group: { name: '遊戲腳本', id: '1' } })
    public BigWin: CGBigWin = null;
    @property({ type: CGDiceRunSet, tooltip: "開骰表演", group: { name: '遊戲腳本', id: '1' } })
    public DiceRunSet: CGDiceRunSet = null;
    // @property({ type: Marquee, tooltip: "跑馬燈腳本" })
    // private Marquee: Marquee = null;

    public Model: CGModel = null;

    //遊戲資源
    @property({ type: [SpriteFrame], tooltip: "下注籌碼貼圖", group: { name: '貼圖資源', id: '2' } })
    public chipSF: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "結算區骰子顏色", group: { name: '貼圖資源', id: '2' } })
    public resultColorSF: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "路紙區骰子顏色", group: { name: '貼圖資源', id: '2' } })
    public roadColorSF: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "勝利倍率貼圖", group: { name: '貼圖資源', id: '2' } })
    public winOddSF: SpriteFrame[] = [];
    @property({ type: Prefab, tooltip: "提示訊息", group: { name: 'prefab資源', id: '3' } })
    public tipPrefab: Prefab = null;
    @property({ type: Prefab, tooltip: "其他玩家下注籌碼", group: { name: 'prefab資源', id: '3' } })
    public betChipBlack: Prefab = null;
    @property({ type: Prefab, tooltip: "本地玩家下注籌碼", group: { name: 'prefab資源', id: '3' } })
    public betChipColor: Prefab = null;

    async onLoad() {
        //啟用後台運行(針對動畫、tween、schedule、spine等動畫)
        WorkOnBlur_Simon.getInstance();
        WorkerTimeout_Simon.getInstance().enable();
        // 初始化所有组件
        this.initComponents();
    }
    private initComponents() {
        // 初始化各个组件,并传入必要的引用
        this.Model = CGModel.getInstance();
        this.View.init(this);
        this.ChipController.init(this);
        this.Manager.init(this);
        this.ChipSet.init(this);
        // this.zoom.init(this);
    }
}