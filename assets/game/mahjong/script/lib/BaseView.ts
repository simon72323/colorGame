import {
    CommandEventName,
    ExchangeInfo,
    ExchangePanelEventName,
    ToolBarEventName,
    log
} from "../include"
import { Component } from "cc"
import { Application } from "../Applicaiton"
import { AlertPanel, DialogEventTypes, MahjongAlertEvent } from "../components/AlertPanel"
import { CocosExchangePanel } from "../components/ExchangePanel"
import { GameManager } from "../components/GameManager"
import { PlayerConfig } from "../components/PlayerConfig"
import { SettingsPanel } from "../components/SettingsPanel"
import { BaseModel } from "./BaseModel"
import { BasePresenter } from "./BasePresenter"
import { Localization, LocalizedStrKeys } from "./Localization"
import { ClientRecvAction, RecvMessage } from "./RecvMessage"
import { BaseGameEventName } from "./BaseGame"
import { UserPrefs } from "./UserPrefs"

export class BaseView extends Component {
    /** 元件的事件處理 */
    public presenter: BasePresenter;
    /** 警告元件 */
    public alertPanel?: AlertPanel;
    /** 設定參數選項 */
    public exchangeOption: boolean = true;
    /** 換分面板元件 */
    public exchangePanel?: CocosExchangePanel;
    /** 設定面板元件 */
    public settingsPanel?: SettingsPanel;
    /** 遊戲中心物件 */
    public gameManager: GameManager;
    /** 本機測試用參數 */
    public playerConfig: PlayerConfig;

    constructor() {
        super();
    }
    protected onLoad(): void {
        this.configBaseGameEvent();
        this.configCommandEvent();
        this.configToolbarEvent();
        if (this.exchangeOption) {
            this.handleExchanePanelEvent();
        }
    }
    start(): void {
    }
    // Splash Screen or Launch Screen
    public updateProgress(progress: number): void {
        Application.getInstance().SetProcessNum(progress)
        if (progress == 95) {
            Application.getInstance().SetProcessNum(100)
            setTimeout(() => {
                Application.getInstance().CloseLoader()
            }, 500);
        }
    }

    protected configBaseGameEvent(): void {
        this.gameManager.event.on(BaseGameEventName.END, this.presenter.endGame.bind(this.presenter));
    }

    protected configCommandEvent(): void {
        
        const command = this.gameManager?.command;

        if (command) {

            const { presenter } = this;
            command.event.on(CommandEventName.SPIN, () => this.onSpinHandle());
            command.event.on(CommandEventName.MAX_BET, presenter.maxBet.bind(presenter));
            command.event.on(CommandEventName.LINE_BET, presenter.addLine.bind(presenter));
            command.event.on(CommandEventName.LINE_BET_MINUS, presenter.minusLine.bind(presenter));
            command.event.on(CommandEventName.LINE, presenter.addLine.bind(presenter));
            command.event.on(CommandEventName.LINE_MINUS, presenter.minusLine.bind(presenter));
            command.event.on(CommandEventName.DOUBLE, presenter.double.bind(presenter));
            command.event.on(CommandEventName.UPDATE_LINEBET, presenter.setLineBet.bind(presenter));
            command.event.on(CommandEventName.UPDATE_LINE, presenter.setLine.bind(presenter));
            command.event.on(CommandEventName.CHANGE_RATIO, presenter.fastExchange.bind(presenter));            
            //開分事件另外處理
            command.event.on(CommandEventName.EXCHANGE, presenter.openCreditExchangePanel.bind(presenter));
        }
    }
    /**
     * @description 改寫configToolbarEvent
     */
    protected configToolbarEvent(): void {
        const toolbar = this.settingsPanel;
        if (toolbar) {
            const { presenter } = this;
            //簡單邏輯 , 就不再透過 switch case 來處理了
            toolbar.event.on(ToolBarEventName.MUSIC, presenter.backgroundMusic.bind(presenter));
            toolbar.event.on(ToolBarEventName.MUTE, presenter.mute.bind(presenter));
            toolbar.event.on(ToolBarEventName.EXIT, this.exit.bind(this));
            toolbar.event.on(ToolBarEventName.HELP, presenter.help.bind(presenter));
            toolbar.event.on(ToolBarEventName.HISTORY, presenter.history.bind(presenter));
            toolbar.event.on(ToolBarEventName.DEPOSIT, presenter.deposit.bind(presenter));
            toolbar.event.on(ToolBarEventName.GAMEINFO, presenter.gameInfo.bind(presenter));
            //開分事件另外處理
            toolbar.event.on(ToolBarEventName.ONEXCHANGE, presenter.openCreditExchangePanel.bind(presenter));
        }
    }
    protected async onSpinHandle():Promise<void> {
        log(`this.playerConfig.standalone`, this.playerConfig?.standalone);
        const { presenter } = this;
        this.gameManager.command.lock();
        if (this.playerConfig && this.playerConfig.standalone) {
            this.gameManager.onSpin();
            // 單機版用*監聽同一個事件所以需要延後Tick
            setTimeout(() => this.gameManager.begin(), 0);
        } else if (presenter.connected) {
            log(`onSpinHandle:
                Bet: ${ this.presenter.bet }
                Credit: ${ this.presenter.credit }`);
            
            if ((this.presenter.bet <= this.presenter.credit && this.presenter.credit > 0) || this.gameManager.isFree || parent['Site'] == 'XC') {
                this.gameManager.onSpin();
                let result = await presenter.beginGame(this.presenter.bet).catch(e => e);
                if (result.event) this.gameManager.begin(result.data);
            } else {
                if (this.exchangePanel && this.presenter.getUserAutoExchange().IsAuto) {
                    await this.presenter.getMachineDetail();
                    this.exchangePanel.dataUpdate(this.presenter.getExchangeInfo());
                    let status = await this.startAutoExchange();
                    if (status) {
                        this.gameManager.onSpin();
                        let result = await presenter.beginGame(this.presenter.bet).catch(e => e);
                        if (result.event) this.gameManager.begin(result.data);
                    } else {
                        this.gameManager.onBettingStatus();
                    }
                } else {
                    this.gameManager.onBettingStatus();
                    const localized = Localization.getInstance();
                    let result: MahjongAlertEvent = await AlertPanel.getInstance().alert({
                        message: localized.get(LocalizedStrKeys.NOT_ENOUGH_CREDIT),
                        confirmButtonText: localized.get(LocalizedStrKeys.GAME_EXCHANGE),
                        confirmButtonVisible: true,
                        closeButtonVisible: true
                    });
                    if (result.isAccept) {
                        await this.presenter.openCreditExchangePanel();
                    }
                }
            }
        }
    }
    protected startAutoExchange(): Promise<boolean> {
        return new Promise(async(resolve: (status: boolean)=>void) => {
            if (this.presenter.balance >= this.presenter.bet) {
                let credit: number = this.presenter.getUserAutoExchange().Credit;
                if (credit < this.presenter.bet) {
                    credit = this.presenter.bet;
                }
                if (this.presenter.balance < credit || credit == -1) {
                    credit = this.exchangePanel.nowMaxChange;
                }
                await this.presenter.creditExchange(this.presenter.getExchangeInfo().betBase, credit);
                this.gameManager.updateInfo(this.presenter.getExchangeInfo());
                resolve(true);
            } else {
                const localized = Localization.getInstance();
                let result: MahjongAlertEvent = await AlertPanel.getInstance().alert({
                    message: localized.get(LocalizedStrKeys.NOT_ENOUGH_CREDIT),
                    confirmButtonText: localized.get(LocalizedStrKeys.GAME_EXCHANGE),
                    confirmButtonVisible: true,
                    closeButtonVisible: true
                });
                if (result.isAccept) {
                    await this.presenter.openCreditExchangePanel();
                }
                resolve(false);
            }
        });
    }
    // Notification: 更新彩池資訊
    public updateJackpot(jpValue: number[]): boolean {
        if (!(this.gameManager && this.gameManager.updateJackpot instanceof Function)) return false;
        if (jpValue) {
            this.gameManager.updateJackpot(jpValue);
            return true;
        } else return false;
    }
    // Notification: 更新跑馬燈資訊
    public updateMarquee(marquee: string): boolean {
        if (marquee) {
            if (this.gameManager && this.gameManager.updateMarquee instanceof Function) {
                this.gameManager.updateMarquee(marquee);
                return true;
            }
        } else {
            return false;
        }
    }
    /** 換分面板: 取機台資訊 */
    public updateMachineInfo(info: ExchangeInfo): void {
        if (this.exchangePanel) {
            this.exchangePanel.dataUpdate(info);
        }
    }
    /** 換分面板: 換分更新 */
    public updateCreditExchangeInfo(info: ExchangeInfo): void {
        if (this.exchangePanel) {
            this.exchangePanel.dataUpdate(info);
        }
    }
    /** 換分面板: 洗分更新 */
    public updateBalanceExhchangeInfo(info: ExchangeInfo):void {
        if (this.exchangePanel) {
            this.exchangePanel.dataUpdate(info);
        }
    }
    /** 換分面板: 顯示 */
    public showExchangePanel(): void {
        if (this.settingsPanel) {
            this.settingsPanel.show(2);
        } else if (this.exchangePanel) {
            this.exchangePanel.show();
        }

    }
    /** 開啟換分頁面：更新 */
    public updateExchangePanel(info: ExchangeInfo): void {
        if (this.exchangePanel) {
            this.exchangePanel.dataUpdate(info);
        }
    }
    /**
     * GameManager: 初始化
     * @description 取代initCostume
     */
    public initGameManager(...args: any): void {
        // TODO: Game Initialized
    }
    /**
     * GameManager: 取得OnLoadInfo後設定
     * @description 取代setupCostume
     */
    public async setupGameManager(): Promise<void> {
        const { presenter } = this;
        // OnLoadInfo completed successfully
        // 取得使用者設定檔案
        const gameSetting = await UserPrefs.getInstance().load(await presenter.uuid());
        if (this.gameManager) {
            this.gameManager.betCreditList = this.presenter.creditList;
            this.gameManager.defaultBetCredit = (gameSetting.points != 0) ? gameSetting.points : this.presenter.defaultBetCredit;
            this.gameManager.setupGame();
        } else {
            
        }

    }
    /**
     * alertPanel Initialized
     */
    public initAlert(): void {
        if (!this.alertPanel) {
            this.alertPanel = this.node.getChildByName('alertPanel')?.getComponent(AlertPanel);
        }
    }
    // 警告Alert訊息
    public async alert(dict_key: string, id?: string): Promise<MahjongAlertEvent> {
        let localized = Localization.getInstance();
        if (this.alertPanel) {
            return this.alertPanel.alert({
                title: localized.get(LocalizedStrKeys.SYSTEM_MESSAGE),
                message: `${localized.get(dict_key)} ${id}`,
                duration: 5.0
            });
        } else {
            return Promise.resolve( { state: DialogEventTypes.EMPTY, isAccept: false, isCancel: false } );
        }
    }
    // 建立Presenter
    public createPresenter(): BasePresenter {
        let presenter = new BasePresenter(new BaseModel(), this);
        // 註冊遊戲事件
        presenter.registerRecvEvents();
        // 百分比事件
        presenter.registerHandleProgressEvents();
        return presenter;
    }
    // 開始連線
    public async startPresenter(address?: string): Promise<boolean> {
        const { presenter } = this;
        let event: any = await presenter.connect(address).catch(() => { return false; });
        log(`Connect:`, event );
        
        if (event === false) return false;

        return true;
    }
    // 離開遊戲服務
    public async exit(): Promise<void> {
        const { presenter } = this;
        await presenter.exit();
    }
    // 統一集中管理Alert事件
    public async errorHandlingForServerActions(action: string, data?: RecvMessage.ErrorMessageData): Promise<MahjongAlertEvent> {
        const { alertPanel } = this;
        const localization = Localization.getInstance();
        log(`handleSLotConnectorFailed: ${action}`);
        let errorDictString: string = localization.get(data?.error);
        let result: MahjongAlertEvent = { state: 0, isAccept: false, isCancel: false };
        switch(action) {
            case ClientRecvAction.Login:
                result = await alertPanel.alert({
                    title: localization.get(LocalizedStrKeys.SYSTEM_MESSAGE),
                    message: errorDictString
                });
                break;
            case ClientRecvAction.WSClose:
                if (this.playerConfig && !this.playerConfig.alertConnectRetries) return result;
                this.settingsPanel.hide();
                if (Application.getInstance().invalidToReconnect) return result;
                result = await alertPanel.alert({
                    title: localization.get(LocalizedStrKeys.SYSTEM_MESSAGE),
                    message: localization.get(LocalizedStrKeys.DISCONNECT),
                    confirmButtonVisible: true,
                    confirmButtonText: localization.get(LocalizedStrKeys.RECONNECT),
                    isTouchBackdrop: false
                });
                if (result.isAccept || result.state === DialogEventTypes.BACKDROP) {
                    Application.getInstance().Reconnect();
                }
                break;
            default:
                result = await alertPanel.alert({
                    title: localization.get(LocalizedStrKeys.SYSTEM_MESSAGE),
                    message: errorDictString
                });
        }
        return result;
    }
    /**
     * 處理換分面板事件 與 controller 之間的溝通
     */
    protected handleExchanePanelEvent() {
        const { exchangePanel } = this;
        const { presenter } = this;
        if (exchangePanel) {
            exchangePanel.event.on(ExchangePanelEventName.CREDIT_EXCHANGE, async (data) => {
                const { isAutoExchange } = exchangePanel;
                const { Credit, Record } = presenter.getUserAutoExchange();
                let userAutoJson = { 
                    autoEx: isAutoExchange, 
                    autoValue: -1, 
                    autoRate: data.betBase, 
                    lastInput: Record 
                };
                if (isAutoExchange) {
                    if (data.amount > 0) {
                        userAutoJson.autoValue = data.amount;
                    } else {
                        userAutoJson.autoValue = Credit;
                    }
                }
                presenter.saveUserAutoExchange(userAutoJson);

                if (data.amount > 0) {
                    await presenter.creditExchange(data.betBase, data.amount);
                }
                this.gameManager.updateInfo(presenter.getExchangeInfo());
            });
            exchangePanel.event.on(ExchangePanelEventName.BALANCE_EXCHANGE, async () => {
                await presenter.balanceExchange();
            });
            exchangePanel.event.on(ExchangePanelEventName.CHANGE_RATIO, async (data) => {
                await presenter.fastExchange(data.ratio);
            });
            exchangePanel.event.on(ExchangePanelEventName.LEAVE_GAME, async () => this.exit());
        }
    }
    // 更新 bet
    updateBet(): void {
        this.gameManager.bet = this.presenter.bet;
        this.gameManager.updateBet();
    };
    // model 做資料結算後確認此局結束
    end(): void {
        this.gameManager.end(this.presenter.credit);
    }
}
