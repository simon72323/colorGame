import { _decorator, CCInteger, Prefab, SpriteFrame } from 'cc';
import { Roller } from './Roller';
import { MahjongWheel, MahjongWheelEvent } from './MahjongWheel';
import { SlotWheelEvent } from './SlotWheel';
import { SymbolItem } from './SymbolItem';
import { MahjongSymbol } from './MahjongSymbol';
import { FreeGameData } from '../mock/MockData';
import { AudioManager } from '../../../colorGame/script/components/AudioManager';
import { SoundFiles } from '../../../colorGame/script/components/SoundFiles';
import { MahjongCardsPool } from './MahjongCardsPool';
const { ccclass, property } = _decorator;

export class MahjongRollerEvent {
    public static DropAwayEnd: string = "DropAwayEnd";
}

@ccclass('MahjongRoller')
export class MahjongRoller extends Roller {

    @property({ type: CCInteger, tooltip: "全刷速度" })
    public dropAwayVelocity: number = -5000; // 全刷速度

    start() {
        
    }

    takeMahjongFillUpData(cards: Array<Array<number>>, lines: any, scatter:any, isFree: boolean):{ ExtendedCards: Array<Array<number>>, CleanAll: Array<boolean>, ListenStartIndex: Array<number> } {
        const lowerFlowerID: number = 35;
        const scatterID: number = 43;

        let arrListenStartIndex: Array<number> = [];
        let arrCleanAll: Array<boolean> = [];
        let returnCards: Array<Array<number>> = [[], [], [], [], []];
        let len :number = lines.length - 1;
        let freeGridsIndex: number = 0;
        let currentScatterAmount: number = 0;
        let pongAmount: number = 0;

        arrListenStartIndex[0] = -1;
        for (let j:number = 0; j < 5; j++) {
            let symbolNum: number = this.arrWheel[0].mainSymbolAmount;
            for (let k:number = 0; k < symbolNum; k++) {
                let symbolID: number = cards[0][(j+1)*4-k-1];
                if (symbolID == scatterID) {
                    currentScatterAmount++;
                }
                if (currentScatterAmount >= 2 && arrListenStartIndex[0] == -1) {
                    arrListenStartIndex[0] = j+1;
                }
            }
        }

        for (let i:number = 0; i < len; i++) {

            let lineLen: number = lines[i].length;
            let nextCards: Array<number> = cards[i+1];
            let roundCards: Array<Array<number>> = [[], [], [], [], []];
            let onlyOne: boolean = true;
            let wheelEliminationCount: Array<number> = [0, 0, 0, 0, 0];

            arrListenStartIndex[i+1] = -1;

            for (let j:number = 0; j < lineLen; j++) {
                let lineData: Array<any> = lines[i][j];
                let grids: Array<number> = lineData["Grids"];
                let gridsNum: number = lineData["GridNum"];

                if (gridsNum >= 3) {
                    pongAmount++;
                }

                for (let k:number = 0; k < gridsNum; k++) {
                    let wheelID: number = Math.floor((grids[k] - 1) / this.arrWheel[0].mainSymbolAmount);
                    let index: number = wheelID * this.arrWheel[0].mainSymbolAmount + wheelEliminationCount[wheelID];
                    let symbolID: number = nextCards[index];
                    roundCards[wheelID].splice(roundCards[wheelID].length - wheelEliminationCount[wheelID], 0, symbolID);
                    wheelEliminationCount[wheelID]++;
                }

                // lineData["ElementID"] < 35 代表不是花牌及 Scatter
                if ((gridsNum > 1 && lineData["ElementID"] < lowerFlowerID) && !isFree) {
                    onlyOne = false;
                }
            }

            if (scatter.length > freeGridsIndex) {
                if ((<FreeGameData>scatter[freeGridsIndex]).Round == i + 1) {
                    currentScatterAmount = 0;

                    let grids: Array<number> = (<FreeGameData>scatter[freeGridsIndex]).Grids;
                    let gridsNum: number = grids.length;
                    for (let k:number = 0; k < gridsNum; k++) {
                        let wheelID: number = Math.floor((grids[k] - 1) / this.arrWheel[0].mainSymbolAmount);
                        let index: number = wheelID * this.arrWheel[0].mainSymbolAmount + wheelEliminationCount[wheelID];
                        roundCards[wheelID].splice(roundCards[wheelID].length - wheelEliminationCount[wheelID], 0, nextCards[index]);
                        wheelEliminationCount[wheelID]++;
                    }

                    freeGridsIndex++;
                }
            }

            if (!onlyOne) {
                currentScatterAmount = 0;

                for (let j:number = 0; j < 5; j++) {
                    let symbolNum: number = this.arrWheel[0].mainSymbolAmount;
                    roundCards[j] = [];
                    for (let k:number = 0; k < symbolNum; k++) {
                        let symbolID: number = nextCards[(j+1)*4-k-1];
                        roundCards[j].push(symbolID);

                        if (symbolID == scatterID) {
                            currentScatterAmount++;
                        }
                        if (currentScatterAmount >= 2 && arrListenStartIndex[i+1] == -1) {
                            arrListenStartIndex[i+1] = j+1;
                        }
                    }
                }
                arrCleanAll.push(true);
            } else {
                if (currentScatterAmount >= 2) {
                    arrListenStartIndex[i+1] = 0;
                }

                for (let j:number = 0; j < 5; j++) {
                    let symbolNum: number = roundCards[j].length;
                    for (let k:number = 0; k < symbolNum; k++) {
                        let symbolID: number = roundCards[j][k];
                        if (symbolID == scatterID) {
                            currentScatterAmount++;
                        }
                        if (currentScatterAmount >= 2 && arrListenStartIndex[i+1] == -1) {
                            arrListenStartIndex[i+1] = j+1;
                        }
                    }
                }
                arrCleanAll.push(false);
            }

            for (let j:number = 0; j < 5; j++) {
                returnCards[j] = returnCards[j].concat(roundCards[j]);
            }

            if (pongAmount >= 4) { // 此局沒胡，下一局即為聽牌局
                arrListenStartIndex[i+1] = 0;
            }
        }

        // 加上一張畫面最上方不會影響連線的牌
        for (let j:number = 0; j < 5; j++) {
            returnCards[j].push(MahjongCardsPool.getInstance().produceCard(true));
        }

        return { ExtendedCards: returnCards, CleanAll: arrCleanAll, ListenStartIndex: arrListenStartIndex};
    }

    dropAway() {
        let len:number = this.arrWheel.length;
        let count: number = 0;
        let checkDropAwayEnd:Function = function():void {
            count++;
            if (count == len) {
                for (let i:number = 0; i < len; i++) {
                    (<MahjongWheel>this.arrWheel[i]).node.off(MahjongWheelEvent.DropAwayEnd, checkDropAwayEnd, this);
                }
                this.node.emit(MahjongRollerEvent.DropAwayEnd);
            }
        }

        for (let i:number = 0; i < len; i++) {
            (<MahjongWheel>this.arrWheel[i]).node.on(MahjongWheelEvent.DropAwayEnd, checkDropAwayEnd, this);
            (<MahjongWheel>this.arrWheel[i]).dropAway(this.dropAwayVelocity);
        }
    }

    getPairSymbol(id: number): Array<MahjongSymbol> {
        let arrSymbol: Array<MahjongSymbol> = [];
        let len:number = this.arrWheel.length;
        for (let i:number = 0; i < len; i++) {
            for (let j:number = 0; j < this.arrWheel[0].mainSymbolAmount; j++) {
                let symbol: MahjongSymbol = <MahjongSymbol>this.arrWheel[i].getMainSymbolByIndex(j);
                if (symbol && symbol.node.active && symbol.symbolID == id - 1) {
                    arrSymbol.push(symbol);
                }
            }
        }
        return arrSymbol;
    }
}

