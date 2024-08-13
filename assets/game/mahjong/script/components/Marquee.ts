import { _decorator, Color, Component, Graphics, Label, Layers, Node, UITransform, Mask, CCInteger, CCFloat, ccenum } from 'cc';
import { log } from '../include';
const { ccclass, property, menu } = _decorator;

export enum MarqueeDirection { LEFT, RIGHT }
ccenum(MarqueeDirection)

@ccclass('Marquee')
@menu('Generic/Marquee')
export class Marquee extends Component {
    @property( { type: Node } )
    protected backgroud: Node = null;
    @property( { type: Label } )
    protected textField: Label = null;

    protected queue: string[] = [];
    
    private running: boolean = false;
    // @property( { type: CCFloat, visible: false } )
    private speed: number = 1.5;
    // @property( { type: CCFloat, tooltip: "速度", slide: true } )
    // public get speed(): number { return this._speed; }
    // public set speed(value: number) { this._speed = value; }

    @property( { type: MarqueeDirection, tooltip: "方向" } )
    public readonly direction: MarqueeDirection = MarqueeDirection.LEFT;

    // public get running(): boolean { return this._running; }
    
    start() {
        
        // let tran: UITransform = this.node.getComponent(UITransform);
        // const { contentSize } = tran;
        this.run();
        // default node
        // tran.width = 900;
        // tran.height = 80;
        // this.node.setPosition(0, 860);

        // log(`contentSize`, contentSize.width, contentSize.height);
        // if (!this.backgroud)
        //     this.backgroud = this.createBackground(contentSize.width, contentSize.height);
        // this.createMask(contentSize.width, contentSize.height);
        // if (!this.textField) 
        //     this.textField = this.createLabel();
    }
    /** 更新 */
    update(deltaTime: number) {
        if (this.running) this.moveLeft();
    }
    /** 遮罩 */
    // private createMask(width: number, height: number) {
    //     const { node } = this;
    //     const maskComponent = node.getComponent(Graphics);
    //     maskComponent.rect(-width/2, 0, width, height);
    //     maskComponent.fillColor = new Color(0, 0 , 0, 150);
    //     maskComponent.stroke();
    //     maskComponent.fill();
    //     let mask = node.getComponent(Mask);
    //     if (!mask) {
    //         mask = node.addComponent(Mask);
    //         mask.type = Mask.Type.GRAPHICS_RECT;
    //     }
    // }
    /** 背景物件 */
    // private createBackground(width: number, height: number):Node {
    //     let node: Node = new Node('background');
    //     node.layer = Layers.Enum.UI_2D;
    //     node.parent = this.node;
    //     node.addComponent(Graphics);
    //     node.setPosition(0, 0);
    //     let tran = node.getComponent(UITransform);
    //     tran.width = width;
    //     tran.height = height;
    //     this.node.addChild(node);
    //     const backgroud = node.getComponent(Graphics);
    //     backgroud.rect(-width/2, -height/2, width, height);
    //     backgroud.fillColor = new Color(0, 0 , 0, 150);
    //     backgroud.stroke();
    //     backgroud.fill();
    //     return node;
    // }
    /** 建立文字框 */
    // private createLabel():Label {
    //     const name: string = 'textField';
    //     const { x, y } = this.node.position;
    //     const { contentSize } = this.node.getComponent(UITransform);
    //     let node: Node = new Node(name);
    //     node.layer = Layers.Enum.UI_2D;
    //     node.parent = this.node;
    //     node.addComponent(Label);
    //     this.node.addChild(node);

    //     let label: Label = this.node.getChildByName(name).getComponent(Label);
    //     label.horizontalAlign = Label.HorizontalAlign.CENTER;
    //     label.verticalAlign = Label.VerticalAlign.CENTER;
    //     label.string = '';
    //     return label;
    // }
    /**
     * 設定顯示的內容
     * @param    str 顯示的內容
     */
    public addText(data: string) {
        this.queue.push(data);
    }
    /**
     * 開始跑馬燈
     */
    public run() {
        if (!this.node.active) {
            this.shiftQueue();
            this.node.active = true;
            this.running = true;
        }
    }
    /** 停止 */
    public stop() {
        this.running = false;
        this.node.active = false;
    }
    /** 暫停 */
    public pause() {
        this.running = false
    }
    /** 暫停:恢復 */
    public resume() {
        this.running = true;
    }
    /**
     * 移動
     */
    private moveLeft() {
        console.log("跑動")
        const { node } = this.textField;
        const { x, y } = node.position;
        const { width, anchorPoint } = this.backgroud.getComponent(UITransform);
        const textWidth = node.getComponent(UITransform).width;
        
        let now: number = x + ((textWidth + width) * anchorPoint.x);
        const margin: number = 10;
        
        if ( now < margin - this.speed * 60 ) {
            this.checkQueue();
        } else {
            node.setPosition(x - this.speed, y);
        }
        
    }
    /**
     * 檢查queue
     */
    private checkQueue() {
        if (!this.queue.length) {
            this.stop();
        } else {
            this.shiftQueue();
        }
    }
    /**
     * 移除queue中的第一個元素
     * @returns { boolean }
     */
    private shiftQueue(): boolean {
        if (!this.queue.length) return false;

        const { width, height } = this.backgroud.getComponent(UITransform);
        const { x, y } = this.backgroud.position;
        const size = this.textField.node.getComponent(UITransform);
        this.textField.string = this.queue.shift();
        this.textField.updateRenderData(true);
        this.textField.node.setPosition(x + width, this.textField.node.position.y);

    }

}

