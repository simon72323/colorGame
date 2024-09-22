import { _decorator, Component, Node, tween, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RAMarquee')
export class RAMarquee extends Component {
    private marqueeText: Node[] = [];
    private marqueeWidth: number[] = [];
    private rollingSpeed: number = 100;
    private marqueeId: number = 0;


    protected onLoad(): void {
        this.getMarqueeSp();
    }

    start() {
        this.runMarquee(this.marqueeId);
    }

    update(deltaTime: number) {

    }

    private getMarqueeSp(): void {
        this.marqueeText = [];
        this.marqueeWidth = [];
        const parentWidth = this.node.getComponent(UITransform)!.contentSize.width;

        this.node.children.forEach(child => {
            this.marqueeText.push(child);
            const width = child.getComponent(UITransform)!.contentSize.width;
            this.marqueeWidth.push(width);
            child.setPosition(new Vec3(parentWidth / 2, 0, 0));
        });
    }

    private runMarquee(id: number): void {
        const nodeWidth = this.marqueeText[id];
        const labelWidth = this.marqueeWidth[id];
        const parentWidth = this.node.getComponent(UITransform)!.contentSize.width;

        // 從右邊外面開始，往左邊移動
        nodeWidth.setPosition(new Vec3(parentWidth / 2, 0, 0));

        tween(nodeWidth)
            .to((labelWidth + parentWidth) / this.rollingSpeed, { position: new Vec3(-labelWidth - parentWidth / 2, 0, 0) })
            .call(() => {
                this.marqueeId = (this.marqueeId + 1) % this.marqueeText.length;
                this.runMarquee(this.marqueeId);
            })
            .start();
    }
}

