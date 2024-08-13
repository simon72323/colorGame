import vhCheck from 'vh-check';  //用vh-check來檢查是否為全螢幕
import urlJoin from "../url/URLJoin";
import { NowOrientation, OrientationType } from "./Orientation";
import { URLParameter } from "../url/URLParameter";
import { Device } from "./Device";


interface IFullScreen {
    imageURL: string;
    closeURL: string;
    setType(orientation: OrientationType | OrientationType[]): void;
    isFull(): boolean;
    show(): void;
    hide(): void;
}

export class FullScreenClass implements IFullScreen {

    set imageURL(url: string) {
        if (this._imgUrl === url) return;
        //
        this._imgUrl = url;
        if (this.bgDiv) {
            this.bgDiv.style.backgroundImage = `url(${url})`;
        }
        else {
            throw new Error('FullScreenPage not init.please call FullScreen.setType() first');
        }
    }


    set closeURL(url: string) {
        if (this._closeUrl === url) return;
        this._closeUrl = url;
        if (this.closeBtn) {
            this.closeBtn.style.backgroundImage = `url(${url})`;
        } else {
            throw new Error('FullScreenPage not init.please call FullScreen.setType() first');
        }
    }



    private gameOrientation: OrientationType | OrientationType[];

    private extraDiv: HTMLDivElement;
    private bgDiv: HTMLDivElement;
    private closeBtn: HTMLAnchorElement;

    private _imgUrl: string = '';
    private _closeUrl: string = '';

    /** 
     * 設定要顯示全螢幕上滑的方向 , 可指定單一方向 ,若兩個方向都要顯示則用陣列傳入
     */
    setType(orientation: OrientationType | OrientationType[]): void {
        if (Device.mobile) {
            this.gameOrientation = orientation;
            this.init();
        }
    }


    private offsetMax: number = 0;
    isFull(): boolean {
        const result = vhCheck({
            cssVarName: 'vh-offset',
            force: false,
            bind: true,
            redefineVh: false,
            updateOnTouch: false,
        });

        this.offsetMax = Math.max(this.offsetMax, result.offset);
        return result.value < 5;
    }


    private init() {
        ////////////////////////////////////////////////////////////////////////////////
        this.extraDiv = parent.document.createElement('div');
        this.extraDiv.id = 'extra_div';
        Object.assign(this.extraDiv.style, {
            backgroundColor: 'rgba(1, 1, 1, 0.7)',
            backgroundRepeat: "no-repeat",
            width: '100%',
            height: 'calc(300%)',
            position: 'absolute',
            top: '0px',
            left: '0px',
            visibility: 'visible',
            overflow: 'scroll',
            backgroundSize: 'contain',
            zIndex: '1',
        } as Partial<CSSStyleDeclaration>);
        parent.document.body.appendChild(this.extraDiv);
        ////////////////////////////////////////////////////////////////////////////////
        this.bgDiv = parent.document.createElement('div');
        this.imageURL = urlJoin(URLParameter.shareFileUrl, 'Mobile/Picture/hint/tips.gif');
        Object.assign(this.bgDiv.style, {
            width: '100%',
            height: '100%',
            position: 'fixed',
            top: '0px',
            left: '0px',
            zIndex: '5',
            backgroundSize: 'auto 80%',
            // backgroundSize',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: "50% 90%"
        } as Partial<CSSStyleDeclaration>);
        parent.document.body.appendChild(this.bgDiv);
        ////////////////////////////////////////////////////////////////////////////////

        this.closeBtn = parent.document.createElement("a");
        this.closeBtn.id = 'fullclose_div';
        this.closeURL = urlJoin(URLParameter.shareFileUrl, 'Mobile/Picture/hint/btn_Close.png');

        Object.assign(this.closeBtn.style, {
            width: '15%',
            height: '15%',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            zIndex: '6',
            position: 'fixed',
            top: '15%',
            right: '0px',
            transform: "translate(-50%, -50%)",
            visibility: 'visible',

        } as Partial<CSSStyleDeclaration>);

        parent.document.body.appendChild(this.closeBtn);
        this.closeBtn.addEventListener('click', this.hide.bind(this));

        ////////////////////////////////////////////////////////////////////////////////
        this.extraDiv.addEventListener('touchmove', this.check.bind(this));

        document.addEventListener("gesturestart", e => e.preventDefault());
        document.addEventListener("gesturechange", e => e.preventDefault());
        document.addEventListener("gestureend", e => e.preventDefault());

        const handleEvt = () => {
            //避免 reszie event 觸發後有重新resize 行為,但沒有觸發rezie event
            //故在handel event 後500ms 再次檢查
            this.check();
            setTimeout(this.check.bind(this), 500);
        };
        window.addEventListener('resize', handleEvt);
        window.addEventListener('orientationchange', handleEvt);
        window.addEventListener('scroll', handleEvt);
        this.check();
    }




    public hide() {
        if (this.extraDiv?.style.visibility != 'hidden') {
            //only do change when is not hidden
            this.extraDiv.style.visibility = 'hidden';
            this.closeBtn.style.visibility = 'hidden';
            this.bgDiv.style.visibility = 'hidden';

        }
    }
    public show() {
        this.resize();
        if (this.extraDiv?.style.visibility != 'visible') {
            //only do change to when is not visible
            this.extraDiv.style.visibility = 'visible';
            this.closeBtn.style.visibility = 'visible';
            this.bgDiv.style.visibility = 'visible';
            this.scrollTop();//在顯示上滑頁面時強制將頁面滑到最上方 , 讓使用者可操作上滑
        }
    }

    private isOrientationToShow() {
        const orientation = NowOrientation();

        if (this.gameOrientation instanceof Array) {
            return this.gameOrientation.includes(orientation);
        } else {
            return this.gameOrientation == orientation;
        }
    }


    private check = () => {
        if (this.isOrientationToShow() == false) {
            this.hide();
        }
        else {
            if (this.isFull()) {
                this.hide();
            }
            else {
                this.show();
            }
        }
    };

    private resize() {
        const orientation = NowOrientation();

        if (orientation == OrientationType.portrait) {
            this.bgDiv.style.backgroundSize = "contain";
            this.bgDiv.style.backgroundPosition = "50% 85%";
            this.closeBtn.style.top = '15%';
        }
        else if (orientation == OrientationType.landscape) {
            this.bgDiv.style.backgroundSize = "auto 80%";
            this.bgDiv.style.backgroundPosition = "50% 90%";
            this.closeBtn.style.top = '15%';
        }
    }


    private scrollTop() {
        window.scrollTo(0, 0);
        window.document.body.scrollTop = 0;
        window.scrollY = 0;
    }
}


export const FullScreenPage = new FullScreenClass();