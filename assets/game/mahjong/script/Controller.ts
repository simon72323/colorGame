import { Component, ImageAsset, Label, Node, ProgressBar, Scene, Sprite, SpriteFrame, Texture2D, UIOpacity, _decorator, assetManager, director, game, tween } from 'cc'
import { Application } from "./Applicaiton"
import { LanguageManager } from './LanguageManager';
import { LanguageFiles } from './LanguageFiles';
import { AudioManager } from './components/AudioManager';
import { AlertPanel } from './components/AlertPanel';
import { SoundFiles } from './components/SoundFiles';
import { URLParameter } from './include';
import { InputKeyboard } from './components/InputKeyboard';
const { ccclass, property } = _decorator;

@ccclass('Controller')
export class Controller extends Component {

    @property({type: Label})
    private progressText: Label = null

    @property({type: ProgressBar})
    private progressBar: ProgressBar = null

    @property({type:Node})
    private LabelNode: Node = null

    private nowProcessGame = 0

    maxLanguageManagerProcess = 10
    maxGameProcess = 70
    maxLoadProcess = 10

    private loaderScene: Scene
    private gameScene: Scene
    private loaderNode: Node

    private languageManagerCompleted: boolean = false;
    private sceneCompleted: boolean = false;
    private languageManagerProgress: number = 0;
    private sceneProgress: number = 0;


    start() {
        let app = Application.getInstance()
        app.onLoad()
        app.SetProcessNum = this.setProcessNum
        app.CloseLoader = this.CloseLoader
        app.Reconnect = this.Reconnect

        assetManager.loadRemote<ImageAsset>(`${URLParameter.shareFileUrl}PC/Picture/loading.png`, (err, imageAsset) => {
            if (err) {
                console.error('Failed to load image:', err);
                return;
            }

            const scene: Scene = director.getScene();
            if (scene.name == "Controller") {
                const texture = new Texture2D();
                texture.image = imageAsset;
                
                const spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;
                
                const node: Node = new Node();
                const sprite: Sprite = node.addComponent(Sprite);
                sprite.spriteFrame = spriteFrame;

                const LoaderCanvas: Node = scene.getChildByName("Canvas");
                LoaderCanvas.addChild(node);
                node.setSiblingIndex(0);
            }
        });

        AudioManager.getInstance().muted(true);

        LanguageManager.getInstance().node.on("completed", ()=>{
            this.languageManagerCompleted = true;
            this.languageManagerProgress = this.maxLanguageManagerProcess;
            this.updateProgress();
            if (this.languageManagerCompleted && this.sceneCompleted) {
                this.onComplete();
            }
        });

        director.preloadScene('Loader', (completedCount, total, item) => { 
            let num = this.processNumCalculator(completedCount, total)
            this.progressText.string = Math.trunc(num*this.maxLoadProcess)+'%'
        }, (err, assert) => {
            director.loadScene("Loader", (err, sce)=> {
                this.loaderScene = sce
                let LoaderCanvas = sce.getChildByName("Canvas")
                this.loaderNode = sce.getChildByName("loading")
                director.addPersistRootNode(this.loaderNode)
                LoaderCanvas.addChild( this.loaderNode)
                let ref = this.loaderNode.getComponent(UIOpacity)
                this.progressBar = this.loaderNode.getChildByName("loadBar").getComponent(ProgressBar)
                this.progressText = this.loaderNode.getChildByName("label").getComponent(Label)
                this.progressBar.progress = 0.1
                this.progressText.string = "10%"
                this.loadGameScene()
                tween(ref).to(0.3,{opacity: 255}).call(() => { }).start()
                this.nowProcessGame = 0
                LanguageManager.getInstance().setSpriteFrame(this.loaderNode.getChildByName('logo').getComponent(Sprite), LanguageFiles.Logo);
            })
        })
    }
    protected onLoad(): void {
        this.progressText = this.node.getChildByName("Label").getComponent(Label)
    }

    update(deltaTime: number) {
    }

    protected loadGameScene() {
        director.preloadScene('scene', (completedCount, total, item) => { 
            let num = this.processNumCalculator(completedCount, total)
            this.sceneProgress = Math.trunc(num * this.maxGameProcess);
            this.updateProgress();
        }, (err, assert) => {
            this.sceneCompleted = true;
            if (this.languageManagerCompleted && this.sceneCompleted) {
                this.onComplete();
            }
        })
    }

    protected updateProgress() {
        this.progressText.string = 10 + this.sceneProgress + this.languageManagerProgress + '%';
        this.progressBar.progress = 0.1 + (this.sceneProgress + this.languageManagerProgress) / 100;
    }

    protected onComplete() {
        let LoaderCanvas = this.loaderScene.getChildByName("Canvas")
        LoaderCanvas.removeAllChildren()
        director.loadScene("scene", (a, scene) => {
            this.gameScene = scene
            let GameCanvas = scene.getChildByName("Canvas");
            // 移動到AlertPanel後面 90 - 100
            GameCanvas.insertChild(this.loaderNode, GameCanvas.getChildByName('alertPanel').getSiblingIndex());
        })
    }

    Reconnect = async () => {
        // 清除聲音
        await AudioManager.getInstance().release();
        // 清除Alert singleton
        AlertPanel.getInstance().release();
        InputKeyboard.getInstance().release();
        
        director.addPersistRootNode(this.loaderNode);
        director.loadScene("scene", (a, scene) => {  
            this.gameScene = scene;
            let GameCanvas = scene.getChildByName("Canvas");
            GameCanvas.addChild(this.loaderNode);
            this.loaderNode.getComponent(UIOpacity).opacity = 255;
       })
    }
    
    protected processNumCalculator(completedCount: number, total: number): number {
        let numP = completedCount/total
        if (numP > 1) {
            numP = 1
        } else if (numP < this.nowProcessGame) {
            numP = this.nowProcessGame
        }
        this.nowProcessGame = numP
        return numP
    }

    setProcessNum = (num: number) => {
        this.progressText.string = num+'%'
        this.progressBar.progress = num / 100
    }

    CloseLoader = () => {
        let UIO = this.loaderNode.getComponent(UIOpacity)
        tween(UIO).to(0.3,{opacity: 0}).call(() => { 
            let GameCanvas = this.gameScene.getChildByName("Canvas")
            GameCanvas.removeChild(this.loaderNode)
            director.removePersistRootNode(this.loaderNode)
        }).start()
    }
}
