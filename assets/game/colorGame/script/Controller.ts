import { Component, ImageAsset, JsonAsset, Label, Node, ProgressBar, Scene, Sprite, SpriteFrame, Texture2D, UIOpacity, _decorator, assetManager, director, game, tween } from 'cc'
// import { Application } from "./Applicaiton"
import { LanguageManager } from './components/LanguageManager';
// import { LanguageFiles } from './LanguageFiles';
import { AudioManager } from './components/AudioManager';
import { CGPathManager } from './components/CGPathManager';
// import { AlertPanel } from './components/AlertPanel';
// import { SoundFiles } from './components/SoundFiles';
// import { URLParameter } from './include';
// import { InputKeyboard } from './components/InputKeyboard';
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

    maxLanguageManagerProcess = 10
    maxGameProcess = 70
    maxPathProcess = 20
    maxLoadProcess = 100

    // private loaderScene: Scene
    // private gameScene: Scene
    // private loaderNode: Node

    private languageManagerCompleted: boolean = false;
    private sceneCompleted: boolean = false;
    private pathCompleted: boolean = false;
    private languageManagerProgress: number = 0;
    private sceneProgress: number = 0;
    private pathProgress: number = 0;

    start() {
        AudioManager.getInstance().muted(true);
        
        //語系掛載之後會改用棋牌的方式
        LanguageManager.getInstance().node.on("completed", () => {
            // console.log("語系加載完成")
            this.languageManagerCompleted = true;
            this.languageManagerProgress = this.maxLanguageManagerProcess;
            this.updateProgress();
            if (this.languageManagerCompleted && this.sceneCompleted && this.pathCompleted) {
                this.onComplete();
            }
        });

        CGPathManager.getInstance().node.on("completed", () => {
            // console.log("路徑加載完成")
            this.pathCompleted = true;
            this.pathProgress = this.maxPathProcess;
            this.updateProgress();
            if (this.languageManagerCompleted && this.sceneCompleted && this.pathCompleted) {
                this.onComplete();
            }
        });

        director.preloadScene('Load', (completedCount, total, item) => {
            let num = this.processNumCalculator(completedCount, total)
            this.progressText.string = Math.trunc(num * this.maxLoadProcess) + '%'
        }, (err, assert) => {
            director.loadScene("Load", (err, sce) => {
                const loaderNode = sce.getChildByName("Canvas").getChildByName("loading")
                director.addPersistRootNode(loaderNode)
                let ref = loaderNode.getComponent(UIOpacity)
                this.progressBar = loaderNode.getChildByName("loadBar").getComponent(ProgressBar)
                this.progressText = loaderNode.getChildByName("label").getComponent(Label)
                this.progressBar.progress = 0
                this.progressText.string = "0%"
                // console.log("開始加載場景",this.pathDataNode)
                this.loadGameScene();
                tween(ref).to(0.3, { opacity: 255 }).call(() => { }).start()
                this.nowProcessGame = 0
                // LanguageManager.getInstance().setSpriteFrame(this.loaderNode.getChildByName('logo').getComponent(Sprite), LanguageFiles.Logo);
            })
        })
    }
    protected onLoad(): void {
        this.progressText = this.node.getChildByName("Label").getComponent(Label);
    }

    protected loadGameScene() {
        director.preloadScene('ColorGame', (completedCount, total, item) => {
            let num = this.processNumCalculator(completedCount, total)
            this.sceneProgress = Math.trunc(num * this.maxGameProcess);
            this.updateProgress();
        }, (err, assert) => {
            console.log("場景加載完成")
            this.sceneCompleted = true;
            if (this.languageManagerCompleted && this.sceneCompleted && this.pathCompleted) {
                this.onComplete();
            }
        })
    }

    protected updateProgress() {
        this.progressText.string = this.sceneProgress + this.languageManagerProgress + this.pathProgress + '%';
        this.progressBar.progress = (this.sceneProgress + this.languageManagerProgress + this.pathProgress) / 100;
    }

    //加載完成
    protected onComplete() {
        // let LoaderCanvas = this.loaderScene.getChildByName("Canvas")
        // LoaderCanvas.removeAllChildren()
        director.loadScene("ColorGame", (a, scene) => {
            // this.gameScene = scene
            // console.log(this.gameScene)
            // console.log("路徑節點", this.pathDataNode)
            // let GameCanvas = scene.getChildByName("Canvas");
            // 移動到AlertPanel後面 90 - 100
            // GameCanvas.insertChild(this.loaderNode, GameCanvas.getChildByName('alertPanel').getSiblingIndex());
        })
    }

    // Reconnect = async () => {
    //     // 清除聲音
    //     await AudioManager.getInstance().release();
    //     // 清除Alert singleton
    //     AlertPanel.getInstance().release();
    //     InputKeyboard.getInstance().release();

    //     director.addPersistRootNode(this.loaderNode);
    //     director.loadScene("ColorGame", (a, scene) => {
    //         this.gameScene = scene;
    //         let GameCanvas = scene.getChildByName("Canvas");
    //         GameCanvas.addChild(this.loaderNode);
    //         this.loaderNode.getComponent(UIOpacity).opacity = 255;
    //     })
    // }

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

    // CloseLoader = () => {
    //     // console.log("Loader關閉")
    //     let UIO = this.loaderNode.getComponent(UIOpacity)
    //     tween(UIO).to(0.3, { opacity: 0 }).call(() => {
    //         let GameCanvas = this.gameScene.getChildByName("Canvas")
    //         GameCanvas.removeChild(this.loaderNode)
    //         director.removePersistRootNode(this.loaderNode)
    //     }).start()
    // }
}
