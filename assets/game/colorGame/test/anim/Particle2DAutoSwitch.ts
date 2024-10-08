import { _decorator, Component, ParticleSystem2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Particle2DAutoSwitch')
export class Particle2DAutoSwitch extends Component {
    @property({ type: [ParticleSystem2D], tooltip: "粒子物件，跟隨啟用/禁用狀態，設置播放與停止" })
    public particles: ParticleSystem2D[] = [];

    public onEnable(): void {
        for (const particle of this.particles) {
            particle.resetSystem();//重播粒子 
        }
    }

    public onDisable(): void {
        for (const particle of this.particles) {
            particle.stopSystem();//停止粒子 
        }
    }
}