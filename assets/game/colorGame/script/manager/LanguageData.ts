import { director } from 'cc';
import { LocalizedLabel } from './LocalizedLabel';

export let _language = 'cn';

export let ready: boolean = false;

/**
 * 初始化
 * @param language 
 */
export function init(language: string) {
    ready = true;
    _language = language;
}

/**
 * 翻译数据
 * @param key 
 */
export function text(key: string): string {
    const win = window as any;

    if (!win.languages) {
        return key;
    }
    const searcher = key.split('.');
    let data = win.languages[_language];

    for (let i = 0; i < searcher.length; i++) {
        data = data[searcher[i]];
        if (!data) {
            return '';
        }
    }
    return data || '';
}

export function updateSceneRenderers() { // very costly iterations
    // const scene = director.getScene();
    // if (!scene) return;

    // // 使用一次遍历来收集所有需要更新的组件
    // const components = scene.getComponentsInChildren('LocalizedLabel');

    // // 更新所有活跃的组件
    // components.forEach(component => {
    //     if (component.node.active && component instanceof LocalizedLabel) {
    //         // component.updateLabel();//執行語系更新
    //     }
    // });
}

// 供插件查询当前语言使用
const win = window as any;
win._languageData = {
    get language() {
        return _language;
    },
    init(lang: string) {
        init(lang);
    },
    updateSceneRenderers() {
        updateSceneRenderers();
    },
};
