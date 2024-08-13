import { CCString, Component, Prefab, _decorator, instantiate, Node, Label, CCBoolean, 
    EventHandler, Button, Input, CCObject, CCInteger, Toggle, log, Enum } from "cc";
import { ToolBarEventName } from "../../include";
import { BaseSettings } from "./BaseSettings";
const { ccclass, property, menu } = _decorator;

const GROUP_TURBO = { name: 'Turbo', style: 'section' }
const GROUP_MUTE = { name: 'Mute', style: 'section' }
const GROUP_MUSIC = { name: 'Music', style: 'section' }

@ccclass()
@menu('Mahjong/SettingsGeneral')
export class SettingsGeneral extends BaseSettings {

    @property( { type: Label, tooltip: '一般設定' } )
    protected generalTitle: Label = null;
    @property( { type: CCString, visible: function () { return !!this.generalTitle; } } )
    protected get generalTitleText(): string { 
        return (this.generalTitle) ? this.generalTitle.string : ''; }
    protected set generalTitleText(value: string) {
        if (this.generalTitle) this.generalTitle.string = value;
    }

    @property( { type: Toggle, tooltip: '快速旋轉按鈕', displayName: 'Button', group: GROUP_TURBO } )
    protected turboOptionButton: Toggle = null;
    
    @property( { type: Label, tooltip: '快速旋轉文字:開啟', displayName: 'Title On', group: GROUP_TURBO } )
    protected turboOptionTitleOn: Label = null;
    
    @property( { type: Label, tooltip: '快速旋轉文字:關閉', displayName: 'Title Off', group: GROUP_TURBO } )
    protected turboOptionTitleOff: Label = null;

    @property( { type: CCString, visible: function () { return !!this.turboOptionButton; }, displayName: 'Text', group: GROUP_TURBO } )
    protected get turboOptionTitleText(): string { 
        return (this.turboOptionTitleOff) ? this.turboOptionTitleOff.string : ''; }
    protected set turboOptionTitleText(value: string) {
        if (this.turboOptionTitleOff) this.turboOptionTitleOff.string = value;
        if (this.turboOptionTitleOn) this.turboOptionTitleOn.string = value;
    }

    @property( { type: Label, tooltip: '音量設定' } )
    protected soundTitle: Label = null;
    @property( { type: CCString, visible: function () { return !!this.soundTitle; } } )
    protected get soundTitleText(): string { 
        return (this.soundTitle) ? this.soundTitle.string : ''; }
    protected set soundTitleText(value: string) {
        if (this.soundTitle) this.soundTitle.string = value;
    }

    @property( { type: Toggle, displayName: 'Button', group: GROUP_MUTE } )
    protected muteButton: Toggle = null;
    @property( { type: Label, displayName: 'Title On', group: GROUP_MUTE } )
    protected muteTitleOn: Label = null;
    @property( { type: Label, displayName: 'Title Off', group: GROUP_MUTE } )
    protected muteTitleOff: Label = null;
    @property( { type: CCString, visible: function () { return !!this.muteButton; }, displayName: 'Text', group: GROUP_MUTE } )
    protected get muteTitleText(): string { 
        return (this.muteTitleOff) ? this.muteTitleOff.string : ''; }
    protected set muteTitleText(value: string) {
        if (this.muteTitleOff) this.muteTitleOff.string = value;
        if (this.muteTitleOn) this.muteTitleOn.string = value;
    }

    @property( { type: Toggle, displayName: 'Button', group: GROUP_MUSIC } )
    protected musicButton: Toggle = null;
    @property( { type: Label, displayName: 'Title On', group: GROUP_MUSIC } )
    protected musicTitleOn: Label = null;
    @property( { type: Label, displayName: 'Title Off', group: GROUP_MUSIC } )
    protected musicTitleOff: Label = null;
    @property( { type: CCString, visible: function () { return !!this.musicButton; }, displayName: 'Text', group: GROUP_MUSIC } )
    protected get musicTitleText(): string { 
        return (this.musicTitleOff) ? this.musicTitleOff.string : ''; }
    protected set musicTitleText(value: string) {
        if (this.musicTitleOff) this.musicTitleOff.string = value;
    }


    protected initialize(): void {
        const { node, generalTitle, turboOptionButton, soundTitle, muteButton, musicButton } = this;
        this.event = node?.parent;

        if (!node) return;
        
        let element: Node;
        // 標題
        this.generalTitle = node.getChildByName('generalTitle')?.getComponent(Label);

        this.soundTitle = node.getChildByName('soundTitle').getComponent(Label);
        
        // 按鈕

        if ((element = node.getChildByName('speed'))) {
            if (element) {
                this.turboOptionButton = element.getComponent(Toggle);
                this.turboOptionTitleOff = element.getChildByName('labelOff')?.getComponent(Label);
                this.turboOptionTitleOn = element.getChildByPath('Checkmark/labelOn')?.getComponent(Label);
            }
        }

        if ((element = node.getChildByName('mute'))) {
            if (element) {
                this.muteButton = element.getComponent(Toggle);
                this.muteTitleOff = element.getChildByName('labelOff')?.getComponent(Label);
                this.muteTitleOn = element.getChildByPath('Checkmark/labelOn')?.getComponent(Label);
            }
        }
        if ((element = node.getChildByName('music'))) {
            if (element) {
                this.musicButton = element.getComponent(Toggle);
                this.musicTitleOff = element.getChildByName('labelOff')?.getComponent(Label);
                this.musicTitleOn = element.getChildByPath('Checkmark/labelOn')?.getComponent(Label);
            }
        }
        super.initialize();
    }

    protected onLoad(): void {
        this.registerEventListener();
        super.onLoad();
    }
    protected start(): void {
    }
    private registerEventListener() {
        const { turboOptionButton, muteButton, musicButton, event } = this;
        const { GAMEINFO, MUSIC, MUTE } = ToolBarEventName;
        if (turboOptionButton) {
            turboOptionButton.target.on(Toggle.EventType.CLICK, () => 
            event?.emit(GAMEINFO, { turboOption: turboOptionButton.isChecked }) );
        }
        if (musicButton) {
            musicButton.target.on(Toggle.EventType.CLICK, () => 
            event?.emit(MUSIC, musicButton.isChecked ) );
        }
        if (muteButton) {
            muteButton.target.on(Toggle.EventType.CLICK, () => 
            event?.emit(MUTE, muteButton.isChecked ) );
        }
    }

}