import { _decorator, Component, Node, Animation, EventHandler, Button, tween, Vec3, Toggle, sp, Label, Tween, UIOpacity, Prefab, UITransform, Sprite, LightingStage } from 'cc';
import Poolhandler from '../../../../common/script/tools/PoolHandler';
import { demoInfo_TA } from './demoInfo_TA';
import { symbolResource_TA } from './symbolResource_TA';
import { symbolSetting_TA } from './symbolSetting_TA';
import { symbolSet_TA } from './symbolSet_TA';
import { symbolWin_TA } from './symbolWin_TA';

const { ccclass, property } = _decorator;

@ccclass('mahjong_TA')
export class mahjong_TA extends Component {
    //按鈕相關
    @property({ type: Node, tooltip: "spin按鈕" })
    private btnSpin: Node = null;
    @property({ type: Node, tooltip: "stop按鈕" })
    private btnStop: Node = null
    @property({ type: Node, tooltip: "自動按鈕停止" })
    private btnAutoStop: Node = null;
    @property({ type: Node, tooltip: "閃電按鈕(關閉狀態)" })
    private btnFastOff: Node = null;
    @property({ type: Node, tooltip: "閃電按鈕(開啟狀態)" })
    private btnFastOn: Node = null;
    @property({ type: Button, tooltip: "自動按鈕" })
    private btnAuto: Button = null;
    @property({ type: Button, tooltip: "下注加分按鈕" })
    private betAdd: Button = null;
    @property({ type: Button, tooltip: "下注減分按鈕" })
    private betLess: Button = null;
    @property({ type: Button, tooltip: "設置選單按鈕" })
    private btnSetting: Button = null;

    //主要介面
    @property({ type: Node, tooltip: "slot主界面" })
    private slotGameUI: Node = null;
    @property({ type: Node, tooltip: "symbol勝利動畫層" })
    private symbolWinLayer: Node = null;
    @property({ type: [Node], tooltip: "slot轉動層" })
    private slotRun: Node[] = [];
    @property({ type: Node, tooltip: "slot遮黑層" })
    private slotBlack: Node = null;
    @property({ type: Node, tooltip: "slot聽牌層" })
    private slotListen: Node = null;
    @property({ type: Node, tooltip: "大獎跑分層" })
    private bigWin: Node = null;
    @property({ type: Node, tooltip: "free紀錄顯示" })
    private freeGet: Node = null;
    @property({ type: Node, tooltip: "花牌置牌區" })
    private flowerArea: Node = null;
    @property({ type: Node, tooltip: "碰/槓/眼睛置牌區" })
    private setArea: Node = null;
    @property({ type: Prefab, tooltip: "牌型prefab" })
    private symbolSet: Prefab = null;
    @property({ type: [Node], tooltip: "牌型顯示(0=free，1=花，2=槓，3=碰，4=碰，5=碰)" })
    private fontType: Node[] = [];
    //stateName對應typeState位置(表演資料對應用)
    private stateNameID = {
        'free': 0,
        'flower': 1,
        'kong': 2,
        'pong': 3,
    }
    // @property({ type: Node, tooltip: "聽牌金幣特效" })
    // private readyCoinFx: Node = null;
    @property({ type: Node, tooltip: "胡牌結算畫面" })
    private result: Node = null;
    @property({ type: Node, tooltip: "胡牌結算得分顯示" })
    private resultWinScore: Node = null;
    // @property({ type: Node, tooltip: "按鈕操作區" })
    // private controlBtns: Node = null;


    //免費遊戲相關介面
    @property({ type: Node, tooltip: "免費遊戲獲得" })
    private freeGameGet: Node = null;
    @property({ type: Node, tooltip: "免費遊戲結算" })
    private totalWin: Node = null;
    @property({ type: Node, tooltip: "免費遊戲上方背景圖" })
    private freeTopBg: Node = null;
    @property({ type: Node, tooltip: "免費遊戲剩餘次數介面" })
    private freeGameTimes: Node = null;
    // @property({ type: Node, tooltip: "免費遊戲背景" })
    // private freeGameBg: Node = null;
    scatterSym: Node[] = [];//中獎的free符號節點

    //分數相關
    @property({ type: Label, tooltip: "玩家分數" })
    private userCashLabel: Label = null;
    @property({ type: Node, tooltip: "目前倍率" })
    private multiple: Node = null;
    // @property({ type: Node, tooltip: "贏得分數資訊" })
    // public winScoreInfo: Node = null;
    @property({ type: Node, tooltip: "共贏得分數資訊" })
    private winTotalScoreInfo: Node = null;

    //時間參數
    private slotRunSpeed: number = 0.4;//slot轉動速度時間
    private scheduleStartTime: number = 0.1;//slot依序表演的間隔時間
    private scheduleStopTime: number = 0.2;//依序停止的間隔時間
    private fastStopTime: number = 0.6;//閃電模式，開始轉動後等待停止的時間
    private stopTime: number = 1;//開始轉動後等待停止的時間
    // private lineTime: number = 2;//中獎表演停留時間(全線跟單線一致)
    private listenTime: number = 2.5;//轉動聽牌時間
    private dropListenTime: number = 1.5;//掉落聽牌時間
    private runScoreTime: number = 10;//跑分時間(最多)


    //遊戲模式設置
    private freeGameMode: boolean = false;//免費遊戲:一般模式
    private autoGameMode: boolean = false;//自動遊戲模式狀態
    private fastMode: boolean = false;//閃電模式狀態

    //其他
    // private symbolShark: boolean = false;//symbol抖動狀態
    private userCash: number = 0;//玩家分數
    // private scoreWinNum: number = 0;//分數跑分分數
    private autoGameRound: number = 0;//自動遊戲回合
    // private autoTimesSetting = [10, 30, 50, 80, 100];
    private bigWinMultiple = [20, 40, 70, 100];//切換bigWin的分數倍率
    private bigWinSpineAnimName = ['win', 'big_win', 'mega_win', 'super_win'];//bigWinSpine動態名稱
    private myPool: Poolhandler = null;//創建物件池
    private symbolHeight = 260;//此款遊戲的symbol欄位高度
    private stopSlot: boolean[] = [false, false, false, false, false];//每段slot停止狀態
    // private nowSlotNumber: number[] = [];//目前盤面的Symbol編號(25組)
    private gameRound: number = 0;//紀錄遊戲目前demo回合(第0局開始)
    private hideSlot: number[] = [0, 0, 0, 0, 0];//掉落前的各symbol隱藏數量(用來判斷該行是否判斷掉落跟聽牌)
    private multipleNum = 0;//紀錄目前倍率
    private pointNum = 0;//紀錄目前台數
    private multipleLevel = 0;//紀錄基數等級
    private multipleBase: number[] = [0.2, 0.6, 1.8, 5.8, 12.4];//基數倍率

    //腳本連結
    @property({ type: demoInfo_TA, tooltip: "demo內容腳本" })
    private demoInfoTA: demoInfo_TA = null;
    @property({ type: symbolResource_TA, tooltip: "symbol資源" })
    private symbolResourceTA: symbolResource_TA = null;

    onLoad() {
        //按鈕觸發設置
        const thisScriptName = this.name.split('<')[1].split('>')[0];
        //spin按鈕
        const spinBtnEventHandler = new EventHandler();
        spinBtnEventHandler.target = this.node;
        spinBtnEventHandler.component = thisScriptName;
        spinBtnEventHandler.handler = 'clickSpin';
        this.btnSpin.getComponent(Button).clickEvents.push(spinBtnEventHandler);

        //stop按鈕
        const stopBtnEventHandler = new EventHandler();
        stopBtnEventHandler.target = this.node;
        stopBtnEventHandler.component = thisScriptName;
        stopBtnEventHandler.handler = 'stopGameSlotRunNow';
        this.btnStop.getComponent(Button).clickEvents.push(stopBtnEventHandler);

        //fast按鈕(關閉)
        const fastBtnOffEventHandler = new EventHandler();
        fastBtnOffEventHandler.target = this.node;
        fastBtnOffEventHandler.component = thisScriptName;
        fastBtnOffEventHandler.handler = 'fastSlotOn';
        this.btnFastOff.getComponent(Button).clickEvents.push(fastBtnOffEventHandler);

        //fast按鈕(開啟)
        const fastBtnOnEventHandler = new EventHandler();
        fastBtnOnEventHandler.target = this.node;
        fastBtnOnEventHandler.component = thisScriptName;
        fastBtnOnEventHandler.handler = 'fastSlotOff';
        this.btnFastOn.getComponent(Button).clickEvents.push(fastBtnOnEventHandler);

        //停止自動遊戲按鈕
        const stopAutoBtnEventHandler = new EventHandler();
        stopAutoBtnEventHandler.target = this.node;
        stopAutoBtnEventHandler.component = thisScriptName;
        stopAutoBtnEventHandler.handler = 'stopAutoGame';
        this.btnAutoStop.getComponent(Button).clickEvents.push(stopAutoBtnEventHandler);

        //配置初始牌面
        const initSymbol = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 43, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
        const slotLength = this.slotRun.length;//slot行數
        for (let i = 0; i < slotLength; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 5; k++) {
                    const instsymbol = this.myPool.get(this.symbolResourceTA.symbolNode);//生成symbolNode物件池內容
                    instsymbol.parent = this.slotRun[i].children[j];
                    const symID = initSymbol[i * slotLength + k];
                    instsymbol.getComponent(symbolSetting_TA).resetSymbol(symID);//設置symbol初始值
                }
            }
            this.slotRun[i].children[2].active = false;//隱藏下層
        }
    }

    //-------------------按鈕事件觸發-------------------/
    //閃電加速開啟
    fastSlotOn() {
        this.fastMode = true;
        this.listenTime = 1.5;//聽牌時間2秒
        this.dropListenTime = 1;//下落聽牌時間
        this.btnFastOn.active = true;
        this.btnFastOff.active = false;
    }
    //閃電加速關閉
    fastSlotOff() {
        this.fastMode = false;
        this.listenTime = 2.5;//聽牌時間3秒
        this.dropListenTime = 1.5;//下落聽牌時間
        this.btnFastOn.active = false;
        this.btnFastOff.active = true;
    }
    //開始自動遊戲
    startAutoGame() {
        this.autoGameMode = true;//啟用自動模式
        this.btnAutoStop.active = true;//顯示自動停止按鈕
        this.btnSpin.active = false;//隱藏spin按鈕
        this.startGameSlotRun();//開始spin轉動
        this.autoGameRound--;
        this.btnAutoStop.children[0].getChildByName('label').getComponent(Label).string = this.autoGameRound.toString();
    }
    //停止自動遊戲
    stopAutoGame() {
        this.autoGameMode = false;//關閉自動模式
        this.btnAutoStop.active = false;//隱藏自動停止按鈕
        this.btnSpin.active = true;//顯示spin按鈕
        //如果自動按鈕是啟用狀態，且spin按鈕未啟用狀態，才啟用spin按鈕
        if (this.btnAuto.interactable && !this.btnSpin.getComponent(Button).interactable)
            this.btnSpin.getComponent(Button).interactable = true;//啟用spin按鈕
    }
    //開始spin轉動
    clickSpin() {
        this.startGameSlotRun();
    }
    //遊戲立即停止(按鍵觸發)
    stopGameSlotRunNow() {
        this.btnStop.active = false;
        //隱藏聽牌物件
        for (let i = 0; i < this.slotListen.children.length; i++) {
            this.listenHide(i);//聽牌特效淡出(slotLine)
        }
        this.unscheduleAllCallbacks();//停止所有計時器
        for (let i = 0; i < this.stopSlot.length; i++) {
            //如果有未執行停止轉動的才執行停止slot
            if (!this.stopSlot[i])
                this.stopSlotRun(i);//停止slot轉動(排除已停止的slot)
        }
    }
    //-------------------按鈕事件觸發-------------------/

    //-------------------主要slot流程-----------------------/
    //開始遊戲slot轉動
    startGameSlotRun() {
        this.gameRound++;//表演回合+1
        if (this.gameRound > this.demoInfoTA.demoRound - 1)
            this.gameRound = 0;//演示回合0
        for (let i = 0; i < this.stopSlot.length; i++) {
            this.stopSlot[i] = false;
        }
        this.btnStop.active = true;//顯示停止按鈕
        this.btnSetting.interactable = false;//禁用設置按鈕
        this.btnAuto.interactable = false;//禁用自動按鈕
        this.betAdd.interactable = false;//禁用下注加分按鈕
        this.betLess.interactable = false;//禁用下注減分按鈕
        this.winTotalScoreInfo.active = false;//隱藏共贏得資訊
        this.btnSpin.getComponent(Animation).getState('btnSpinRotate').speed = 4;//加速旋轉
        this.btnSpin.getChildByName('loopFx').active = true;//顯示旋轉狀態
        this.multipleNum = 0;//倍率回歸
        this.pointNum = 0;//台數回歸
        this.multipleLevel = 0;//基數回歸
        this.multiple.getChildByName('label').getComponent(Label).string = "";//清空倍率
        //執行slot轉動
        if (this.fastMode) {
            //起始同時轉動
            for (let i = 0; i < this.slotRun.length; i++) {
                this.startSlotRun(i);
            }
            //等待轉動時間結束
            this.scheduleOnce(() => {
                this.waitGameStopSlot(0, 0.01);//等待遊戲依序停止(哪行slot,等待停止時間)
            }, this.fastStopTime)
        } else {
            //起始依序轉動
            let i = 0;
            this.schedule(() => {
                this.startSlotRun(i);
                i++;
            }, this.scheduleStartTime, this.slotRun.length - 1, 0.01)
            //等待轉動時間結束
            this.scheduleOnce(() => {
                this.waitGameStopSlot(0, this.scheduleStopTime);//等待遊戲依序停止(哪行slot,等待停止時間)
            }, this.stopTime)
        }
    }

    //等待遊戲依序停止(哪行slot,等待停止時間)
    waitGameStopSlot(slotLine: number, time: number) {
        //如果此行聽牌狀態未顯示，正常停止此行slot
        if (!this.slotListen.children[slotLine].active)
            this.stopSlotRun(slotLine);
        if (slotLine === this.slotRun.length - 1)
            return;//最後一行不執行聽牌判斷
        this.scatterSave(slotLine);//紀錄中獎scatter
        let readyTime = 0;//等待聽牌時間
        //scatter數量>=2時
        if (this.scatterSym.length >= 2) {
            readyTime = this.listenTime;
            this.scheduleOnce(() => {
                this.creatScatter();//生成scatter聽牌物件
                this.listenLoopSlot(slotLine + 1);//執行減速聽牌(哪行slot)
            }, this.slotRunSpeed)
        }
        this.scheduleOnce(() => {
            slotLine++;//執行下一行slot
            this.waitGameStopSlot(slotLine, time);//再次執行遊戲依序停止(下行slot)
        }, time + readyTime)
    }

    //開始轉動slot(哪行slot)
    startSlotRun(slotLine: number) {
        const slotRunLine = this.slotRun[slotLine];//該行slotRun
        slotRunLine.children[2].active = true;//顯示下層
        const slotRunLineHeight = slotRunLine.getComponent(UITransform).height;//行高
        const downPos = new Vec3(slotRunLine.position.x, -slotRunLineHeight, 0);//移到下方位置
        tween(slotRunLine).to(this.slotRunSpeed, { position: downPos }, { easing: "cubicIn" })
            .call(() => {
                this.loopSlotRun(slotLine);//執行循環轉動
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < slotRunLine.children[i].children.length; j++) {
                        slotRunLine.children[i].children[j].getComponent(symbolSetting_TA).blurShow();//顯示模糊漸變
                    }
                }
            })
            .tag(slotLine).start();
    }

    //循環轉動slot(哪行slot)
    loopSlotRun(slotLine: number) {
        //設置隨機上中下的數值(先預設固定值)
        const slotRunLine = this.slotRun[slotLine];//該行slotRun
        const slotRunLineHeight = slotRunLine.getComponent(UITransform).height;//行高
        const upPos = new Vec3(slotRunLine.position.x, slotRunLineHeight, 0);//移到上方位置
        const downPos = new Vec3(slotRunLine.position.x, -slotRunLineHeight, 0);//移到下方位置
        const symbolAmount = slotRunLine.children[1].children.length;//該行symbol數量
        //檢查如果symbol節點有隱藏的，需重新顯示(因為此遊戲會有空牌狀態)
        for (let i = 0; i < symbolAmount; i++) {
            if (!slotRunLine.children[1].children[i].active)
                slotRunLine.children[1].children[i].active = true;
        }
        this.setSymbolImage(slotRunLine.children[1], this.randomSymbolNum(symbolAmount));//設置正symbol圖案(隨機)
        slotRunLine.position = upPos;//每次循環時會回到上面
        let changeSymbol = true;//等待上下換圖
        tween(slotRunLine).to(this.slotRunSpeed, { position: downPos }, {
            onUpdate: () => {
                //轉到一半時，設置上下symbol圖案一致(隨機)
                if (slotRunLine.position.y < 0 && changeSymbol) {
                    changeSymbol = false;
                    const randomData = this.randomSymbolNum(symbolAmount);
                    this.setSymbolImage(slotRunLine.children[0], randomData);//設置上symbol圖案(隨機一致)
                    this.setSymbolImage(slotRunLine.children[2], randomData);//設置下symbol圖案(隨機一致)
                }
            }
        }).call(() => {
            this.loopSlotRun(slotLine);//持續轉動
        }).tag(slotLine).start();
    }

    //停止轉動slot(哪行slot)
    stopSlotRun(slotLine: number) {
        Tween.stopAllByTag(slotLine);//停止一般loop輪盤轉動
        this.stopSlot[slotLine] = true;//設定該行已執行停止轉動
        const slotRunLine = this.slotRun[slotLine];//該行slotRun
        const xPos = slotRunLine.position.x;
        const slotRunLineHeight = slotRunLine.getComponent(UITransform).height;//行高
        const upPos = new Vec3(xPos, slotRunLineHeight, 0);//移到上方位置
        const endingPos = new Vec3(xPos, -30, 0);//移到停止超出位置
        const endPos = new Vec3(xPos, 0, 0);//移到停止位置
        const symbolAmount = slotRunLine.children[1].children.length;//該行symbol數量
        const slotSymbolNumber = this.demoInfoTA.symData[this.gameRound].slotNumber[0];//設置本回合各slot的symbol停止編號
        const symbolNumber = slotSymbolNumber.slice(symbolAmount * slotLine, symbolAmount * (slotLine + 1));//該行的symbol停止編號
        this.setSymbolImage(slotRunLine.children[1], symbolNumber);//設置正symbol圖案(結果)
        slotRunLine.position = upPos;//slot回歸到上面
        this.blurSFReset(slotRunLine);//轉換為正常貼圖
        tween(slotRunLine).to(this.slotRunSpeed - 0.1, { position: endingPos }, { easing: 'cubicOut' })
            .call(() => {
                //播放回彈音效
            })
            .then(tween(slotRunLine).to(0.1, { position: endPos }))
            .call(() => {
                this.endSlot(slotLine);//結束slot轉動時執行(哪行slot)
            }).start();
    }

    //scatter節點紀錄(哪行slot)
    scatterSave(slotLine: number) {
        const mainSlotRun = this.slotRun[slotLine].children[1];
        //每行第一個資料不判斷
        for (let i = 1; i < mainSlotRun.children.length; i++) {
            if (mainSlotRun.children[i].getComponent(symbolSetting_TA).symID === 43)
                this.scatterSym.push(mainSlotRun.children[i]);//儲存scatter節點
        }
    }

    //生成scatter聽牌物件
    creatScatter() {
        for (let i = 0; i < this.scatterSym.length; i++) {
            //生成過的話就不生成(子物件數量跟生成數量相比)
            if (this.symbolWinLayer.children.length < i + 1) {
                const instScatter = this.myPool.get(this.symbolResourceTA.symbolWin);//生成中獎symbol物件池內容
                instScatter.parent = this.symbolWinLayer;//設置父節點
                instScatter.getComponent(symbolWin_TA).setSymbolWinData(43, true, this.scatterSym[i]);//設置symbolWin編號(symID，聽牌狀態，輪軸的symbol節點)
            }
        }
    }

    //聽牌特效淡入顯示(哪行slot)
    listenShow(slotLine: number, hideTime: number) {
        const slotListen = this.slotListen.children[slotLine];
        slotListen.getComponent(UIOpacity).opacity = 0;
        slotListen.active = true;//顯示第N行聽牌特效
        tween(slotListen.getComponent(UIOpacity)).to(0.2, { opacity: 255 }).start();//淡入
        this.scheduleOnce(() => {
            this.listenHide(slotLine);//隱藏聽牌
        }, hideTime)
    }

    //聽牌特效淡出(哪行slot)
    listenHide(slotLine: number) {
        const slotListen = this.slotListen.children[slotLine];
        tween(slotListen.getComponent(UIOpacity)).to(0.2, { opacity: 0 }).call(() => {
            slotListen.active = false;//隱藏聽牌特效
        }).start();//淡出
    }

    //執行聽牌loop依序減速並停止轉動(哪行slot)
    listenLoopSlot(slotLine: number) {
        Tween.stopAllByTag(slotLine);//停止一般loop輪盤轉動
        this.listenShow(slotLine, this.listenTime);//聽牌特效淡入顯示(slotLine)
        const slotRunLine = this.slotRun[slotLine];//該行slotRun
        const time = [0.1, 0.13, 0.16, 0.19];//loop依序減速的時間百分比(2段時間一組)
        let timeStep = 0;//陣列時間段
        const xPos = slotRunLine.position.x;
        const slotRunLineHeight = slotRunLine.getComponent(UITransform).height;//行高
        const upPos = new Vec3(xPos, slotRunLineHeight, 0);//移到上方位置
        const downPos = new Vec3(xPos, -slotRunLineHeight, 0);//移到下方位置
        const endingPos = new Vec3(xPos, -30, 0);//移到停止超出位置
        const endPos = new Vec3(xPos, 0, 0);//移到停止位置
        const symbolAmount = slotRunLine.children[1].children.length;//該行symbol數量
        const slowSlot = () => {
            this.setSymbolImage(slotRunLine.children[1], this.randomSymbolNum(symbolAmount));//設置正symbol圖案(隨機)
            slotRunLine.position = upPos;//每次循環時會回到上面
            tween(slotRunLine).to(this.listenTime * time[timeStep], { position: endPos })
                .call(() => {
                    timeStep++;//表演時間段+1
                    const randomData = this.randomSymbolNum(symbolAmount);
                    this.setSymbolImage(slotRunLine.children[0], randomData);//設置上symbol圖案(隨機一致)
                    this.setSymbolImage(slotRunLine.children[2], randomData);//設置下symbol圖案(隨機一致)
                    tween(slotRunLine).to(this.listenTime * time[timeStep], { position: downPos })
                        .call(() => {
                            timeStep++;//表演時間段+1
                            if (timeStep < time.length)
                                slowSlot.bind(this)();//再次轉動
                            else {
                                //執行減速停止轉動
                                const slotSymbolNumber = this.demoInfoTA.symData[this.gameRound].slotNumber[0];//設置本回合各slot的symbol停止編號
                                const symbolNumber = slotSymbolNumber.slice(symbolAmount * slotLine, symbolAmount * (slotLine + 1));//該行的symbol停止編號
                                this.setSymbolImage(slotRunLine.children[1], symbolNumber);//設置正symbol圖案(結果)
                                slotRunLine.position = upPos;//slot回歸到上面
                                this.blurSFReset(slotRunLine);//轉換為正常貼圖
                                tween(slotRunLine).to(this.listenTime * 0.36, { position: endingPos }, { easing: 'sineOut' }).then
                                    (tween(slotRunLine).to(this.listenTime * 0.06, { position: endPos }))
                                    .call(() => {
                                        this.stopSlot[slotLine] = true;//設定該行已執行停止轉動
                                        this.endSlot(slotLine);//結束slot轉動時執行(哪行slot)
                                    }).tag(slotLine).start();
                            }
                        }).tag(slotLine).start();
                }).tag(slotLine).start();
        }
        slowSlot.bind(this)();
    }

    //結束slot(哪行slot)
    endSlot(slotLine: number) {
        const slotRunLine = this.slotRun[slotLine];//該行slotRun
        slotRunLine.children[2].active = false;//隱藏下層
        this.listenHide(slotLine);//聽牌特效淡出(slotLine)
        const slotSymbolNumber = this.demoInfoTA.symData[this.gameRound].slotNumber[0];//設置本回合symbol停止編號
        const symbolAmount = slotRunLine.children[1].children.length;//該行symbol數量
        //判斷此行的symbol是否有需要提前出現的動態
        for (let i = 0; i < symbolAmount; i++) {
            if (slotSymbolNumber[symbolAmount * slotLine + i] === 43)
                slotRunLine.children[1].children[i].getComponent(symbolSetting_TA).scatterStay();//如果是scatter編號，顯示停留動態
        }
        //如果是最後一段停止，執行結果判斷
        if (slotLine === this.slotRun.length - 1)
            this.resultGameSpin();//遊戲spin結果判斷
    }

    //遊戲spin結果判斷
    resultGameSpin() {
        this.btnSpin.getComponent(Animation).getState('btnSpinRotate').speed = 1;//旋轉速度回歸
        this.btnSpin.getComponent(Button).interactable = false;//禁用spin按鈕
        this.unscheduleAllCallbacks();//停止所有計時器
        this.btnStop.active = false;//隱藏停止按鈕
        //如果最後一行聽牌結束沒有蒐集到3個free，要清除表演動態，並回歸靜態節點顯示
        this.putSymbolWinLayer();//退還所有勝利表演pool物件
        for (const data of this.scatterSym) {
            data.active = true;
            data.getComponent(symbolSetting_TA).scatterStay();//播放停留動態
        }
        if (this.autoGameRound === 0 && this.autoGameMode)
            this.stopAutoGame();//停止自動遊戲
        const symData = this.demoInfoTA.symData[this.gameRound];//該回合sym資料
        const lineAward = symData.lineAward;//中獎連線資料
        //判斷有沒有中獎
        if (lineAward.length > 0) {
            let step = 0;//紀錄要表演的中獎次數
            //中獎表演
            const lineAwardShow = () => {
                this.hideSlot = [0, 0, 0, 0, 0];//清空空缺處數量紀錄
                const slotNumber = symData.slotNumber[step];//本回合slot編號
                const typeAward = lineAward[step].typeAward;//中獎線牌型表演資料
                let typeRound = 0;//該次中獎的牌型表演回合，可能包含(free、花牌、槓、碰、眼睛等等)
                let updataAll = false;//判斷下回是否要全刷掉補牌(MG模式下有遇到3碰或4槓才會true)
                //牌型表演
                const typeAwardShow = () => {
                    this.slotBlackShow();//顯示遮黑層
                    this.putSymbolWinLayer();//退還所有勝利表演pool物件
                    //生成並表演symbol中獎
                    for (let i = 0; i < typeAward[typeRound].symPos.length; i++) {
                        for (let j = 0; j < typeAward[typeRound].symPos[i].length; j++) {
                            const pos = typeAward[typeRound].symPos[i][j];//中獎圖標位置
                            const instSymbolAnim = this.myPool.get(this.symbolResourceTA.symbolWin);//生成中獎symbol物件池內容
                            instSymbolAnim.parent = this.symbolWinLayer;//設置父節點
                            const winSymbol = this.slotRun[Math.floor(pos / 5)].children[1].children[pos % 5];//勝利的symbol節點
                            instSymbolAnim.getComponent(symbolWin_TA).setSymbolWinData(slotNumber[pos], false, winSymbol);//執行表演(symID，聽牌狀態，輪軸的symbol節點)
                        }
                    }
                    const typeName = typeAward[typeRound].name;//贏得的牌型名稱
                    const typeSymID = typeAward[typeRound].symID;//贏得的牌型symbol編號資料
                    const typeSymPos = typeAward[typeRound].symPos;//贏得的牌型symbol位置資料
                    const fontType = this.fontType[this.stateNameID[typeName]];//該回合要顯示的牌型動態
                    //顯示牌型動態(眼睛牌型除外)
                    let waitMoveTime = 1;
                    if (typeName !== 'eye')
                        if (typeName === 'free') {
                            waitMoveTime = 3;//免費遊戲獲得表演等待秒數
                            //等待一秒(free牌表演)
                            this.scheduleOnce(() => {
                                this.scheduleOnce(() => {
                                    //等待指向線特效出現
                                    if (this.freeGet.active) {
                                        this.freeGet.getComponent(Animation).play('freeGetAgain');
                                        this.freeGet.getChildByName('freeGetTx').getChildByName('label').getComponent(Label).string = '+22';
                                    }
                                    else {
                                        this.freeGet.getComponent(UIOpacity).opacity = 0;//透明度0
                                        this.freeGet.getChildByName('freeGetTx').getChildByName('label').getComponent(Label).string = '+11';
                                        this.freeGet.active = true;//顯示獲得免費遊戲紀錄
                                        this.freeGet.getComponent(Animation).play('freeGet');
                                    }
                                }, 2.2)
                                this.scatterSym = [];//清空scatter節點紀錄資料(全刷掉才要清空)
                                for (let data of this.symbolWinLayer.children) {
                                    data.getComponent(symbolWin_TA).scatterRemove();//表演scatter牌消除
                                }
                                fontType.active = true;//顯示牌型動態
                                if (this.freeGameMode) {
                                    //顯示再次獲得
                                    fontType.getChildByName('getAgain').active = true;
                                    this.scheduleOnce(() => {
                                        //等待指向線特效出現，表演加局
                                        const timesLabel = this.freeGameTimes.getChildByName('label');
                                        timesLabel.getComponent(Animation).play();//播放縮放動態
                                        timesLabel.getComponent(Label).string = (Number(timesLabel.getComponent(Label).string) + 11).toString();//剩餘次數+11局
                                    }, 2.2)
                                }
                                else
                                    fontType.getChildByName('getAgain').active = false;
                            }, 1)
                        }
                        else {
                            fontType.active = true;//顯示牌型動態
                            if (typeName == 'pong' || typeName == 'kong')
                                this.slotGameUI.getComponent(Animation).play('shark');//播放震動
                        }
                    //等待牌型表演結束後，勝利牌移到置牌區
                    this.scheduleOnce(() => {
                        this.slotBlackHide();//隱藏遮黑層
                        if (typeName !== 'free')
                            updataAll = this.winSymbolSet(typeName, typeSymID, typeSymPos);//勝利牌移到置牌區(名稱類型,勝利編號,勝利位置),回傳是否要全刷掉補牌
                        typeRound++;//牌型表演+1
                        //1秒後，判斷牌型表演結束
                        this.scheduleOnce(() => {
                            if (typeName !== 'eye')
                                fontType.active = false;//隱藏牌型動態
                            //如果牌型表演結束
                            if (typeRound === typeAward.length) {
                                this.putSymbolWinLayer();//退還所有勝利表演pool物件
                                step++;//連線表演次數+1
                                const nextSlotNumber = symData.slotNumber[step];//下一個中獎線的停止編號
                                //無symbol表演資料，直接結算
                                if (!nextSlotNumber) {
                                    this.resultGame();//執行結算
                                    return;
                                }
                                let waitReadyTime = 0;
                                //如果目前剛好有四組碰牌，表演聽(胡)牌
                                if (this.setArea.children.length === 4) {
                                    this.slotBlackShow();//顯示遮黑層
                                    this.fontType[4].active = true;//顯示聽牌
                                    this.scheduleOnce(() => {
                                        this.slotBlackHide();//隱藏遮黑層
                                    }, 1.8)
                                    waitReadyTime = 1;//因聽牌表演時間2秒，所以須多等待1秒掉牌
                                }
                                this.scheduleOnce(() => {
                                    //更新盤面(slot盤面編號，是否全刷掉)
                                    this.updataSlot(nextSlotNumber, updataAll, () => {
                                        //執行symbol掉落補牌(是否全刷掉)
                                        this.dropSymbol(() => {
                                            //掉落完畢後判斷，無中獎資料，直接結算
                                            if (!lineAward[step]) {
                                                this.resultGame();//執行結算
                                                return;
                                            }
                                            else
                                                lineAwardShow.bind(this)();//再次判斷中獎表演
                                        });
                                    })
                                }, waitReadyTime)
                            } else
                                typeAwardShow.bind(this)();//再次執行牌型表演
                        }, 1)
                    }, waitMoveTime)
                }
                typeAwardShow.bind(this)();//執行牌型表演
            }
            lineAwardShow.bind(this)();//執行中獎表演
        } else
            this.scheduleOnce(() => {
                this.scatterWinTest();//判斷是否進入免費模式
            }, 0.3)
    }

    //更新下一個盤面配置(下一個slot盤面編號，是否全刷掉)
    updataSlot(slotNumber: number[], updataAll: boolean, callback: any) {
        if (updataAll) {
            //更新下一個盤面配置_全刷掉(下一個slot盤面編號)
            this.hideSlot = [4, 4, 4, 4, 4];//全空
            const slotLength = this.slotRun.length;//slot行數
            let i = 0;
            this.schedule(() => {
                const mainSlotLine = this.slotRun[i].children[1];
                const symbolAmount = mainSlotLine.children.length;//該行symbol數量
                for (let j = 0; j < symbolAmount; j++) {
                    const moveSymbol = mainSlotLine.children[j];
                    const movePos = moveSymbol.position.y - 1590;
                    const pos = i * symbolAmount + j;
                    tween(moveSymbol).to(0.3, { position: new Vec3(0, movePos, 0) }, { easing: 'cubicIn' }).call(() => {
                        moveSymbol.position = new Vec3(0, 2470 - moveSymbol.getSiblingIndex() * this.symbolHeight, 0);
                        moveSymbol.active = true;//顯示symbol
                        moveSymbol.getComponent(symbolSetting_TA).setSymbolData(slotNumber[pos]);//設置下局的symbol(不更新位置)
                    }).start();
                }
                i++;
                if (i === slotLength) {
                    this.scheduleOnce(() => {
                        callback();
                    }, 0.3)
                }
            }, 0.05, slotLength - 1, 0.01)
        } else {
            //更新下一個盤面配置_紀錄缺口(下一個slot盤面編號)
            for (let i = 0; i < this.slotRun.length; i++) {
                const slotSymbol = this.slotRun[i].children[1];
                let moveNum = 0;//消除移動的數量
                let saveSymbol = [];//先紀錄symbol排序，因為設置siblingIndex後排序可能會抓錯
                for (const data of slotSymbol.children) {
                    saveSymbol.push(data);
                }
                //從下方開始判斷(最後一個子物件)
                for (let j = saveSymbol.length - 1; j >= 0; j--) {
                    const symNode = saveSymbol[j];
                    if (!symNode.active) {
                        this.hideSlot[i]++;//該行空缺數+1
                        moveNum++;//消除移動的數量+1
                        symNode.setSiblingIndex(0);//如果該節點隱藏，排序就要移到最上層
                        symNode.position.add(new Vec3(0, this.symbolHeight * (moveNum + j), 0));//設置上移後Y參數
                        symNode.active = true;
                    }
                }
                //再執行symbol圖案設置
                const symbolAmount = slotSymbol.children.length;//該行symbol數量
                for (let j = 0; j < symbolAmount; j++) {
                    const symID = slotNumber[symbolAmount * i + j]
                    slotSymbol.children[j].getComponent(symbolSetting_TA).setSymbolData(symID);//設置下局的symbol(不更新位置)
                }
            }
            callback();
        }
    }

    //執行下落表演(是否是全掉落，callback)
    dropSymbol(callback: any) {
        const slotLength = this.slotRun.length;//slot行數
        const drop = (slotLine: number) => {
            if (slotLine === slotLength) {
                //等待掉落完
                this.scheduleOnce(() => {
                    if (this.scatterSym.length < 3) {
                        this.putSymbolWinLayer();//退還所有勝利表演pool物件
                        for (const data of this.scatterSym) {
                            data.active = true;
                            data.getComponent(symbolSetting_TA).scatterStay();//播放停留動態
                        }
                    }
                    callback();//回傳掉落完畢
                }, 0.9);
            }
            else {
                //執行掉落表演
                const slotSymbol = this.slotRun[slotLine].children[1].children;
                for (const moveSymbol of slotSymbol) {
                    const setPos = new Vec3(0, 1170 - (this.symbolHeight * moveSymbol.getSiblingIndex()), 0);//實際放置的位置
                    const yPos = moveSymbol.position.y;
                    //判斷是否執行掉落
                    if (yPos > setPos.y) {
                        const time = 0.45 + 0.05 * (yPos - setPos.y) / this.symbolHeight;//基礎下落時間0.35+0.05*相差高度/基本高度
                        const delayTime = 0.05 * (slotSymbol.length - moveSymbol.getSiblingIndex() - 1);//根據排序來決定延遲執行掉落時間
                        tween(moveSymbol).delay(delayTime).to(time - 0.2, { position: new Vec3(0, setPos.y, 0) }, { easing: 'cubicIn' })
                            .then(tween(moveSymbol).to(0.065, { position: new Vec3(0, setPos.y + 30, 0) }, { easing: 'cubicOut' }))
                            .then(tween(moveSymbol).to(0.065, { position: new Vec3(0, setPos.y, 0) }, { easing: 'cubicIn' }))
                            .then(tween(moveSymbol).to(0.035, { position: new Vec3(0, setPos.y + 10, 0) }, { easing: 'cubicOut' }))
                            .then(tween(moveSymbol).to(0.035, { position: new Vec3(0, setPos.y, 0) }, { easing: 'cubicIn' }))
                            .start();
                    } else
                        moveSymbol.position = setPos;//設置位置
                }

                this.scatterSave(slotLine);//紀錄中獎scatter
                slotLine++;
                if ((this.fontType[4].active || this.scatterSym.length >= 2) && slotLine < slotLength && this.hideSlot[slotLine] > 0) {
                    // this.slotBgFx.active = true;//顯示聽牌背景特效
                    this.scheduleOnce(() => {
                        this.listenShow(slotLine, this.dropListenTime);//顯示第n行聽牌
                        if (this.scatterSym.length >= 2)
                            this.creatScatter();//生成scatter聽牌物件
                    }, 0.7)
                    //等待掉落聽牌時間
                    this.scheduleOnce(() => {
                        drop.bind(this)(slotLine);//判斷下一行
                    }, this.dropListenTime)
                } else {
                    this.scheduleOnce(() => {
                        drop.bind(this)(slotLine);//判斷下一行
                    }, this.scheduleStartTime)
                }
            }
        }
        //判斷聽牌以及該行是否有空缺
        if ((this.fontType[4].active || this.scatterSym.length >= 2) && this.hideSlot[0] > 0) {
            // this.scheduleOnce(() => {
            this.listenShow(0, this.dropListenTime);//顯示第一行聽牌
            if (this.scatterSym.length >= 2) {
                this.creatScatter();//生成scatter聽牌物件
            }
            // }, 0.7)
            this.scheduleOnce(() => {
                drop.bind(this)(0);//第一行開始執行掉落
            }, this.dropListenTime - 0.7)
        } else
            drop.bind(this)(0);//第一行開始執行掉落
    }

    //勝利牌移到置牌區(名稱,symID,sym位置)
    winSymbolSet(name: string, symID: number[], symPos: number[][]) {
        let updataAll = false;//判斷下回是否要全刷掉補牌(MG模式下有遇到3碰或4槓才會true)
        let symbolMovePos: Node[] = [];//紀錄symbol移動的位置
        for (let i = 0; i < symID.length; i++) {
            //判斷是否是中途槓牌(不新增牌組)
            if (name === 'kong' && symPos[i].length === 1) {
                this.pointNum += 1;//台數+1(補槓統一加1台)
                //中途槓牌類型(要移到置牌區)
                for (const data of this.setArea.children) {
                    if (data.getComponent(symbolSet_TA).symID === symID[i]) {
                        symbolMovePos.push(data.children[3]);//要移動的牌型位置
                        data.getComponent(symbolSet_TA).tileNum = 4;
                        break;//退出迴圈
                    }
                }
            } else {
                const instSymbolSet = this.myPool.get(this.symbolSet);//生成symbolSet物件池內容
                switch (name) {
                    case 'flower':
                        instSymbolSet.parent = this.flowerArea;//花牌置牌區
                        this.pointNum += 1;//台數+1
                        break;
                    case 'kong':
                        instSymbolSet.parent = this.setArea;//眼、碰、槓牌置牌區
                        if (symID[i] >= 32)
                            this.pointNum += 3;//加台數
                        else if (symID[i] >= 28)
                            this.pointNum += 2;//加台數
                        else
                            this.pointNum += 1;//加台數
                        if (this.multipleLevel < 4)
                            this.multipleLevel++;
                        if (!this.freeGameMode)
                            updataAll = true;//非免費模式，下一回合要全刷掉補牌
                        break;
                    case 'pong':
                        instSymbolSet.parent = this.setArea;//眼、碰、槓牌置牌區
                        if (symID[i] >= 32)
                            this.pointNum += 2;//加台數
                        else if (symID[i] >= 28)
                            this.pointNum += 1;//加台數
                        if (this.multipleLevel < 4)
                            this.multipleLevel++;
                        if (!this.freeGameMode)
                            updataAll = true;//非免費模式，下一回合要全刷掉補牌
                        break;
                    case 'eye':
                        instSymbolSet.parent = this.setArea;//眼、碰、槓牌置牌區
                        this.multipleLevel = 5;
                        break;
                }
                instSymbolSet.getComponent(symbolSet_TA).init(symPos[i].length, symID[i]);//初始化(張數，symbol編號)
                instSymbolSet.getComponent(symbolSet_TA).setType();//設置牌型與貼圖
                for (let j = 0; j < symPos[i].length; j++) {
                    symbolMovePos.push(instSymbolSet.children[j]);//要移動的牌型位置
                }
            }

            let multiple = this.multipleBase[this.multipleLevel - 1] * (1 + this.pointNum);
            if (multiple > this.multipleNum) {
                this.multipleNum = multiple;
                this.multiple.getChildByName('label').getComponent(Label).string = this.multipleNum.toString() + 'x';
                this.multiple.getComponent(Animation).play();//播放倍率切換動態
            }
        }
        let winScale = 0.28;//移動到置牌區的尺寸
        for (let i = 0; i < symbolMovePos.length; i++) {
            const symbolWinNode = this.symbolWinLayer.children[i];
            const moveWorldPos = symbolMovePos[i].worldPosition.subtract(this.symbolWinLayer.worldPosition);
            const childrenID = symbolMovePos[i].getSiblingIndex();
            symbolWinNode.getComponent(symbolWin_TA).resetTarget();//清除跟隨節點
            if (childrenID > 2)
                tween(symbolWinNode).to(0.6, { position: new Vec3(moveWorldPos.x, moveWorldPos.y + 15, moveWorldPos.z) }, { easing: 'quartOut' }).start();
            else
                tween(symbolWinNode).to(0.6, { position: new Vec3(moveWorldPos.x + i * 15, moveWorldPos.y, moveWorldPos.z) }, { easing: 'quartOut' }).start();
            tween(symbolWinNode).to(0.5, { scale: new Vec3(winScale + 0.03, winScale + 0.03, 1) }, { easing: 'quartOut' })
                .then(tween(symbolWinNode).to(0.1, { scale: new Vec3(winScale, winScale, 1) }, { easing: 'sineOut' }))
                .then(tween(symbolWinNode).to(0.2, { position: moveWorldPos }, { easing: 'backOut' }))
                .call(() => {
                    symbolMovePos[i].parent.getComponent(symbolSet_TA).showChildren();
                    symbolWinNode.scale = new Vec3(0, 0, 0);
                }).start();
        }
        return updataAll;
    }

    //結算此回合
    resultGame() {
        this.putSymbolWinLayer();//退還所有勝利表演pool物件
        for (const data of this.scatterSym) {
            data.active = true;
            data.getComponent(symbolSetting_TA).scatterStay();//播放停留動態
        }
        this.scatterSym = [];
        this.fontType[4].active = false;//隱藏聽牌狀態
        const ws = this.demoInfoTA.symData[this.gameRound].ws;//共贏分
        //判斷是否胡牌
        if (ws > 0) {
            if (this.setArea.children.length > 4) {
                this.slotBlackShow();//顯示遮黑層
                this.fontType[5].active = true;//顯示胡牌
                this.slotGameUI.getComponent(Animation).play('shark');//播放震動
                //3秒後
                this.scheduleOnce(() => {
                    this.slotBlackHide();//隱藏遮黑層
                    this.putPlaceArea();//退還置牌區的pool物件
                    this.fontType[5].active = false;//隱藏胡牌狀態
                    this.result.active = true;//顯示胡牌結算畫面
                    const anim = this.result.getComponent(Animation);
                    anim.play(anim.clips[0].name);
                    this.setResult();//設置結算內容
                    this.resultWinScore.getChildByName('label').getComponent(Label).string = this.numberSpecification(ws);//設置結算得分
                    //等待動畫播完
                    this.scheduleOnce(() => {
                        //判斷是否執行bigWin跑分
                        if (ws > this.demoInfoTA.betScore * this.bigWinMultiple[0])
                            this.bigWinRunning();
                        else
                            this.showResultScore();//顯示結算總得分
                    }, anim.clips[0].duration)
                }, 3)
            } else {
                this.showWinTotalScore(ws);//顯示共贏得
                this.scheduleOnce(() => {
                    //判斷是否執行bigWin跑分
                    if (ws > this.demoInfoTA.betScore * this.bigWinMultiple[0])
                        this.bigWinRunning();
                    else {
                        this.putPlaceArea();//退還置牌區的pool物件
                        this.scheduleOnce(() => {
                            this.scatterWinTest();//判斷是否進入免費模式
                        }, 0.3)
                    }
                }, 1)
            }
        } else {
            this.scatterWinTest();//判斷是否進入免費模式
        }
    }

    //設置胡牌內容
    setResult() {
        const huAward = this.demoInfoTA.symData[this.gameRound].huAward;//該回合胡牌資料
        //設置牌型標題
        let huCount = 0;//胡牌牌型數量(牌型編號10以內的)
        for (let i = 0; i < huAward.huType[0].length; i++) {
            if (huAward.huType[0][i] < 11) {
                const huTypeTitleSpriteFrame = this.symbolResourceTA.huTypeTitleSF[huAward.huType[0][i]];
                this.result.getChildByName('titles').children[i].getComponent(Sprite).spriteFrame = huTypeTitleSpriteFrame;
                this.result.getChildByName('titles').children[i].active = true;
                huCount++;
            }
        }
        this.result.getChildByName('titles').getComponent(Animation).play('resultTitle' + huCount.toString());//播放待機模式
        //設置花牌
        for (let i = 0; i < 8; i++) {
            const flowerTile = this.result.getChildByName('tiles').getChildByName('flowerTile');
            if (i < huAward.flower.length) {
                const flowerSpriteFrame = this.symbolResourceTA.symbolSF[huAward.flower[i] - 1];
                flowerTile.children[i].active = true;//顯示花牌
                flowerTile.children[i].children[0].getComponent(Sprite).spriteFrame = flowerSpriteFrame;
            } else
                flowerTile.children[i].active = false;//隱藏花牌
        }
        //設置碰、槓、眼睛牌
        for (let i = 0; i < 5; i++) {
            const winTileSet = this.result.getChildByName('tiles').getChildByName('winTile').children[i];
            for (let j = 0; j < winTileSet.children.length; j++) {
                if (j < huAward.setSym[i].length) {
                    const symbolSpriteFrame = this.symbolResourceTA.symbolSF[huAward.setSym[i][j] - 1];
                    winTileSet.children[j].children[0].getComponent(Sprite).spriteFrame = symbolSpriteFrame;
                    winTileSet.children[j].active = true;//顯示麻將牌
                } else
                    winTileSet.children[j].active = false;//隱藏麻將牌
            }
        }
        //設置牌型台數
        for (let i = 0; i < 8; i++) {
            const winPoints = this.result.getChildByName('points').getChildByName('winPoints');
            if (i < huAward.huType[0].length) {
                const huTypeSpriteFrame = this.symbolResourceTA.huTypeSF[huAward.huType[0][i]];
                winPoints.children[i].active = true;//顯示牌型台數
                winPoints.children[i].getChildByName('tx').getComponent(Sprite).spriteFrame = huTypeSpriteFrame;//設置牌型語系貼圖
                winPoints.children[i].getChildByName('points').children[0].getComponent(Label).string = huAward.huType[1][i].toString();//設置台數
            } else
                winPoints.children[i].active = false;//隱藏牌型台數
        }
        this.result.getChildByName('points').getChildByName('allPoints').getChildByName('label').getComponent(Label).string = huAward.allPoints.toString();//設置總台數
    }

    //顯示結算得分
    showResultScore() {
        this.resultWinScore.active = true;//顯示結算總得分
        //等待5秒關閉結算後判斷免費模式
        this.scheduleOnce(() => {
            const anim = this.result.getComponent(Animation);
            anim.play(anim.clips[1].name);
            //等待動畫播放結束
            this.scheduleOnce(() => {
                this.result.active = false;
                this.resultWinScore.active = false;
            }, anim.clips[1].duration)
            //胡牌盤面掉落更新
            // this.putPlaceArea();//退還置牌區的pool物件
            this.scatterWinTest();//判斷是否進入免費模式
        }, 5)
    }

    //重啟spin按鈕
    resetGameSpin() {
        //先判斷是否為免費模式
        if (this.freeGameMode) {
            const symData = this.demoInfoTA.symData[this.gameRound];
            if (symData.freeGameLeft <= 0) {
                //免費遊戲結束
                this.totalWin.active = true;//顯示免費遊戲結算
                this.totalWin.getComponent(Animation).play("totalWinShow");//播放得分畫面
                this.totalWin.getChildByName('label').getComponent(Label).string = this.numberSpecification(symData.bala);//設置免費遊戲總得分
                //5秒後自動執行(根據動畫資訊出現開始算5秒)
                tween(this).delay(5).call(() => {
                    this.freeGameExit(symData.bala);//自動執行免費遊戲結算
                }).tag(88).start();
            } else {
                //等待0.4秒下局轉動
                this.scheduleOnce(() => {
                    this.startGameSlotRun();//開始下局轉動
                    this.freeGameTimes.getChildByName('label').getComponent(Label).string = (symData.freeGameLeft - 1).toString();//免費次數更新
                }, 0.4)
            }
            return;
        }
        //如果是自動遊戲狀態，等待0.4秒下局轉動
        else if (this.autoGameMode) {
            this.scheduleOnce(() => {
                this.startGameSlotRun();//開始下局轉動
                this.autoGameRound--;
                this.btnAutoStop.children[0].getChildByName('label').getComponent(Label).string = this.autoGameRound.toString();
            }, 0.4)
            return;
        }
        this.btnSpin.getComponent(Button).interactable = true;//啟用spin
        this.btnAuto.interactable = true;//啟用自動按鈕
        this.btnSetting.interactable = true;//啟用設置按鈕
        this.betAdd.interactable = true;//啟用下注加分按鈕
        this.betLess.interactable = true;//啟用下注減分按鈕
    }
    //-------------------主要slot流程-------------------/

    //-------------------功能類-------------------/
    //symbol抖動效果(哪一行)
    // runSymbolShark() {
    //     if (this.symbolShark)
    //         return;
    //     this.symbolShark = true;//啟用抖動
    //     // const startSymbolShark = (symbol: Node) => {
    //     //     const randomPos = new Vec3(5 - Math.random() * 10, 5 - Math.random() * 10, 0);
    //     //     tween(symbol).to(0.05, { position: randomPos }).start();
    //     // }
    //     for (let i = 0; i < this.slotRun.length; i++) {
    //         for (let j = 0; j < this.slotRun[i].children[1].children.length; j++) {
    //             if (this.slotRun[i].children[1].children[j].active) {
    //                 let count = 0;//目前抖動次數

    //                 this.schedule(() => {
    //                     if (count < 30) {
    //                         this.slotRun[i].children[1].children[j].children[0].position = new Vec3(5 - Math.random() * 10, 5 - Math.random() * 10, 0);
    //                         count++
    //                     } else
    //                         this.slotRun[i].children[1].children[j].children[0].position = new Vec3(0, 0, 0);//回歸位置
    //                 }, 0.05, 30, 0.01)
    //             }
    //         }
    //     }
    // }

    //聽牌特效開關
    // setReadyFx(bool: boolean) {
    // }


    //設置symbol圖案(哪行slotSymbol,該行顯示的symbol編號)
    setSymbolImage(slotSymbol: Node, symbolNumber: number[]) {
        for (let i = 0; i < slotSymbol.children.length; i++) {
            slotSymbol.children[i].getComponent(symbolSetting_TA).setSymbolData(symbolNumber[i]);//設置顯示的symbol
        }
    }
    //回傳該行隨機symbol圖案編號(要隨機產生的編號數量)
    randomSymbolNum(amount: number) {
        let result: number[] = [];//要回傳的隨機編號陣列
        for (let i = 0; i < amount; i++) {
            result.push(Math.ceil(Math.random() * 43));//隨機1~43
        }
        return result;//回傳該行隨機symbol圖案編號
    }
    //模糊貼圖回歸正常(哪行slot)
    blurSFReset(slotRunLine: Node) {
        //設置上下用模糊貼圖
        for (const data of slotRunLine.children) {
            for (const data2 of data.children) {
                data2.getComponent(symbolSetting_TA).blurHide();//顯示模糊漸變
            }
        }
    }
    //遮黑淡入
    slotBlackShow() {
        this.slotBlack.getComponent(UIOpacity).opacity = 0;
        this.slotBlack.active = true;//顯示遮黑
        tween(this.slotBlack.getComponent(UIOpacity)).to(0.15, { opacity: 255 }).start();//淡入
    }
    //遮黑淡出
    slotBlackHide() {
        tween(this.slotBlack.getComponent(UIOpacity)).to(0.15, { opacity: 0 }).call(() => {
            this.slotBlack.active = false;//隱藏遮黑
        }).start();//淡出
    }
    //顯示共贏得分數
    showWinTotalScore(score: number) {
        this.winTotalScoreInfo.getChildByName('score').getChildByName('label').getComponent(Label).string = this.numberSpecification(score);//共贏分設置
        this.winTotalScoreInfo.active = true;//顯示共贏得
    }
    //錢包歸分(得分)
    walletScore(score: number) {
        this.userCash = Number(this.userCash) + (score * 10000);//玩家得分增加
        const cashStr = this.numberSpecification((this.userCash / 10000));
        this.runScore(Number(this.userCashLabel.string.replace(/,/gi, '')), Number(cashStr.replace(/,/gi, '')), this.userCashLabel);//執行小跑分
    }
    /**規格化數值(取小數點後2位)*/
    private numberSpecification(num: number): string {
        return num.toLocaleString('zh', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    }
    //退還symbolWinLayer節點下的pool
    putSymbolWinLayer() {
        while (this.symbolWinLayer.children.length > 0) {
            this.myPool.put(this.symbolWinLayer.children[0]);//退還symbolWinLayer節點下的pool
        }
    }
    //退還placeArea下的pool
    putPlaceArea() {
        // for (const data of this.freeArea.children) {
        //     data.getComponent(Animation).play();
        // }
        for (const data of this.flowerArea.children) {
            data.getComponent(Animation).play();
        }
        for (const data of this.setArea.children) {
            data.getComponent(Animation).play();
        }
        this.scheduleOnce(() => {
            // while (this.freeArea.children.length > 0) {
            //     this.myPool.put(this.freeArea.children[0]);//退還symbolWinLayer節點下的pool
            // }
            while (this.flowerArea.children.length > 0) {
                this.myPool.put(this.flowerArea.children[0]);//退還symbolWinLayer節點下的pool
            }
            while (this.setArea.children.length > 0) {
                this.myPool.put(this.setArea.children[0]);//退還symbolWinLayer節點下的pool
            }
        }, 1)
    }
    //跑分
    runScore(stratScore: number, endScore: number, label: Label) {
        const runScore = { score: stratScore };//設置起始分
        tween(runScore).to(0.5, { score: endScore }, {
            onUpdate: () => {
                label.string = this.numberSpecification(runScore.score);//更新分數
            }
        }).call(() => {
            label.string = this.numberSpecification(endScore);//更新分數
        }).start();
    }
    //-------------------功能類-------------------/

    //-------------------大獎跑分相關-------------------/
    //執行大獎跑跑分(滑鼠點擊後直接跳結果)
    bigWinRunning() {
        const ws = this.demoInfoTA.symData[this.gameRound].ws;//共贏分
        const runningScoreLabel = this.bigWin.getChildByName("label").getComponent(Label);
        runningScoreLabel.string = "0";//清空跑分
        this.bigWin.active = true;//顯示跑分物件
        this.bigWin.getComponent(Button).interactable = true;//啟用按鈕
        this.bigWin.getComponent(Animation).play("bigWinReset");
        let arrayId = 0;
        const bigWinSpine = this.bigWin.getChildByName("spine").getComponent(sp.Skeleton);
        bigWinSpine.setAnimation(0, this.bigWinSpineAnimName[arrayId] + '_begin', false);//進場
        bigWinSpine.setCompleteListener(() => {
            bigWinSpine.setAnimation(0, this.bigWinSpineAnimName[arrayId] + '_loop', true);//循環播放
            bigWinSpine.setCompleteListener(null);//結束監聽
        })
        //等待跑分結束(回傳)
        const runBigWinScore = { runScore: 0 };
        tween(runBigWinScore).to(this.runScoreTime, { runScore: ws }, {
            onUpdate: () => {
                runningScoreLabel.string = this.numberSpecification(runBigWinScore.runScore);
                if (arrayId < 4 && runBigWinScore.runScore > this.demoInfoTA.betScore * this.bigWinMultiple[arrayId]) {
                    arrayId++;//判斷下個階段
                    bigWinSpine.setAnimation(0, this.bigWinSpineAnimName[arrayId] + '_begin', false);//進場
                    bigWinSpine.setCompleteListener(() => {
                        bigWinSpine.setAnimation(0, this.bigWinSpineAnimName[arrayId] + '_loop', true);//循環播放
                        bigWinSpine.setCompleteListener(null);//結束監聽
                    })
                }
            }
        }).call(() => {
            this.bigWinOver();//執行bigWin跑分結束
        }).tag(88).start();
    }

    //執行bigWin跑分結束
    bigWinOver() {
        const ws = this.demoInfoTA.symData[this.gameRound].ws;//共贏分
        this.bigWin.getComponent(Button).interactable = false;//禁用按鈕
        const runningScoreLabel = this.bigWin.getChildByName("label").getComponent(Label);
        runningScoreLabel.string = this.numberSpecification(ws);
        this.bigWin.getComponent(Animation).play("bigWinOver");
        this.scheduleOnce(() => {
            this.bigWin.active = false;//隱藏跑分物件
            //如果是胡牌結算階段
            if (this.result.active)
                this.showResultScore();//顯示結算總得分
            else if (!this.freeGameMode)
                this.showWinTotalScore(ws);//顯示共贏得
            else
                this.scheduleOnce(() => {
                    this.scatterWinTest();//判斷是否進入免費模式
                }, 0.3)
        }, 2)
    }

    //大獎跑分畫面按下觸發
    endBigWinRun() {
        const ws = this.demoInfoTA.symData[this.gameRound].ws;//共贏分
        Tween.stopAllByTag(88);
        this.unscheduleAllCallbacks();
        const bigWinSpine = this.bigWin.getChildByName("spine").getComponent(sp.Skeleton);
        bigWinSpine.setCompleteListener(null);//結束監聽
        for (let i = 0; i < this.bigWinMultiple.length; i++) {
            if (ws < this.demoInfoTA.betScore * this.bigWinMultiple[i]) {
                bigWinSpine.setAnimation(0, this.bigWinSpineAnimName[i - 1] + '_loop', true)
                break;
            }
            if (i === this.bigWinMultiple.length - 1)
                bigWinSpine.setAnimation(0, this.bigWinSpineAnimName[i] + '_loop', true)
        }
        this.bigWinOver();
    }
    //-------------------大獎跑分相關-------------------/

    //-------------------免費遊戲表演相關-------------------/
    //判斷是否進入免費模式,判斷盤面的symbol
    scatterWinTest() {
        this.btnSpin.getChildByName('loopFx').active = false;//隱藏旋轉狀態
        //判斷是否有獲得免費圖示
        if (this.freeGet.active) {
            this.scheduleOnce(() => {
                this.freeGet.getComponent(Animation).play('freeGetExit');
                this.scheduleOnce(() => {
                    this.freeGet.active = false;//隱藏免費遊戲紀錄
                }, 0.3)
                this.startFreeGame();//表演時間結束後【執行freeGame表演流程】
            }, 0.3)
        }
        else
            this.resetGameSpin();//重啟spin(等待0.3秒)
    }
    //執行freeGame流程
    startFreeGame() {
        this.slotBlackHide();//隱藏遮黑層
        //如果是第一次進入免費遊戲，會先出現介面
        if (!this.freeGameMode) {
            const freeGameTimesUIOpacity = this.freeGameTimes.getComponent(UIOpacity);
            freeGameTimesUIOpacity.opacity = 0;
            this.freeGameTimes.active = true;
            tween(freeGameTimesUIOpacity).to(0.3, { opacity: 255 }).start();

            const freeTopBgUIOpacity = this.freeTopBg.getComponent(UIOpacity);
            freeTopBgUIOpacity.opacity = 0;
            this.freeTopBg.active = true;
            tween(freeTopBgUIOpacity).to(0.3, { opacity: 255 }).start();

            // this.controlBtns.active = false;//隱藏操作按鈕區
            this.freeGameGet.active = true;//獲得免費遊戲
            this.scheduleOnce(() => {
                this.freeGameStart();//自動執行免費遊戲開始
            }, 4.1)
        } else
            this.freeGameStart();//自動執行免費遊戲開始
    }

    //免費遊戲開始
    freeGameStart() {
        Tween.stopAllByTag(88);//停止免費遊戲自動關閉視窗倒數
        if (!this.freeGameMode) {
            this.freeGameSet(true);//免費遊戲進退場設置(如果是第一次進入免費模式，需設置參數)
            this.freeGameGet.active = false;
        }
        this.scheduleOnce(() => {
            this.resetGameSpin()//重啟遊戲spin轉動
        }, 0.3)
    }

    //免費遊戲進退場設置(免費遊戲狀態)
    freeGameSet(bool: boolean) {
        this.freeGameMode = bool;//免費模式開關
        //freeGame介面淡出
        if (!bool) {
            tween(this.freeTopBg.getComponent(UIOpacity)).to(0.3, { opacity: 0 })
                .call(() => {
                    this.freeTopBg.active = false;
                }).start();
            tween(this.freeGameTimes.getComponent(UIOpacity)).to(0.3, { opacity: 0 })
                .call(() => {
                    this.freeGameTimes.active = false;
                }).start();
        }
        if (!bool && this.autoGameMode) {
            this.btnAutoStop.active = true;//顯示自動停止按鈕
            this.btnSpin.active = false;//隱藏spin按鈕
        }
    }

    //免費遊戲結算退出(按鈕觸發或5秒自動觸發)
    freeGameExit(score: number) {
        Tween.stopAllByTag(88);//停止免費遊戲自動關閉視窗倒數
        this.freeGameSet(false);//免費遊戲進退場設置
        this.totalWin.getComponent(Animation).play("totalWinExit");
        this.scheduleOnce(() => {
            this.totalWin.active = false;//隱藏免費遊戲結算畫面
            this.showWinTotalScore(score);//顯示共贏得
            this.scheduleOnce(() => {
                this.resetGameSpin();//重啟spin
            }, 0.3)
        }, 0.2)
    }
    //-------------------免費遊戲表演相關-------------------/
}