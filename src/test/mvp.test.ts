import 'jest';

import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals';
import { envSetup } from './envSetup';
import { BaseModel, BaseView, BasePresenter } from '../../assets/game/mahjong/script';
import { ClientRecvAction } from '../../assets/game/mahjong/script/lib/RecvMessage';
import { ClientSendAction } from '../../assets/game/mahjong/script/lib/SendMessage';
import { AIOBridge, URLParameter, userAnalysis } from '../../assets/game/mahjong/script/include';
import { CommandEventName, ExchangePanelEventName, ToolBarEventName } from '../../assets/game/mahjong/script/include';
import { GameManager } from '../../assets/game/mahjong/script/components/GameManager';
import { Info } from '../../assets/game/mahjong/script/components/Info';
import { GameCommand } from '../../assets/game/mahjong/script/components/GameCommand';
import { Label, Scene, Node } from 'cc';
import { Application } from '../../assets/game/mahjong/script/Applicaiton';
import { UtilsKit } from '../../assets/game/mahjong/script/lib/UtilsKit';
import { AlertPanel } from '../../assets/game/mahjong/script/components/AlertPanel';


Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

const gameType: string = 'machjong';
let mockData: any = {
    ready: {"action":"ready","data":{"ts":1706848620892,"version":"1.1.33"}},
    updateMarquee: {"action":"updateMarquee", data: "中獎訊息"},
    login: {
        "action": "login",
        "event": true,
        "gameType": gameType,
        "data": {
          "Sid": "a453d40de86c70685bdaa9c3e763f7e9",
          "UserID": 1,
          "HallID": "1",
          "GameID": null,
          "COID": null,
          "Test": 0,
          "ExchangeRate": 0.137659,
          "IP": "111.235.135.54"
        }
    },
    takeMachine: {
        "action":"takeMachine",
        "event":true,
        "gameType": gameType,
        "data":{
            "GameCode":9,
            "event":true
        }
    },
    onLoadInfo: {
        "action":"onLoadInfo",
        "event":true,
        "gameType":"5271",
        "data":{
            "event":true,
            "Balance":90141507.57,
            "Base":"1:1",
            "DefaultBase":"1:1",
            "BetCreditList":[
                2,
                6,
                8,
                10,
                20,
                40,
                100,
                200,
                300,
                400,
                500,
                600,
                1000,
                1400,
                1600
            ],
            "DefaultBetCredit":6,
            "WagersID":0,
            "LoginName":"fxnick",
            "AutoExchange":true,
            "Credit":0,
            "BetBase":"",
            "SingleBet":100
        }
    },
    onGetMachineDetail: {
        "action":"getMachineDetail",
        "event":true,
        "gameType": gameType,
        "data":{
            "event":true,
            "ExchangeRate":1,
            "LoginName":"fxroy",
            "Currency":"RMB",
            "HallID":6,
            "UserID":455648479,
            "Balance":256510.82,
            "Test":true,
            "Base":"1:1",
            "DefaultBase":"1:1",
            "Credit":0,
            "BetBase":"",
            "WagersID":0
        }
    },
    onCreditExchange: {
        "action":"creditExchange",
        "event":true,
        "gameType": gameType,
        "data":{
            "Credit":795263.2,
            "Balance":795263.2,
            "BetBase":"1:10",
            "event":true
        }
    },
    onBalanceExchange: {
        "action":"balanceExchange",
        "event":true,
        "gameType": gameType,
        "data":{
            "TransCredit":695263.2,
            "Amount":100,
            "Balance":695263.2,
            "BetBase":"1:1",
            "event":true
        }
    },
    onBeginGame: {
        "action":"beginGame",
        "event":true,
        "gameType": gameType,
        "data": {
            WagersID: 999,
            BetInfo: {},
            Credit: 1000,
            Credit_End: "1000",
            BetTotal: 1000,
            PayTotal: 1000,
            BBJackpot: null,
            event:true
        }
    },
    onHitJackpot: {
        action: "onHitJackpot",
        event: true,
        gameType: "5271",
        data: {
            JPType: 2,
            JPAmount: 1000,
            TicketNo: "",
            beginGameResult: {
                WagersID: 999,
                BetInfo: {},
                Credit: 1000,
                Credit_End: "1000",
                BetTotal: 1000,
                PayTotal: 1000,
                BBJackpot: null,
                event:true
            }
        }
    },
    onMachineLeave: { 
        action: "machineLeave", 
        event: true, 
        gameType: gameType, 
        data: { 
            event: true 
        } 
    },
    onErrorMessage: { 
        action: "machineLeave", 
        event: false, 
        error: "SET_ACCUMULATION_FAIL",
        errCode: 1354000281
    },
    onExit: {
        action: "exit", 
        event: true, 
        gameType: gameType, 
        data: { 
            event: true 
        } 
    },
    onJoinGame: {
        action: "joinGame",
        event: true, 
        gameType
    },
    onLeaveGame: {
        action: "leaveGame",
        event: true, 
        gameType
    }
}
describe('BaseModel Instance', () => {
    let model: BaseModel;
    let view: BaseView;
    let presenter: BasePresenter;
    beforeEach(() => {
        model = new BaseModel();
        view = new BaseView();
        presenter = new BasePresenter(model, view);
        // @ts-ignore
        view.presenter = presenter;
    });
    afterEach(() => {
        model = new BaseModel();
    });
    test('Initial configReceiveEvent', () => {
        let fn = jest.fn();
        // @ts-ignore
        model.connection.receiver.on = fn;
        // @ts-ignore
        model.configReceiveEvent();
        expect(fn).toHaveBeenCalledTimes(Object.values(ClientRecvAction).length);
    });
    test('Trigger handleReceiveEvent', () => {
        expect(model.gameCode).toBeFalsy;
        let handle = jest.fn();
        let handleError = jest.fn();
        // @ts-ignore
        model.isReady = handle;
        // @ts-ignore
        model.updateMarquee = handle;
        // @ts-ignore
        model.onLogin = handle;
        // @ts-ignore
        model.onTakeMachine = handle;
        // @ts-ignore
        model.onLoadInfo = handle;
        // @ts-ignore
        model.onGetMachineDetail = handle;
        // @ts-ignore
        model.onBalanceExchange = handle;
        // @ts-ignore
        model.onCreditExchange = handle;
        // @ts-ignore
        model.onBeginGame = handle;
        // @ts-ignore
        model.onHitJackpot = handle;
        // @ts-ignore
        model.onMachineLeave = handle;
        // @ts-ignore
        model.onErrorMessage = handleError;
        const { Ready, 
            UpdateMarquee, 
            Login, 
            TakeMachine,
            LoadInfo,
            GetMachineDetail,
            BalanceExchange,
            CreditExchange,
            BeginGame,
            HitJackpot,
            MachineLeave
        } = ClientRecvAction;
        const { receiver } = model.connection;
        receiver.emit(Ready, mockData.ready);
        expect(handle).toBeCalledTimes(1);
        handle.mockClear();
        receiver.emit(UpdateMarquee, mockData.updateMarquee);
        expect(handle).toBeCalledTimes(1);
        handle.mockClear();
        receiver.emit(Login, mockData.login);
        expect(handle).toBeCalledTimes(1);
        handle.mockClear();
        receiver.emit(TakeMachine, mockData.takeMachine);
        expect(handle).toBeCalledTimes(1);
        handle.mockClear();
        receiver.emit(LoadInfo, mockData.onLoadInfo);
        expect(handle).toBeCalledTimes(1);
        handle.mockClear();
        receiver.emit(GetMachineDetail, mockData.onGetMachineDetail);
        expect(handle).toBeCalledTimes(1);
        handle.mockClear();
        receiver.emit(CreditExchange, mockData.onCreditExchange);
        expect(handle).toBeCalledTimes(1);
        handle.mockClear();
        receiver.emit(BalanceExchange, mockData.onBalanceExchange);
        expect(handle).toBeCalledTimes(1);
        handle.mockClear();
        receiver.emit(BeginGame, mockData.onBeginGame);
        expect(handle).toBeCalledTimes(1);
        handle.mockClear();
        receiver.emit(HitJackpot, mockData.onHitJackpot);
        expect(handle).toBeCalledTimes(1);
        handle.mockClear();
        receiver.emit(MachineLeave, mockData.onMachineLeave);
        expect(handle).toBeCalledTimes(1);
        handle.mockClear();
        receiver.emit(MachineLeave, mockData.onErrorMessage as any);
        expect(handleError).toBeCalledTimes(1);
        handleError.mockClear();
    });
    test('Invoking dispatch Event', () => {
        const { Ready, 
            UpdateMarquee, 
            Login, 
            TakeMachine,
            LoadInfo,
            GetMachineDetail,
            BalanceExchange,
            CreditExchange,
            BeginGame,
            HitJackpot,
            MachineLeave
        } = ClientRecvAction;
        const { receiver } = model.connection;
        const { login, 
            takeMachine, 
            onLoadInfo,
            onGetMachineDetail,
            onCreditExchange
         } = mockData;
        // @ts-ignore
        model.isReady(mockData.ready);
        
        // @ts-ignore
        model.updateMarquee(mockData.updateMarquee.data);
        expect(model.dataModel.marquee).toBe(mockData.updateMarquee.data);
        
        // @ts-ignore
        model.onLogin(login.data);
        expect(model.dataModel).toHaveProperty('userId', String(login.data.UserID));

        // @ts-ignore
        model.onTakeMachine(takeMachine.data);
        expect(model.dataModel).toHaveProperty('gameCode', String(takeMachine.data.GameCode));
        
        receiver.emit(LoadInfo, onLoadInfo);
        expect(model.dataModel).toHaveProperty('loginName', String(onLoadInfo.data.LoginName));

        receiver.emit(GetMachineDetail, mockData.onGetMachineDetail);
        expect(model.dataModel).toHaveProperty('balance', (onGetMachineDetail.data.Balance));
        expect(model.dataModel).toHaveProperty('credit', (onGetMachineDetail.data.Credit));
        expect(model.dataModel).toHaveProperty('base', (onGetMachineDetail.data.Base));
        expect(model.dataModel).toHaveProperty('betBase', (onGetMachineDetail.data.BetBase));

        receiver.emit(CreditExchange, mockData.onCreditExchange);
        expect(model.dataModel).toHaveProperty('balance', (mockData.onCreditExchange.data.Balance));
        expect(model.dataModel).toHaveProperty('credit', (mockData.onCreditExchange.data.Credit));
        expect(model.dataModel).toHaveProperty('betBase', (mockData.onCreditExchange.data.BetBase));
    
        receiver.emit(BalanceExchange, mockData.onBalanceExchange);

        expect(model.dataModel).toHaveProperty('balance', (mockData.onBalanceExchange.data.Balance));
        expect(model.dataModel).toHaveProperty('credit', 0);
        expect(model.dataModel).toHaveProperty('betBase', (mockData.onBalanceExchange.data.BetBase));
        expect(model.dataModel.washInfo).toHaveProperty('transCredit', (mockData.onBalanceExchange.data.TransCredit));
        expect(model.dataModel.washInfo).toHaveProperty('amount', (mockData.onBalanceExchange.data.Amount));
    
        receiver.emit(BeginGame, mockData.onBeginGame);
        // TODO:BeginGame補測試
        
        receiver.emit(HitJackpot, mockData.onHitJackpot);
        expect(model.dataModel).toHaveProperty('winJPType', (mockData.onHitJackpot.data.JPType));
        expect(model.dataModel).toHaveProperty('winJPAmount', (mockData.onHitJackpot.data.JPAmount));
        
        receiver.emit(MachineLeave, mockData.onMachineLeave);
        // TODO:MachineLeave補測試

        // receiver.emit(MachineLeave, mockData.onErrorMessage);

    });
    test('Connect', async () => {
        let getFn = jest.fn();
        // @ts-ignore
        model.getConnectPath = getFn;
        await model.connect().catch((err) => {});
        expect(getFn).toBeCalledTimes(1);
        
        model.connect("ws://localhost").catch((err) => {});
        expect(getFn).toBeCalledTimes(1);

    });
    test('Test sender & receiver', async () => {

        const { sender, receiver } = model.connection;

        sender.callServer = jest.fn();

        model.send(ClientSendAction.Exit, {
            action: ClientSendAction.Exit,
            gameType
        });
        expect(sender.callServer).toBeCalledTimes(1);

        let reuslt = await new Promise((resolve, reject) => {
            // @ts-ignore
            model.onRecv({
                action: ClientSendAction.Exit, 
                event: true,
                gameType,
                data: { event: true }
            }, resolve, reject);
        });
        expect(reuslt).toHaveProperty('event', true);

        reuslt = await new Promise((resolve, reject) => {
            // @ts-ignore
            model.onRecv({
                action: ClientSendAction.Exit, 
                event: true,
                gameType: '3276'
            }, resolve, reject);
        });
        expect(reuslt).toHaveProperty('event', true);


        let bool = await new Promise((resolve, reject) => {
            // @ts-ignore
            model.onRecv({
                action: ClientSendAction.Exit,
                event: false,
                gameType
            }, resolve, reject);
        }).catch((err) => { return false });
        expect(bool).toBeFalsy; 

    });
});

describe('BasePresenter Instance', () => {

    let model: BaseModel;
    let view: BaseView;
    let presenter: BasePresenter;
    
    beforeEach(() => {
        model = new BaseModel();
        //@ts-ignore
        model.data.userAutoExchange = {
            IsAuto: true,
            Record: []
        }
        view = new BaseView();
        presenter = new BasePresenter(model, view);
        // @ts-ignore
        view.presenter = presenter;
        view.gameManager = new GameManager();
        //@ts-ignore
        let info = view.gameManager.info = new Info();
        //@ts-ignore
        info.betLabel = new Label();
    });
    afterEach(() => {
        model = new BaseModel();
        view = new BaseView();
        presenter = new BasePresenter(model, view);
    });
    test('Should be instance of BasePresenter',async () => {
        presenter = new BasePresenter(model, view);
        // @ts-ignore
        expect(presenter.view).toBe(view);
        // @ts-ignore
        expect(presenter.model).toBe(model);

        expect(presenter.sender).toEqual(model.connection.sender);

        expect(presenter.receiver).toEqual(model.connection.receiver);
        
        expect(presenter.event).toEqual(model.connection.event);
        
        expect(presenter.gameCode).toEqual(model.dataModel.gameCode);

        expect(presenter.gameType).toEqual(model.dataModel.gameType);
        expect(presenter.gameType = "30001").toEqual(model.dataModel.gameType);

        expect(presenter.sid = 'qazwsxedc').toEqual(presenter.sid);
        model.data.isJoinGame = true;
        expect(presenter.isJoinGame).toBeTruthy();

        model.data.balance = 50000;

        expect(presenter.balance).toEqual(model.data.balance);

        model.data.userId = 'userId-1';
        expect(presenter.userId).toEqual(model.data.userId);

        expect(await presenter.uuid()).toEqual(model.data.uuid);

        expect(presenter.connected).toBeFalsy();
        
        expect(presenter.quickExBarValues).toEqual(model.data.quickExBarValues);

        presenter.setLine(2);

        expect(model.data.line).toBe(2);

        presenter.setLineBet(10);

        expect(model.data.lineBet).toBe(10);

        presenter.mute(1);

        presenter.backgroundMusic(1);

        // @ts-ignore
        presenter.model = null;
        
        expect(presenter.sender).toBeFalsy;
        
        expect(presenter.receiver).toBeFalsy;
        
        expect(presenter.event).toBeFalsy;


    });
    test('register event', () => {
        let once = jest.fn();
        let on = jest.fn();
        // @ts-ignore
        presenter.event.once = once;
        // @ts-ignore
        presenter.event.on = on;
        presenter.registerHandleProgressEvents()
        // @ts-ignore
        expect(once).toBeCalledTimes(presenter.TriggerConnectionProgression.length);
        once.mockClear();
        
        presenter.registerRecvEvents();
        // @ts-ignore
        expect(on).toBeCalledTimes(presenter.TriggerConnectionTypes.length);
        on.mockClear();
        model.data.connected = true;
        // @ts-ignore
        presenter.view = null;
        presenter.registerHandleProgressEvents();
        expect(once).toBeCalledTimes(0);

        let updateUserAnalysis = jest.fn();
        // @ts-ignore
        presenter.updateUserAnalysis = updateUserAnalysis;
        userAnalysis.emit('update', { uiHelp: 1 });
        expect(updateUserAnalysis).toBeCalledTimes(1);

    });
    test('handelConneciontEvent', () => {

        AIOBridge.onLoaded = jest.fn();
        view.updateJackpot = jest.fn(()=> { return true; });
        view.setupGameManager = jest.fn();
        view.updateMachineInfo = jest.fn();
        view.updateCreditExchangeInfo = jest.fn();
        view.updateBalanceExhchangeInfo = jest.fn();
        // @ts-ignore
        view.updateMarquee = jest.fn();
        // @ts-ignore
        view.errorHandlingForServerActions = jest.fn();

        // 錯誤時候不會觸發
        // @ts-ignore
        presenter.handelConneciontEvent({ action: 'ready', event: false });
        expect(AIOBridge.onLoaded).toHaveBeenCalledTimes(0);

        // @ts-ignore
        presenter.handelConneciontEvent({ action: 'ready', event: true });
        // @ts-ignore
        presenter.handelConneciontEvent({ action: 'updateJP', event: true });
        // @ts-ignore
        presenter.handelConneciontEvent({ action: 'onLoadInfo', event: true });
        // @ts-ignore
        presenter.handelConneciontEvent({ action: 'getMachineDetail', event: true });
        // @ts-ignore
        presenter.handelConneciontEvent({ action: 'creditExchange', event: true });
        // @ts-ignore
        presenter.handelConneciontEvent({ action: 'balanceExchange', event: true });
        // @ts-ignore
        presenter.handelConneciontEvent({ action: 'updateMarquee', event: true });
        // @ts-ignore
        presenter.handelConneciontEvent({ action: 'close', event: true });

        expect(AIOBridge.onLoaded).toHaveBeenCalledTimes(1);
        expect(view.updateJackpot).toHaveBeenCalledTimes(1);
        expect(view.setupGameManager).toHaveBeenCalledTimes(1);
        expect(view.updateMachineInfo).toHaveBeenCalledTimes(1);
        expect(view.updateCreditExchangeInfo).toHaveBeenCalledTimes(1);
        expect(view.updateBalanceExhchangeInfo).toHaveBeenCalledTimes(1);
        expect(view.updateMarquee).toHaveBeenCalledTimes(1);
        expect(view.errorHandlingForServerActions).toHaveBeenCalledTimes(1);

    });
    test('Test not implemented', () => {
        expect(()=> {  presenter.addLineBet(); }).toThrow("Method not implemented.");
        expect(()=> {  presenter.minusLineBet(); }).toThrow("Method not implemented.");
        expect(()=> {  presenter.end(); }).toThrow("Method not implemented.");
        expect(()=> {  presenter.double(); }).toThrow("Method not implemented.");
        expect(()=> {  presenter.free(); }).toThrow("Method not implemented.");
        expect(()=> {  presenter.leaveMachine(); }).toThrow("Method not implemented.");

    });
    test('Test connect & disconnect', async () => {
        // @ts-ignore
        model.connect = jest.fn().mockImplementationOnce(() => Promise.resolve(true));
        // @ts-ignore
        model.disconnect = jest.fn().mockImplementationOnce(() => Promise.resolve(true));

        expect(await presenter.connect()).toBeTruthy();

        expect(await presenter.disconnect()).toBeTruthy();

    });
    test('BaseView testings lines game', () => {
        
        presenter = new BasePresenter(model, view);

        presenter.setLine(10);
        expect(model.dataModel.line).toBe(10);

        presenter.setLineBet(100);
        expect(model.dataModel.lineBet).toBe(100);
        model.dataModel.maxLine = 10;
        // 超過最大值回歸1
        presenter.addLine(true);
        expect(model.dataModel.line).toBe(1);
        // Line + 1
        presenter.addLine(false);
        expect(model.dataModel.line).toBe(2);
        // 最大值維持
        model.dataModel.line = model.dataModel.maxLine;
        presenter.addLine(false);
        expect(model.dataModel.line).toBe(10);

        presenter.minusLine(false);
        expect(model.dataModel.line).toBe(9);
        
        model.dataModel.line = 1;
        presenter.minusLine(false);
        expect(model.dataModel.line).toBe(1);

        presenter.minusLine(true);
        expect(model.dataModel.line).toBe(10);

        presenter.minusLine();
        expect(model.dataModel.line).toBe(9);

        model.dataModel.maxLineBet = 20;
        model.dataModel.lineBet = 10;
        model.dataModel.maxLine = 20;
        model.dataModel.line = 10;

        presenter.maxBet();

        expect(model.dataModel.lineBet).toBe(20);

        expect(model.dataModel.line).toBe(20);
    });
    test('Sender to Server', async () => {
        let onExit = jest.fn(() => Promise.resolve(mockData.onExit));
        // @ts-ignore
        model.send = onExit;
        await presenter.exit();
        expect(onExit).toBeCalledTimes(1);
        onExit.mockClear();

        let onBalanceExchange = jest.fn(() => {
            //@ts-ignore
            model.handleReceiveEvent(mockData.onBalanceExchange)
            return Promise.resolve(mockData.onBalanceExchange)
        });
        // @ts-ignore
        model.send = onBalanceExchange;
        // expect(await presenter.balanceExchange()).toStrictEqual(model.getExchangeInfo());
        expect(await presenter.balanceExchange()).toStrictEqual(mockData.onBalanceExchange);
        

    });
    test('Should bet error', () => {
        let action = jest.fn();
        // @ts-ignore
        presenter.view.errorHandlingForServerActions = action;
        // @ts-ignore
        expect(presenter.isServerError({event: false, action: ClientRecvAction.BeginGame})).toBeTruthy();
        // @ts-ignore
        expect(presenter.isServerError({event: true})).toBeFalsy();

        expect(action).toHaveBeenCalledTimes(1);
    });
    test('Login', async () => {
        // @ts-ignore
        presenter.sender.callServer = jest.fn();
        // @ts-ignore
        presenter.receiver.once = (name: string, callback: (data: any) => void) => {
            callback(mockData.login);
        };
        let result = await presenter.login();
        expect(result).toBe(mockData.login);

        let login = Object.assign({}, mockData.login);
        login.event = false;
        // @ts-ignore
        presenter.receiver.once = (name: string, callback: (data: any) => void) => {
            callback(login);
        };
        result = await presenter.login().catch((e) => {return e });
        expect(result).toBe(login);
    });
    test('TakeMachine', async () => {
        // @ts-ignore
        presenter.sender.callServer = jest.fn();
        // @ts-ignore
        presenter.receiver.once = (name: string, callback: (data: any) => void) => {
            model.dataModel.gameCode = mockData.takeMachine.data.GameCode;
            callback(mockData.takeMachine);
        };
        let result = await presenter.takeMachine();
        expect(result).toBe(mockData.takeMachine.data.GameCode);

        let takeMachine = Object.assign({}, mockData.takeMachine);
        takeMachine.error = "Failed";
        // @ts-ignore
        presenter.receiver.once = (name: string, callback: (data: any) => void) => {
            callback(takeMachine);
        };
        result = await presenter.takeMachine().catch((e) => {return e });
        expect(result).toBe(mockData.takeMachine.data.GameCode);
    });
    test('getMachineDetail', async () => {
        // @ts-ignore
        presenter.sender.callServer = jest.fn();
        // @ts-ignore
        presenter.receiver.once = (name: string, callback: (data: any) => void) => {
            callback(mockData.onGetMachineDetail);
        };
        let result = await presenter.getMachineDetail();
        expect(result).toBe(mockData.onGetMachineDetail);

        let getMachineDetail = Object.assign({}, mockData.onGetMachineDetail);
        getMachineDetail.event = false;
        // @ts-ignore
        presenter.receiver.once = (name: string, callback: (data: any) => void) => {
            callback(getMachineDetail);
        };
        result = await presenter.getMachineDetail().catch((e) => {return e });
        expect(result).toBe(getMachineDetail);
    });
    test('OnLoadInfo', () => {
        // @ts-ignore
        model.send = jest.fn();
        presenter.onLoadInfo();
        expect(model.send).toBeCalledTimes(1);
    });
    test('BeginGame', async () => {
        // @ts-ignore
        presenter.sender.callServer = jest.fn();
        // @ts-ignore
        presenter.receiver.once = (name: string, callback: (data: any) => void) => {
            callback(mockData.onBeginGame);
        };
        let result = await presenter.beginGame({ BetCredit: 100 });
        expect(result).toBe(mockData.onBeginGame);

        result = await presenter.beginGame(100);
        expect(result).toBe(mockData.onBeginGame);

        result = await presenter.beginGame([100]).catch((e) => e.event);
        
        expect(result).toBeFalsy();

        let onBeginGame = Object.assign({}, mockData.onBeginGame);
        onBeginGame.event = false;
        // @ts-ignore
        presenter.receiver.once = (name: string, callback: (data: any) => void) => {
            callback(onBeginGame);
        };
        result = await presenter.beginGame({ BetCredit: 100 }).catch((e) => {return e });
        expect(result).toBe(onBeginGame);
    });
    test('endGame', () => {
        view.end = jest.fn();
        presenter.endGame();
        expect(view.end).toBeCalledTimes(1);
    })

    test('CreditExchange', () => {
        // @ts-ignore
        model.send = jest.fn();
        presenter.creditExchange("1:1", 100);
        expect(model.send).toBeCalledTimes(1);
    });

    test('JoinGame', async () => {
        // @ts-ignore
        presenter.sender.callServer = jest.fn();
        // @ts-ignore
        presenter.receiver.once = (name: string, callback: (data: any) => void) => {
            callback(mockData.onJoinGame);
        };
        let result = await presenter.joinGame();
        expect(result).toBeTruthy()

        let onJoinGame = Object.assign({}, mockData.onJoinGame);
        onJoinGame.event = false;
        // @ts-ignore
        presenter.receiver.once = (name: string, callback: (data: any) => void) => {
            callback(onJoinGame);
        };
        result = await presenter.joinGame().catch((e) => {return e });
        expect(result).toBeFalsy();
    });
    test('LeaveGame', async () => {
        // @ts-ignore
        presenter.sender.callServer = jest.fn();
        // @ts-ignore
        presenter.receiver.once = (name: string, callback: (data: any) => void) => {
            callback(mockData.onLeaveGame);
        };
        let result = await presenter.leaveGame();
        expect(result).toBeTruthy()

        let onLeaveGame = Object.assign({}, mockData.onLeaveGame);
        onLeaveGame.event = false;
        // @ts-ignore
        presenter.receiver.once = (name: string, callback: (data: any) => void) => {
            callback(onLeaveGame);
        };
        result = await presenter.leaveGame().catch((e) => {return e });
        expect(result).toBeFalsy();
    });
    test('Should be openCreditExchangePanel', async () => {

        view.showExchangePanel = jest.fn();
        view.updateExchangePanel = jest.fn();
        
        presenter.getMachineDetail = jest.fn(() => Promise.resolve(null));

        await presenter.openCreditExchangePanel();

        expect(view.showExchangePanel).toHaveBeenCalledTimes(1);
        expect(view.updateExchangePanel).toHaveBeenCalledTimes(1);

        // @ts-ignore
        presenter.view = null;
        await presenter.openCreditExchangePanel();
        expect(view.showExchangePanel).toHaveBeenCalledTimes(1);
        expect(view.updateExchangePanel).toHaveBeenCalledTimes(1);

    });
    test('FastExchange', async () => {

        let balanceExchange = jest.fn(() => Promise.resolve({
            event: true,
            data: {
                "Amount": 100,
                "Balance": 7202687.77,
                "BetBase": "",
                "ErrorID": 0,
                "TransCredit": 100,
                "event": true
            }
        }));
        let getMachineDetail = jest.fn(() => Promise.resolve({}));
        let creditExchange = jest.fn(() => Promise.resolve({}));        

        presenter.balanceExchange = () => balanceExchange() as any;
        presenter.getMachineDetail = () => getMachineDetail();
        presenter.creditExchange = (betBase, credit) => {
            expect(betBase).toBe("1:1");
            expect(credit).toBe(50);
            return creditExchange() as any;
        };
        await presenter.fastExchange("1:1");
        expect(balanceExchange).toHaveBeenCalledTimes(0);
        expect(getMachineDetail).toHaveBeenCalledTimes(0);

        model.dataModel.balance = 50;
        model.dataModel.credit = 1000;
        model.dataModel.betBase = "1:1";
        await presenter.fastExchange("1:1");
        expect(balanceExchange).toHaveBeenCalledTimes(1);
        expect(getMachineDetail).toHaveBeenCalledTimes(1);

        model.dataModel.washInfo = {
            transCredit: 1000,
            amount: 1000
        };

        await presenter.fastExchange("1:1");


    });

    test('SaveUserAutoExchange', async () => {
        // @ts-ignore
        presenter.sender.callServer = jest.fn();
        // @ts-ignore
        presenter.receiver.once = (name: string, callback: (data: any) => void) => {
            callback({ event: true, action: 'saveUserAutoExchange' });
        };
        let result = await presenter.saveUserAutoExchange({
            autoEx: true,
            autoValue: 1,
            autoRate: "auto",
            lastInput: []
        });
        expect(result).toStrictEqual({ event: true, action: 'saveUserAutoExchange' });
    });
    test('UpdateUserAnalysis', async () => {
                // @ts-ignore
                presenter.sender.callServer = jest.fn();
            
                // @ts-ignore
                presenter.receiver.once = (name: string, callback: (data: any) => void) => {
                    callback({ event: true, action: 'updateUserAnalysis' });
                };
                let result = await presenter.updateUserAnalysis({ betPlus: 1 });
                result = await presenter.updateUserAnalysis();
                expect(result).toStrictEqual({ event: true, action: 'updateUserAnalysis' });
    });
    test('URLParameter argument', () => {
        // @ts-ignore
        URLParameter.url = new URL('http://localhost/lb?lang=en');
        let presenter = new BasePresenter(model, new BaseView());
        expect(model.data.lang).toBe("en");
    });
});

describe('BaseView Instance', () => {
    let model: BaseModel;
    let view: BaseView;
    let presenter: BasePresenter;
    let gameManagerInfo: Info;
    let gameCommand: GameCommand;
    
    beforeEach(() => {
        model = new BaseModel();
        //@ts-ignore
        model.data.userAutoExchange = {
            IsAuto: true,
            Record: []
        }
        view = new BaseView();
        view.gameManager = new GameManager();
        //@ts-ignore
        view.gameManager.info = gameManagerInfo = new Info();
        view.gameManager.command = gameCommand = new GameCommand();
        //@ts-ignore
        gameCommand.betSetPanel = jest.fn();
        presenter = new BasePresenter(model, view);

        //@ts-ignore
        view.presenter = presenter;
        //@ts-ignore
        gameManagerInfo.creditLabel = new Label();
        //@ts-ignore
        gameManagerInfo.betBaseLabel = new Label();
    });
    afterEach(() => {
        view.gameManager.command = null;
        view.gameManager = null;
        model = new BaseModel();
        view = new BaseView();
        presenter = new BasePresenter(model, view);
    });
    test('BaseView config configToolbarEvent', () => {
        // @ts-ignore
        view.onLoad();
        // configToolbarEvent
        // @ts-ignore
        view.settingsPanel = { event: {} };

        presenter.backgroundMusic = jest.fn();
        presenter.mute = jest.fn();
        presenter.exit = jest.fn(() => Promise.resolve());
        presenter.help = jest.fn();
        presenter.history = jest.fn();
        presenter.deposit = jest.fn();
        presenter.gameInfo = jest.fn();
        presenter.openCreditExchangePanel = jest.fn(() => Promise.resolve());
        // @ts-ignore
        view.settingsPanel.event.on = (action: string, callback: any) => {
            callback();
            if (action === ToolBarEventName.MUSIC) {
                expect(presenter.backgroundMusic).toBeCalledTimes(1);
            }
            if (action === ToolBarEventName.MUTE) {
                expect(presenter.mute).toBeCalledTimes(1);
            }
            if (action === ToolBarEventName.EXIT) {
                expect(presenter.exit).toBeCalledTimes(1);
            }
            if (action === ToolBarEventName.HELP) {
                expect(presenter.help).toBeCalledTimes(1);
            }
            if (action === ToolBarEventName.HISTORY) {
                expect(presenter.history).toBeCalledTimes(1);
            }
            if (action === ToolBarEventName.DEPOSIT) {
                expect(presenter.deposit).toBeCalledTimes(1);
            }
            if (action === ToolBarEventName.GAMEINFO) {
                expect(presenter.gameInfo).toBeCalledTimes(1);
            }
            if (action === ToolBarEventName.ONEXCHANGE) {
                expect(presenter.openCreditExchangePanel).toBeCalledTimes(1);
            }

        };
        // @ts-ignore
        view.configToolbarEvent();
    });
    test('BaseView config configCommandEvent', () => {
        // configCommandEvent
        // @ts-ignore
        view.gameManager = { command: { event: {} } };
        let beginGame = jest.fn(() => Promise.resolve());
        let maxBet = jest.fn();
        let addLine = jest.fn();
        let minusLine = jest.fn();
        let double = jest.fn();
        let setLineBet = jest.fn();
        let setLine = jest.fn();
        let fastExchange = jest.fn(() => Promise.resolve({}));
        let openCreditExchangePanel = jest.fn(() => Promise.resolve());

        presenter.beginGame = beginGame as any;
        presenter.maxBet = maxBet;
        presenter.addLine = addLine;
        presenter.minusLine = minusLine;
        presenter.double = double;
        presenter.setLineBet = setLineBet;
        presenter.setLine = setLine;
        presenter.fastExchange = fastExchange;
        presenter.openCreditExchangePanel = openCreditExchangePanel;
        
        // @ts-ignore
        view.gameManager.command.event.on = (action: string, callback: any) => {
            callback();
            switch (action) {
                case CommandEventName.SPIN: {
                    //expect(beginGame).toHaveBeenCalled();
                    //beginGame.mockClear();
                    break;
                }
                case CommandEventName.MAX_BET: {
                    expect(maxBet).toBeCalledTimes(1);
                    maxBet.mockClear();
                    break;
                }
                case CommandEventName.LINE_BET: {
                    expect(addLine).toHaveBeenCalled();
                    addLine.mockClear();
                    break;
                }
                case CommandEventName.LINE_BET_MINUS: {
                    expect(minusLine).toHaveBeenCalled();
                    minusLine.mockClear();
                    break;
                }
                case CommandEventName.LINE: {
                    expect(addLine).toHaveBeenCalled();
                    addLine.mockClear();
                    break;
                }
                case CommandEventName.LINE_MINUS: {
                    expect(minusLine).toHaveBeenCalled();
                    minusLine.mockClear();
                    break;
                }
                case CommandEventName.DOUBLE: {
                    expect(double).toHaveBeenCalled();
                    double.mockClear();
                    break;
                }
                case CommandEventName.UPDATE_LINEBET: {
                    expect(setLineBet).toHaveBeenCalled();
                    setLineBet.mockClear();
                    break;
                }
                case CommandEventName.UPDATE_LINE: {
                    expect(setLine).toHaveBeenCalled();
                    setLine.mockClear();
                    break;
                }
                case CommandEventName.CHANGE_RATIO: {
                    expect(fastExchange).toHaveBeenCalled();
                    fastExchange.mockClear();
                    break;
                }
                case CommandEventName.EXCHANGE: {
                    expect(openCreditExchangePanel).toHaveBeenCalled();
                    openCreditExchangePanel.mockClear();
                    break;
                }

            }
            expect(beginGame).not.toHaveBeenCalled();
            expect(maxBet).not.toHaveBeenCalled();
            expect(addLine).not.toHaveBeenCalled();
            expect(minusLine).not.toHaveBeenCalled();
            expect(double).not.toHaveBeenCalled();
            expect(setLineBet).not.toHaveBeenCalled();
            expect(fastExchange).not.toHaveBeenCalled();
            expect(openCreditExchangePanel).not.toHaveBeenCalled();
        };
        // @ts-ignore
        view.configCommandEvent();
    });
    test('onSpinHandle standalone', async () => {
        let fn = jest.fn();
        let fn2 = jest.fn();
        // @ts-ignore
        view.playerConfig = {
            standalone: true
        }
        view.gameManager.begin = fn;
        // @ts-ignore
        view.gameManager.onSpin = fn2;
        // @ts-ignore
        view.gameManager.end = jest.fn();
        // @ts-ignore
        presenter.getMachineDetail = jest.fn();
        // @ts-ignore
        await view.onSpinHandle();
        await UtilsKit.Defer(1);
        expect(view.gameManager.begin).toHaveBeenCalled();
        fn.mockClear();
        view.playerConfig.standalone = false;
        // @ts-ignore
        view.presenter.model.data.connected = true;
        // @ts-ignore
        view.presenter.model.data.bet = 0;
        // @ts-ignore
        view.presenter.model.data.credit = 100;
        let sypOn = jest.spyOn(view.presenter,'beginGame');
        sypOn.mockImplementation(() => Promise.resolve({ event: true, data: {} } as any));
        // @ts-ignore
        await view.onSpinHandle();
        expect(view.gameManager.onSpin).toHaveBeenCalled();
        expect(view.gameManager.begin).toHaveBeenCalled();

        fn.mockClear();
        // onSpinHandle to exchangePanel
        // @ts-ignore
        view.startAutoExchange = jest.fn(() => Promise.resolve({ event: true, data:'' }));
        // @ts-ignore
        view.presenter.getMachineDetail = jest.fn(() => Promise.resolve({ event: true }));
        // @ts-ignore
        view.gameManager.onBettingStatus = jest.fn();
        // @ts-ignore
        new AlertPanel().alert = jest.fn(() => Promise.resolve({ isAccept: true, } ));
        // @ts-ignore
        view.presenter.model.data.bet = 1;
        // @ts-ignore
        view.presenter.model.data.credit = 0;
        // @ts-ignore
        await view.onSpinHandle();
        // @ts-ignore
        view.exchangePanel = new Node();
        // @ts-ignore
        view.exchangePanel.dataUpdate = jest.fn();
        model.data.userAutoExchange.IsAuto = true;
        // @ts-ignore
        await view.onSpinHandle();
        expect(view.gameManager.begin).toHaveBeenCalled();
        // @ts-ignore
        expect(view.startAutoExchange).toHaveBeenCalled();
        view.end();
        expect(view.gameManager.end).toHaveBeenCalled();
    });

    test('BaseView updateProgress', async () => {

        let fnOn = jest.fn();
        // @ts-ignore
        Application.getInstance().SetProcessNum = fnOn;
        Application.getInstance().CloseLoader = fnOn;

        view.updateProgress(10);
        expect(fnOn).toBeCalledTimes(1);
        fnOn.mockClear();
        view.updateProgress(95);
        await UtilsKit.Defer(501);
        expect(fnOn).toBeCalledTimes(3);

    });
    test('BaseView updateJackpot', () => {
        view.gameManager = null;
        let updateJackpot = jest.fn();
        expect(view.updateJackpot([1, 2, 3])).toBeFalsy();
        expect(view.updateJackpot(null)).toBeFalsy();
        // @ts-ignore
        view.gameManager = {};
        // @ts-ignore
        view.gameManager.updateJackpot = function () { updateJackpot() };
        expect(view.updateJackpot([1, 2, 3])).toBeTruthy();
        expect(view.updateJackpot(null)).toBeFalsy();
    });
    test('BaseView updateMarquee', () => {
        view.gameManager = null;

        let updateMarquee = jest.fn();
        expect(view.updateMarquee('string')).toBeFalsy();
        expect(view.updateMarquee(null)).toBeFalsy();
        // @ts-ignore
        view.gameManager = {};
        // @ts-ignore
        view.gameManager.updateMarquee = function () { updateMarquee() };
        expect(view.updateMarquee('string')).toBeTruthy();
        expect(updateMarquee).toHaveBeenCalled();
    });
    test('BaseView updateMachineInfo', () => {
        view.updateMachineInfo({
            credit: 11000,
            balance: 500,
            betBase: "1:1",
            base: "1:1"
        });
        // @ts-ignore
        view.exchangePanel = {
            dataUpdate: jest.fn(),
            show: jest.fn()
        };
        view.updateMachineInfo({
            credit: 11000,
            balance: 500,
            betBase: "1:1",
            base: "1:1"
        });
        expect(view.exchangePanel.dataUpdate).toHaveBeenCalled();
    });
    test('BaseView updateCreditExchangeInfo', () => {
        view.updateCreditExchangeInfo({
            credit: 11000,
            balance: 500,
            betBase: "1:1",
            base: "1:1"
        });
        // @ts-ignore
        view.exchangePanel = {
            dataUpdate: jest.fn(),
            show: jest.fn()
        };
        view.updateCreditExchangeInfo({
            credit: 11000,
            balance: 500,
            betBase: "1:1",
            base: "1:1"
        });
        expect(view.exchangePanel.dataUpdate).toHaveBeenCalled();
    });
    test('BaseView updateBalanceExhchangeInfo', () => {
        view.updateBalanceExhchangeInfo({
            credit: 11000,
            balance: 500,
            betBase: "1:1",
            base: "1:1"
        });
        // @ts-ignore
        view.exchangePanel = {
            dataUpdate: jest.fn(),
            show: jest.fn()
        };
        view.updateBalanceExhchangeInfo({
            credit: 11000,
            balance: 500,
            betBase: "1:1",
            base: "1:1"
        });
        expect(view.exchangePanel.dataUpdate).toHaveBeenCalled();
    });
    test('BaseView showExchangePanel', () => {
        view.showExchangePanel();
        // @ts-ignore
        view.exchangePanel = {
            dataUpdate: jest.fn(),
            show: jest.fn()
        };
        view.showExchangePanel();
        expect(view.exchangePanel.show).toHaveBeenCalled();
        // @ts-ignore
        view.settingsPanel = {
            show: jest.fn()
        }
        view.showExchangePanel();
        expect(view.settingsPanel.show).toHaveBeenCalled();

    });
    test('BaseView updateExchangePanel', () => {
        // test view.updateExchangePanel = null;
        view.updateExchangePanel({
            credit: 11000,
            balance: 500,
            betBase: "1:1",
            base: "1:1"
        });
        // @ts-ignore
        view.exchangePanel = {
            dataUpdate: jest.fn(),
            show: jest.fn()
        };
        view.updateExchangePanel({
            credit: 11000,
            balance: 500,
            betBase: "1:1",
            base: "1:1"
        });
        expect(view.exchangePanel.dataUpdate).toHaveBeenCalled();

    });
    test('BaseView initGameManager', () => {
        view.initGameManager();
    });
    test('BaseView setupGameManager', () => {
        view.setupGameManager();
    });
    test('BaseView initAlert', () => {
        view.initAlert();
    });
    test('BaseView alert', () => {
        view.alert('Error', "errCode");
    });
    test('handleExchanePanelEvent', () => {
        // view.handleExchanePanelEvent();

        let creditExchange = jest.fn(() => Promise.resolve());
        let balanceExchange = jest.fn(() => Promise.resolve());
        let fastExchange = jest.fn(() => Promise.resolve({}));
        let exit = jest.fn(() => Promise.resolve());

        presenter.creditExchange = creditExchange as any;
        presenter.balanceExchange = balanceExchange as any;
        presenter.fastExchange = fastExchange;
        presenter.saveUserAutoExchange = jest.fn(() => Promise.resolve()) as any;
        presenter.exit = exit;
        // @ts-ignore
        view.exchangePanel = { event: {} }
        // @ts-ignore
        view.exchangePanel.event.on = (action: string, callback: any) => {
            switch( action ) {
                case ExchangePanelEventName.CREDIT_EXCHANGE: {
                    callback({ betBase: '1:1', amount: 1000 });
                    expect(creditExchange).toHaveBeenCalled();
                    creditExchange.mockClear();
                    break;
                }
                case ExchangePanelEventName.BALANCE_EXCHANGE: {
                    callback();
                    expect(balanceExchange).toHaveBeenCalled();
                    creditExchange.mockClear();
                    break;
                }
                case ExchangePanelEventName.CHANGE_RATIO: {
                    callback({ ratio: 0 });
                    expect(fastExchange).toHaveBeenCalled();
                    fastExchange.mockClear();
                    break;
                }
                case ExchangePanelEventName.LEAVE_GAME: {
                    callback();
                    expect(exit).toHaveBeenCalled();
                    exit.mockClear();
                    break;
                }
            }
        };

        // @ts-ignore
        view.handleExchanePanelEvent();
    });
    test('errorHandlingForServerActions', async () => {
        const data = { state: 1, isAccept: true, isCancel: false };
        const message = {
            error: 'ERROR_TEST', errCode: 0,
            event: false,
            result: ''
        };
        view.settingsPanel = {
            hide: jest.fn(),
        } as any;
        view.alertPanel = {
            alert: jest.fn().mockImplementation(() => Promise.resolve(data))
        } as any;
        // @ts-ignore
        AlertPanel.singleton = view.alertPanel;
        let result = await view.errorHandlingForServerActions(ClientRecvAction.Login, message);
        expect(data).toBe(result);
        result = await view.errorHandlingForServerActions(ClientRecvAction.WSClose, message);
        expect(view.alertPanel.alert).toHaveBeenCalledTimes(2);
        result = await view.errorHandlingForServerActions(ClientRecvAction.Error, message);
        expect(data).toBe(result);

        await view.alert('ERROR_TEST', '122');

    })
    test('createPresenter', async () => {
        let view = new BaseView();
        let presenter = view.createPresenter();
        view.presenter = presenter;
        //@ts-ignore
        expect(presenter.view).toStrictEqual(view);
        let bool: boolean = true;
        let spyOn = jest.spyOn(presenter, 'connect');
        spyOn.mockImplementation(() => Promise.resolve(bool));
        view.startPresenter();
        expect(spyOn).toHaveBeenCalledTimes(1);
    });
    test('not initialised', async () => {
        let view = new BaseView();
        let spyOn = jest.spyOn(console,'warn');
        view.setupGameManager();
        // expect(spyOn).toHaveBeenCalledTimes(1);
    });
    
});

describe('Application', () => {
    test('should', () => {
        const app = Application.getInstance();
        expect(app.isSingleton).toBe(true);
        let scene = new Scene('scene');
        let canvas = new Node('Canvas');
        scene.addChild(canvas);
        app.currentScene = scene;
        expect(scene).toBe(app.currentScene);
        expect(app.canvas).not.toBeNull();
        app.onLoad();
        app.resize();
        app.relese();
        //@ts-ignore
        expect(Application.isSingleton).toBeFalsy();
    })
})