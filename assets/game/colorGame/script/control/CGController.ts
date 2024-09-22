import { _decorator, Component, SpriteFrame, Prefab } from 'cc';
import { CGView } from '../view/CGView';
import { CGModel } from '../model/CGModel';
import { CGZoomView } from '../view/CGZoomView';
import { CGChipDispatcher } from '../view/CGChipDispatcher';
import { CGRoundView } from '../view/CGRoundView';
import { CGChipSetView } from '../view/CGChipSetView';
import { CGBigWin } from '../view/CGBigWinView';
import { CGDiceRunView } from '../view/CGDiceRunView';
import { CGMarquee } from '../view/CGMarquee';
import PoolHandler from '../tools/PoolHandler';
const { ccclass, property } = _decorator;

@ccclass('CGController')
export class CGController extends Component {
    //組件腳本
    @property({ type: CGModel, tooltip: "GameModel", group: { name: '遊戲腳本', id: '1' } })
    public model: CGModel = null;
    @property({ type: CGView, tooltip: "介面腳本", group: { name: '遊戲腳本', id: '1' } })
    public view: CGView = null;
    @property({ type: CGZoomView, tooltip: "骰子視角腳本", group: { name: '遊戲腳本', id: '1' } })
    public zoomView: CGZoomView = null;
    @property({ type: CGChipDispatcher, tooltip: "籌碼表演腳本", group: { name: '遊戲腳本', id: '1' } })
    public chipDispatcher: CGChipDispatcher = null;
    @property({ type: CGRoundView, tooltip: "回合腳本", group: { name: '遊戲腳本', id: '1' } })
    public roundView: CGRoundView = null;
    @property({ type: CGChipSetView, tooltip: "籌碼設置腳本", group: { name: '遊戲腳本', id: '1' } })
    public chipSetView: CGChipSetView = null;
    @property({ type: CGBigWin, tooltip: "大獎表演", group: { name: '遊戲腳本', id: '1' } })
    public bigWin: CGBigWin = null;
    @property({ type: CGDiceRunView, tooltip: "開骰表演", group: { name: '遊戲腳本', id: '1' } })
    public diceRunView: CGDiceRunView = null;
    @property({ type: CGMarquee, tooltip: "跑馬燈腳本" })
    private Marquee: CGMarquee = null;

    // public dataModel: CGDataModel = null;

    //遊戲資源

    @property({ type: [SpriteFrame], tooltip: "結算區骰子顏色", group: { name: '貼圖資源', id: '2' } })
    public resultColorSF: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "路紙區骰子顏色", group: { name: '貼圖資源', id: '2' } })
    public roadColorSF: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "勝利倍率貼圖", group: { name: '貼圖資源', id: '2' } })
    public winOddSF: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "頭像貼圖", group: { name: '貼圖資源', id: '2' } })
    public avatarPhoto: SpriteFrame[] = [];

    protected onLoad() {
        this.node.on('OnButtonEventPressed', this.onBetAreaPressed, this);
        // 初始化所有组件
        this.initComponents();
        // this.initWebSocket();

        //開始模擬server發送消息
        // this.startSimulatingServerMessages();
    }

    //注區按下
    private onBetAreaPressed(param: string): void {
        this.chipDispatcher.createChipToBetArea(Number(param), 0, this.model.touchChipID, false);
    }

    //設置點選中的籌碼ID
    setTouchChipID(chipID: number) {
        this.model.touchChipID = chipID;
    }
    // //取得點選中的籌碼ID
    // getTouchChipID(): number {
    //     return this.model.touchChipID;
    // }

    //等待接收到onJoinGame之後，傳送chipRange給需要的View
    setChipRangeToView() {
        const chipRange = [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];
        this.chipSetView.setChipRange(chipRange);
    }

    private initComponents() {
        // 初始化各个组件,并传入必要的引用
        // this.model.init(this);
        // this.view.init(this);
        // this.chipDispatcher.init(this);
        // this.roundManager.init(this);
        this.chipSetView.init(this);
        // this.zoom.init(this);
    }


}