import { GetCookie } from "../Cookie";
import { URLParameter } from "../url/URLParameter";
import { Device } from "./Device";

export enum OrientationType {
    landscape = 0,
    portrait = 1,
}

//遊戲方向定義在字典檔中 direction
//HFLoader 會將字典檔 direction 寫進cookie

function GetDirection(): number {
    const direction = GetCookie('direction');

    if (direction === null) {
        return OrientationType.landscape;
    } else {
        return parseInt(direction);
    }
}
/**
 * 字典檔中定義的遊戲方向
 */
export const DefineDirection: number = GetDirection();

/**
 * 實際遊戲應該的方向
 */
export const GameSetOrientation: OrientationType.landscape | OrientationType.portrait = Device.mobile ? DefineDirection % 2 : DefineDirection >> 1;

export function NowOrientation(): OrientationType {
    if (window.innerHeight > window.innerWidth) {
        return OrientationType.portrait;
    }
    else {
        return OrientationType.landscape;
    }
}

export function isGameSetOrientation(): boolean {
    return NowOrientation() === GameSetOrientation;
}


export class OrientationPageClass {

    private _imgUrl: string;

    private element: HTMLDivElement;

    private _gameOrientation: OrientationType;
    
    public get isReady():boolean {
        return (!!this.element);
    } 

    public nowOrientation: (width?: number, height?: number) => {} = (width?: number, height?: number) => NowOrientation();

    constructor() {
        const name = GameSetOrientation === OrientationType.landscape ? 'portrait' : 'landscape';
        this._imgUrl = `${URLParameter.shareFileUrl}Mobile/Picture/hint/${name}.gif`;
    }

    set imageURL(url: string) {
        this._imgUrl = url;
        if (this.element) {
            this.element.style.backgroundImage = `url(${url})`;
        }
    }


    setOrientation(orientation: OrientationType) {
        this._gameOrientation = orientation;
        this.init();
        // this.setup();
    }

    init() {
        if (!this.element) {
            const element = parent.document.createElement("div") as HTMLDivElement;
            element.id = 'OrientationPage';

            Object.assign(element.style, {
                backgroundImage: `url(${this._imgUrl})`,
                backgroundColor: "rgb(0,0,0)",
                backgroundSize: 'contain', //--2018.08.22修改 , 修為contain 原始50%在橫向顯示會切邊
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                width: '100%',
                height: '100%',
                zIndex: '5',
                top: '0px',
                left: '0px',
                overflow: 'visible',
                position: 'fixed',
            } as CSSStyleDeclaration);

            parent.document.body.appendChild(element);

            this.element = element;

        }
        this.check();

    }
    setup() {
        parent.window.addEventListener('resize', this.onResize);
        parent.window.addEventListener('orientationchange', () => this.check());
    }

    show() {
        if (this.element?.style.visibility != 'visible') {
            this.element.style.visibility = 'visible';
        }
    }
    hide() {
        if (this.element?.style.visibility != 'hidden') {
            this.element.style.visibility = 'hidden';
        }
    }

    public onResize = () => {
        this.check();
        setTimeout(this.check, 450);
    };

    public check = (width?: number, height?: number) => {

        const aspect_ratio = [window.screen.width, window.screen.height].sort().reduce((a, b) => { return b / a; });
        if (aspect_ratio < 1.2) {
            // 接近正方形的裝置不顯示
            this.hide();
            return;
        } else {            
            if (this._gameOrientation == this.nowOrientation(width, height)) {
                this.hide();
            } else {
                this.show();
            }
        }
    };
}

export const OrientationPage = new OrientationPageClass();