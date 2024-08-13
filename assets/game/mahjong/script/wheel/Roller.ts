import { _decorator, Animation, AnimationClip, CCFloat, Color, Component, Graphics, Node, UIOpacity, UITransform, Vec3 } from 'cc';
import { SlotWheel, SlotWheelEvent } from './SlotWheel';
import { EliminationSlotWheel, EliminationSlotWheelEvent } from './EliminationSlotWheel';
import { UtilsKit } from '../lib/UtilsKit';
import { SymbolItem } from './SymbolItem';
import { AudioManager } from '../components/AudioManager';
import { SoundFiles } from '../components/SoundFiles';
const { ccclass, property } = _decorator;

export class RollerEvent {
    public static StopEnd: string = "StopEnd";
    public static DropEnd: string = "DropEnd";
}

export class DefaulRollerInfo
{
    public launchDelayTime: number = 0.2;
    public stopDelayTime: number = 0.2;
    public wheelDropDelayTime: number = 0.2;
    public symbolDropDelayTime: number = 0.2;
    public symbolDropTime: number = 0.5;
    public listenDelayTime: number = 1.5;
}

@ccclass('Roller')
export class Roller extends Component {

    @property({ type: [SlotWheel] })
    protected arrWheel: Array<SlotWheel> = []!;

    @property({ type: CCFloat, tooltip: "啟動延遲間隔時間" })
    public launchDelayTime: number = 0.2;

    @property({ type: CCFloat, tooltip: "停止延遲間隔時間" })
    public stopDelayTime: number = 0.2;

    @property({ type: CCFloat, tooltip: "每軸掉落啟動延遲間隔時間" })
    public wheelDropDelayTime: number = 0.2;

    @property({ type: CCFloat, tooltip: "每軸物件掉落延遲間隔時間" })
    public symbolDropDelayTime: number = 0.2;

    @property({ type: CCFloat, tooltip: "物件掉落時間" })
    public symbolDropTime: number = 0.5;

    @property({ type: CCFloat, tooltip: "輪軸聽牌延遲時間" })
    public listenDelayTime: number = 1.5;

    @property({ type: AnimationClip, tooltip: "輪軸聽牌效果動畫" })
    protected listenAnimationClip: AnimationClip = null;

    @property({ type: Node, tooltip: "輪軸聽牌 Node" })
    protected listenNode: Node = null;

    protected _listenStartIndex: number = -1;
    protected listenLeftBlack: Graphics;
    protected listenRightBlack: Graphics;

    protected _defaultWheelInfo: DefaulRollerInfo; // 預設轉輪資訊

    protected _doSpeedUp: boolean = false; // 是否加速

    get doSpeed(): boolean {
        return this._doSpeedUp;
    }


    get isRunnung():boolean {
        let len:number = this.arrWheel.length;
        for (let i:number = 0; i < len; i++) {
            if (this.arrWheel[i].isRunnung) {
                return true;
            }
        }
        return false;
    }

    set listenStartIndex(n: number) {
        this._listenStartIndex = n;
    }

    onLoad(): void {
        let len:number = this.arrWheel.length;
        for (let i:number = 0; i < len; i++) {
            this.arrWheel[i].node.on(SlotWheelEvent.StopEnd, this.checkAllWheelStop, this);
        }

        if (this.listenAnimationClip) {
            let animation: Animation = this.addComponent(Animation);
            animation.addClip(this.listenAnimationClip, this.listenAnimationClip.name);
        }

        if (this.listenNode) {
            this.listenNode.active = false;
        }

        this._defaultWheelInfo = new DefaulRollerInfo();
        this._defaultWheelInfo.wheelDropDelayTime = this.wheelDropDelayTime;
        this._defaultWheelInfo.symbolDropDelayTime = this.symbolDropDelayTime;
        this._defaultWheelInfo.symbolDropTime = this.symbolDropTime;
        this._defaultWheelInfo.stopDelayTime = this.stopDelayTime;
        this._defaultWheelInfo.launchDelayTime = this.launchDelayTime;
        this._defaultWheelInfo.listenDelayTime = this.listenDelayTime;
    }

    public speedUp(b: boolean) {
        this._doSpeedUp = b;

        let len:number = this.arrWheel.length;
        for (let i:number = 0; i < len; i++) {
            this.arrWheel[i].speedUp(b);
        }

        if (b) {
            this.launchDelayTime = 0;
            this.stopDelayTime = 0;
            this.wheelDropDelayTime = 0.01;
        } else {
            this.launchDelayTime = this._defaultWheelInfo.launchDelayTime;
            this.stopDelayTime = this._defaultWheelInfo.stopDelayTime;
            this.wheelDropDelayTime = this._defaultWheelInfo.wheelDropDelayTime;
        }

        let scale: number = b? 0.5:1
        this.symbolDropDelayTime = scale * this._defaultWheelInfo.symbolDropDelayTime;
        this.symbolDropTime = scale * this._defaultWheelInfo.symbolDropTime;
        this.listenDelayTime = scale * this._defaultWheelInfo.listenDelayTime;
    }

    protected checkAllWheelStop(): void {
        AudioManager.getInstance().play(SoundFiles.RollStop);
        if (!this.isRunnung) {
            this.node.emit(RollerEvent.StopEnd);
            AudioManager.getInstance().stop(SoundFiles.Roll);
        }
    }

    public getSymbolByIndex(index: number): SymbolItem {
        let wheelID: number = Math.floor((index - 1) / this.arrWheel[0].mainSymbolAmount);
        let symbolIndex: number = (index - 1) % this.arrWheel[0].mainSymbolAmount;
        return this.arrWheel[wheelID].getMainSymbolByIndex(symbolIndex);
    }

    async launch() {
        AudioManager.getInstance().play(SoundFiles.Roll, true);

        let len:number = this.arrWheel.length;
        for (let i:number = 0; i < len; i++) {

            if (!this.arrWheel[i].isRunnung) {
                this.arrWheel[i].launch();
            }

            if (i < len - 1) {
                await UtilsKit.DeferByScheduleOnce(1000 * this.launchDelayTime);
            }
        }
    }

    async stop(cards: Array<Array<number>>, stopDelayTime: number = this.stopDelayTime, extendedCards?: Array<Array<number>>) {

        if (extendedCards) {
            extendedCards = extendedCards;
        }

        let len:number = this.arrWheel.length;
        for (let i:number = 0; i < len; i++) {

            if (!this.arrWheel[i].isRunnung) {
                this.arrWheel[i].launch();
            }

            if (this._listenStartIndex != -1 && i >= this._listenStartIndex) {
                this.playListenEffect(i);
                await UtilsKit.DeferByScheduleOnce(1000 * this.listenDelayTime);
            }

            this.arrWheel[i].stop(cards[i], extendedCards?extendedCards[i]:null);

            if (i < len - 1)
            {
                await UtilsKit.DeferByScheduleOnce(1000 * stopDelayTime);
                this.stopListenEffect();
            }
        }
        this.stopListenEffect();
    }

    /**
     * 取得延伸(掉落階段物件)牌組
     * "Cards": [
            [1,2,3,4,5,11,11,8,9,10,11,12,11,14,15,40,17,18,19,20],
            [1,2,3,4,5,6,7,8,9,10,11,12,11,14,15,16,17,18,19,20]
        ],
        "Lines": [
                    [
                        {
                            "ElementID": 11,
                            "GridNum": 3,
                            "Grids": [
                                6,
                                7,
                                13
                            ],
                            "Payoff": 0
                        },
                        {
                            "ElementID": 40,
                            "GridNum": 1,
                            "Grids": [
                                16
                            ],
                            "Payoff": 0
                        }
                    ],
                    []
                ]
     * @param cards beginGame cards
     * @param lines beginGame lines
     * @returns 
     */
    takeExtendedCards(cards: Array<Array<number>>, lines: any): Array<Array<number>> {

        let returnCards: Array<Array<number>> = [];
        let wheelLen: number = this.arrWheel.length;
        let len :number = lines.length - 1;

        for (let j:number = 0; j < wheelLen; j++) {
            returnCards.push([]);
        }

        for (let i:number = 0; i < len; i++) {

            let lineLen: number = lines[i].length;
            let nextCards: Array<number> = cards[i+1];
            let wheelEliminationCount: Array<number> = [0, 0, 0, 0, 0];

            for (let j:number = 0; j < wheelLen; j++) {
                wheelEliminationCount.push(0);
            }

            for (let j:number = 0; j < lineLen; j++) {

                let lineData: Array<any> = lines[i][j];
                let grids: Array<number> = lineData["Grids"];
                let gridsNum: number = lineData["GridNum"];

                for (let k:number = 0; k < gridsNum; k++) {
                    let wheelID: number = Math.floor((grids[k] - 1) / this.arrWheel[0].mainSymbolAmount);
                    let index: number = wheelID * this.arrWheel[0].mainSymbolAmount + wheelEliminationCount[wheelID];
                    returnCards[wheelID].splice(returnCards[wheelID].length - wheelEliminationCount[wheelID], 0, nextCards[index]);
                    wheelEliminationCount[wheelID]++;
                }
            }
        }
        return returnCards;
    }

    eliminate(grids: Array<number>) {
        let len: number = grids.length;
        let arrWheelGrids: Array<Array<number>> = [];

        for (let i:number = 0; i < len; i++) {
            let wheelIndex: number = Math.floor((grids[i] - 1) / this.arrWheel[0].mainSymbolAmount); // 這裡預設所有軸物件數目一樣
            if (!arrWheelGrids[wheelIndex]) {
                arrWheelGrids[wheelIndex] = [];
            }
            arrWheelGrids[wheelIndex].push(grids[i] - 1 - (wheelIndex * this.arrWheel[0].mainSymbolAmount)); // 這裡預設所有軸物件數目一樣
        }

        len = arrWheelGrids.length;
        for (let i:number = 0; i < len; i++) {
            if (arrWheelGrids[i] && arrWheelGrids[i].length > 0) {
                (<EliminationSlotWheel>this.arrWheel[i]).eliminate(arrWheelGrids[i]);
            }
        }
    }

    async drop(wheelDelayTime: number = this.wheelDropDelayTime, symbolDelayTime: number = this.symbolDropDelayTime, symbolDropTime: number = this.symbolDropTime) {        
        let len:number = this.arrWheel.length;
        let count: number = 0;
        let checkDropEnd:Function = function():void {
            count++;
            if (count == len) {
                for (let i:number = 0; i < len; i++) {
                    (<EliminationSlotWheel>this.arrWheel[i]).node.off(EliminationSlotWheelEvent.DropEnd, checkDropEnd, this);
                }
                this.node.emit(RollerEvent.DropEnd);
            }
        }

        for (let i:number = 0; i < len; i++) {
            if ( (<EliminationSlotWheel>this.arrWheel[i]).hasEliminatedSymbolAmount == 0) {
                count++;
            } else {
                if (this._listenStartIndex != -1 && i >= this._listenStartIndex) {
                    this.playListenEffect(i);
                    await UtilsKit.DeferByScheduleOnce(1000 * this.listenDelayTime);
                }
                (<EliminationSlotWheel>this.arrWheel[i]).node.on(EliminationSlotWheelEvent.DropEnd, checkDropEnd, this);
                (<EliminationSlotWheel>this.arrWheel[i]).drop(symbolDelayTime, symbolDropTime);
                if (i != len - 1) {
                    await UtilsKit.DeferByScheduleOnce(1000 * wheelDelayTime);
                    this.stopListenEffect();
                }
            }
        }
        this.stopListenEffect();
    }

    protected playListenEffect(wheelIndex: number) {
        AudioManager.getInstance().play(SoundFiles.Miroll);

        if (this.listenNode)
        {
            this.listenNode.active = true;
            this.listenNode.setPosition(this.arrWheel[wheelIndex].node.getPosition());
        }
        if (this.listenAnimationClip) {
            let animation: Animation = this.getComponent(Animation);
            animation.play(this.listenAnimationClip.name);
        }

        if (!this.listenLeftBlack) {
            let node: Node = new Node("listenLeftBlack");
            this.node.addChild(node);
            this.listenLeftBlack = node.addComponent(Graphics);
            this.listenLeftBlack.clear();
            this.listenLeftBlack.fillColor = new Color(0, 0, 0, 255 * 0.7);
            this.listenLeftBlack.rect(0, 0, 1, 1);
            this.listenLeftBlack.fill();
            
            node = new Node("listenRightBlack");
            this.node.addChild(node);
            this.listenRightBlack = node.addComponent(Graphics);
            this.listenRightBlack.clear();
            this.listenRightBlack.fillColor = this.listenLeftBlack.fillColor;
            this.listenRightBlack.rect(0, 0, 1, 1);
            this.listenRightBlack.fill();
            
            this.listenNode.setSiblingIndex(this.node.children.length - 1);
        }

        let x: number;
        let y: number;
        let w: number;
        let h: number;
        if (wheelIndex > 0) {
            this.listenLeftBlack.node.active = true;

            x = this.arrWheel[0].node.position.x - 0.5 * this.arrWheel[0].node.getComponent(UITransform).width;
            y = this.arrWheel[0].node.position.y - 0.5 * this.arrWheel[0].node.getComponent(UITransform).height;
            w = this.arrWheel[wheelIndex].node.position.x - 0.5 * this.arrWheel[wheelIndex].node.getComponent(UITransform).width - x;
            h = this.arrWheel[wheelIndex].node.position.y + 0.5 * this.arrWheel[wheelIndex].node.getComponent(UITransform).height - y;

            this.listenLeftBlack.node.setPosition(x, y);
            this.listenLeftBlack.node.setScale(w, h);
        }

        if (wheelIndex < this.arrWheel.length - 1) {
            this.listenRightBlack.node.active = true;

            let len: number = this.arrWheel.length;
            x = this.arrWheel[wheelIndex].node.position.x + 0.5 * this.arrWheel[wheelIndex].node.getComponent(UITransform).width;
            y = this.arrWheel[wheelIndex].node.position.y - 0.5 * this.arrWheel[wheelIndex].node.getComponent(UITransform).height;
            w = this.arrWheel[len - 1].node.position.x + 0.5 * this.arrWheel[len - 1].node.getComponent(UITransform).width - x;
            h = this.arrWheel[len - 1].node.position.y + 0.5 * this.arrWheel[len - 1].node.getComponent(UITransform).height - y;

            this.listenRightBlack.node.setPosition(x, y);
            this.listenRightBlack.node.setScale(w, h);
        }
    }

    protected stopListenEffect() {
        AudioManager.getInstance().stop(SoundFiles.Miroll);

        if (this.listenNode)
        {
            this.listenNode.active = false;
        }
        if (this.listenAnimationClip) {
            let animation: Animation = this.getComponent(Animation);
            animation.stop();
        }
        if (this.listenLeftBlack) {
            this.listenLeftBlack.node.active = false;
            this.listenRightBlack.node.active = false;
        }
    }
}

