import { Animation, Vec3, _decorator, tween } from 'cc';
import { EliminationSlotWheel } from './EliminationSlotWheel';
import { MahjongSymbol } from './MahjongSymbol';
import { SymbolItem } from './SymbolItem';
import { UtilsKit } from '../lib/UtilsKit';
import { PrefabInstancePoolManager } from '../tools/PrefabInstancePoolManager';
import { AudioManager } from '../../../colorGame/script/components/AudioManager';
import { SoundFiles } from '../../../colorGame/script/components/SoundFiles';
import { MahjongCardsPool } from './MahjongCardsPool';
const { ccclass, property } = _decorator;

export class MahjongWheelEvent {
    public static DropAwayEnd: string = "DropAwayEnd";
}

@ccclass('MahjongWheel')
export class MahjongWheel extends EliminationSlotWheel {

    //生成初始Symbol(每軸執行一次)
    protected generateInitialSymbols() {
        let symbol: SymbolItem;
        for (let i: number = this.mainSymbolAmount - 1; i >= 0; i--) {
            symbol = this.spawnSymbolByID(MahjongCardsPool.getInstance().produceCard(true) - 1);
        }

        symbol = this.arrSymbol[0];
        let top: number = symbol.node.getPosition().y + 0.5 * symbol.height;
        while (top < this.maskRect.y + this.maskRect.height) {
            symbol = this.spawnSymbolByID(MahjongCardsPool.getInstance().produceCard(true) - 1);
            top += symbol.height;
        }
        let initialBounceDisplacement: number = this.getBounceDisplacement(this.initialVelocity, this.maxVelocity, this.timeToAchieveMaxVelocity);

        symbol = this.arrSymbol[this.arrSymbol.length - 1];
        let bottom: number = symbol.node.getPosition().y - 0.5 * symbol.height + initialBounceDisplacement;
        while (bottom > this.maskRect.y) {
            symbol = this.spawnSymbolByID(MahjongCardsPool.getInstance().produceCard(true) - 1, false);
            bottom -= symbol.height;
        }
    }

    stop(cards: Array<number>, extendedCards?: Array<number>, time?: number) {
        MahjongCardsPool.getInstance().removeCards(cards);

        if (extendedCards) {
            MahjongCardsPool.getInstance().removeCards(extendedCards);
        }

        super.stop(cards, extendedCards, time);
    }

    //根據id產生symbol
    protected spawnSymbolByID(id: number = this.generateSymbolID(), prepend: boolean = true): MahjongSymbol {
        let symbol: MahjongSymbol = PrefabInstancePoolManager.instance.takeOut(this.symbolPrefab).getComponent(MahjongSymbol);
        this.addSymbol(symbol, prepend);
        symbol.changeSymbolID(id);
        symbol.getComponent(Animation).stop();
        return symbol;
    }

    //產生symbolID
    protected generateSymbolID(): number {
        let id: number;
        if (this._extendedCards.length > 0) {
            id = this._extendedCards.shift() - 1;
        } else {
            id = MahjongCardsPool.getInstance().produceCard(false) - 1;
        }
        return id;
    }

    async dropAway(velocity: number = this.maxVelocity) {
        AudioManager.getInstance().play(SoundFiles.RollDrop);
        let bottom: number = this.maskRect.y;
        let time: number;
        let len: number = this.arrMainSymbol.length;
        for (let i: number = len - 1; i >= 0; i--) {
            let symbol: SymbolItem = this.arrMainSymbol[i];
            if (symbol.node.active) {
                this.hasEliminatedSymbol.push(symbol);
                time = (bottom - 0.5 * symbol.height - symbol.node.getPosition().y) / velocity;
                tween(symbol.node).to(time, { position: new Vec3(0, bottom - 0.5 * symbol.height, 0) }).call(() => {
                    symbol.node.active = false;
                }).start();
            }
        }

        await UtilsKit.DeferByScheduleOnce(1000 * time);
        this.node.emit(MahjongWheelEvent.DropAwayEnd);
    }

}