import { CommandEventName } from '../include';
import { _decorator, Button, CCString, Component, Event, EventHandler, instantiate, js, Label, Node, Prefab, Toggle } from 'cc';
import { Localization, LocalizedStrKeys } from '../lib/Localization';
import { AudioManager } from '../../../colorGame/script/components/AudioManager';
import { SoundFiles } from '../../../colorGame/script/components/SoundFiles';
import { UtilsKit } from '../lib/UtilsKit';
const { ccclass, property } = _decorator;

@ccclass('BetSetPanel')
export class BetSetPanel extends Component {
   
    @property({ type: Prefab, tooltip: "下注面板內 toogle prefab" })
    protected tooglePrefab: Prefab;

    protected _currentBetNode: Node;

    protected _currentBet: number;

    protected _arrBet: Array<number>;

    protected toggleIndex:number;
    protected arrToggle: Array<Toggle> = [];

    @property( { type: Label } )
    protected title: Label = null;
    @property( { type: CCString, visible: function () { return !!this.title; } } )
    protected get titleText(): string { 
        return (this.title) ? this.title.string : ''; }
    protected set titleText(value: string) {
        if (this.title) this.title.string = value;
    }

    set arrBet(arr: Array<number>) {
        this._arrBet = arr;

        let len: number = this._arrBet.length;
        for (let i:number = 0; i < len; i++) {
            this.produceToggle(this._arrBet[i]);
        }

        if (len > 0) {
            this.toggleIndex = 0;
            this.setBetBytoggleIndex(this.toggleIndex);
        }
    }

    get arrBet(): Array<number> {
        return this._arrBet;
    }

    set currentBet(n:number) {
        let len: number = this._arrBet.length;
        for (let i:number = 0; i < len; i++) {
            if (n == this._arrBet[i]) {
                this.toggleIndex = i;
                this.setBetBytoggleIndex(this.toggleIndex);
                break;
            }
        }
    }

    get currentBet(): number {
        return this._currentBet;
    }

    protected produceToggle(bet: number) {
        const content: Node = this.node.getChildByName("content");
        const toggleContainer: Node = content.getChildByName("toggle");

        let toggleNode: Node = instantiate(this.tooglePrefab);
        let toggle: Toggle = toggleNode.getComponent(Toggle);
        let labelNode: Node = toggleNode.getChildByName("label");
        let abbreviated: string = UtilsKit.FormatNumber(bet);
        labelNode.getComponent(Label).string = abbreviated;
        toggle.node.on(Toggle.EventType.CLICK, () => { this.clickToggle(toggle, bet.toString()) });
        this.arrToggle.push(toggle);
        toggleContainer.addChild(toggleNode);

        labelNode = toggleNode.getChildByName("checkmark").getChildByName("label");
        labelNode.getComponent(Label).string = abbreviated;
    }
    onLoad(): void {
        if (!this.title) {
            this.title = this.node.getChildByPath('content/title')?.getComponent(Label);
        }
        this.title.string = Localization.getInstance().get(LocalizedStrKeys.BET_OPTION);

        const content: Node = this.node.getChildByName("content");
        const closeBtnNode: Node = content.getChildByName("closeBtn");
        closeBtnNode.on(Button.EventType.CLICK, () => { 
            this.node.emit(CommandEventName.CLOSE);
        });

        
    }

    protected clickToggle(toggle: Toggle, bet: string) {
        AudioManager.getInstance().play(SoundFiles.ButtonClick);
        if (this._currentBetNode) {
            this._currentBetNode.getComponent(Toggle).isChecked = false;
        }
        this._currentBetNode = toggle.node;
        this.currentBet = Number(bet);
        this.node.emit(CommandEventName.UPDATE_LINEBET, this._currentBet);
    }

    public setBetBytoggleIndex(index: number) {
        let cacheActive: boolean = this.node.active;
        this.node.active = true;

        if (this._currentBetNode) {
            this._currentBetNode.getComponent(Toggle).isChecked = false;
        }
        this._currentBetNode = this.arrToggle[index].node;
        this._currentBetNode.getComponent(Toggle).isChecked = true;
        this._currentBet = this._arrBet[index];

        this.node.active = cacheActive;

        this.node.emit(CommandEventName.UPDATE_LINEBET, this._currentBet);
    }

    public next() {
        this.toggleIndex++;
        if (this.toggleIndex > this._arrBet.length - 1) {
            this.toggleIndex = 0;
        }
        this.setBetBytoggleIndex(this.toggleIndex);
    }

    public previous() {
        this.toggleIndex--;
        if (this.toggleIndex < 0) {
            this.toggleIndex = this._arrBet.length - 1;
        }
        this.setBetBytoggleIndex(this.toggleIndex);
    }
}

