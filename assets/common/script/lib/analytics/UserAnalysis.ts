import { URLParameter } from "../../include";
import { Emitter } from "strict-event-emitter";
import { Flags } from "./Flags";

export namespace UserAnalysis {
    
    /** 
     * 統計次數用的key
     */
    export const CounterKeys = [
        'betPlus',
        'betMinus',
        'betOption',
        'uiHelp',
        'innerJP',
        'outterJP',
        'innerEx',
        'outterEx',
        'burgerMenu',
        'betRecordBtn',
        'ruleBtn',
        'settingBtn',
        'muteBtn',
        'musicBtn',
        'notEnough_cancel',
        'notEnough_exchange',
        'exchange_quick_100',
        'exchange_quick_500',
        'exchange_quick_full',
        'exchange_customConfirm_enter',
        'exchange_customConfirm_click',
        'exchange_customConfirm_record',
        'exchange_delete_record',
        'exchange_reset',
    ];

    export type CounterKey = typeof CounterKeys[number];

    /** beginGame狀態的flag */
    export const BeginGameFlag = ['auto', 'turbo'] as const;

    export type BeginGameFlags = typeof BeginGameFlag[number];
    export enum TurboOption {
        /** turbo 還沒確定狀態 */
        None = 0,
        /** 手動啟用 turbo , 沒跳確認視窗  */
        SetTurbo = 1,
        /** 跳 turbo提示 , 使用者按確定 */
        ConfirmTurbo = 2,
        /** 跳 turbo提示 , 使用者按取消 */
        CancelTurbo = 3,
        /** 跳 turbo提示 , 使用者沒按,畫面取消  */
        TimeoutTurbo = 4,
    }
    export type CounterData = {
        [key in CounterKey]?: any;
    };

    export interface AnalysisClientData extends CounterData {
        autoTimes?: number;//client送 auto次數
        exchange: { default: boolean, value: number }[];
        beginGameCount: {
            0: number;  // turbo 0 | auto 0
            1: number;  // turbo 0 | auto 1
            2: number;  // turbo 1 | auto 0
            3: number;  // turbo 1 | auto 1
        };
        turboOption?: TurboOption;
    }

    interface UserAnalysisEvent {
        'update': Partial<AnalysisClientData>;
    }
    type UserAnalysisEvents =  {
        update: [object]
    }
    const CounterUpadteTimes = 60 * 1000;

    class BehaviorReport extends Emitter<UserAnalysisEvents> {

        enable: boolean = false;

        private counter: Record<CounterKey, number>;

        private _counterChange: boolean = true;

        private beginGameCount: {
            0: number;  // turbo 0 | auto 0
            1: number;  // turbo 0 | auto 1
            2: number;  // turbo 1 | auto 0
            3: number;  // turbo 1 | auto 1
        } = {
                0: 0,
                1: 0,
                2: 0,
                3: 0,
            };

        private _turboOption: TurboOption = TurboOption.None;

        public exchangeData: { default: boolean, value: number; }[] = [];

        constructor() {
            super();
            this.initCounter();
            setInterval(this.runTicker, CounterUpadteTimes);
        }

        private runTicker = () => {
            if (this._counterChange) {
                if (this.enable) this.emit('update', this.counter);
                this._counterChange = false;
            }
        };

        private initCounter() {

            let o: Partial<Record<CounterKey, number>> = {};

            for (let key of CounterKeys) {
                o[key] = 0;
            }

            this.counter = o as Record<CounterKey, number>;
        }


        /**
         * 傳入特定key , 會將該key的counter 次數+1
         */
        public addCounter(key: CounterKey | string, obj?: any) {
            GAManager.CustumEvent(key, obj || {});

            if (this.counter[key] !== undefined) {
                if (key == 'musicBtn' || key == 'muteBtn') {
                    //musicBtn , muteBtn 只紀錄第一次
                    if (this.counter[key] == 1) return;
                }
                this.counter[key]++;
                this._counterChange = true;
            }
        }



        /**
         * 設定 turbo 狀態
         * @param option 
         */
        public setTurboOption(option: TurboOption) {
            //加入狀態紀錄 , 防止實作部分重複設定
            if (this._turboOption == TurboOption.None) {
                if (option != TurboOption.None) this._turboOption = option;
                if (this.enable) this.emit('update', { turboOption: this._turboOption });
            }
        }

        /**
         * @param times 設定auto次數
         */
        public setAutoTimes(times: number) {
            if (this.enable) {
                this.emit('update', { autoTimes: times });
                GAManager.CustumEvent('updateAutoTimes', { autoTimes: times });
            }
        }

        /**
         * 進行一次 beginGame ,傳入flags 狀態
         */
        public beginGame(flags: Record<BeginGameFlags, boolean>) {

            const flag = new Flags(BeginGameFlag);

            for (let key in flags) {
                if (flags[key as BeginGameFlags]) {
                    flag.setFlag(key as BeginGameFlags);
                }
                else {
                    flag.clearFlag(key as BeginGameFlags);
                }
            }

            if (this.beginGameCount[flag.value] === undefined) this.beginGameCount[flag.value] = 0;
            this.beginGameCount[flag.value]++;

            if (this.enable) {
                this.emit('update', { beginGameCount: this.beginGameCount });
                GAManager.CustumEvent('begeinGame', flags);
            }


        }


        /**
         * 傳入一次換分的資料
         * @param data 
         */
        public exchange(exchange: AnalysisClientData['exchange']) {
            if (this.enable) {
                this.emit('update', { exchange });
                const value = exchange.reduce((a, b) => a + b.value, 0);
                GAManager.CustumEvent('exchange', { value });
            }
            this.exchangeData = [];
        }
    }


    export const Instance: BehaviorReport = new BehaviorReport();

}

export namespace GAManager {

    export function CustumEvent(event: string, data: any) {
        if (typeof gtag == 'function') {
            if (typeof data == 'undefined') data = {};
            gtag('event', `customEvt_${event}`, Object.assign(data, { GameType: URLParameter.gameType }));
        }
    }
}

