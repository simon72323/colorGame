import { _decorator, Component, Node } from 'cc';
import { RABaseGameView } from '../view/RAGameView';
import { onBeginGame } from '../enum/RAInterface';
import { RAGameModel } from '../model/RAGameModel';
import { beginGameData } from '../enum/mockData';
import { RAComboView } from '../view/RAComboView';
import { RASymbolTipView } from '../view/RASymbolTipView';
import { RASymbol } from '../view/RASymbol';
import { RASymbolID } from '../enum/RAEnum';
const { ccclass, property } = _decorator;

@ccclass('RAGameControl')
export class RAGameControl extends Component {

    @property(RABaseGameView)
    public gameView: RABaseGameView = null!; // game view

    @property(RAGameModel)
    public model: RAGameModel = null!; // game view

    @property(RAComboView)
    public comboView: RAComboView = null; // game combo

    @property(RASymbolTipView)
    public tipView: RASymbolTipView = null; // symbol tip

    private hasGameStarted: boolean = false;

    protected onLoad(): void {
    }

    protected start(): void  {
        this.gameView.playOpenFx();
        this.model.enableTip = true;
        // this.tipView.enableTipBtn(true);
    }

    public onSpin(): void {
    }

    public onBeginGame(msg: object): void {
        this.model.setBeginGameData(msg as onBeginGame);

        if (!this.hasGameStarted) {
            this.playFirstMultiple();
            this.hasGameStarted = true;
        }

        this.updateSymbols();
        this.model.enableTip = false;

        // 監聽公版事件
        // useGlobalEventDispatcher().addEventListener(gtCommEvents.Game.SPIN, ()=>{
        //})
        this.resetStatus();
    }

    public showTip(event: Event, customEventData: string): void {
        if(!this.model.enableTip){
            return;
        }

        const node: Node = (event.target as undefined)as Node;
        const id: RASymbolID = node.getComponent(RASymbol).symbolID;
        const rates: number[] = this.model.getRates(id);

        this.tipView.showTip(node, rates);
    }

    protected update(deltaTime: number): void {
    }

    /**
     * symbol掉落演出，盤面symbol顯示為server給的資料
     */
    private updateSymbols(): void {
        const cards = this.model.shiftCardsData(); // 盤面更新卡牌資料
        let gwdata = this.model.shiftGreenWildData();
        let rwdata = this.model.shiftRedWildData();

        console.log('cards:', JSON.stringify(cards));

        this.gameView.updateSymbols(cards, () => {
            this.handleBeginGame();
        });
    }

    /**
     * 處理 onBeginGame
     */
    private handleBeginGame(): void {
        console.log('handleBeginGame...');
        // 更新落下的 symbol
        if (this.model.isLineHit()) {
            this.playLineWin();
            console.log('1.中線表演')
        } else if (this.model.isScatterHit()) {
            console.log('2.演出中scatter');
            this.playScatterWin();
        } else {
            // 都沒中的情況
            console.log('3.所有獎項演出完畢!');
            // this.hasGameStarted = false;
            this.model.enableTip = true;
            // this.tipView.enableTipBtn(true);
        }
    }

    // 第一次亮燈
    private playFirstMultiple(): void {
        const deafultLine: number = 0;
        const isFreeGame: boolean = false;
        this.comboView.showMultipleLabel(deafultLine, isFreeGame);
    }

    /**
     * 處理中線演出
     */
    private playLineWin(): void {
        let linedata = this.model.shiftLinesData(); // 中線資料
        let draw = this.model.shiftCardsData(); // 補牌資料
        let gwdata = this.model.shiftGreenWildData();
        let rwdata = this.model.shiftRedWildData();
        let accumulateData = this.model.shiftAccumulateData(); // 累積加總分數資料

        console.log('linedata: ', JSON.stringify(linedata));
        console.log('draw: ', JSON.stringify(draw));
        console.log('gwdata: ', JSON.stringify(gwdata));
        console.log('rwdata: ', JSON.stringify(rwdata));
        this.gameView.playLinesWin(linedata, draw, gwdata, rwdata,() => { this.handleBeginGame(); });
        this.comboView.setLineWinInfo(linedata, accumulateData, this.model.isFreeGameSpin());

    }

    /**
     * 處理中Scatter演出
     */
    private playScatterWin(): void {
        this.gameView.playScatterWin(this.model.getScatterData(), () => { this.handleBeginGame(); });
        this.comboView.setScatterWinInfo();
    }

    private resetStatus(): void {
        // this.hasGameStarted = false;
        // FreeGameSpin
        this.comboView.resetComboInfo(this.model.isFreeGameSpin());
    }
}

