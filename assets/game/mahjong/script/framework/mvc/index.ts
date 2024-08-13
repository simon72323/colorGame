export const MVCVersion = '1.0.0a';
import { WebSocketCore, WebSocketCoreEvent, WebsocketCoreConfig } from './src/connection/ws/WebSocketCore';
import { Receive } from './src/connection/connector/receive/Receive';
import { IfController, Controller } from './src/mvc/controller/Controller';
import { Model } from './src/mvc/model/Model';
import { IfDataModel, DataModel } from './src/mvc/model/DataModel';
import { IfCasinoView, View } from './src/mvc/view/View';
import {
    Error_Result,
    onBalanceExchange,
    onBeginGame,
    onCreditExchange,
    onGetMachineDetail,
    onHitJackpot,
    WinJPType,
    onLogin,
    onLoadInfo,
    onTakeMachine,
    updateJP
} from './src/connection/connector/data/Receive';

import { CommandEventName, CommandEventMap, IfCommand } from './src/interface/Command';
import { IfToolBar, ToolbarEventMap, ToolBarEventName } from './src/interface/Toolbar';
import { IfCostume, CostumeEventMap, CostumeEventName } from './src/interface/Costume';
import { ExchangePanelEventName, IfExchangePanel, ExchangePanelEventMap, ExchangePanelEventDispatcher, ExchangeInfo, AbstractExchangePanel } from './src/interface/Exchange';
import { IfAlertPanel, AlertOptions, AlertPanelEventMap } from './src/interface/Alert';
import { BaseSeverEventMap } from './src/connection/connector/receive/SeverAction';

export {
    WebSocketCore,
    Receive,
    DataModel,
    Controller,
    Model,
    View,
    CommandEventName,
    CostumeEventName,
    ToolBarEventName,
    ExchangePanelEventName, AbstractExchangePanel, ExchangePanelEventDispatcher
};

export type {
    WebSocketCoreEvent,
    WebsocketCoreConfig,
    IfController,
    IfDataModel,
    IfCasinoView,
    Error_Result,
    onBalanceExchange,
    onBeginGame,
    onCreditExchange,
    onGetMachineDetail,
    onHitJackpot,
    WinJPType,
    onLogin,
    onLoadInfo,
    onTakeMachine,
    updateJP,
    CommandEventMap, IfCommand,
    IfCostume, CostumeEventMap,
    ToolbarEventMap, IfToolBar,
    ExchangePanelEventMap, ExchangeInfo, IfExchangePanel,
    IfAlertPanel, AlertOptions,
    AlertPanelEventMap,
    BaseSeverEventMap
}

