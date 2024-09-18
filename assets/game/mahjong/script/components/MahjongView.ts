
import { Component, KeyCode, _decorator, settings, Settings, native, Label } from "cc"
import { BUILD } from "cc/env"
import { Application } from "../Applicaiton"
import { Dict, URLParameter, log, userAnalysis } from "../include"
import { BasePresenter } from "../lib/BasePresenter"
import { BaseView } from "../lib/BaseView"
import { ClientRecvAction } from "../lib/RecvMessage"
import { UtilsKit } from "../lib/UtilsKit"
import { MahjongRoller } from "../wheel/MahjongRoller"
import { Roller } from "../wheel/Roller"
import { AlertPanel } from "./AlertPanel"
import { CocosExchangePanel } from "./ExchangePanel"
import { GameManager } from "./GameManager"
import { PlayerConfig } from "./PlayerConfig"
import { SettingsPanel } from "./SettingsPanel"
import { AudioManager } from "../../../colorGame/script/components/AudioManager"
import { SoundFiles } from "../../../colorGame/script/components/SoundFiles"
import { Localization } from "../lib/Localization"
import { InputKeyboard, InputOccuraction } from "./InputKeyboard"
import { ProjectCategory, ProjectProperty } from "./ProjectSettings"
import { IPL } from "../framework/share-tools/src/environment/ipl/IPL"
import { UserPrefs } from "../lib/UserPrefs"
import { MahjongModel } from "../lib/MahjongModel"
import { MahjongPresenter } from "../lib/MahjongPresenter"
import { GameCommandMode } from "./GameCommand"
const { ccclass, property, menu } = _decorator;


@ccclass('MahjongView')
@menu('Mahjong/MahjongView')
export class MahjongView extends BaseView {

    @property({ type: AlertPanel, tooltip: '警告面板' })
    public alertPanel: AlertPanel;

    @property( { tooltip: '使用換分面板' } )
    public exchangeOption: boolean = true;

    @property({ type: CocosExchangePanel, tooltip: '換分面板', visible: function() {
        return this.exchangeOption;
    }})
    public exchangePanel: CocosExchangePanel;
    @property({ type: SettingsPanel, tooltip: '設定面板' })
    public settingsPanel: SettingsPanel;

    @property({ type: Component, tooltip: '遊戲邏輯管理物件' })
    public gameManager: GameManager;

    @property({ type: Roller, tooltip: '遊戲滾輪' })
    public roller: MahjongRoller;

    @property({ type: PlayerConfig })
    public playerConfig: PlayerConfig;

    @property({ type: Label, tooltip: '' })
    public versionLabel: Label;

    constructor() {
        super();
        // log(`Application:`, Application.getInstance());
        this.presenter = this.createPresenter();
    }
    protected async onLoad(): Promise<void> {
        // Cache data
        await UserPrefs.getInstance().init();
        // 鍵盤小元件
        InputKeyboard.getInstance().enabled = true;
        const applciation: Application = Application.getInstance();
        log(`InitGameManager: ${this.gameManager} BUILD: ${BUILD} isLoaded: ${Dict.isLoaded}(${location.origin}|${URLParameter.iplLang})`);
        // 初始化GameManager
        this.initGameManager('gameManager', GameManager);
        if (BUILD && this.playerConfig) {
            this.playerConfig.enabled = false;
            this.playerConfig = null;
        } else {
            PlayerConfig.localCustomSettingsJson();
        }
        let localized = Localization.getInstance();
        await localized.reload(location.origin, URLParameter.iplLang);

        const version: string = settings.querySettings(ProjectCategory.project, ProjectProperty.version);
        const environment: string = settings.querySettings(ProjectCategory.project, ProjectProperty.environment);
        log(`Version: ${version} Environment: ${environment}`);
        this.productVersion(version, environment);
        this.setupInputKeyboard();
        super.onLoad();
    }
    public start() {
        super.start();
        const { local, gameType } = URLParameter;
        const { playerConfig } = this;

        let audioManager = AudioManager.getInstance();
        if (audioManager.hasSource(SoundFiles.BasicMusic)) {
            audioManager.playMusic(SoundFiles.BasicMusic)
        } else {
            audioManager.node.on('completed', () => audioManager.playMusic(SoundFiles.BasicMusic));
        }

        if (playerConfig && playerConfig.loginOption && local) {
            if (playerConfig.session) this.presenter.sid = playerConfig.session;
            if (playerConfig.gameType) this.presenter.gameType = playerConfig.gameType;
            this.startPresenter(playerConfig.wsUrl);
        } else {
            this.startPresenter();
        } 
    }
    // 建立MVP - Presenter
    public createPresenter(): BasePresenter {
        let presenter = new MahjongPresenter(new MahjongModel(), this);
        // 註冊遊戲事件
        presenter.registerRecvEvents();
        // 百分比事件
        presenter.registerHandleProgressEvents();
        return presenter;
    }
    // 進入遊戲服務
    public async startPresenter(address?: string): Promise<boolean> {
        const { presenter } = this;
        
        if (await super.startPresenter(address) === false) return false;
        // [1] 登入login
        let loginResult: any = await presenter.login().catch(async e => {
            await this.errorHandlingForServerActions(ClientRecvAction.Login, e);
            return e.error;
        });
        log(`login:`, loginResult);
        if (loginResult.error) return false;
        
        userAnalysis.enable = true;
        
        this.gameManager.updateBottomInfo(`${presenter.gameType}-BB`, presenter.userId);
        // [2] 這邊是等待 接收到 takeMachine
        let gameCode: String = await presenter.takeMachine().catch(async (e) => {
            const { action } = e;
            await this.errorHandlingForServerActions(action, e);
            presenter.exit();
            return '';
        })
        log(`> GameCode: ${gameCode}`);
        if (!gameCode) return false;
        // [3] 讀取資訊 onLoadInfo
        let loadInfo = await presenter.onLoadInfo().catch(e => false);
        if (!loadInfo) return false;
        
        if (this.exchangePanel) {
            this.exchangePanel.dataUpdate(presenter.getExchangeInfo());
            this.exchangePanel.updateUserAutoExchange(presenter.getUserAutoExchange());
            this.exchangePanel.updateQuickExchangeBar(presenter.quickExBarValues);
            log(`> GetExchangeInfo:`, presenter.getExchangeInfo());
        }
        log(`> OnLoadInfo:`, loadInfo);
        // [4] 加入遊戲
        log(`> JoinGame:`, await presenter.joinGame().catch((e) => { return e }));
        await UtilsKit.Defer(1000); // 為了讓場景上所有 node 完成初始化 (onLoad and start)

        // [5] 給遊戲基本資料
        this.gameManager.payRate = (<MahjongPresenter>this.presenter).payRate;
        this.gameManager.taiNum = (<MahjongPresenter>this.presenter).taiNum;

        // [6] 判斷是否 自動開分/開啟換分面板
        this.gameManager.command.mode(GameCommandMode.BETTING);
        if (this.playerConfig && this.playerConfig.standalone) { // 單機版
            this.gameManager.updateInfo();
        } else if (presenter.credit > 0 || !this.exchangePanel) {
            this.gameManager.updateInfo(this.presenter.getExchangeInfo());
        } else if (presenter.getUserAutoExchange().IsAuto && presenter.getUserAutoExchange().Credit != 0 && presenter.balance >= presenter.bet) {
            await this.startAutoExchange();
        } else {    
            presenter.openCreditExchangePanel();
        }
        // [test] 換分洗分
        // log(`creditExchange:`, await presenter.creditExchange('1:1', 100));
        // log(`balanceExchange:`, await presenter.balanceExchange());

        return true;
    }
    // 離開遊戲服務
    public async exit(): Promise<void> {
        log(`MahjongView:exit()`);
        const { presenter } = this;

        Application.getInstance().invalidToReconnect = true;

        if (presenter.isJoinGame) await presenter.leaveGame().catch((e) => { return e; });
        
        presenter.exit();

        presenter.disconnect();
        
        IPL.CloseWinodw();
    }
    // 初始化 - 如果沒有GameManager
    public initGameManager(childeName: string, CConstructor: any): void {
        this.gameManager = this.node.getChildByName(childeName).getComponent(CConstructor);
    }
    protected setupInputKeyboard(): void {
        const inputKeyboard:InputKeyboard = InputKeyboard.getInstance();
        //事件
        inputKeyboard.pushEvent({
            name: InputOccuraction.SPACE_SPINE,
            traget: this.gameManager,
            action: (code:KeyCode) => { this.gameManager.onHotKeys(code) },
            keyCode: KeyCode.SPACE,
            focus: true
        });
    }
    public productVersion(version: string = "", environment:string = ''): void {
        const { versionLabel, settingsPanel } = this;
        if (!version) version = "";
        if (versionLabel && environment !== 'prod') {
            versionLabel.string = `${version}`;
        } else {
            versionLabel.string = '';
        }
        
        if (settingsPanel && settingsPanel.versionLabel) {
            settingsPanel.versionLabel.string = `H3 ${version}`;
        }
    }
    public async setupGameManager(): Promise<void> {
        const { presenter } = this;
        super.setupGameManager();
        // 取得使用者設定檔案
        const gameSetting = await UserPrefs.getInstance().load(await presenter.uuid());
        // 設定靜音
        this.settingsPanel.mute(gameSetting.isMuted);
        // 設定加速按鈕
        this.gameManager.command.setSpeedUp(gameSetting.doSpeedUp);
        // 
        this.gameManager.command.setBetAmount(gameSetting.points);

        // XC(星城)
        if (parent['Site'] == "XC") {
            this.exchangePanel = null;
            this.settingsPanel.removeExchangeTab();
        }
    }
    protected async onSpinHandle():Promise<void> {
        await this.gameManager.pickTheSeat((<MahjongPresenter>this.presenter).diceNum, (<MahjongPresenter>this.presenter).myFlowerID);
        super.onSpinHandle();
    }

}