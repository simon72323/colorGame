import { Device } from "../environment/device/Device";
import { URLParameter } from "../environment/url/URLParameter";


const timestamps = [
    'entrance',
    'loader',
    'ws',
    'login',
    'takeMachine',
    'loadInfo',
    'getMachineDetail',
    'onGetMachineDetail',
    'done',
] as const;

interface SetInfo {
    GameType: string,
    HallID: number,
    UserID: number,
    SessionID: string,
    Domain: string,
    Browser: string,
    OS: string,
    Portal: string,
    CDN: string,
    MemberDomain: string,
    ClickGame: number,
}
interface SentTime {
    Entrance: number,
    Loader: number,
    WebSocket: number,
    LoginCheck: number,
    TakeMachine: number,
    OnLoadInfo2: number,
    GetMachineDetail: number,
    Complete: number,
}

type SendData = SetInfo & SentTime;


type timestamp = Partial<Record<typeof timestamps[number], number>>;

function encodeFormData(data) {
    if (!data) return "";    // Always return a string
    var pairs = [];          // To hold name=value pairs
    for (var name in data) {                                  // For each name
        if (!data.hasOwnProperty(name)) continue;            // Skip inherited
        if (typeof data[name] === "function") continue;      // Skip methods
        let value = "";
        if (typeof data[name] != 'undefined' && typeof data[name].toString == 'function') {
            value = data[name].toString();
        }
        name = encodeURIComponent(name.replace(" ", "+"));   // Encode name
        value = encodeURIComponent(value.replace(" ", "+")); // Encode value
        pairs.push(name + "=" + value);   // Remember name=value pair
    }
    return pairs.join('&'); // Return joined pairs separated with &
}


export class PlayerLoaderInfoImpl {

    private timestamp: timestamp = {};
    private info: SetInfo;

    get portal() {
        let portal = '';
        switch (URLParameter.platform) {
            case 'AIO':
                if (URLParameter.mua) portal = URLParameter.mua;
                else portal = "AIO";
                break;
            case 'app':
                portal = "APP";
                break;
            case null:
                if (Device.mobile || Device.tablet)
                    portal = "Phone";
                else portal = "PC";
                break;
            default:
                portal = "其他";
                break;
        }
        return portal;
    }

    /**
     * user 需要手動設定對應的資訊
     */
    setInfo(info: SetInfo) {
        this.info = info;
    }


    /**
     * 
     * entrance: 進入頁面.  
     * loader: loader 載入完成.  
     * ws: ws 連線完成.  
     * login: ws 收到onLogin  
     * takeMachine: ws 收到onTakeMachine
     * loadInfo: ws 收到onLoadInfo
     * getMachineDetail : call getMachineDetail
     * onGetMachineDetail : ws 收到onGetMachineDetail
     * done : 遊戲開始
     */
    setTimeStemp(key: keyof timestamp) {
        if (!timestamps.includes(key)) return;
        if (this.timestamp[key] == null) {
            this.timestamp[key] = Date.now();
        }
    }

    getTimeStamp(key: keyof timestamp) {
        return this.timestamp[key] || 0;
    }

    send() {

        if (!this.canSend()) return;

        let GetMachineDetail = () => {
            const loadinfo = this.getTimeStamp('loadInfo');
            const costOfGetMachineDetail = this.getTimeStamp('onGetMachineDetail') - this.getTimeStamp('getMachineDetail');
            return loadinfo + costOfGetMachineDetail;
        };
        let Complete = () => {
            return Math.max(this.getTimeStamp('done'), this.getTimeStamp('onGetMachineDetail'));
        };

        let data: SendData = {
            ...this.info,
            Portal: this.portal,
            Entrance: this.getTimeStamp('entrance'),
            Loader: this.getTimeStamp('loader'),
            WebSocket: this.getTimeStamp('ws'),
            LoginCheck: this.getTimeStamp('login'),
            TakeMachine: this.getTimeStamp('takeMachine'),
            OnLoadInfo2: this.getTimeStamp('loadInfo'),
            GetMachineDetail: GetMachineDetail(),
            Complete: Complete(),
        };
        this.postData(data);
    }

    private postData(data: SendData) {

        fetch(`${location.origin}/ipl/portal.php/game/casinofrontend_entrance/loadingtime`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: encodeFormData(data)
        })
            .then(res => { })
            .catch(err => { });

    }

    private canSend() {
        const checkNotSet: (keyof timestamp)[] = [
            'loader',
            'ws',
            'login',
            'takeMachine',
            'loadInfo',
            'done',
        ];

        for (let i = 0; i < checkNotSet.length; i++) {
            const key = checkNotSet[i];
            if (this.timestamp[key] == null || this.timestamp[key] == 0) {
                return false;
            }
        }

        return true;
    }

}
