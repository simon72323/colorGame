import { Emitter } from 'strict-event-emitter';

//https://wd.imgix.net/image/eqprBhZUGfb8WYnumQ9ljAxRrA72/wgyY9jyBaPTlVZIrJfoD.svg
//https://developer.chrome.com/articles/page-lifecycle-api/#developer-recommendations-for-each-state
//https://github.com/GoogleChromeLabs/page-lifecycle#readme


const ACTIVE = 'active';
//A page is in the active state if it is visible and has input focus.
//Possible previous states: passive, frozen
//Possible next states: passive


const PASSIVE = 'passive';
//A page is in the passive state if it is visible and does not have input focus.
//Possible previous states: active, hidden , frozen
//Possible next states: active, hidden


const HIDDEN = 'hidden';
//A page is in the hidden state if it is not visible (and has not been frozen, discarded, or terminated).
//Possible previous states:  passive, frozen
//Possible next states:passive , frozen , terminated


const FROZEN = 'frozen';
// In the frozen state the browser suspends execution of freezable tasks in the page's task queues until the page is unfrozen.
// This means things like JavaScript timers and fetch callbacks do not run. Already-running tasks can finish (most importantly the freeze callback), but they may be limited in what they can do and how long they can run.
// 
// Browsers freeze pages as a way to preserve CPU/battery/data usage; 
// they also do it as a way to enable faster back/forward navigations — avoiding the need for a full page reload.

// Possible previous states:  hidden
// Possible next states: active, passive, hidden



const TERMINATED = 'terminated';
//A page is in the terminated state once it has started being unloaded and cleared from memory by the browser.
//  No new tasks can start in this state, and in-progress tasks may be killed if they run too long.

//Possible previous states: hidden
//Possible next states: NONE



const STATES = [
    ACTIVE,
    PASSIVE,
    HIDDEN,
    FROZEN,
    TERMINATED
] as const;


//@ts-ignore
const IS_SAFARI = typeof safari === 'object' && safari.pushNotification;

const SUPPORTS_PAGE_TRANSITION_EVENTS = 'onpageshow' in self;

const EVENTS = [
    'focus',
    'blur',
    'visibilitychange',
    'freeze',
    'resume',
    'pageshow',
    // IE9-10 do not support the pagehide event, so we fall back to unload
    // Note: unload *MUST ONLY* be added conditionally, otherwise it will
    // prevent page navigation caching (a.k.a bfcache).
    SUPPORTS_PAGE_TRANSITION_EVENTS ? 'pagehide' : 'unload',
] as const;



/**
 * Converts an array of states into an object where the state is the key
 * and the value is the index.
 * @param {!Array<string>} arr
 * @return {!Object}
 */
const toIndexedObject = (arr) => arr.reduce((acc, val, idx) => {
    acc[val] = idx;
    return acc;
}, {});


const LEGAL_STATE_TRANSITIONS = [
    // The normal unload process (bfcache process is addressed above).
    [ACTIVE, PASSIVE, HIDDEN, TERMINATED],

    // An active page transitioning to frozen,
    // or an unloading page going into the bfcache.
    [ACTIVE, PASSIVE, HIDDEN, FROZEN],

    // A hidden page transitioning back to active.
    [HIDDEN, PASSIVE, ACTIVE],

    // A frozen page being resumed
    [FROZEN, HIDDEN],

    // A frozen (bfcached) page navigated back to
    // Note: [FROZEN, HIDDEN] can happen here, but it's already covered above.
    [FROZEN, ACTIVE],
    [FROZEN, PASSIVE],
].map(toIndexedObject) as Record<number, Record<PageState, number>>;


function getLegalStateTransitionPath(oldState: PageState, newState: PageState): PageState[] {
    // We're intentionally not using for...of here so when we transpile to ES5
    // we don't need to include the Symbol polyfills.
    for (let order: Record<PageState, number>, i = 0; order = LEGAL_STATE_TRANSITIONS[i]; ++i) {
        const oldIndex = order[oldState];
        const newIndex = order[newState];

        if (oldIndex >= 0 &&
            newIndex >= 0 &&
            newIndex > oldIndex) {
            // Differences greater than one should be reported
            // because it means aorder state was skipped.
            return (<PageState[]>Object.keys(order)).slice(oldIndex, newIndex + 1);
        }
    }
    return [];
    // TODO(philipwalton): it shouldn't be possible to get here, but
    // consider some kind of warning or call to action if it happens.
    // console.warn(`Invalid state change detected: ${oldState} > ${newState}`);
};

function getCurrentState() {
    if (document.visibilityState === HIDDEN) {
        return HIDDEN;
    }
    if (document.hasFocus()) {
        return ACTIVE;
    }
    return PASSIVE;
};
type PageState = typeof STATES[number];

export type StateEvent = {
    statechange: [{
        oldState: PageState;
        newState: PageState;
        originalEvent: Event;
    }];
};
export class LifecycleImpl extends Emitter<StateEvent>{

    get state() { return this._state; }

    private _state: PageState = getCurrentState();

    private _safariBeforeUnloadTimeout: number | null = null;

    constructor() {
        super();

        EVENTS.forEach((eventName) => {
            window.addEventListener(eventName, this.handleEvents.bind(this));
        });

        // Safari does not reliably fire the `pagehide` or `visibilitychange`
        // events when closing a tab, so we have to use `beforeunload` with a
        // timeout to check whether the default action was prevented.
        // - https://bugs.webkit.org/show_bug.cgi?id=151610
        // - https://bugs.webkit.org/show_bug.cgi?id=151234
        // NOTE: we only add this to Safari because adding it to Firefox would
        // prevent the page from being eligible for bfcache.
        if (IS_SAFARI) {
            window.addEventListener('beforeunload', (evt) => {
                this._safariBeforeUnloadTimeout = setTimeout(() => {
                    if (!(evt.defaultPrevented || evt.returnValue.length > 0)) {
                        this._dispatchChangesIfNeeded(evt, HIDDEN);
                    }
                }, 0);
            });
        }

    }

    protected handleEvents(evt: Event) {

        window.addEventListener('pagehide', (evt) => {

        });
        if (IS_SAFARI) {
            clearTimeout(this._safariBeforeUnloadTimeout);
        }
        switch (evt.type) {
            case 'pageshow':
            case 'resume':
                this._dispatchChangesIfNeeded(evt, getCurrentState());
                break;
            case 'focus':
                this._dispatchChangesIfNeeded(evt, ACTIVE);
                break;
            case 'blur':
                // The `blur` event can fire while the page is being unloaded, so we
                // only need to update the state if the current state is "active".
                if (this._state === ACTIVE) {
                    this._dispatchChangesIfNeeded(evt, getCurrentState());
                }
                break;
            case 'pagehide':
            case 'unload':
                this._dispatchChangesIfNeeded(evt, (<PageTransitionEvent>evt).persisted ? FROZEN : TERMINATED);
                break;
            case 'visibilitychange':
                // The document's `visibilityState` will change to hidden  as the page
                // is being unloaded, but in such cases the lifecycle state shouldn't
                // change.
                if (this._state !== FROZEN &&
                    this._state !== TERMINATED) {
                    this._dispatchChangesIfNeeded(evt, getCurrentState());
                }
                break;
            case 'freeze':
                this._dispatchChangesIfNeeded(evt, FROZEN);
                break;
        }
    }


    private _dispatchChangesIfNeeded(originalEvent, newState) {
        if (newState !== this._state) {
            const oldState = this._state;
            const path = getLegalStateTransitionPath(oldState, newState);

            for (let i = 0; i < path.length - 1; ++i) {
                const oldState = path[i];
                const newState = path[i + 1];

                this._state = newState;

                this.emit('statechange', {
                    oldState,
                    newState,
                    originalEvent,
                });


            }
        }

    }

}


export const PageLifecycle = new LifecycleImpl();

