
// export class BaseDataEvent<Define extends Record<string, any>, Event extends keyof Define = keyof Define> {

//     static create<Define extends Record<string, any>, E extends keyof Define = keyof Define>(event: E, data?: Define[E]) {
//         return new BaseDataEvent(event, data);
//     } 

//     constructor(public type: Event, public data?: Define[Event]) {

//     }
// }


// export type DataMapToEvtMap<T extends Record<string, any>> = {
//     [event in keyof T]: BaseDataEvent<T, event>
// };


