import { _decorator, Component, Graphics, CCInteger, Vec3, Color, Rect, Mask, CCBoolean, Prefab,CCFloat } from 'cc';
import { SymbolItem } from './SymbolItem';
import { PrefabInstancePoolManager } from '../tools/PrefabInstancePoolManager';
const { ccclass, property } = _decorator;

export class SlotWheelEvent {
    public static StopEnd: string = "StopEnd";
}

export class DefaultWheelInfo
{
    public initialVelocity: number = 500; // 初速度
    public maxVelocity: number = -5000; // 最大速度
    public timeToAchieveMaxVelocity: number = 1; // 啟動後耗時多久至最大速度(單位:sec)
}

@ccclass('SlotWheel')
export class SlotWheel extends Component {

    protected static vec3: Vec3 = new Vec3();


    @property({ type: CCInteger, tooltip: "主要顯示數量" })
    public mainSymbolAmount: number = 3; // 主要顯示數量

    @property({ type: Rect, tooltip: "主要區域：此區域為滾輪主要物件擺放區域" })
    public mainRect: Rect = new Rect(-500, -500, 1000, 1000);

    @property({ type: Rect, tooltip: "遮罩區域：此區域作為滾輪物件可視範圍" })
    public maskRect: Rect = new Rect(-500, -600, 1000, 1200);

    @property({ type: CCBoolean, tooltip: "是否創建遮罩" })
    public cerateMask: boolean = false;

    @property({ type: CCInteger, tooltip: "初速度" })
    public initialVelocity: number = 500; // 初速度

    @property({ type: CCInteger, tooltip: "最大速度" })
    public maxVelocity: number = -5000; // 最大速度

    @property({ type: CCFloat, tooltip: "啟動後耗時多久至最大速度(單位:sec)" })
    public timeToAchieveMaxVelocity: number = 1; // 啟動後耗時多久至最大速度(單位:sec)

    @property({ type: CCInteger, tooltip: "停止時回彈速度" })
    public bounceVelocity: number = 1000; // 停止時回彈速度

    @property({ type: Prefab, tooltip: "滾輪內物件 prefab" })
    protected symbolPrefab: Prefab = null;


    protected arrSymbol: Array<SymbolItem> = []; // 滾輪內所有物件 [index 由小至大] 對應 [Symbol 由上而下]
    protected arrMainSymbol: Array<SymbolItem> = []; // 主要物件 [index 由小至大] 對應 [Symbol 由上而下]
    protected mask: Mask;

    protected _lastTime: number;
    protected _velocity: number; // 速度
    protected _acceleration: number = -1; // 加速度
    protected _isRunnung: boolean = false; // 輪軸是否滾動中
    protected _inStoppingPhase: boolean = false; // 輪軸停止中
    protected _totalTimeToStop: number; // 從開始停止至完全靜止狀態需花費的時間
    protected _timeToStop: number; // 至靜止狀態還需花費的時間

    protected _extendedCards: Array<number> = []; // 輪軸停止時延伸物件(下階段掉落物件)牌組

    protected _defaultWheelInfo: DefaultWheelInfo; // 預設輪軸資訊

    get isRunnung():boolean {return this._isRunnung}
    get inStoppingPhase():boolean {return this._inStoppingPhase}

    start() {
        this._defaultWheelInfo = new DefaultWheelInfo();
        this._defaultWheelInfo.initialVelocity = this.initialVelocity;
        this._defaultWheelInfo.maxVelocity = this.maxVelocity;
        this._defaultWheelInfo.timeToAchieveMaxVelocity = this.timeToAchieveMaxVelocity;

        this.init();
    }

    protected init() {
        if (this.cerateMask) {
            this.generateMask();
        }
        this.generateInitialSymbols();
    }

    public speedUp(b: boolean) {
        if (b) {
            this.initialVelocity = 2 * this._defaultWheelInfo.initialVelocity;
            this.maxVelocity = 2 * this._defaultWheelInfo.maxVelocity;
            this.timeToAchieveMaxVelocity = 0.5 * this._defaultWheelInfo.timeToAchieveMaxVelocity;
        } else {
            this.initialVelocity = this._defaultWheelInfo.initialVelocity;
            this.maxVelocity = this._defaultWheelInfo.maxVelocity;
            this.timeToAchieveMaxVelocity = this._defaultWheelInfo.timeToAchieveMaxVelocity;
        }
    }

    protected run() {
        let deltaTime: number = this._lastTime;
        this._lastTime = Date.now() * 0.001;
        deltaTime = this._lastTime - deltaTime;

        let desireVelocity: number = this._inStoppingPhase? this.bounceVelocity : this.maxVelocity;
        let accelerationTime: number = this._acceleration == 0? 0 : (desireVelocity - this._velocity) / this._acceleration;
        let uniformVelocityTime: number = 0;

        if (this._inStoppingPhase) { // 準備停止
            deltaTime = Math.min(this._timeToStop, deltaTime);
            this._timeToStop -= deltaTime;
            if (this._timeToStop <= 0) {
                this._isRunnung = false;
                this.unschedule(this.run);
            }
        }

        if (accelerationTime < deltaTime) {
            uniformVelocityTime = deltaTime - accelerationTime;
        } else {
            accelerationTime = deltaTime;
        }

        let displacement: number = this._velocity * accelerationTime + 0.5 * this._acceleration * accelerationTime * accelerationTime + desireVelocity * uniformVelocityTime;
        let bounceDisplacement:number = this.getBounceDisplacement(this.bounceVelocity, this.maxVelocity, this._totalTimeToStop, this._velocity);
        bounceDisplacement += this.getBounceDisplacement(this.initialVelocity, this.maxVelocity, this.timeToAchieveMaxVelocity);

        let top: number;
        let len: number = this.arrSymbol.length;
        let symbol: SymbolItem;
        let symbolTop: number;
        for (let i:number = 0; i < len; i++) {
            symbol = this.arrSymbol[i];
            SlotWheel.vec3.set(0, displacement, 0);
            symbol.node.setPosition(Vec3.add(SlotWheel.vec3, SlotWheel.vec3, symbol.node.getPosition()));

            if (i == 0) {
                top = symbol.node.getPosition().y + 0.5 * symbol.height;
            }

            symbolTop = symbol.node.getPosition().y + 0.5 * symbol.height + bounceDisplacement;
            if (symbolTop <= this.maskRect.y) {
            // if (!this._inStoppingPhase && top <= this.maskRect.y) {
                this.removeSymbol(symbol);
                i--;
                len--;
            }
        }

        let newSymbol: SymbolItem;
        while (top < this.maskRect.y + this.maskRect.height) {
            newSymbol = this.spawnSymbolByID();
            newSymbol.node.setPosition(0, top + 0.5 * newSymbol.height, 0);
            top += newSymbol.height;

            symbolTop = symbol.node.getPosition().y + 0.5 * symbol.height + bounceDisplacement;
            if (symbolTop <= this.maskRect.y) {
            // if (!this._inStoppingPhase && top <= this.maskRect.y) {
                this.removeSymbol(symbol);
            } else {
                if (!this._inStoppingPhase) {
                    newSymbol.gettingBlur(true);
                }
            }
        }

        this._velocity = uniformVelocityTime != 0? desireVelocity : this._velocity + accelerationTime * this._acceleration;

        if (!this._isRunnung) { // 轉輪停止事件可以掛在這
            this._inStoppingPhase = false;
            this.node.emit(SlotWheelEvent.StopEnd);
        }
    }

    generateMask() {
        this.addComponent(Mask);
        this.mask = this.getComponent(Mask);
        this.mask.type = Mask.Type.GRAPHICS_RECT;

        let g: Graphics = this.getComponent(Graphics);
        g.clear();
        g.fillColor = Color.WHITE;
        g.strokeColor = Color.WHITE;
        g.lineWidth = 2;
        g.rect(this.maskRect.x, this.maskRect.y, this.maskRect.width, this.maskRect.height);
        g.fill();       
    }

    protected generateInitialSymbols() {
        let symbol: SymbolItem;
        for (let i:number = this.mainSymbolAmount - 1; i >= 0; i--) {
            symbol = this.spawnSymbolByID();
        }

        symbol = this.arrSymbol[0];
        let top: number = symbol.node.getPosition().y + 0.5 * symbol.height;
        while (top < this.maskRect.y + this.maskRect.height) {
            symbol = this.spawnSymbolByID();
            top += symbol.height;
        }

        let initialBounceDisplacement:number = this.getBounceDisplacement(this.initialVelocity, this.maxVelocity, this.timeToAchieveMaxVelocity);

        symbol = this.arrSymbol[this.arrSymbol.length - 1];
        let bottom: number = symbol.node.getPosition().y - 0.5 * symbol.height + initialBounceDisplacement;
        while (bottom > this.maskRect.y) {
            symbol = this.spawnSymbolByID(this.generateSymbolID(), false);
            bottom -= symbol.height;
        }
    }


    /**
     * 取得反彈高度
     * @returns 反彈高度
     */

    /**
     * 取得反彈高度
     * @param bounceVelocity 加速度過程的初始速度(反彈速度)
     * @param destVelocity 加速度過程的最終速度
     * @param totalTime 加速度過程所花的時間
     * @param destVelocity 目前速度
     * @returns 反彈高度
     */
    protected getBounceDisplacement(bounceVelocity: number, destVelocity: number, totalTime: number, currentVelocity?: number): number {
        if (bounceVelocity * destVelocity >= 0) {
            return 0;
        } else {
            let acceleration: number = (destVelocity - bounceVelocity) / totalTime;
            let time: number = (0 - bounceVelocity) / acceleration;
            if (currentVelocity != null) {
                time = Math.min(time, (currentVelocity - bounceVelocity) / acceleration);
            }
            return Math.abs(bounceVelocity * time + 0.5 * acceleration * time * time);
        }
    }

    /**
     * 輪軸啟動
     */
    launch() {
        this._velocity = this.initialVelocity;
        this._acceleration = (this.maxVelocity - this.initialVelocity) / this.timeToAchieveMaxVelocity;
        this._isRunnung = true;
        this._lastTime = Date.now() * 0.001;
        this.schedule(this.run, 0);
    }

    /**
     * 輪軸停止
     * @param cards 輪軸停止時主要物件牌組
     * @param extendedCards 輪軸停止時延伸物件(下階段掉落物件)牌組
     */
    stop(cards: Array<number>, extendedCards?: Array<number>, time?: number) {
        this.run();

        this._velocity = this.maxVelocity;

        this._inStoppingPhase = true;
        this.arrMainSymbol = [];

        let len: number = cards.length;
        let i: number = len - 1;
        let newID: number;
        let newSymbol: SymbolItem;
        while (i >= 0) {
            newID = cards[i] - 1;
            newSymbol = this.spawnSymbolByID(newID);
            this.arrMainSymbol.unshift(newSymbol);
            i--;
        }

        let displacement: number = (this.mainRect.y + 0.5 * newSymbol.height) - this.arrMainSymbol[this.arrMainSymbol.length - 1].node.getPosition().y;
        if (time != null) {
            this._totalTimeToStop = time;
            this._timeToStop = time;
            this._velocity = 2 * (displacement / time) - this.bounceVelocity;
        }
        this._acceleration = ((this.bounceVelocity * this.bounceVelocity) - (this._velocity * this._velocity)) / (2 * displacement);
        
        if (time == null) {
            this._timeToStop = (this.bounceVelocity - this._velocity) / this._acceleration;
            this._totalTimeToStop = this._timeToStop;
        }

        if (extendedCards) {
            this._extendedCards = extendedCards;
        }
    }

    /**
     * 產生 symbol
     * @param id symbol id
     * @param prepend 是否前置
     * @param y 位置 y
     * @returns 
     */
    protected spawnSymbolByID(id: number = this.generateSymbolID(), prepend: boolean = true, y: number = null): SymbolItem {
        let symbol:SymbolItem = PrefabInstancePoolManager.instance.takeOut(this.symbolPrefab).getComponent(SymbolItem);
        this.addSymbol(symbol, prepend, y);
        symbol.changeSymbolID(id);
        return symbol;
    }

    /**
     * 增加 symbol
     * @param symbol 
     * @param prepend 是否前置
     * @param y 位置 y
     */
    protected addSymbol(symbol: SymbolItem, prepend: boolean = true, y?: number) {
        symbol.node.active = true;
        this.node.addChild(symbol.node);

        let desY: number;
        if (this.arrSymbol.length == 0) {
            desY = this.mainRect.y + 0.5 * symbol.height;
            this.arrSymbol.push(symbol);
        } else {
            if (prepend) {
                desY = this.arrSymbol[0].node.position.y + 0.5 * this.arrSymbol[0].height + 0.5 * symbol.height;
                this.arrSymbol.unshift(symbol);
                symbol.node.setSiblingIndex(0);
            } else {
                desY = this.arrSymbol[this.arrSymbol.length - 1].node.position.y - 0.5 * this.arrSymbol[this.arrSymbol.length - 1].height - 0.5 * symbol.height;
                this.arrSymbol.push(symbol);
            }
        }

        if (y == null) {
            y = desY;
        }
        symbol.node.setPosition(0, y);
    }

    /**
     * 移除 Symbol
     * @param symbol 
     */
    protected removeSymbol(symbol: SymbolItem) {
        this.node.removeChild(symbol.node);
        this.arrSymbol.splice(this.arrSymbol.indexOf(symbol), 1);
        symbol.recycle();
    }

    protected generateSymbolID(): number {
        let id :number;
        if (this._extendedCards.length > 0) {
            id = this._extendedCards.shift();
        } else {
            id = 0;
        }
        return id;
    }

    public getMainSymbolByIndex(mainIndex: number): SymbolItem {
        if (this.arrMainSymbol.length > mainIndex && this.arrMainSymbol[mainIndex]) {
            return this.arrMainSymbol[mainIndex];
        } else {
            return null;
        }
    }
}