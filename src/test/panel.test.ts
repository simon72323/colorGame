import 'jest';
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals';
import {Device} from '../../assets/game/mahjong/script/include'


import { AlertPanel } from '../../assets/game/mahjong/script/components/AlertPanel';
import { CocosExchangePanel, ExchangePanel } from '../../assets/game/mahjong/script/components/ExchangePanel';

import { Button, Label, Toggle, Node } from 'cc';
import { UtilsKit } from '../../assets/game/mahjong/script/lib/UtilsKit';
import { AutoSetPanel } from '../../assets/game/mahjong/script/components/AutoSetPanel';
import { BetSetPanel } from '../../assets/game/mahjong/script/components/BetSetPanel';

describe('BaseView Instance', () => {
    beforeEach(() => {

    })
    test('🦊 Testing AlertPanel', async () => {
        let alert = new AlertPanel();
        expect(alert).toEqual(AlertPanel.getInstance());
        //@ts-ignore
        alert.onLoad();
        //@ts-ignore
        alert.start();
        //@ts-ignore
        const { alertBasicNone, alertBasic, alertDialog, iconAlertDialog, subview, alertMessageOptions } = alert;
        
        expect(alertBasicNone).toBeTruthy();
        expect(alertBasic).toBeTruthy();
        expect(alertDialog).toBeTruthy();
        expect(iconAlertDialog).toBeTruthy();
        expect(subview).toBeTruthy();

        alert.title = 'Alert Title';
        expect(alertMessageOptions.title).toBe(alert.title);
        alert.message = 'Alert Message';
        expect(alertMessageOptions.message).toBe(alert.message);
        alert.confirmButtonVisible = true;
        expect(alertMessageOptions.confirmButtonVisible).toBe(alert.confirmButtonVisible);

        alert.confirmButtonText = 'confirm button text';
        expect(alertMessageOptions.confirmButtonText).toBe(alert.confirmButtonText);

        alert.cancelButtonVisible = true;
        expect(alertMessageOptions.cancelButtonVisible).toBe(alert.cancelButtonVisible);

        alert.cancelButtonText = 'cancel button text';
        expect(alertMessageOptions.cancelButtonText).toBe(alert.cancelButtonText);

        alert.iconButton = true;
        expect(alertMessageOptions.iconButton).toBe(alert.iconButton);

        alert.alert({ message:'' });
        //@ts-ignore
        expect(alert.current).toEqual(alertBasicNone);

        alert.alert({
            title: 'Alert', 
            message: 'Please enter',
            confirmButtonText: 'Confirm',
            confirmButtonVisible: true
        });
        //@ts-ignore
        expect(alert.current).toEqual(alertBasic);
        
        alert.alert({
            title: 'Alert', 
            message: 'Please enter',
            confirmButtonText: 'Confirm',
            confirmButtonVisible: true,
            cancelButtonText: 'cancel',
            cancelButtonVisible: true
        });
        //@ts-ignore
        expect(alert.current).toEqual(alertDialog);
        
        await alert.alert({
            title: 'Alert', 
            message: 'Please enter',
            iconButton: true,
            duration: 1
        });
        //@ts-ignore
        expect(alert.current).toEqual(iconAlertDialog);
        alert.clear();

    })
    test('ExchangePanel', async () => {
        let panel = new ExchangePanel();
        panel.userName = 'testuser';
        expect(panel.userName).toEqual('testuser');

        let balance = await new Promise((reslove) => {
            panel.event.on('display', () => {
                reslove(panel.balance);
            });
            panel.balance = 5001;

        });
        expect(balance).toBe(5001);

        let testcase = await new Promise((reslove) => {
            panel.event.on('display', () => reslove(true));
            //@ts-ignore
            panel.updateDisplay();
        });
        expect(testcase).toBeTruthy;

        panel.creditExchange('1:1', 50);
        panel.changeRatio('1:1');
        panel.balanceExchange();
        panel.leaveGame();
    })
    test('CocosExchangePanel', async () => {
        let cExPanel = new CocosExchangePanel();
        //@ts-ignore
        let { dataElements } = cExPanel;
        //@ts-ignore
        expect(cExPanel.titleText).toBe("");
        //@ts-ignore
        cExPanel.title = new Label();
        //@ts-ignore
        cExPanel.titleText = '456';
        //@ts-ignore
        expect(cExPanel.title.string).toBe('456');
        //@ts-ignore
        let balanceLabel = cExPanel.balanceLabel = new Label();
        //@ts-ignore
        let creditLabel = cExPanel.creditLabel = new Label();
        //@ts-ignore
        let exchangeLabel = cExPanel.exchangeLabel = new Label();
        //@ts-ignore
        let creditTitle = cExPanel.creditTitle = new Label();
        //@ts-ignore
        let exchangeTitle: Label = cExPanel.exchangeTitle = new Label();
        //@ts-ignore
        let submitButton: Button = cExPanel.submitButton = new Button();
        //@ts-ignore
        let autoExchangeToggle: Toggle = cExPanel.autoExchangeToggle = new Toggle();
        //@ts-ignore
        let autoExchangeTooltip = cExPanel.autoExchangeTooltip = new Label();
        autoExchangeTooltip.node.parent = new Node();
        
        cExPanel.balance = 1001;
        //@ts-ignore
        const { exchangePanel, exchangeInfo } = cExPanel;
        expect(exchangePanel.balance).toBe(exchangeInfo.balance);

        cExPanel.credit = 50;
        expect(exchangePanel.credit).toBe(exchangeInfo.credit);

        cExPanel.creditTitleText = 'Credit';
        expect(cExPanel.creditTitleText).toBe(creditTitle.string);
        
        cExPanel.exchangeTitleText = 'Exchange';
        expect(cExPanel.exchangeTitleText).toBe(exchangeTitle.string);

        cExPanel.exchange = 100;
        expect(cExPanel.exchange).toBe(exchangePanel.exchange);

        cExPanel.isAutoExchange = true;
        expect(autoExchangeToggle.isChecked).toBeTruthy;
        expect(dataElements.isAuto).toBeTruthy;

        //@ts-ignore
        let autoExchangeLabelOff = cExPanel.autoExchangeLabelOff = new Label();
        //@ts-ignore
        let autoExchangeLabelOn = cExPanel.autoExchangeLabelOn = new Label();
        cExPanel.autoExchangeLabelText = 'autoText';
        expect(autoExchangeLabelOff.string).toBe('autoText');
        expect(autoExchangeLabelOff.string).toBe(autoExchangeLabelOn.string);
        

        cExPanel.autoExchangeTooltipText = 'autoExchangeTooltipText';
        expect(autoExchangeTooltip.string).toBe('autoExchangeTooltipText');
        let values = ['1', '2', '3'];
        let quickExBar = [ new Node(), new Node(), new Node() ];
        let quickExBarLabels = [ new Label(), new Label(), new Label() ];
        //@ts-ignore
        cExPanel.quickExBar = quickExBar;
        //@ts-ignore
        cExPanel.quickExBarLabels = quickExBarLabels;

        cExPanel.updateQuickExchangeBar(values);
        
        values.forEach((value, index) => {
            expect(quickExBarLabels[index].string).toBe(value);
            expect(values[index]).toBe(value);
        })
        cExPanel.betBase = '1:1';
        cExPanel.exchange = 50;
        cExPanel.creditExchange();
        expect(submitButton.enabled).toBeFalsy;
        cExPanel.dataUpdate({
            credit: 500,
            balance: 5000,
            base: '1:1',
            betBase: '1:1'
        });
        await UtilsKit.Defer(0);
        expect(cExPanel.credit).toBe(500);
        //@ts-ignore
        cExPanel.clear();
        expect(cExPanel.exchange).toBe(0);
        cExPanel.addExchange(10);
        await UtilsKit.Defer(0);
        expect(cExPanel.exchange).toBe(10);


        expect(cExPanel.event).toBe(exchangePanel.event);

        //@ts-ignore
        cExPanel.exchangeInfo = {
            balance: 49999,
            base: '1:1',
            betBase: "1:1"
        }
        //@ts-ignore
        cExPanel.start();
        //@ts-ignore
        expect(cExPanel.exchangePanel.balance).toBe(49999);
        // transCredit
        expect(cExPanel.transCredit).toBe(0);
        expect(cExPanel.transCredit = 100).toBe(100);
        
        expect(cExPanel.base = "1:10").toBe("1:10");

        expect(cExPanel.amount = 10).toBe(10);

        cExPanel.transCredit = 0;
        cExPanel.amount = 0;
        //@ts-ignore
        expect(cExPanel.exchangeInfo.washInfo).toBeUndefined;
        expect(cExPanel.amount).toBe(0);

        cExPanel.amount = 10;
        //@ts-ignore
        expect(cExPanel.exchangeInfo.washInfo.transCredit).toBe(0);

        expect(cExPanel.balanceTitleText).toBeUndefined;
        let balanceTitle = new Label();
        //@ts-ignore
        cExPanel.balanceTitle = balanceTitle;
        balanceTitle.string = 'balanceTitle';
        expect(cExPanel.balanceTitleText).toBe('balanceTitle');
        expect(cExPanel.balanceTitleText = 'balanceTitle_set').toBe('balanceTitle_set');

        expect(cExPanel.balance = 1234).toBe(cExPanel.balance);

        cExPanel.autoExchangeLabelText = 'auto exchange label text';
        
        expect(cExPanel.autoExchangeLabelText).toBe(autoExchangeLabelOff.string);

        expect(cExPanel.autoExchangeLabelText).toBe(autoExchangeLabelOn.string);
        //@ts-ignore
        cExPanel.autoExchangeLabelOff = null;

        cExPanel.autoExchangeLabelText = 'testing remove off';
        expect(cExPanel.autoExchangeLabelText).toBe(autoExchangeLabelOn.string);

        //@ts-ignore
        cExPanel.autoExchangeLabelOn = null;
        cExPanel.autoExchangeLabelText = 'testing remove off & on';
        expect(cExPanel.autoExchangeLabelText).toBe('');
        //@ts-ignore
        expect(cExPanel.submitButtonText).toBeUndefined;
        let submitButtonLabel = new Label();
        //@ts-ignore
        cExPanel.submitButtonLabel = submitButtonLabel;
        //@ts-ignore
        cExPanel.submitButtonText = 'Submit_Button';
        //@ts-ignore
        expect(submitButtonLabel.string).toBe(cExPanel.submitButtonText);

    })
    test('CocosExchangePanel init', async () => {
        let cExPanel = new CocosExchangePanel();
        let autoExchangeTooltip = new Label();
        //@ts-ignore
        autoExchangeTooltip.node.parent = new Node();
        let autoTipButton = new Node();
        //@ts-ignore
        cExPanel.resetButton = new Button();
        //@ts-ignore
        cExPanel.autoExchangeTooltip = autoExchangeTooltip;
        //@ts-ignore
        cExPanel.exchangeInvalidFeedback = new Label();
        //@ts-ignore
        cExPanel.exchangeInvalidFeedback.node.parent = new Node();
        //@ts-ignore
        cExPanel.backdrop = new Node();
        //@ts-ignore
        cExPanel.autoExchangeToggle = new Toggle();
        //@ts-ignore
        cExPanel.autoTipButton = autoTipButton;
        let values = ['1', '2', '3'];
        let quickExBar = [ new Node(), new Node(), new Node() ];
        let quickExBarLabels = [ new Label(), new Label(), new Label() ];
        //@ts-ignore
        cExPanel.quickExBar = quickExBar;
        //@ts-ignore
        cExPanel.quickExBarLabels = quickExBarLabels;
        //@ts-ignore
        cExPanel.setup();
        //@ts-ignore
        cExPanel.onLoad();
        await new Promise((resolve) => {
            autoTipButton.on(Button.EventType.CLICK, () => resolve(true));
            autoTipButton.emit(Button.EventType.CLICK);
        });
        expect(autoExchangeTooltip.node.parent.active).toBe(true);

        //ACTIVE_IN_HIERARCHY_CHANGED 
        const Event = Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED;
        cExPanel.node.active = false;
        let result = await new Promise((resolve) => {
            cExPanel.node.on(Event, () => resolve(true));
            cExPanel.node.emit(Event);
        });
        
        //@ts-ignore
        expect(cExPanel.exchangePanel.isShow).toBe(false);

        cExPanel.node.active = true;
        result = await new Promise((resolve) => {
            cExPanel.node.on(Event, () => resolve(true));
            cExPanel.node.emit(Event);
        });

        //@ts-ignore
        expect(cExPanel.exchangePanel.isShow).toBe(cExPanel.isShow);
        //@ts-ignore
        expect(cExPanel.exchangePanel.exBalance).toBe(cExPanel.exBalance);
        //@ts-ignore
        expect(cExPanel.exchangePanel.nowMaxChange).toBe(cExPanel.nowMaxChange);
        //@ts-ignore
        expect(cExPanel.exchangePanel.event).toBe(cExPanel.event);

        //@ts-ignore
        cExPanel.onLoad();

    })
    test('exchangePanel adapter', async () => {
        let cExPanel = new CocosExchangePanel();
        let panel = {
            updateDisplay: jest.fn(),
            creditExchange: jest.fn(),
            balanceExchange: jest.fn(),
            changeRatio: jest.fn(),
            leaveGame: jest.fn(),
            maxChange: jest.fn(),
            addExchange: jest.fn(),
            getChangeCredit: jest.fn()
        };
        //@ts-ignore
        cExPanel.exchangePanel = panel;

        cExPanel.getChangeCredit(50, '1:1', "1:1");
        expect(panel.getChangeCredit).toHaveBeenCalled();

        cExPanel.addExchange(50);
        expect(panel.addExchange).toHaveBeenCalled();

        cExPanel.maxChange();
        expect(panel.maxChange).toHaveBeenCalled();

        expect(cExPanel.node.active).toBeFalsy;
        cExPanel.show();
        expect(cExPanel.node.active).toBeTruthy;
        cExPanel.close();
        expect(cExPanel.node.active).toBeFalsy;
        
        cExPanel.betBase = '1:1';
        cExPanel.exchange = 50;
        cExPanel.creditExchange();
        expect(panel.creditExchange).toHaveBeenCalled();

        cExPanel.balanceExchange();
        expect(panel.balanceExchange).toHaveBeenCalled();

        cExPanel.changeRatio('1:1');
        expect(panel.changeRatio).toHaveBeenCalled();

        cExPanel.leaveGame();
        expect(panel.leaveGame).toHaveBeenCalled();

        cExPanel.updateUserAutoExchange({ IsAuto: true, Credit: 0, BetBase: '1:1', Record: null })
        expect(cExPanel.isAutoExchange).toBeTruthy;



    });

});

describe('AutoSetPanel', () => {
    beforeEach(() => {

    })
    test('🐶 Testing AutoSetPanel', () => {
        let autoSetPanel: AutoSetPanel = new AutoSetPanel();
        //@ts-ignore
        autoSetPanel.titleText = '1234';
        //@ts-ignore
        expect(autoSetPanel.titleText).toBe('');
        //@ts-ignore
        autoSetPanel.title = new Label();

    });
})
describe('BetSetPanel', () => {

    test('🐶 Testing BetSetPanel', () => {
        let betSetPanel: BetSetPanel = new BetSetPanel();
        //@ts-ignore
        expect(betSetPanel.titleText = "1234").toBe('1234');
        // @ts-ignore
        let title = betSetPanel.title;
        // @ts-ignore
        betSetPanel.title = null
        //@ts-ignore
        betSetPanel.titleText = "1234"
        //@ts-ignore
        expect(betSetPanel.titleText).toBe("");
        // @ts-ignore
        betSetPanel.title = betSetPanel.title;
        // setup 1.
        betSetPanel.onLoad();
        // @ts-ignore
        betSetPanel.tooglePrefab = Node;
        
        betSetPanel.arrBet = [1, 2, 3];

        betSetPanel.currentBet = 2;

        expect(betSetPanel.currentBet).toBe(2);

        betSetPanel.next();
        // @ts-ignore
        expect(betSetPanel.toggleIndex).toBe(2);

        betSetPanel.previous();
        // @ts-ignore
        expect(betSetPanel.toggleIndex).toBe(1);

        betSetPanel.previous();
        betSetPanel.previous();
        // @ts-ignore
        expect(betSetPanel.toggleIndex).toBe(2);
        betSetPanel.next();
        // @ts-ignore
        expect(betSetPanel.toggleIndex).toBe(0);

        let toggle: Toggle = new Toggle();
        // @ts-ignore
        betSetPanel.clickToggle(toggle, "1");

    });
});