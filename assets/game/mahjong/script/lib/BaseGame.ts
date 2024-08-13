import { Emitter, EventMap } from "strict-event-emitter";

export enum BaseGameEventName {
    END = "end",
}

export interface BaseGameEventMap extends EventMap {
    [BaseGameEventName.END]: [];
};

export interface BaseGame {
    readonly event: any
    free?: any;
}