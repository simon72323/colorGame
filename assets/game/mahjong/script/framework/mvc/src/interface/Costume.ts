import { Emitter } from 'strict-event-emitter';
import { WinJPType } from "../connection/connector/data/Receive/onHitJackpot";
import { CommandEventMap, IfCommand } from "./Command";
import { IfToolBar, ToolbarEventMap } from "./Toolbar";
import { EventMap } from 'strict-event-emitter';

export enum CostumeEventName {
    /** 一局結束 */
    END = 'end',
    /** 免費遊戲 */
    FREE = 'free',
    HIT_BONUS = 'hitBonus',
    END_BONUS = 'endBonus',
    DOUBLE_UP = 'doubleUp',
}

export type CostumeEventMap = {
    [CostumeEventName.END]: [];
    [CostumeEventName.FREE]: [];
    [CostumeEventName.HIT_BONUS]: [];
    [CostumeEventName.END_BONUS]: [];
    [CostumeEventName.DOUBLE_UP]: [];
};



export interface IfCostume<
    CommandEvent extends EventMap = CommandEventMap,
    ToolBarEvent extends EventMap = ToolbarEventMap,
    CostumeEvent extends CostumeEventMap = CostumeEventMap,
> extends Emitter<CostumeEvent> {
    /**餘額 */
    credit: number;
    /** 下注比例 */
    betBase: string;
    /** 下注比例列表 */
    base: string;
    /** 線數 */
    line: number;
    /** 每線押注 */
    lineBet: number;
    /** 總押注 */
    bet: number;
    /** 單號 */
    wagersID: string;
    /** 結果牌型 */
    cards?: any;
    /** 贏得分數 */
    payoff: number;
    /** 每線結果 */
    lines?: any;
    scatter?: any;
    bonus?: any;
    free?: any;
    freeTimes: number;
    doubleTime: number;
    winJPType?: WinJPType;
    winJPAmount?: number;
    levelID?: number;
    brickNum?: number;
    axisLocation?: string;
    betCreditList?: number[];
    defaultBetCredit?: number;
    isCash: boolean;


    isExchangePageOpen: boolean;
    updateInfo(): void;
    updateBet(): void;
    begin(): void;
    double(): void;
    end(): void;

    updateJackpot(jp: number[]): void;
    updateMarquee(marquee: string): void;
    winJackpot(): void;
    disableExchange(): void;



    command: IfCommand<CommandEvent>;
    toolbar: IfToolBar<ToolBarEvent>;

}





