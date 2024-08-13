import { URLParameter } from "../url/URLParameter";




export class LangSupport {

    private source: string;


    private map: Map<string, string[]> = new Map();

    
    constructor(source: string = URLParameter.lang) {
        this.source = source;
    }


    /** 
     * 新增支援的語系
     * @param lang 語系
     * @param alias 語系別名
     */
    addSupport(lang: string, ...alias: string[]) {

        if (!this.map.has(lang)) {
            this.map.set(lang, [lang]);
        }

        if (alias) {
            if (alias instanceof Array) {
                const ary = this.map.get(lang);
                alias = alias.filter((v) => !ary.includes(v));
                this.map.get(lang).push(...alias);
            }
        }
    }
    deleteSupport(lang: string) {
        this.map.delete(lang);
    }

    get lang() {

        let result: string;

        this.map.forEach((alias, lang) => {
            if (alias.includes(this.source) && result == undefined) {
                result = lang;
            }
        });

        return result;
    }


}


export const GameSupportLang = new LangSupport();

GameSupportLang.addSupport('tw', 'zh-tw');
GameSupportLang.addSupport('cn', 'zh-cn', 'ug');
GameSupportLang.addSupport('en', 'us');
