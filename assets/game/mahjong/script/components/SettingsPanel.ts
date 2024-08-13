
import { CCString, Component, Prefab, _decorator, instantiate, Node, Label, CCBoolean, EventHandler, Button, Input, CCObject, CCInteger, Toggle, game, Layout, UITransform, math, Animation, animation, RealKeyframeValue } from "cc";
import { AlertPanel, DialogEventTypes, MahjongAlertEvent } from "./AlertPanel";
import { MahjongView } from "./MahjongView";
import { Localization, LocalizedStrKeys } from "../lib/Localization";
import { SettingsWebView } from "./settings/SettingsWebView";
import { BUILD } from "cc/env";
import { userAnalysis, URLParameter, ToolBarEventName, log } from "../include";
import { AudioManager } from "./AudioManager";
import { SoundFiles } from "./SoundFiles";
import { TogglePlugin } from "../../../../common/script/ui/TogglePlugin";
import { UserPrefs } from "../lib/UserPrefs";
import { InputKeyboard, InputOccuraction } from "./InputKeyboard";
const { ccclass, property, menu } = _decorator;


export enum SettingsViewControllerEvent {
    CLOSE = "SettingViewClose"
} 

export enum TrackButtonEvents {
    EXIT_BTN,
    AUDIO_TOGGLE_BTN,
    EXCHANGE_BTN,
    HISTORY_BTN,
    RULE_BTN,
    HELP_BTN
}

/**
 * 設定面板
 */
@ccclass()
@menu('Mahjong/SettingsPanel')
export class SettingsPanel extends Component {
    
    // @property( { type: CCBoolean } )
    protected useContainer: boolean = false;

    @property( { type: Node, tooltip: '導覽列' } )
    protected navigationBar: Node;

    // @property( { type: Node } )
    // protected backgroud: Node;

    @property( { type: Label } )
    public versionLabel: Label;

    @property( { type: Node, tooltip: '標籤列' } )
    protected tabBar: Node;
    
    @property( { type: Node, tooltip: '標籤列選單' } )
    protected tabBarItems: Node[] = [];

    @property( { type: Node, tooltip: '顯示控制器' } )
    protected viewControllers: Node[] = [];
    
    @property( { type: CCInteger, tooltip: '目前顯示編號' } )
    public get selectedIndex(): number { 
        return this._selectedIndex;
    }
    public set selectedIndex(value: number) {
        log(`selectedIndex: ${value}`, this._selectedIndex);
        if (this._selectedIndex !== value) {
            this.selectedTabBarItem(value);
            this.showView(value);
        }
        this._selectedIndex = value;
    }

    @property( { type: CCInteger, visible: false } )
    public _selectedIndex: number = 3;

    @property( { type: Node } )
    protected closeButton: Node;

    // 事件
    public get event(): Node {
        return this.node;
    }
    // 初始化物件
    protected onLoad(): void {

        // 初始化
        if (this.tabBar) {
            this.tabBar.parent.active = true;
            this.tabBar.active = true;
        }
        if (this.navigationBar) {
            this.navigationBar.parent.active = true;
            this.navigationBar.active = true;
        }

        if (this.closeButton) {
            this.closeButton.on(Button.EventType.CLICK, () => {
                AudioManager.getInstance().play(SoundFiles.ButtonClick);
                this.hide();
            });
        }
        this.node.on(Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED, () => {
            const inputKeyboard = InputKeyboard.getInstance();
            inputKeyboard.setFocus(InputOccuraction.SPACE_SPINE, !this.node.active);
        });

        this.selectedTabBarItem(this._selectedIndex);
        this.showView(this._selectedIndex);
    }
    // 初始化註冊
    protected start(): void {
        this.registerTabBarItemEvent();
        this.registerViewControllers();
    }
    // 拔除兌換分數功能(白牌須將兌換分數功能拔除)
    public removeExchangeTab() {
        const toggleExchange: Node = this.tabBar.getChildByName("toggleExchange");

        const { tabBarItems, viewControllers } = this;
        let len: number = tabBarItems.length;
        for (let i:number = 0; i < len; i++) {
            if (tabBarItems[i] == toggleExchange) {
                tabBarItems.splice(i, 1);
                viewControllers.splice(i, 1);
                break;
            }
        }

        toggleExchange.removeFromParent();

        this.organizeTabBarLayout();
    }
    // 佈局 tab bar
    protected organizeTabBarLayout() {
        const refTab: Node = this.tabBar.children[0];
        const tabBarRealWidth: number = this.tabBar.children[this.tabBar.children.length - 1].position.x - refTab.position.x;

        let len: number = this.tabBarItems.length - 1;
        let paddingLeft: number = -0.5 * tabBarRealWidth;
        let spacingX: number = tabBarRealWidth / (len - 1);
        for (let i:number = 0; i < len; i++) {
            this.tabBarItems[i].setPosition(paddingLeft + i * spacingX, this.tabBarItems[i].position.y);
        }

        let animation: Animation = this.tabBar.parent.getComponent(Animation);
        len = animation.defaultClip.tracksCount;
        for (let i:number = 0; i < len; i++) {
            let track: animation.Track = animation.defaultClip.getTrack(i);
            let path: animation.TrackPath = track.path;
            if (path.parseHierarchyAt(0) == "toggleSound" && path.parsePropertyAt(1) == "position") {
                const [x] = track.channels(); // x, y, z 是前三條通道
                const keyLen: number = x.curve.keyFramesCount;
                const adjustX = this.tabBarItems[1].position.x - (<RealKeyframeValue>x.curve.getKeyframeValue(keyLen - 1)).value;

                let a = [];
                let b = [];
                for (let j:number = 0; j < keyLen; j++) {
                    a.push((<RealKeyframeValue>x.curve.getKeyframeValue(j)).value + adjustX);
                    b.push(x.curve.getKeyframeTime(j));
                }

                x.curve.clear();
                for (let j:number = 0; j < keyLen; j++) {
                    x.curve.addKeyFrame(b[j], a[j]);
                }
            }
        }
    }
    // 當前被選中的按鈕處理
    protected selectedTabBarItem(selectedIndex: number): void { 
        const { tabBarItems } = this;

        tabBarItems.forEach((item, index) => {
            let button = item.getComponent(Toggle);
            if (index === TrackButtonEvents.AUDIO_TOGGLE_BTN) {
                // 特殊規則按鈕
            } else {
                button.isChecked = (index === selectedIndex);
                button.interactable = !button.isChecked;
            }
        });

        
    }
    // 顯示current介面
    protected showView(selectedIndex: number): void {
        const { viewControllers } = this;
        log(`showView: ${selectedIndex}`);
        
        if (!viewControllers[selectedIndex]) return; // 選擇的物件不存在不跳轉view

        const settingsWebView: SettingsWebView = viewControllers[selectedIndex].getComponent(SettingsWebView);
        if (settingsWebView) {
            settingsWebView.show(settingsWebView.website);
        }
        
        viewControllers.forEach((view, index) => {
            return (view) ? view.active = (index === selectedIndex) : false;
        });

    }
    // 註冊事件
    protected registerTabBarItemEvent(): void {
        const { tabBarItems } = this;
        const localized = Localization.getInstance();

        tabBarItems.forEach((item, index) => {
            log(`tabBarTtems: ${index}`);
            
            item.on(Button.EventType.CLICK, () => {
                setTimeout(async ()=> {
                    AudioManager.getInstance().play(SoundFiles.ButtonClick);
                    this.trackButtonEvent(index);
                    if (index != 0) return;
                    this.hide();
                    let result: MahjongAlertEvent = await AlertPanel.getInstance().alert({
                        title: localized.get(LocalizedStrKeys.SYSTEM_MESSAGE),
                        message: localized.get(LocalizedStrKeys.CONFIRM_LEAVE),
                        confirmButtonText: localized.get(LocalizedStrKeys.CONTINUE),
                        confirmButtonVisible: true,
                        cancelButtonText: localized.get(LocalizedStrKeys.EXITBTN),
                        cancelButtonVisible: true
                    });
                    if (result.isCancel) {
                        this.event.emit(ToolBarEventName.EXIT);
                    }
                }, 0)
            })
        });
    }
    protected registerViewControllers(): void {
        const { viewControllers } = this;
        viewControllers.forEach((view, index) => {
            if(view) {
                view.on(SettingsViewControllerEvent.CLOSE, () => this.hide());

                if (view.name == "historyView") {
                    view.getComponent(SettingsWebView).website = BUILD? URLParameter.betHistoryUrl:"http://localhost:7456/";
                } else if (view.name == "ruleView") {
                    view.getComponent(SettingsWebView).website = BUILD? URLParameter.ruleUrl:"http://localhost:7456/";
                } else if (view.name == "helpView") {
                    view.getComponent(SettingsWebView).website = BUILD? URLParameter.helpUrl:"http://localhost:7456/";
                }
            }
        });
    }
    // 顯示
    public show(selectedIndex?: number): void {
        if (typeof selectedIndex == 'number') {
            this.selectedIndex = selectedIndex;
        }
        if (!this.node.active) {
            this.node.active = true;
        }
    }
    // 隱藏
    public hide(): void {
        this.node.active = false;
        this.selectedIndex = 0;
    }
    protected trackButtonEvent(index: TrackButtonEvents): void {
        switch(index) {
            
            case TrackButtonEvents.EXIT_BTN:
                this.selectedIndex = index;
                userAnalysis.addCounter("exitBtn");
                break;
            case TrackButtonEvents.EXCHANGE_BTN:
                this.selectedIndex = index;
                userAnalysis.addCounter("innerEx");
                this.event.emit(ToolBarEventName.DEPOSIT);
                break;
            case TrackButtonEvents.AUDIO_TOGGLE_BTN:
                const item = this.tabBarItems[TrackButtonEvents.AUDIO_TOGGLE_BTN];
                const togglePlugin = item.getComponent(TogglePlugin);
                AudioManager.getInstance().muted(togglePlugin.checked);
                UserPrefs.getInstance().gameSettings.isMuted = togglePlugin.checked;
                userAnalysis.addCounter("muteBtn");
                this.event.emit(ToolBarEventName.MUTE);
                break;
            case TrackButtonEvents.HISTORY_BTN:
                this.selectedIndex = index;
                userAnalysis.addCounter("betRecordBtn");
                this.event.emit(ToolBarEventName.HISTORY);
                break;
            case TrackButtonEvents.RULE_BTN:
                this.selectedIndex = index;
                userAnalysis.addCounter("ruleBtn");
                this.event.emit(ToolBarEventName.GAMEINFO);
                break;
            case TrackButtonEvents.HELP_BTN:
                this.selectedIndex = index;
                userAnalysis.addCounter("uiHelp");
                this.event.emit(ToolBarEventName.HELP);
                break;
        }
    }
    public mute(bool: boolean): void {
        const item = this.tabBarItems[TrackButtonEvents.AUDIO_TOGGLE_BTN];
        const toggle = item.getComponent(Toggle);
        const togglePlugin = item.getComponent(TogglePlugin);
        toggle.setIsCheckedWithoutNotify(bool);
        AudioManager.getInstance().muted(togglePlugin.checked);
        togglePlugin.onCheckedToggle(toggle, "");
    }

}