import { _decorator, Button, CCString, Component, Event, EventHandler, js, Label, log, Node, Toggle } from 'cc';
import { Localization, LocalizedStrKeys } from '../lib/Localization';
import { AudioManager } from '../../../colorGame/script/components/AudioManager';
import { SoundFiles } from '../../../colorGame/script/components/SoundFiles';
import { CommandEventName } from '../include';
const { ccclass, property } = _decorator;

@ccclass('AutoSetPanel')
export class AutoSetPanel extends Component {

    protected _autoNumberNode: Node;
    protected _currentAutoNumber: number;

    protected arrToggle: Array<Toggle> = [];

    @property( { type: Label } )
    protected title: Label = null;
    @property( { type: CCString, visible: function () { return !!this.title; } } )
    protected get titleText(): string { 
        return (this.title) ? this.title.string : ''; }
    protected set titleText(value: string) {
        if (this.title) this.title.string = value;
    }

    set autoNumberNode(node: Node) {
        this._autoNumberNode = node;
    }

    get currentAutoNumber(): number {
        return this._currentAutoNumber;
    }
    onLoad(): void {
        if (!this.title) {
            this.title = this.node.getChildByPath('content/title')?.getComponent(Label);
        }
        this.title.string = Localization.getInstance().get(LocalizedStrKeys.AUTO_START);
    }
    start() {
        this.init();
    }

    onEnable() {
        this._currentAutoNumber = 0;

        let len: number = this.arrToggle.length;
        for (let i:number = 0; i < len; i++) {
            this.arrToggle[i].isChecked = false;
        }

        if (this._autoNumberNode) {
            const lableNode: Node = this._autoNumberNode.getChildByName("label");
            const infinityNode: Node = this._autoNumberNode.getChildByName("infinite");
            infinityNode.active = false;
            lableNode.active = false;
        }
    }

    protected init() {
        const content: Node = this.node.getChildByName("content");
        const autoToggle: Node = content.getChildByName("autoToggle");

        let len: number = autoToggle.children.length;
        for (let i:number = 0; i < len; i++) {
            let toggleNode: Node = autoToggle.children[i];
            let toggle: Toggle = toggleNode.getComponent(Toggle);
            let labelNode: Node = toggleNode.getChildByName("label");
            let autoNumber: string;
            if (labelNode) {
                autoNumber = labelNode.getComponent(Label).string;
            } else {
                autoNumber = "-1"; // which means infinity;
            }
            toggle.node.on(Toggle.EventType.CLICK, () => { setTimeout(()=>{this.clickTogglt(toggle, autoNumber)}, 0) });

            this.arrToggle.push(toggle);
        }

        const closeBtnNode: Node = content.getChildByName("closeBtn");
        closeBtnNode.on(Button.EventType.CLICK, () => { 
            this.node.emit(CommandEventName.CLOSE);
        });
    }

    protected clickTogglt(toggle: Toggle, autoNumber: string) {
        log("toggle.isChecked", toggle.isChecked);

        AudioManager.getInstance().play(SoundFiles.ButtonClick);
        if (toggle.isChecked) {
            this._currentAutoNumber = Number(autoNumber);
        } else {
            this._currentAutoNumber = 0;
        }

        if (this._autoNumberNode) {
            const lableNode: Node = this._autoNumberNode.getChildByName("label");
            const infinityNode: Node = this._autoNumberNode.getChildByName("infinite");
            if (this._currentAutoNumber >= 0) {
                infinityNode.active = false;
                lableNode.active = true;
                lableNode.getComponent(Label).string = this._currentAutoNumber.toString();
            } else {
                infinityNode.active = true;
                lableNode.active = false;
            }
        }
    }
}


