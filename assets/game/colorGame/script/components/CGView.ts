import { _decorator, Component, Node, Label, UITransform, EventHandler, Sprite, Button, Color } from 'cc';
import { CGGameManager } from './CGGameManager';
import { UtilsKits } from '../tools/UtilsKits';
import { CGUtils } from '../tools/CGUtils';

const { ccclass, property } = _decorator;
//負責處理介面操作與更新
@ccclass('CGView')
export class CGView extends Component {
    @property({ type: Node, tooltip: "背景燈光", group: { name: '基本介面', id: '1' } })
    public bgLight: Node = null;
    @property({ type: Node, tooltip: "資訊面板", group: { name: '基本介面', id: '1' } })
    public infoBar: Node = null;
    @property({ type: Node, tooltip: "結算", group: { name: '基本介面', id: '1' } })
    public result: Node = null;
    @property({ type: Node, tooltip: "'狀態標題", group: { name: '基本介面', id: '1' } })
    public stageTitle: Node = null;
    @property({ type: Node, tooltip: "走勢", group: { name: '基本介面', id: '1' } })
    public roadMap: Node = null;
    @property({ type: Node, tooltip: "走勢彈窗", group: { name: '基本介面', id: '1' } })
    public roadMapPopup: Node = null;
    @property({ type: Node, tooltip: "3d盒子", group: { name: '基本介面', id: '1' } })
    public box3D: Node = null;

    @property({ type: [Node], tooltip: "跟注按鈕(3顆)", group: { name: '跟注', id: '2' } })
    public btnCall: Node[] = [];
    @property({ type: [Node], tooltip: "取消跟注按鈕(3顆)", group: { name: '跟注', id: '2' } })
    public btnStopCall: Node[] = [];
    @property({ type: [Node], tooltip: "跟注特效", group: { name: '跟注', id: '2' } })
    public callFx: Node[] = [];

    @property({ type: Node, tooltip: "下注按鈕區", group: { name: '注區相關', id: '3' } })
    public betArea: Node = null;
    @property({ type: Node, tooltip: "下注勝利顯示區", group: { name: '注區相關', id: '3' } })
    public betWin: Node = null;
    @property({ type: Node, tooltip: "下注區資訊", group: { name: '注區相關', id: '3' } })
    public betInfo: Node = null;
    @property({ type: Node, tooltip: "下注提示光區", group: { name: '注區相關', id: '3' } })
    public betLight: Node = null;
    @property({ type: Node, tooltip: "下注時間", group: { name: '注區相關', id: '3' } })
    public betTime: Node = null;
    @property({ type: Node, tooltip: "續押按鈕", group: { name: '注區相關', id: '3' } })
    public btnRebet: Node = null;
    @property({ type: Node, tooltip: "自動投注按鈕", group: { name: '注區相關', id: '3' } })
    public btnAuto: Node = null;
    @property({ type: Node, tooltip: "停止自動投注按鈕", group: { name: '注區相關', id: '3' } })
    public btnAutoStop: Node = null;
    @property({ type: Label, tooltip: "續押額度", group: { name: '注區相關', id: '3' } })
    public rebetCreditLable: Label = null;
    @property({ type: Node, tooltip: "提示訊息顯示層", group: { name: '注區相關', id: '3' } })
    public tipMessage: Node = null;


    @property({ type: Node, tooltip: "玩家位置", group: { name: '玩家', id: '4' } })
    public playerPos: Node = null;
    @property({ type: Node, tooltip: "本地玩家贏分特效", group: { name: '玩家', id: '4' } })
    public mainPlayerWin: Node = null;


    @property({ type: Node, tooltip: "下注額度按鈕(公版)", group: { name: '公版', id: '5' } })
    public comBtnBet: Node = null;
    @property({ type: Node, tooltip: "額度兌換按鈕(公版)", group: { name: '公版', id: '5' } })
    public comBtnCredits: Node = null;

    private gameManager: CGGameManager = null;

    public init(gameManager: CGGameManager) {
        this.gameManager = gameManager;
        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        const view = this.gameManager.view;
        const scriptName = 'CGview';
        //btnCall按鈕觸發事件設置
        for (let i = 0; i < view.btnCall.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'btnCallDown';
            eventHandler.customEventData = i.toString();
            view.btnCall[i].getComponent(Button).clickEvents.push(eventHandler);
        }
        //btnStopCall按鈕觸發事件設置
        for (let i = 0; i < view.btnStopCall.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'btnStopCallDown';
            eventHandler.customEventData = i.toString();
            view.btnStopCall[i].getComponent(Button).clickEvents.push(eventHandler);
        }
    }

    //跟注按鈕按下
    public btnCallDown(event: Event, customEventData: string) {
        const id = parseInt(customEventData);
        // 例如：更新遊戲狀態，發送網路請求等
        this.updateBetCallUI(id, true);//啟用跟注
    }

    //取消跟注按鈕按下
    public btnStopCallDown(event: Event, customEventData: string) {
        const id = parseInt(customEventData);
        // 例如：更新遊戲狀態，發送網路請求等
        this.updateBetCallUI(id, false);//停用跟注
    }

    //更新跟注介面
    public updateBetCallUI(id: number, isActive: boolean) {
        this.btnCall[id].active = !isActive;
        this.btnStopCall[id].active = isActive;
        this.callFx[id].active = isActive;
    }

    //設置子物件("名稱")的Label數值
    private setChildNameLabel(node: Node, name: string, value: number) {
        node.getChildByName(name).getComponent(Label).string = UtilsKits.NumDigits(value);
    }

    //更新額度(籌碼下注完才更新)
    public updateUICredit() {
        const { userTotalBet, credit, totalBets, userBets } = this.gameManager.dataModel.getCreditData();//取得資料
        this.setChildNameLabel(this.comBtnBet, 'Label', userTotalBet);//更新本地用戶總額
        this.setChildNameLabel(this.comBtnCredits, 'Label', credit);//更新本地用戶下注額度
        for (let i = 0; i < 6; i++) {
            const node = this.betInfo.children[i];
            this.setChildNameLabel(node.getChildByName('TotalCredit'), 'Label', totalBets[i]);//更新所有注區下注額度
            this.setChildNameLabel(node, 'BetCredit', userBets[i]);//更新本地用戶各注區的下注額度
        }
        //下注區額度比例更新
        const total = totalBets.reduce((a, b) => a + b, 0);
        totalBets.forEach((credit, i) => {
            const per = total === 0 ? 0 : Math.trunc(credit / total * 100);
            const percentNode = this.betInfo.children[i].getChildByName('Percent');
            percentNode.getChildByName('Label').getComponent(Label).string = per + '%';
            percentNode.getChildByName('PercentBar').getComponent(UITransform).width = per;
        });
    }

    //更新用戶排名(接收server更新)
    public updateUserRanks() {
        const rank = this.gameManager.dataModel.getRanksData();//取得資料
        for (let i = 1; i < 4; i++) {
            const node = this.playerPos.children[i].children[0];
            node.getChildByName('Name').getComponent(Label).string = rank[i - 1].displayName;
            this.setChildNameLabel(node, 'Label', rank[i - 1].credit);
        }
    }

    //更新路紙(接收server更新)
    public updateRoadMap() {
        const { roadColorPers, roadColors } = this.gameManager.dataModel.getRoadMapData();
        const colorMap = this.roadMap.getChildByName('ColorMap');
        const popupColorMap = this.roadMapPopup.getChildByName('ColorMap');
        for (let i = 0; i < 6; i++) {
            const percentage = roadColorPers[i].toFixed(2);
            colorMap.children[i].getComponent(Label).string = percentage + '%';
            popupColorMap.children[i].getComponent(Label).string = percentage + '\n%';
        }
        this.updateLastColors(roadColors);// 更新上局顏色
        this.updateHotColdValues(roadColorPers, colorMap, popupColorMap);// 更新冷熱值
    }

    // 更新路紙，上局顏色
    private updateLastColors(roadColors: number[][]) {
        const lastColor = this.roadMap.getChildByName('LastColor');
        const popupLastColor = this.roadMapPopup.getChildByName('LastColor');
        for (let i = 0; i < 3; i++) {
            lastColor.children[i].getComponent(Sprite).spriteFrame = this.gameManager.roadColorSF[roadColors[0][i]];
        }
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 3; j++) {
                popupLastColor.children[i].children[j].getComponent(Sprite).spriteFrame = this.gameManager.roadColorSF[roadColors[i][j]];
            }
        }
    }

    //更新路紙，冷熱值
    private updateHotColdValues(colorPer: number[], colorMap: Node, popupColorMap: Node) {
        const updateElement = (type: 'Hot' | 'Freeze') => {
            const value = type === 'Hot' ? Math.max(...colorPer) : Math.min(...colorPer);
            const index = colorPer.indexOf(value);
            [colorMap, popupColorMap].forEach(node => {
                const element = node.getChildByName(type);
                element.active = colorPer.lastIndexOf(value) === index;
                if (element.active)
                    element.setPosition(node.children[index].getPosition());
            });
        };
        updateElement('Hot');//更新熱值
        updateElement('Freeze');//更新冷值
    }

    //路紙視窗顯示(節點觸發)
    public roadMapPopupShow() {
        CGUtils.popupShow(this.gameManager.view.roadMapPopup);
    }

    //路紙視窗關閉(節點觸發)
    public roadMapPopupHide() {
        CGUtils.popupHide(this.gameManager.view.roadMapPopup);
    }

    //提示訊息顯示
    public async showTipMessage(tx: string, setColor?: Color) {
        const tip = this.gameManager.pool.get(this.gameManager.tipPrefab);
        const tipLabel = tip.children[0].getComponent(Label);
        tip.parent = this.tipMessage;
        tipLabel.color = setColor ?? new Color(220, 220, 220, 255);
        tipLabel.string = tx;
        await UtilsKits.Delay(1);
        this.gameManager.pool.put(tip);
    }
}