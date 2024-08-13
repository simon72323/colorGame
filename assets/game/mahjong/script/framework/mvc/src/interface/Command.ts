import { Emitter, EventMap } from 'strict-event-emitter';


export enum CommandEventName {
    SPIN = "spin",
    STOP = "stop",
    SCORE = "score",
    MAX_BET = "maxBet",
    LINE_BET = "lineBet",
    LINE_BET_MINUS = "lineBetMinus",
    LINE = "line",
    LINE_MINUS = "lineMinus",
    EXCHANGE = "exchange",
    DOUBLE = "double",
    UPDATE_LINEBET = "updatelinebet",
    UPDATE_LINE = "updateline",
    CHANGE_RATIO = "changeratio",
    TURBO = "turbo",
    CLOSE = "close",
}

export interface CommandEventMap extends EventMap {
    [CommandEventName.SPIN]: [];
    [CommandEventName.STOP]: [];
    [CommandEventName.SCORE]: [];
    [CommandEventName.MAX_BET]: [];
    [CommandEventName.LINE_BET]: [];
    [CommandEventName.LINE_BET_MINUS]: [];
    [CommandEventName.LINE]: [];
    [CommandEventName.LINE_MINUS]: [];
    [CommandEventName.EXCHANGE]: [];
    [CommandEventName.DOUBLE]: [];
    [CommandEventName.UPDATE_LINEBET]: [number];
    [CommandEventName.UPDATE_LINE]: [number];
    [CommandEventName.CHANGE_RATIO]: [string];
    [CommandEventName.TURBO]: [];
};



export interface IfCommand<Events extends EventMap = CommandEventMap> {
    readonly event: Emitter<Events>;
}