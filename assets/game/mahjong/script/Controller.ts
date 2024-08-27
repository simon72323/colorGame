import { Component, ImageAsset, Label, Node, ProgressBar, Scene, Sprite, SpriteFrame, Texture2D, UIOpacity, _decorator, assetManager, director, game, tween } from 'cc'
// import { Application } from "./Applicaiton"
// import { LanguageManager } from './LanguageManager';
// import { LanguageFiles } from './LanguageFiles';
import { AudioManager } from './components/AudioManager';
import { AlertPanel } from './components/AlertPanel';
// import { SoundFiles } from './components/SoundFiles';
// import { URLParameter } from './include';
import { InputKeyboard } from './components/InputKeyboard';
const { ccclass, property } = _decorator;

@ccclass('Controller')
export class Controller extends Component {

    // @property({ type: Label })
    private progressText: Label = null

    // @property({ type: ProgressBar })
    private progressBar: ProgressBar = null

    // @property({ type: Node })
    // private LabelNode: Node = null

    private nowProcessGame = 0

    // maxLanguageManagerProcess = 10
    maxGameProcess = 90
    maxLoadProcess = 100

    private loaderScene: Scene
    private gameScene: Scene
    private loaderNode: Node
    private pathDataNode: Node

    // private languageManagerCompleted: boolean = false;
    // private sceneCompleted: boolean = false;
    // private languageManagerProgress: number = 0;
    private sceneProgress: number = 0;


    start() {
        AudioManager.getInstance().muted(true);

        // LanguageManager.getInstance().node.on("completed", ()=>{
        //     console.log("語系加載完成")
        //     this.languageManagerCompleted = true;
        //     this.languageManagerProgress = this.maxLanguageManagerProcess;
        //     this.updateProgress();
        //     if (this.languageManagerCompleted && this.sceneCompleted) {
        //         this.onComplete();
        //     }
        // });
        console.log("開始加載載入頁")
        director.preloadScene('Load', (completedCount, total, item) => {
            let num = this.processNumCalculator(completedCount, total)
            this.progressText.string = Math.trunc(num * this.maxLoadProcess) + '%'
        }, (err, assert) => {
            director.loadScene("Load", (err, sce) => {
                this.loaderScene = sce
                this.loaderNode = sce.getChildByName("Canvas").getChildByName("loading")
                director.addPersistRootNode(this.loaderNode)
                let ref = this.loaderNode.getComponent(UIOpacity)
                this.progressBar = this.loaderNode.getChildByName("loadBar").getComponent(ProgressBar)
                this.progressText = this.loaderNode.getChildByName("label").getComponent(Label)
                this.pathDataNode = sce.getChildByName("PathData")
                this.progressBar.progress = 0.1
                this.progressText.string = "0%"
                console.log("開始加載場景",this.pathDataNode)
                this.loadGameScene();
                tween(ref).to(0.3, { opacity: 255 }).call(() => { }).start()
                this.nowProcessGame = 0
                // LanguageManager.getInstance().setSpriteFrame(this.loaderNode.getChildByName('logo').getComponent(Sprite), LanguageFiles.Logo);
            })
        })
    }
    protected onLoad(): void {
        this.progressText = this.node.getChildByName("Label").getComponent(Label)
        // this.setProcessNum
        // this.CloseLoader
        // this.Reconnect
    }

    protected loadGameScene() {
        director.preloadScene('newColorGame', (completedCount, total, item) => {
            let num = this.processNumCalculator(completedCount, total)
            console.log("加載中2",num)
            this.sceneProgress = Math.trunc(num * this.maxGameProcess);
            this.updateProgress();
        }, (err, assert) => {
            console.log("遊戲場景加載完成")
            this.onComplete();
        })
    }

    protected updateProgress() {
        this.progressText.string = 10+this.sceneProgress + '%';
        this.progressBar.progress = 0.1+this.sceneProgress / 100;
    }

    protected onComplete() {
        let LoaderCanvas = this.loaderScene.getChildByName("Canvas")
        LoaderCanvas.removeAllChildren()
        director.loadScene("newColorGame", (a, scene) => {
            this.gameScene = scene
            console.log(this.gameScene)
            console.log("路徑節點",this.pathDataNode)
            // let GameCanvas = scene.getChildByName("Canvas");
            // 移動到AlertPanel後面 90 - 100
            // GameCanvas.insertChild(this.loaderNode, GameCanvas.getChildByName('alertPanel').getSiblingIndex());
        })
    }

    Reconnect = async () => {
        // 清除聲音
        await AudioManager.getInstance().release();
        // 清除Alert singleton
        AlertPanel.getInstance().release();
        InputKeyboard.getInstance().release();

        director.addPersistRootNode(this.loaderNode);
        director.loadScene("newColorGame", (a, scene) => {
            this.gameScene = scene;
            let GameCanvas = scene.getChildByName("Canvas");
            GameCanvas.addChild(this.loaderNode);
            this.loaderNode.getComponent(UIOpacity).opacity = 255;
        })
    }

    protected processNumCalculator(completedCount: number, total: number): number {
        let numP = completedCount / total
        if (numP > 1) {
            numP = 1
        } else if (numP < this.nowProcessGame) {
            numP = this.nowProcessGame
        }
        this.nowProcessGame = numP
        return numP
    }

    setProcessNum = (num: number) => {
        this.progressText.string = num + '%'
        this.progressBar.progress = num / 100
    }

    CloseLoader = () => {
        console.log("關閉")
        let UIO = this.loaderNode.getComponent(UIOpacity)
        tween(UIO).to(0.3, { opacity: 0 }).call(() => {
            let GameCanvas = this.gameScene.getChildByName("Canvas")
            GameCanvas.removeChild(this.loaderNode)
            director.removePersistRootNode(this.loaderNode)
        }).start()
    }
}
