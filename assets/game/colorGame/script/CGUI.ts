import { _decorator, Component, Node, EventHandler, Button, Label, UITransform, Toggle } from 'cc';
import { CGData } from './CGData';
import { UtilsKitS } from '../../../common/script/lib/UtilsKitS';
const { ccclass, property } = _decorator;

//負責處理介面操作與更新

@ccclass('CGUI')
export class CGUI extends Component {
    @property({ type: Node, tooltip: "背景燈光" })
    public bgLight: Node = null;
    @property({ type: Node, tooltip: "資訊面板" })
    public infoBar: Node = null;
    @property({ type: Node, tooltip: "玩家位置" })
    public playerPos: Node = null;
    @property({ type: [Node], tooltip: "跟注按鈕(3顆)" })
    public btnCall: Node[] = [];
    @property({ type: [Node], tooltip: "取消跟注按鈕(3顆)" })
    public btnStopCall: Node[] = [];
    @property({ type: [Node], tooltip: "跟注特效" })
    public callFx: Node[] = [];
    @property({ type: Node, tooltip: "下注按鈕區" })
    public betArea: Node = null;
    @property({ type: Node, tooltip: "下注勝利顯示區" })
    public betWin: Node = null;
    @property({ type: Node, tooltip: "下注區資訊" })
    public betInfo: Node = null;
    @property({ type: Node, tooltip: "下注提示光區" })
    public betLight: Node = null;
    @property({ type: Node, tooltip: "籌碼選擇區" })
    public selectChip: Node = null;
    @property({ type: Node, tooltip: "本地玩家贏分特效" })
    public mainPlayerWin: Node = null;
    @property({ type: Node, tooltip: "結算" })
    public result: Node = null;
    @property({ type: Node, tooltip: "大贏分" })
    public bigWin: Node = null;
    @property({ type: Node, tooltip: "3d盒子" })
    public box3D: Node = null;
    @property({ type: Node, tooltip: "下注時間" })
    public betTime: Node = null;
    @property({ type: Node, tooltip: "'狀態標題(子物件):0=開始押注，1=停止押注，2=等待下局開始" })
    public stageTitle: Node = null;

    //籌碼相關
    @property({ type: Node, tooltip: "籌碼派發層" })
    public chipDispatcher: Node = null;
    @property({ type: Node, tooltip: "續押按鈕" })
    public btnRebet: Node = null;
    @property({ type: Node, tooltip: "自動投注按鈕" })
    public btnAuto: Node = null;
    @property({ type: Node, tooltip: "停止自動投注按鈕" })
    public btnAutoStop: Node = null;
    @property({ type: Label, tooltip: "續押分數" })
    public rebetScoreLable: Label = null;
    @property({ type: Node, tooltip: "提示訊息顯示層" })
    public tipMessage: Node = null;

    @property({ type: Node, tooltip: "下注分數按鈕(公版)" })
    public comBtnBet: Node = null;
    @property({ type: Node, tooltip: "分數兌換按鈕(公版)" })
    public comBtnScores: Node = null;

    @property({ type: CGData, tooltip: "遊戲資料腳本" })
    private gameData: CGData = null;

    onLoad() {
        const scriptName = this.name.split('<')[1].split('>')[0];
        //btnCall按鈕觸發事件設置
        for (let i = 0; i < this.btnCall.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'btnCallDown';
            eventHandler.customEventData = i.toString();
            this.btnCall[i].getComponent(Button).clickEvents.push(eventHandler);
        }
        //btnCall按鈕觸發事件設置
        for (let i = 0; i < this.btnCall.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'btnStopCallDown';
            eventHandler.customEventData = i.toString();
            this.btnStopCall[i].getComponent(Button).clickEvents.push(eventHandler);
        }
        //選擇籌碼按鈕觸發事件設置
        for (let i = 0; i < this.selectChip.children.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'setSelectChipID';
            eventHandler.customEventData = i.toString();
            this.selectChip.children[i].getComponent(Toggle).clickEvents.push(eventHandler);
        }
    }

    //籌碼選擇設置
    private setSelectChipID(event: Event, id: number) {
        this.gameData.selectChipID = this.gameData.localPlayerData.ChipSetID[id];
    }

    //跟注按鈕按下
    private btnCallDown(event: Event, id: number) {
        this.startBetCall(id);
    }

    //取消跟注按鈕按下
    private btnStopCallDown(event: Event, id: number) {
        this.stopBetCall(id);
    }

    //取消跟注
    public stopBetCall(id: number) {
        this.btnCall[id].active = true;
        this.btnStopCall[id].active = false;
        this.callFx[id].active = false;//特效隱藏
    }

    //啟用跟注
    public startBetCall(id: number) {
        this.btnCall[id].active = false;
        this.btnStopCall[id].active = true;
        this.callFx[id].active = true;//特效顯示
    }

    //更新分數
    public updataUIScore() {
        this.comBtnBet.getChildByName('Label').getComponent(Label).string = UtilsKitS.NumDigits(this.gameData.localPlayerData.BetTotalCredit);
        this.comBtnScores.getChildByName('Label').getComponent(Label).string = UtilsKitS.NumDigits(this.gameData.localPlayerData.Credit);
        for (let i = 1; i < 4; i++) {
            this.playerPos.children[i].children[0].getChildByName('Label').getComponent(Label).string = UtilsKitS.NumDigits(this.gameData.topPlayerData[i - 1].Credit);
        }
        for (let i = 0; i < 6; i++) {
            this.betInfo.children[i].getChildByName('TotalScore').getChildByName('Label').getComponent(Label).string = UtilsKitS.NumDigits(this.gameData.betInfo.BetAreaTotal[i]);
            this.betInfo.children[i].getChildByName('BetScore').getComponent(Label).string = UtilsKitS.NumDigits(this.gameData.localPlayerData.BetCredit[i]);
        }
        //下注區分數比例更新
        let allScroe = this.gameData.betInfo.BetAreaTotal.reduce((a, b) => a + b, 0);
        for (let i = 0; i < this.gameData.betInfo.BetAreaTotal.length; i++) {
            let per = allScroe === 0 ? 0 : Math.trunc(this.gameData.betInfo.BetAreaTotal[i] / allScroe * 100);
            const percentNode = this.betInfo.children[i].getChildByName('Percent');
            percentNode.getChildByName('Label').getComponent(Label).string = per + '%';
            percentNode.getChildByName('PercentBar').getComponent(UITransform).width = per;
        }
    }
}