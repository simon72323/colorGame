import { Emitter, EventMap } from 'strict-event-emitter';

export enum ToolBarEventName {
    EXIT = "exit",
    HELP = "help",
    HISTORY = "history",
    MUSIC = "music",
    MUTE = "mute",
    DEPOSIT = "deposit",
    TAPMENU = "tapmenu",
    ONEXCHANGE = "onexchange",
    GAMEINFO = "gameinfo",
}


export interface ToolbarEventMap extends EventMap {
    [ToolBarEventName.EXIT]: [];
    [ToolBarEventName.HELP]: [];
    [ToolBarEventName.HISTORY]: [];
    [ToolBarEventName.MUSIC]: [];
    [ToolBarEventName.MUTE]: [];
    [ToolBarEventName.DEPOSIT]: [];
    [ToolBarEventName.TAPMENU]: [];
    [ToolBarEventName.ONEXCHANGE]: [];
    [ToolBarEventName.GAMEINFO]: [];
};



export interface IfToolBar<Events extends EventMap = ToolbarEventMap> {
    readonly event: Emitter<Events>;
}
