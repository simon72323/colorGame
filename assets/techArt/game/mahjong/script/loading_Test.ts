import { _decorator, Component, ProgressBar, resources } from 'cc'
const { ccclass, property } = _decorator;

@ccclass('loading_Test')
export class loading_Test extends Component {

    @property({type: ProgressBar})
    private loadingBar: any = null

    start() {
        resources.preloadDir("loadingPage", (err, assets) => {
            console.log(err, assets)
        })
        this.loadingBar = this.node.getChildByName("ProgressBar").getComponent(ProgressBar)
        this.loadingBar.progress = 1


 
    //    this.loadingBar = this.getComponent(ProgressBar)
    //    if (this.loadingBar) {

    //    } else {
    //     console.log(123123, this.loadingBar)

    //    } 
    //    this.loadingBar.progress = 1
    }

    update(deltaTime: number) {
        
    }
}

