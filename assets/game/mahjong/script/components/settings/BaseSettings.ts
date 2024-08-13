import { Localization, LocalizedStrKeys } from "../../lib/Localization";

import { 
    Component, _decorator, Node, Label, WebView
} from "cc";
import {
    CCString, CCBoolean, CCObject, CCInteger, Enum
} from "cc";
import { ToolBarEventName } from "../../include";
const { ccclass, property, menu } = _decorator;

export enum InitialArguments {
    // 無設定
    NONE = 0,
    // 預設CODE值
    DEFAULT = 1
}

@ccclass()
@menu('Mahjong/BaseSettings')
export abstract class BaseSettings extends Component {
    @property( { type: Enum(InitialArguments), tooltip: '拿來設定初始值', displayOrder: 0 })
    protected get initialArgument(): InitialArguments { return this._initialArgument; }
    protected set initialArgument(value: InitialArguments) {
        if (value === InitialArguments.DEFAULT) {
            this.initialize();
        }
        this._initialArgument = value; 
    }
    @property( { type: Enum(InitialArguments), visible: false } )
    protected _initialArgument: InitialArguments = InitialArguments.NONE;

    @property( { type: Label } )
    protected title: Label = null;
    @property( { type: CCString, visible: function () { return !!this.title; } } )
    protected get titleText(): string { 
        return (this.title) ? this.title.string : ''; }
    protected set titleText(value: string) {
        if (this.title) this.title.string = value;
    }
    @property( { type: CCString, visible: function () { return !!this.title; } } )
    protected localizedTitleString: string = '';
    // delegate methods
    @property( { type: Node, tooltip: 'Delegate', displayOrder: 1 } )
    public event: Node = null;

    protected initialize(): void {
        const { node } = this;
        this.title = node?.getChildByName('title')?.getComponent(Label);
    }
    protected onLoad() {
        const { localizedTitleString } = this;
        if ( localizedTitleString && LocalizedStrKeys[localizedTitleString]) {
            this.titleText = Localization.getInstance().get(LocalizedStrKeys[localizedTitleString]);
        }
    }
}