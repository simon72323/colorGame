import { _decorator, Component, Node, Animation, Slider, ProgressBar, Button, EventHandler, Layers, Layout, Vec3, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('common_TA')
export class common_TA extends Component {

    //公版相關
    @property({ type: Node, tooltip: "設置按鈕" })
    public settingBtn: Node | null = null!;
    // @property({ type: [Node], tooltip: "設置關閉按鈕,0=關閉按鈕1,1=0=關閉按鈕2" })
    // public settingCloseBtn: Node[] = []!;
    // @property({ type: [Node], tooltip: "公版按鈕,0=音樂,1=紀錄,2=說明,3=回大廳,4=自動下注" })
    // public commonBtn: Node[] = []!;
    @property({ type: [Node], tooltip: "彈出視窗,0=音樂,1=紀錄,2=說明,3=回大廳,4=自動下注" })
    public popup: Node[] = []!;
    @property({ type: [Node], tooltip: "彈出視窗關閉按鈕,0=音樂,1=紀錄,2=說明,3=回大廳,4=自動下注" })
    public popupClose: Node[] = []!;
    @property({ type: [Node], tooltip: "聲音開關節點,0=音樂開,1=音樂關,2=聲音開,3=聲音關" })
    public musicBtn: Node[] = []!;

    //【視窗】彈出視窗相關
    @property({ type: Node, tooltip: " 回大廳視窗" })
    public popupHome: Node | null = null!;
    @property({ type: Node, tooltip: "自動功能視窗" })
    public popupAuto: Node | null = null!;
    


    onLoad() {
        //設置按鈕功能
        let thisScriptName = this.node.components[0].name.split('<')[1].split('>')[0];
        //公版按鈕
        // for (let i = 0; i < this.commonBtn.length; i++) {
        //     const commonBtnEventHandler = new EventHandler();
        //     commonBtnEventHandler.target = this.node;
        //     commonBtnEventHandler.component = thisScriptName;
        //     commonBtnEventHandler.handler = 'popupShow';
        //     commonBtnEventHandler.customEventData = i.toString();
        //     this.commonBtn[i].getComponent(Button)!.clickEvents.push(commonBtnEventHandler);
        // }

        //彈出視窗關閉按鈕
        for (let i = 0; i < this.popupClose.length; i++) {
            const popupCloseBtnEventHandler = new EventHandler();
            popupCloseBtnEventHandler.target = this.node;
            popupCloseBtnEventHandler.component = thisScriptName;
            popupCloseBtnEventHandler.handler = 'popupHide';
            popupCloseBtnEventHandler.customEventData = i.toString();
            this.popupClose[i].getComponent(Button)!.clickEvents.push(popupCloseBtnEventHandler);
        }

        //設置按鈕
        const settingBtnEventHandler = new EventHandler();
        settingBtnEventHandler.target = this.node;
        settingBtnEventHandler.component = thisScriptName;
        settingBtnEventHandler.handler = 'settingContentShow';
        this.settingBtn.getComponent(Button)!.clickEvents.push(settingBtnEventHandler);

        // //設置關閉按鈕
        // for (let i = 0; i < this.settingCloseBtn.length; i++) {
        //     const settingCloseBtnEventHandler = new EventHandler();
        //     settingCloseBtnEventHandler.target = this.node;
        //     settingCloseBtnEventHandler.component = thisScriptName;
        //     settingCloseBtnEventHandler.handler = 'settingContentHide';
        //     this.settingCloseBtn[i].getComponent(Button)!.clickEvents.push(settingCloseBtnEventHandler);
        // }

        //設置音樂音效按鈕
        for (let i = 0; i < this.musicBtn.length; i++) {
            const musicBtnEventHandler = new EventHandler();
            musicBtnEventHandler.target = this.node;
            musicBtnEventHandler.component = thisScriptName;
            musicBtnEventHandler.handler = 'musicOnOff';
            musicBtnEventHandler.customEventData = i.toString();
            this.musicBtn[i].getComponent(Button)!.clickEvents.push(musicBtnEventHandler);
        }

        //【視窗】回大廳取消按鈕
        const homeCancleBtnEventHandler = new EventHandler();
        homeCancleBtnEventHandler.target = this.node;
        homeCancleBtnEventHandler.component = thisScriptName;
        homeCancleBtnEventHandler.handler = 'homeCancle';
        this.popupHome.children[1].getChildByName('btnCancle').getComponent(Button)!.clickEvents.push(homeCancleBtnEventHandler);

        //【視窗】自動功能確認按鈕
        const autoConfirmBtnEventHandler = new EventHandler();
        autoConfirmBtnEventHandler.target = this.node;
        autoConfirmBtnEventHandler.component = thisScriptName;
        autoConfirmBtnEventHandler.handler = 'autoConfirm';
        this.popupAuto.children[1].getChildByName('btnConfirm').getComponent(Button)!.clickEvents.push(autoConfirmBtnEventHandler);

    }


    //設置選單顯示
    settingContentShow() {
        this.settingBtn.children[0].active = true;
        this.settingBtn.children[0].children[0].getComponent(Animation)!.play("settingContentShow");
    }

    //設置選單隱藏
    settingContentHide() {
        this.settingBtn.children[0].children[0].getComponent(Animation)!.play("settingContentHide");
        this.scheduleOnce(() => {
            this.settingBtn.children[0].active = false;
        }, 0.2)
    }

    //視窗顯示
    popupShow(event: Event, customEventData: string) {
        this.popup[Number(customEventData)].active = true;
        //如果設置選單是開啟狀態，須關閉
        if (this.settingBtn.children[0])
            this.settingContentHide();
    }

    //視窗關閉
    popupHide(event: Event, customEventData: string) {
        this.popup[Number(customEventData)].active = false;
    }

    //音樂音效開關
    musicOnOff(event: Event, customEventData: string) {
        switch (customEventData) {
            case '0': //音樂關
                this.musicBtn[0].active = false;
                this.musicBtn[1].active = true;
                break;
            case '1'://音樂開
                this.musicBtn[0].active = true;
                this.musicBtn[1].active = false;
                break;
            case '2'://聲音關
                this.musicBtn[2].active = false;
                this.musicBtn[3].active = true;
                break;
            case '3'://聲音開
                this.musicBtn[2].active = true;
                this.musicBtn[3].active = false;
                break;
        }
    }

    //【視窗】回大廳取消按鈕按下
    homeCancle() {
        this.popupHome.active = false;
    }

    //【視窗】自動功能確認按鈕按下
    autoConfirm() {
        this.popupAuto.active = false;
    }

    update() {
        //【視窗】自動視窗出現時，同步判斷進度條
        if (this.popupAuto) {
            let subSlider = this.popupAuto.children[1].getChildByName('subSlider');
            subSlider.getComponent(ProgressBar)!.progress = subSlider.getComponent(Slider)!.progress;
            let addSlider = this.popupAuto.children[1].getChildByName('addSlider');
            addSlider.getComponent(ProgressBar)!.progress = addSlider.getComponent(Slider)!.progress;
            let winSlider = this.popupAuto.children[1].getChildByName('winSlider');
            winSlider.getComponent(ProgressBar)!.progress = winSlider.getComponent(Slider)!.progress;
        }
    }

}
