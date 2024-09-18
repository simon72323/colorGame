import { _decorator, Component, Node, EventHandler, Button, Label, UITransform, Toggle, Animation, Sprite, UIOpacity } from 'cc';
import { CGResource } from './CGResource';
import { UtilsKitS } from '../../../common/script/lib/UtilsKitS';
import { RankInfo } from './connector/receive/CGReceive';

export interface ScoreUpdateData {
    betTotalCredit: number;
    credit: number;
    rank: RankInfo[];
    betAreaTotalCredit: number[];
    betAreaCredit: number[];
}
const { ccclass, property } = _decorator;

//負責處理介面操作與更新

@ccclass('CGView')
export class CGView extends Component {
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
    public touchChip: Node = null;
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


    //籌碼設置
    @property({ type: Node, tooltip: "籌碼設置彈窗" })
    public chipSetPopup: Node = null;
    @property({ type: Node, tooltip: "籌碼Toggle" })
    public chipToggle: Node = null;

    @property({ type: Node, tooltip: "下注分數按鈕(公版)" })
    public comBtnBet: Node = null;
    @property({ type: Node, tooltip: "分數兌換按鈕(公版)" })
    public comBtnScores: Node = null;


    //走勢相關介面
    @property({ type: Node, tooltip: "走勢" })
    public roadMap: Node = null;
    @property({ type: Node, tooltip: "走勢彈窗" })
    public roadMapPopup: Node = null;


    //腳本連結
    @property({ type: CGResource, tooltip: "遊戲資源腳本" })
    private gameResource: CGResource = null;


    //更新跟注介面
    public updateBetCallUI(id: number, isActive: boolean) {
        this.btnCall[id].active = !isActive;
        this.btnStopCall[id].active = isActive;
        this.callFx[id].active = isActive;
    }


    //更新分數
    public updateUIScore(data: ScoreUpdateData) {
        const { betTotalCredit, credit, rank, betAreaTotalCredit, betAreaCredit } = data;
        const setDigitLabel = (node: Node, path: string, value: number) => {
            node.getChildByName(path).getComponent(Label).string = UtilsKitS.NumDigits(value);
        };
        setDigitLabel(this.comBtnBet, 'Label', betTotalCredit);
        setDigitLabel(this.comBtnScores, 'Label', credit);
        for (let i = 1; i < 4; i++) {
            const node = this.playerPos.children[i].children[0];
            node.getChildByName('Name').getComponent(Label).string = rank[i - 1].loginName;
            setDigitLabel(node, 'Label', rank[i - 1].credit);
        }
        for (let i = 0; i < 6; i++) {
            const node = this.betInfo.children[i];
            setDigitLabel(node.getChildByName('TotalScore'), 'Label', betAreaTotalCredit[i]);
            setDigitLabel(node, 'BetScore', betAreaCredit[i]);//玩家各區的下注分數
        }

        //下注區分數比例更新
        const allScore = betAreaTotalCredit.reduce((sum, credit) => sum + credit, 0);
        betAreaTotalCredit.forEach((credit, i) => {
            const per = allScore === 0 ? 0 : Math.trunc(credit / allScore * 100);
            const percentNode = this.betInfo.children[i].getChildByName('Percent');
            percentNode.getChildByName('Label').getComponent(Label).string = per + '%';
            percentNode.getChildByName('PercentBar').getComponent(UITransform).width = per;
        });

        // //下注區分數比例更新
        // let allScroe = 0;
        // for (let i = 0; i < betAreaTotalData.length; i++) {
        //     allScroe += betAreaTotalData[i];
        // }
        // for (let i = 0; i < betAreaTotalData.length; i++) {
        //     let per = allScroe === 0 ? 0 : Math.trunc(betAreaTotalData[i] / allScroe * 100);
        //     const percentNode = this.betInfo.children[i].getChildByName('Percent');
        //     percentNode.getChildByName('Label').getComponent(Label).string = per + '%';
        //     percentNode.getChildByName('PercentBar').getComponent(UITransform).width = per;
        // }
    }

    //更新路紙
    public updateRoadMap(data: any, winNumber?: number[]) {
        const colorPer = data.roadColorPers;//獲得前100局顏色比例
        const colorMap = this.roadMap.getChildByName('ColorMap');
        const popupColorMap = this.roadMapPopup.getChildByName('ColorMap');
        for (let i = 0; i < 6; i++) {
            const percentage = colorPer[i].toFixed(2);
            colorMap.children[i].getComponent(Label).string = percentage + '%';
            popupColorMap.children[i].getComponent(Label).string = percentage + '\n%';
        }
        this.updateLastColors(data.roadColors);// 更新上局顏色
        this.updateHotColdValues(colorPer, colorMap, popupColorMap);// 更新冷熱值
    }

    // 更新路紙，上局顏色
    private updateLastColors(roadColors: number[][]) {
        const lastColor = this.roadMap.getChildByName('LastColor');
        const popupLastColor = this.roadMapPopup.getChildByName('LastColor');
        for (let i = 0; i < 3; i++) {
            lastColor.children[i].getComponent(Sprite).spriteFrame = this.gameResource.roadColorSF[roadColors[0][i]];
        }
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 3; j++) {
                popupLastColor.children[i].children[j].getComponent(Sprite).spriteFrame = this.gameResource.roadColorSF[roadColors[i][j]];
            }
        }
    }

    //更新路紙，冷熱值
    private updateHotColdValues(colorPer: number[], colorMap: Node, popupColorMap: Node) {
        const updateElement = (type: 'Hot' | 'Freeze') => {
            const isHot = type === 'Hot';
            const perValue = isHot ? Math.max(...colorPer) : Math.min(...colorPer);
            const indices = colorPer.flatMap((value, index) => value === perValue ? index : []);//冷熱數值內容

            [colorMap, popupColorMap].forEach(node => {
                const element = node.getChildByName(type);
                if (indices.length === 1) {
                    element.active = true;
                    element.setPosition(node.children[indices[0]].getPosition());
                } else {
                    element.active = false;//代表有相同的冷/熱值
                }
            });
        };
        updateElement('Hot');//更新熱值
        updateElement('Freeze');//更新冷值
    }

    //更新籌碼設置(設置頁面)
    public updateChipSet(chipSetIDing: number[]) {
        const chipToggleChildren = this.chipToggle.children;
        if (chipSetIDing.length > 4) {
            for (let i = 0; i < chipToggleChildren.length; i++) {
                if (chipSetIDing.indexOf(i) === -1) {
                    chipToggleChildren[i].getComponent(Toggle).interactable = false;
                    chipToggleChildren[i].getComponent(Toggle).isChecked = false;
                    chipToggleChildren[i].getComponent(UIOpacity).opacity = 80;
                } else {
                    chipToggleChildren[i].getComponent(Toggle).interactable = true;
                    chipToggleChildren[i].getComponent(Toggle).isChecked = true;
                    chipToggleChildren[i].getComponent(UIOpacity).opacity = 255;
                }
            }
        } else {
            for (let i = 0; i < chipToggleChildren.length; i++) {
                if (chipSetIDing.indexOf(i) === -1)
                    chipToggleChildren[i].getComponent(Toggle).isChecked = false;
                else
                    chipToggleChildren[i].getComponent(Toggle).isChecked = true;
                if (!chipToggleChildren[i].getComponent(Toggle).interactable) {
                    chipToggleChildren[i].getComponent(Toggle).interactable = true;
                    chipToggleChildren[i].getComponent(UIOpacity).opacity = 255;
                }
            }
        }
    }

    //更新籌碼選擇(籌碼選擇區)
    public updateTouchChip(chipSetID: number[], chipRange: number[]) {
        const touchChipChildren = this.touchChip.children;
        for (let i = 0; i < touchChipChildren.length; i++) {
            const touchChip = touchChipChildren[i];
            if (chipSetID.length > i) {
                touchChip.active = true;
                touchChip.getChildByName('Sprite').getComponent(Sprite).spriteFrame =
                    this.chipToggle.children[chipSetID[i]].getChildByName('Sprite').getComponent(Sprite).spriteFrame;
                touchChip.getChildByName('Checkmark').getComponent(Sprite).spriteFrame =
                    this.chipToggle.children[chipSetID[i]].getChildByName('Checkmark').getComponent(Sprite).spriteFrame;
                touchChip.getChildByName('Label').getComponent(Label).string =
                    UtilsKitS.NumDigits(chipRange[chipSetID[i]]);
            } else
                touchChip.active = false;
        }
        touchChipChildren[0].getComponent(Toggle).isChecked = true;
    }

    //彈窗顯示
    public popupShow(node: Node) {
        node.active = true;
        node.getChildByName('BtnClose').getComponent(Button).interactable = true;
        node.getComponent(Animation).play('PopupShow');
    }

    //彈窗隱藏
    public popupHide(node: Node) {
        node.getChildByName('BtnClose').getComponent(Button).interactable = false;
        node.getComponent(Animation).play('PopupHide');
        setTimeout(() => {
            node.active = false;
        }, 200)
    }
}