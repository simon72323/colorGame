import { _decorator, Component, Node, CCString, Vec2, Button, PolygonCollider2D, EventTouch, Intersection2D, UITransform, Vec3, Toggle } from 'cc';
const { ccclass, property, menu } = _decorator;

@ccclass('ButtonEvent')
@menu('UI/ButtonEvent')
export default class ButtonEvent extends Component {
    @property(Node)
    public target: Node = null!;
    @property(CCString)
    public param: string = '';

    public start(): void {
        const polygon = this.getComponent(PolygonCollider2D);
        const toggle = this.getComponent(Toggle);
        const button = this.getComponent(Button);

        if (polygon) {
            polygon.enabled = false;
            if (button) {
                this.node.on(Node.EventType.TOUCH_END, this.onPolygonTouchEnd, this);
            }
        } else if (toggle) {
            this.node.on(Node.EventType.TOUCH_END, this.onToggleTouchEnd, this);
        } else if (button) {
            this.node.on(Node.EventType.TOUCH_END, this.onButtonTouchEnd, this);
        } else {
            console.log('ButtonEvent:腳本:未找到相關屬性');
        }
    }
    public onPolygonTouchEnd(event: EventTouch): void {
        const tPos = event.getUILocation();//滑鼠點擊的位置
        const locationInNode = event.target.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(tPos.x, tPos.y));
        if (this.hitTest(locationInNode)) {
            if (this.getComponent(Button)!.interactable) {
                // console.log("poly按下")
                this.triggerEvent('OnButtonEventPressed');
            } else {
                this.triggerEvent('OnButtonEventPressFailed');
            }
        }
    }
    public onToggleTouchEnd(event: EventTouch): void {
        if (this.getComponent(Toggle)!.interactable) {
            // console.log("toggle按下")
            this.triggerEvent('OnButtonEventPressed');
        } else {
            this.triggerEvent('OnButtonEventPressFailed');
        }
    }

    public onButtonTouchEnd(event: EventTouch): void {
        if (this.getComponent(Button)!.interactable) {
            // console.log("btn按下")
            this.triggerEvent('OnButtonEventPressed');
        } else {
            this.triggerEvent('OnButtonEventPressFailed');
        }
    }
    private hitTest(point: Vec2): boolean {
        const polygonCollider = this.getComponent(PolygonCollider2D)!;
        // console.log(point, polygonCollider.points)
        return Intersection2D.pointInPolygon(point, polygonCollider.points);
    }
    private triggerEvent(event: string): void {
        this.target.emit(event, this.param);
    }
}