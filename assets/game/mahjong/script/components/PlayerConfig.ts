import { BUILD } from "cc/env";
import { Localization } from "../lib/Localization";
import { Component, _decorator, Node, CCBoolean, CCString, CCObject, Enum, settings, ccenum, Game } from "cc";
import { ProjectCategory, ProjectProperty } from "./ProjectSettings";
import npmPackage from "../../../../../package.json";
import { log } from "../include";
const { ccclass, property, menu,  } = _decorator;

enum GameSiteCategories { Default, XC };
ccenum(GameSiteCategories)

@ccclass('PlayerConfig')
@menu('Mahjong/PlayerConfig')
export class PlayerConfig extends Component {

    @property({ type: CCBoolean, tooltip: '使用自訂資料' })
    public loginOption: boolean = false;

    @property({ type: CCString, visible: function () { return this.loginOption; } })
    public get hostname(): string { return this._hostname; };
    public set hostname(value: string) {
        this._hostname = value;
        this.wsUrl = `ws://${value}/fxcasino/fxLB?gameType=${this.gameType}`;
    };
    public _hostname: string = '127.0.0.1';

    @property({ type: CCString, tooltip: '自訂連線位址', displayName: 'wsUrl', visible: true, readonly: true })
    public wsUrl: string = `ws://127.0.0.1:3000/fxcasino/fxLB?gameType=5276`;

    @property({ type: CCString, tooltip: '測試:登入Session', displayName: '🧪 Session', visible: function () { return this.loginOption; } })
    public session: string = 'bb0433b883db775484203db0e6018397a55cfb3611';

    @property({ type: CCString, tooltip: '測試:遊戲編號', displayName: '🧪 GameType', visible: function () { return this.loginOption; } })
    public gameType: string = '5276';

    @property({ type: CCBoolean, tooltip: '顯示重新連線'})
    public alertConnectRetries: boolean = false;

    @property({ type: CCBoolean, tooltip: '關閉多國語言'})
    public nonLocalizable: boolean = false;
    
    @property({ type: CCBoolean, tooltip: '使用自訂資料' })
    public standalone: boolean = true;

    @property( { type: GameSiteCategories, tooltip: '個平台測試'  } )
    public site: GameSiteCategories = GameSiteCategories.Default;

    protected async onLoad(): Promise<void> {
        if (BUILD) this.loginOption = false;
        let localization = Localization.getInstance();
        if (this.loginOption) {
            // await localization.reload();
            // localization.nonLocalizable = this.nonLocalizable;
            if (this.site === GameSiteCategories.XC) {
                parent['Site'] = GameSiteCategories[GameSiteCategories.XC];
            }
            log(`Loading override settings parent.Site: ${parent['Site']}`);

        }
    }
    static localCustomSettingsJson(): boolean {
        if (BUILD) return false;
        log(`npmPackage.version`, npmPackage.version);
        // Build Settings.json 自訂參數:版號
        settings.overrideSettings(ProjectCategory.project, ProjectProperty.version, npmPackage.version);

        return true;
    }

}