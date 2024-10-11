import { _decorator, Component, Label } from 'cc';
const { ccclass, property, menu } = _decorator;

@ccclass('LocalizedLabel')
@menu('i18n/LocalizedLabel')
export class LocalizedLabel extends Component {
    @property({ tooltip: 'key' })
    public key: string = '';

    updateLabel(languageData: any) {
        if (this.key === '' || !languageData)
            return;
        const label = this.getComponent(Label);
        if (label)
            label.string = languageData[this.key];
    }
}