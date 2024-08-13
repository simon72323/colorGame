import { 
    Component, _decorator, Node, Label, WebView, game, screen, math, director, UITransform, view
} from "cc";
import {
    CCString, CCBoolean, CCObject, CCInteger, Enum
} from "cc";
import { ToolBarEventName } from "../../include";
import { BaseSettings, InitialArguments } from "./BaseSettings";
import { Resize } from "../../tools/Resize";
const { ccclass, property, menu } = _decorator;

@ccclass()
@menu('Mahjong/SettingsWebView')
export class SettingsWebView extends BaseSettings {

    @property( { type: WebView, tooltip: 'Iframe' } )
    protected webView: WebView = null;
    @property( { type: CCString, tooltip: '網址', visible: function () { return !!this.webView } } )
    public get website(): string {
        return this.webView ? this.webView.url : "";
    }
    public set website(value: string) {
        this.webView.url = value;
    }

    protected initialize(): void {
        const { node } = this;
        this.webView = node?.getChildByName('webView')?.getComponent(WebView);
        this.event = node?.parent;
        
        super.initialize();
    }
    public show(url?: string): void {
        if (this.website) this.website = url;
        this.node.active = true;

        const webviewWrapper = document.getElementById('webview-wrapper');
        if (webviewWrapper) { // if 條件通過代表初創好 webview-wrapper；以下將此 webview-wrapper 重新命名

            const contentSize: math.Size = this.webView.node.getComponent(UITransform).contentSize.clone();
            let resize: ()=>void = ()=> {
                const dpr = screen.devicePixelRatio;
                const scaleX = 1 / dpr;
                const scaleY = 1 / dpr;
    
                const camera = director.root.batcher2D.getFirstRenderCamera(this.node.parent);
                let m: math.Mat4 = new math.Mat4();
                this.node.getWorldMatrix(m);
                camera.update(true);
                camera.worldMatrixToScreen(m, m, game.canvas.width, game.canvas.height);
    
                let sx: number = m.m00 * scaleX;
                let sy: number = m.m05 * scaleY; 
                
                const destScale: number = 1.2;
                this.webView.node.setScale(destScale / sx, destScale / sy);
                this.webView.node.getComponent(UITransform).setContentSize(contentSize.width * sx / destScale, contentSize.height * sy / destScale);
            }

            view.on('canvas-resize', resize);

            resize();

            let x: number = Number(game.canvas.style.left.split("px")[0]);
            let y: number = Number(game.canvas.style.top.split("px")[0]);
            webviewWrapper.style.left = `${x}px`;
            webviewWrapper.style.bottom = `${y}px`;
            webviewWrapper.id = this.node.name;
            Resize.getInstance().addWebviewWrapper(webviewWrapper);
        }
    }
}