import 'jest';
import { jest } from '@jest/globals';
import { Emitter } from 'strict-event-emitter';
import { Tween, log } from 'cc';

global['DepositUrl'] = jest.fn();

//@ts-ignore
HTMLCanvasElement.prototype.getContext = () => { 
    // return whatever getContext has to return
};

export class MockNode extends Emitter<any> {
    static EventType = {
        ACTIVE_IN_HIERARCHY_CHANGED: "active-in-hierarchy-changed"
    }
    layer: any;
    name: string;
    _children: any[] = [];
    get children() { return this._children; }
    _components: {} = {};
    get components() { return this._components; }
    parent: MockNode;
    // 顯示物件
    active: boolean = false;
    position: {
        x: number,
        y: number
    } = {x: 0, y: 0};
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }
    getPosition() {
        return this.position;
    }
    setSiblingIndex(id) {
        
    }
    getChildByPath(path: string) {
        let group = path.split('/');
        let child;
        let endpoint = this;
        group.forEach((name: string) => {
            child = endpoint.getChildByName(name);
            endpoint = child;
        });
        return endpoint;
    }
    getChildByName(name: string) {
        for (let i = 0; i < this._children.length; i++ ) {
            let child = this._children[i];
            if ( child.name === name) return child;
        }
        let _child = new MockNode(this);
        _child.name = name;
        this._children.push(_child);
        return _child;
    }
    getComponents(name: string) {
        return [];
    }
    getComponent(instance) {
        let el;
        if (instance == MockLabel) {
            if (this._components.hasOwnProperty(instance.name)) {
                return this._components[instance.name];
            } else {
                el = new MockLabel();
                el.node = this;
                return this._components[instance.name] = el;
            }
        }
        if (instance == MockAnimation) {
            if (this._components.hasOwnProperty(instance.name)) {
                return this._components[instance.name];
            } else {
                el = new MockAnimation();
                el.node = this;
                return this._components[instance.name] = el;
            }
        } else if (instance) {
            
            if (this._components.hasOwnProperty(instance.name)) {
                return this._components[instance.name];
            } else {
                el = new instance();
                el.node = this;
                return this._components[instance.name] = el;
            }
        }

    }
    
    addComponent(instance) {
        if (!this._components[instance.name]) {
            return this._components[instance.name] = new instance();
        } else {
            return null;
        }
    }
    addChild(instance) {
        this._children.push(instance);
    }

    constructor(parent: MockNode) {
        super();
        this.parent = parent;
        this.name = this.constructor.name;
    }
}
export class MockScene extends MockNode {
    constructor(scene: MockScene) {
        super(scene);
    }
}

let Scene: MockScene = new MockScene(null);
Scene.addChild(new MockNode(null));

export const MockLayers = {
    Enum: {
        UI_2D: 6,
    }
}
export class MockMask {
    static Type = jest.fn();
}
export class MockGraphics {
    static Type = jest.fn();
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    node = null;
    clear() {}
    rect(x, y, width, height) {
        this.x = x;
        this.y = x;
        this.width = width;
        this.height = height;
    }
    fill() {}
    stroke() {}
}
export class MockUITransform {

    contentSize: {
        width: number, height: number
    } = { width: 0, height: 0 };
    anchorPoint: {
        x: number, y: number
    } = { x: 0, y: 0 };
    node = null;
    get width(): number { return this.contentSize.width; }
    set width(value: number) { this.contentSize.width = value; }
    get height(): number { return this.contentSize.height; }
    set height(value: number) { this.contentSize.height = value; }
    scheduleOnce(arg, duration) {if (arg) arg()}
    setContentSize(width: number, height: number) {
        this.contentSize.width = width; 
        this.contentSize.height = height;
    }
}
export class MockAnimation extends Emitter<any> {
    mockGroupFn: any = {
        play: jest.fn(),
        stop: jest.fn(),
    }
    static EventType = {
        FINISHED: "finished",
        LASTFRAME: "lastframe",
        RESUME: "resume",
        PAUSE: "pause",
        STOP: "stop",
        PLAY: "play",
    }
    clips: any[] = [{ name: "clip1" }, { name: "clip2" }];
    node;
    play(...args) {
        this.mockGroupFn.play();
    }
    stop(...args) {
        this.mockGroupFn.stop();
    }
}

export class Skeleton {
    mockGroupFn: any = {
        setCompleteListener: jest.fn()
    }
    setAnimation(...args) {

    }
    setCompleteListener(callback) {
        if (callback) {
            this.mockGroupFn.setCompleteListener();
            callback();
        }
    }
}
export class sp {
    static Skeleton = Skeleton;
}
enum HorizontalAlign { LEFT, CENTER, RIGHT }
enum VerticalTextAlignment { TOP, CENTER, BOTTOM }
export class MockLabel {
    testcase: any = {
        updateRenderData: jest.fn()
    }
    static Type = jest.fn();
    static HorizontalAlign = HorizontalAlign;
    static VerticalAlign = VerticalTextAlignment;
    string = '';
    node: MockNode = new MockNode(null);
    updateRenderData(bool:boolean) {
        this.testcase.updateRenderData();
    }
}
export class MockProfiler {
    static hideStats:() => {} = jest.fn()
}
export class MockInput {
    static EventType = jest.fn();
}
export class MockButton extends Emitter<any> {
    static  Transition: any = {
        NONE: 0,
        COLOR: 1,
        SPRITE: 2,
        SCALE: 3
    }
    static EventType = jest.fn();
    node: MockNode = new MockNode(null);
    enabled: boolean = false;
    constructor() {
        super();
    }
}

export class MockToggle extends MockButton {
    isChecked: boolean = false;
}
export class MockGame extends Emitter<any> {
    static EVENT_HIDE = "game_on_hide";
    static EVENT_SHOW = "game_on_show";
    canvas = {
        parentNode: {
            appendChild: jest.fn()
        },
        style: jest.fn(),
        parentElement: {
            style: jest.fn()
        }
    }
}
class MockComponent {
    testcase = {
        addComponent: jest.fn(),
        getComponent: jest.fn(),
    }
    _components: {} = {};
    schedule(){ jest.fn() }
    unschedule(){ jest.fn() }
    scheduleOnce(arg, duration) {if (arg) arg()}
    addComponent() { 
        const { testcase } = this;
        testcase.addComponent();
    }
    getComponent(instance) { 
        const { testcase } = this;
        console.log(`getComponent`, instance.name);
        testcase.getComponent();
        
        if (instance == MockMask) {
            if (this._components.hasOwnProperty(instance.name)) {
                return this._components[instance.name];
            } else {
                return this._components[instance.name] = new MockMask();
            }
        }
        if (instance == MockGraphics) {
            if (this._components.hasOwnProperty(instance.name)) {
                return this._components[instance.name];
            } else {
                console.log('MockGraphics');
                let graphics = this._components[instance.name] = new MockGraphics();
                graphics.node = this;
                return graphics;
            }
        }
        if (instance == MockUITransform) {
            if (this._components.hasOwnProperty(instance.name)) {
                return this._components[instance.name];
            } else {
                let tran = this._components[instance.name] = new MockUITransform();
                tran.node = this;
                return tran;
            }
        }
        if (instance == MockAnimation) {
            if (this._components.hasOwnProperty(instance.name)) {
                return this._components[instance.name];
            } else {
                let node = this._components[instance.name] = new MockAnimation();
                node.node = this;
                return node;
            }
        }

        if (this._components.hasOwnProperty(instance.name)) {
            return this._components[instance.name];
        } else {
            return this._components[instance.name] = {};
        }
     }
    node: MockNode = new MockNode(root);
}
export class MockBlockInputEvents extends MockComponent {

}
export class MockAudioSource extends MockComponent {
    static EventType = {
        STARTED: "started",
        ENDED: "ended",
    }
    duration: number;
    volume: number = 1;
    loop: boolean = false;
    clip: MockAudioClip = null;
    private _playing = false;
    get playing() { return this._playing }
    getVolume():number { return this.volume; }
    play() {};
    pause() {};
    stop() {};
    playOneShot() {};
}
export class MockAudioClip {
    duration: number;
    volume: number = 1;
    loop: boolean = false;
    path: string = null;
    enabled: boolean = false;
    getVolume():number { return this.volume; }
    play() {};
    pause() {};
    stop() {};
    playOneShot(volume?: number) {};
    constructor(path?: string) {
        this.path = path;
    }
}

export class MockAssetManager {
    Bundle = {
        load: (path: string) => new MockAudioClip(path)
    };
    loadBundle(name: string, callback: Function) {
        if (callback) callback(null, this.Bundle);
    }
}
export class mockTween {
    args: any[] = [];
    selector: any = null;
    _tag: number = null;
    o: any = null;
    constructor(o:any) {
        this.o = o;
    }
    to(...args: any[]) {
        this.args = args;
        return this;
    }
    call(selector) {
        this.selector = selector;
        return this;
    }
    tag(num) {
        this._tag = num;
        return this;
    }
    start() {
        const { selector, args } = this;
        let block;
        for (let i = 0; i < args.length; i++) {
            if (args[i].onUpdate) {
                block = args[i];
            }  
        }
        for (let i = 0; i < args.length; i++) {
            if ( typeof args[i] === 'object' && !args[i].onUpdate) { 
                let keys = Object.keys( args[i] );
                    keys.forEach( key => {
                        if (this.o[key] != null || typeof this.o[key] != 'undefined') {
                            
                            for (let j = 0; j <= args[i][key]; j++) {
                                this.o[key] = j;
                                
                                if (block) block.onUpdate(this.o);
                            }
                            if (selector) selector();
                            
                        }
                    });              
            }
        }
        return this;
    }
    static stopAllByTag(tag) {
        
    }
    static stopAllByTarget() {

    }
}
export const assetManager = new MockAssetManager();

let root:MockNode = new MockNode(null);

// 模擬cocos engine modules framework
jest.mock('cc', () => {
    return {
        __esModule: true,
        CCBoolean: jest.fn(),
        CCString: jest.fn(),
        CCInteger: jest.fn(),
        ccenum: jest.fn(),
        Component: MockComponent,
        _decorator: {
            ccclass: () => {},
            property: () => {},
            menu: () => {}
        },
        Mask: MockMask,
        Graphics: MockGraphics,
        UITransform: MockUITransform,
        Vec3: jest.fn(),
        Color: jest.fn(),
        Rect: jest.fn(),
        Prefab: class Prefab {
            name: string = 'prefab';
        },
        profiler: MockProfiler,
        Button: MockButton,
        Toggle: MockToggle,
        Node: MockNode,
        Scene: MockScene,
        Input: MockInput,
        Label: MockLabel,
        Animation: MockAnimation,
        AudioSource: MockAudioSource,
        AudioClip: MockAudioClip,
        AssetManager: MockAssetManager,
        assetManager,
        sp: sp,
        instantiate: function (Instance) {
            console.log('instantiate', Instance);
            return new Instance();
        },
        Layers: MockLayers,
        game: new MockGame(),
        Game: MockGame,
        view: {
            setOrientation: jest.fn(),
            setResolutionPolicy: jest.fn(),
            getDesignResolutionSize: jest.fn().mockReturnValue({ width: 800, height: 600 }),
            on: jest.fn()
        },
        macro: {
            ORIENTATION_PORTRAIT: 0
        },
        ResolutionPolicy: {
            EXACT_FIT: 0
        },
        screen: {
            devicePixelRatio: jest.fn(),
            windowSize: jest.fn(),
        },
        director: {
            root: {
                resize: jest.fn()
            },
            getScene: function() {
                return Scene; 
            },
            addPersistRootNode: (node) => {}
        },
        BlockInputEvents: MockBlockInputEvents,
        tween: (o) => {
            return new mockTween(o);
        },
        Tween: mockTween,
        sys: {
            isMobile: false
        },
        Sprite: class MockSprite {
            
        }
      }
}, { virtual: true });

export let environments = {
    __esModule: true,
    BUILD: false
}

jest.mock('cc/env', () => {
    return environments;
}, { virtual: true })
export let UAParserData = {
    device: { type: '' },
    os: { name: "windows" },
    browser: { name: '' }
}
class MockUAParser {
    static n: string = 'mockUAParser';
    getResult() { return UAParserData; }
}
// jest.mock('ua-parser-js', () => {
//     return {
//         default: MockUAParser
//     }
// }, { virtual: true });

jest.mock('crypto-es', () => {
    return {
        __esModule: true,
        default: {
            "AES": jest.fn()
        }

    }
}, { virtual: true });

export class envSetup {
    // cocos simulator
}
