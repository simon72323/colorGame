import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LocalizedLabel')
export class LocalizedLabel extends Component {
    @property({ tooltip: 'key' })
    key: string = '';

    updateLabel(languageData: any) {
        if (this.key === '' || !languageData)
            return;
        const label = this.getComponent(Label);
        if (label)
            label.string = languageData[this.key];
    }
}