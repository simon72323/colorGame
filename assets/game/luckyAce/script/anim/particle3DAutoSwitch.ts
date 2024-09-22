import { _decorator, Component, ParticleSystem } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('particle3DAutoSwitch')
export class particle3DAutoSwitch extends Component {
    @property({ type: [ParticleSystem], tooltip: "粒子物件，跟隨啟用/禁用狀態，設置播放與停止噴發" })
    public particles: ParticleSystem[] = [];

    private parConstant: number[] = [];

    // onLoad(){
    //     for (let i = 0; i < this.particles.length; i++) {
    //         this.parConstant[i] = this.particles[i].rateOverTime.constant;  //記錄粒子噴發數 
    //     }
    //     console.error('記錄粒子噴發數'+this.parConstant[0]+'，'+this.parConstant[1]);
    // }

    public onEnable(): void {
        for (const particle of this.particles) {
            particle.play(); //重播粒子 
        }
        // for (let i = 0; i < this.particles.length; i++) {
        //     this.particles[i].rateOverTime.constant = this.parConstant[i]; //讀取記錄的粒子噴發數 
        //     this.particles[i].play(); //重播粒子
        // }
    }

    // public stopParticle(): void {
    //     for (const particle of this.particles) {
    //         particle.rateOverTime.constant = 0; //停止粒子噴發，數量減至0 
    //     }
    // }

    // public onDisable(): void {
    //     for (let i = 0; i < this.particles.length; i++) {
    //         this.particles[i].rateOverTime.constant = this.parConstant[i]; //回復粒子原設定噴發數量 
    //     }
    // }
}