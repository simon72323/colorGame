import { _decorator, Component, Node, Toggle, Button, EventHandler } from 'cc';
import { CGView } from './CGView';
import { CGModel } from './CGModel';

const { ccclass, property } = _decorator;

@ccclass('CGController')
export class CGController extends Component {
    @property(CGView)
    private view: CGView = null;
    private model: CGModel;

    onLoad() {
        this.model = CGModel.getInstance();
        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        const scriptName = 'CGController'; // 改为 Controller 的脚本名
        //選擇籌碼按鈕觸發事件設置
        for (let i = 0; i < this.view.touchChip.children.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'setTouchChipID';
            eventHandler.customEventData = i.toString();
            this.view.touchChip.children[i].getComponent(Toggle).clickEvents.push(eventHandler);
        }
        //btnCall按鈕觸發事件設置
        for (let i = 0; i < this.view.btnCall.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'btnCallDown';
            eventHandler.customEventData = i.toString();
            this.view.btnCall[i].getComponent(Button).clickEvents.push(eventHandler);
        }
        //btnStopCall按鈕觸發事件設置
        for (let i = 0; i < this.view.btnStopCall.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'btnStopCallDown';
            eventHandler.customEventData = i.toString();
            this.view.btnStopCall[i].getComponent(Button).clickEvents.push(eventHandler);
        }

        // 籌碼選擇toggle按鈕觸發事件設置
        const chipToggleChildren = this.view.chipToggle.children;
        for (let i = 0; i < chipToggleChildren.length; i++) {
            const eventHandler = new EventHandler();
            eventHandler.target = this.node;
            eventHandler.component = scriptName;
            eventHandler.handler = 'chipSet';
            eventHandler.customEventData = i.toString();
            chipToggleChildren[i].getComponent(Toggle).clickEvents.push(eventHandler);
        }
    }

    //更新點選的籌碼
    public setTouchChipID(event: Event, customEventData: string) {
        console.log("點選值", customEventData)
        this.model.setTouchChipID(parseInt(customEventData));
    }

    //跟注按鈕按下
    public btnCallDown(event: Event, customEventData: string) {
        const id = parseInt(customEventData);
        // 在这里添加跟注逻辑
        // 例如：更新游戏状态，发送网络请求等
        this.view.updateBetCallUI(id, true);//啟用跟注
    }

    //取消跟注按鈕按下
    public btnStopCallDown(event: Event, customEventData: string) {
        const id = parseInt(customEventData);
        // 在这里添加取消跟注逻辑
        // 例如：更新游戏状态，发送网络请求等
        this.view.updateBetCallUI(id, false);//停用跟注
    }

    //-----------籌碼設置相關-------------
    private chipSet(event: Event, customEventData: string) {
        const id = parseInt(customEventData);
        const isChecked = this.view.chipToggle.children[id].getComponent(Toggle).isChecked;
        const updatedChipSetIDing = this.model.updateChipSetID(id, isChecked);
        this.scheduleOnce(() => {
            this.view.updateChipSet(updatedChipSetIDing);
        }, 0);
    }
    //籌碼設置按鈕確認(節點觸發)
    public chipSetConfirm() {
        this.model.saveChipSetID();
        this.chipSetPopupHide();
        this.updateTouchChip();
    }
    //籌碼設置按鈕預設(節點觸發)
    public chipSetDefault() {
        const defaultChipSet = this.model.setDefaultChipSet();
        this.view.updateChipSet(defaultChipSet);
    }

    //顯示籌碼設置視窗(節點觸發)
    public chipSetPopupShow() {
        const currentChipSet = this.model.getCurrentChipSet();
        this.view.updateChipSet(currentChipSet);
        this.view.popupShow(this.view.chipSetPopup);
    }
    //隱藏籌碼設置視窗(節點觸發)
    public chipSetPopupHide() {
        this.view.popupHide(this.view.chipSetPopup);
    }
    //更新點選的籌碼
    public updateTouchChip() {
        const touchChipData = this.model.getTouchChipData();
        this.view.updateTouchChip(touchChipData.chipSetID, touchChipData.chipRange);
    }
    //-----------籌碼設置相關-------------

    //更新分數
    public updateUIScore() {
        this.view.updateUIScore(this.model.getScoreData());
    }

    //更新路紙
    public updateRoadMap() {
        this.view.updateRoadMap(this.model.getRoadMapData());
    }
    //路紙視窗顯示(節點觸發)
    public roadMapPopupShow() {
        this.view.popupShow(this.view.roadMapPopup);
    }

    //路紙視窗關閉(節點觸發)
    public roadMapPopupHide() {
        this.view.popupHide(this.view.roadMapPopup);
    }
}


