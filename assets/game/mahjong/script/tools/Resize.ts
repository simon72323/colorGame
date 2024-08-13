import { _decorator, Size, view, ResolutionPolicy, director, game, screen, macro, sys } from 'cc';
import { OrientationPage, OrientationType } from '@casino-mono/share-tools';
import { log } from '../include';

export class Resize
{
    private static singleton:Resize = null;

    private _leftBG:HTMLImageElement;
    private _rightBG:HTMLImageElement;
    private _arrWebviewWrapper:Array<any>;

    set leftBG(bg:HTMLImageElement) { 
        this._leftBG = bg;
        game.canvas.parentNode.appendChild(this._leftBG);
        game.canvas.parentElement.style.backgroundColor = "";
        this.resize();
    }

    set rightBG(bg:HTMLImageElement) { 
        this._rightBG = bg;
        game.canvas.parentNode.appendChild(this._rightBG);
        game.canvas.parentElement.style.backgroundColor = "";
        this.resize();
    }

    constructor() {
        this._arrWebviewWrapper = [];

        view.setOrientation(macro.ORIENTATION_PORTRAIT);
        view.setResolutionPolicy(ResolutionPolicy.EXACT_FIT);

        game.canvas.style.backgroundColor = "black";
        game.canvas.parentElement.style.backgroundColor = "black";

        this.resize();
        view.on('canvas-resize', this.resize);
        // view.setResizeCallback(this.resize);
        if (sys.isMobile) {
            OrientationPage.setOrientation(OrientationType.portrait);
            OrientationPage.setup();
        }
    }

    public resize:()=>void = ()=>{
        log("resize");

        const devicePixelRatio:number = screen.devicePixelRatio;
        const designResolutionSize:Size = view.getDesignResolutionSize();
        const windowSize:Size = screen.windowSize;

        const containerW:number = windowSize.width;
        const containerH:number = windowSize.height;
        const designW:number = designResolutionSize.width;
        const designH:number = designResolutionSize.height;

        let scaleX:number = containerW / designW;
        let scaleY:number = containerH / designH;
        let scale:number = 0;
        let contentW:number;
        let contentH:number;
        if (scaleX < scaleY) {
            scale = scaleX;
            contentW = containerW;
            contentH = designH * scale;
        } else {
            scale = scaleY;
            contentW = designW * scale;
            contentH = containerH;
        }

        let x:number = Math.floor(0.5 * (containerW - contentW) / devicePixelRatio);
        let y:number = Math.floor(0.5 * (containerH - contentH) / devicePixelRatio);
        let w:number = Math.floor(contentW / devicePixelRatio);
        let h:number = Math.floor(contentH / devicePixelRatio); 
        game.canvas.style.position = "absolute";
        game.canvas.style.width = `${w}px`;
        game.canvas.style.height = `${h}px`;
        game.canvas.style.left = `${x}px`;
        game.canvas.style.top = `${y}px`;

        director.root.resize(contentW, contentH);

        let len:number = this._arrWebviewWrapper.length;
        for (let i:number = 0; i < len; i++) {
            let webviewWrapper = this._arrWebviewWrapper[i];
            webviewWrapper.style.left = `${x}px`;
            webviewWrapper.style.bottom = `${y}px`;
        }

        if (this._leftBG) {

            if (x == 0) {
                scaleX = containerW / devicePixelRatio / this._leftBG.naturalWidth;
                scaleY = containerH / devicePixelRatio / this._leftBG.naturalHeight;
                scale = Math.max(scaleX, scaleY, 1);

                contentW = Math.floor(this._leftBG.naturalWidth * scale);
                contentH = Math.floor(this._leftBG.naturalHeight * scale);

                this._leftBG.style.left = `${0}px`;
            } else {
                scaleX = x / this._leftBG.naturalWidth;
                scaleY = containerH / devicePixelRatio / this._leftBG.naturalHeight;
                scale = Math.max(scaleX, scaleY, 1);

                contentW = Math.floor(this._leftBG.naturalWidth * scale);
                contentH = Math.floor(this._leftBG.naturalHeight * scale);

                this._leftBG.style.left = `${Math.floor(x-contentW)}px`;
            }
            this._leftBG.style.width = `${contentW}px`;
            this._leftBG.style.height = `${contentH}px`;
        }

        if (this._rightBG) {
            
            if (x == 0) {
                this._rightBG.style.visibility = "hidden";
            } else {
                this._rightBG.style.visibility = "visible";

                scaleX = x / this._rightBG.naturalWidth;
                scaleY = containerH / devicePixelRatio / this._rightBG.naturalHeight;
                scale = Math.max(scaleX, scaleY, 1);

                contentW = Math.floor(this._rightBG.naturalWidth * scale);
                contentH = Math.floor(this._rightBG.naturalHeight * scale);

                x += w;

                this._rightBG.style.left = `${x}px`;
                this._rightBG.style.width = `${contentW}px`;
                this._rightBG.style.height = `${contentH}px`;
            }
        }

        game.canvas.parentElement.style.width = `${Math.floor(containerW / devicePixelRatio)}px`;
        game.canvas.parentElement.style.height = `${Math.floor(containerH / devicePixelRatio)}px`;
        document.body.style.overflow = "hidden";
    }
    
    public addWebviewWrapper(webviewWrapper:any):void {
        this._arrWebviewWrapper.push(webviewWrapper);
    }
    public static getInstance():Resize {
        if (!Resize.singleton) {
            Resize.singleton = new Resize();
        }
        return Resize.singleton;
    }
}
