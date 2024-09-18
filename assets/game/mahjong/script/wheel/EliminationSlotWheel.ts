import { Vec3, _decorator, tween } from 'cc';
import { SlotWheel } from './SlotWheel';
import { SymbolItem } from './SymbolItem';
import { UtilsKit } from '../lib/UtilsKit';
import { AudioManager } from '../../../colorGame/script/components/AudioManager';
import { SoundFiles } from '../../../colorGame/script/components/SoundFiles';
const { ccclass, property } = _decorator;

export class EliminationSlotWheelEvent {
    public static DropEnd: string = "DropEnd";
}

@ccclass('EliminationSlotWheel')
export class EliminationSlotWheel extends SlotWheel {

    protected hasEliminatedSymbol: Array<SymbolItem> = []; // 已經消除的元件

    get hasEliminatedSymbolAmount(): number {
        return this.hasEliminatedSymbol.length;
    }

    launch() {
        this.cleanEliminatedSymbol();
        super.launch();
    }
    
    eliminate(arrIndex:Array<number>) {
        let len:number = arrIndex.length;
        for (let i:number = 0; i < len; i++) {
            let index: number = arrIndex[i];
            let symbol: SymbolItem = this.arrMainSymbol[index];
            symbol.node.active = false;
            this.hasEliminatedSymbol.push(symbol);
        }
    }

    protected cleanEliminatedSymbol() {
        while (this.hasEliminatedSymbol.length > 0) {
            let symbol: SymbolItem = this.hasEliminatedSymbol.pop();
            this.arrMainSymbol.splice(this.arrMainSymbol.indexOf(symbol), 1);
            this.removeSymbol(symbol);
        }
    }

    async drop(delayTime: number, dropTime: number) {

        this.cleanEliminatedSymbol();

        this.arrMainSymbol = [];

        const bias: number = 0.1;
        let len: number = this.arrSymbol.length;
        let top: number = this.mainRect.y;
        let ceilingBottom: number = this.maskRect.y + this.maskRect.height;
        let symbol: SymbolItem;

        let time = dropTime;

        if (len > 0) {
            AudioManager.getInstance().play(SoundFiles.RollDrop);

            ceilingBottom = Math.max(ceilingBottom, this.arrSymbol[0].node.getPosition().y - 0.5 * this.arrSymbol[0].height);

            let i: number = len - 1;
            while (i >= 0) {
                symbol = this.arrSymbol[i];
                if (Math.abs(symbol.node.getPosition().y - (top + 0.5 * symbol.height)) < bias) {
                    top += symbol.height;
                    if (this.arrMainSymbol.length < this.mainSymbolAmount) {
                        this.arrMainSymbol.unshift(symbol);
                    }
                } else if (symbol.node.getPosition().y > top + 0.5 * symbol.height) {
                    await this.symbolDrop(symbol, new Vec3(0, top + 0.5 * symbol.height, 0), time, delayTime);
                    top += symbol.height;
                    if (this.arrMainSymbol.length < this.mainSymbolAmount) {
                        this.arrMainSymbol.unshift(symbol);
                    }
                }
                i--;
            }
        }
       
        while (true) {
            symbol = this.spawnSymbolByID();
            symbol.node.setPosition(0, ceilingBottom + 0.5 * symbol.height, 0);

            if (this.arrMainSymbol.length < this.mainSymbolAmount) {
                this.arrMainSymbol.unshift(symbol);
            }

            if (top + symbol.height >= this.maskRect.y + this.maskRect.height) {
                await this.symbolDrop(symbol, new Vec3(0, top + 0.5 * symbol.height, 0), time, time);
                break;
            } else {
                await this.symbolDrop(symbol, new Vec3(0, top + 0.5 * symbol.height, 0), time, delayTime);
            }

            ceilingBottom += symbol.height
            top += symbol.height;
        }

        this.node.emit(EliminationSlotWheelEvent.DropEnd);
    }

    protected symbolDrop(symbol: SymbolItem, position: Vec3, time:number, delayTime: number):Promise<void> {
        return new Promise(async (resolve) => 
        {
            tween(symbol.node).to(time*0.6, { position: new Vec3(0, position.y, 0) }, { easing: 'cubicIn' })
                .then(tween(symbol.node).to(time*0.13, { position: new Vec3(0, position.y + 30, 0) }, { easing: 'cubicOut' }))
                .then(tween(symbol.node).to(time*0.13, { position: new Vec3(0, position.y, 0) }, { easing: 'cubicIn' }))
                .then(tween(symbol.node).to(time*0.07, { position: new Vec3(0, position.y + 15, 0) }, { easing: 'cubicOut' }))
                .then(tween(symbol.node).to(time*0.07, { position: new Vec3(0, position.y, 0) }, { easing: 'cubicIn' }))
                .start();
            // tween(symbol.node).to(time, {position: position}, {easing: "bounceOut"}).start();

            if (delayTime <= 0) {
                resolve();
            } else {
                await UtilsKit.DeferByScheduleOnce(delayTime * 1000);
                resolve();
            }
        });
    }
}

