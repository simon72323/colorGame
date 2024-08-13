export class PHPProiveHeadersClass {

    headers: { [key: string]: string; } | null;

    get apiUrl() {
        // api 放在 casinoH5/test.php
        // 所以要根據url組出正確的api url
        // 在本地端測試時 會透過proxy來將 localhost/ipl/ 轉到到對應的網址
        const target = 'casinoH5/';
        const index = this.url.href.indexOf(target) == -1 ? -1 : (this.url.href.indexOf(target) + target.length);
        const casinoH5 = (index == -1) ? `${this.url.origin}/ipl/app/flash/pig/game/casinoH5/` : this.url.href.slice(0, index);
        return casinoH5 + 'test.php';
    }

    private url: URL;

    constructor(href: string = window.location.href) {
        this.url = new URL(href);
        this.headers = null;
    }


    async get(key: string) {

        if (this.headers == null) {
            this.headers = await this.fetchHeader();
        }
        return this.headers ? this.headers[key] : '';
    }

    async getAll() {
        if (this.headers == null) {
            this.headers = await this.fetchHeader();
        }
        return this.headers ? this.headers : {};
    }

    private async fetchHeader() {
        return await fetch(this.apiUrl)
            .then(res => res.text())
            .then(this.parseResponseText)
            .catch(() => null);
    }


    private parseResponseText(inputText: string) {
        const lines = inputText.split('\n');
        return lines.reduce((data, line) => {
            const matchs = /\[(.*?)\]\s*=>\s*(.*)/.exec(line);
            if (matchs) {
                const [, key, value] = matchs;
                data[key] = value;
            }
            return data;
        }, {});
    }
}

export const PHPProiveHeaders = new PHPProiveHeadersClass();



//sample response text
// <pre>Array
// (
//     [USER] => root
//     [HOME] => /root
//     [HTTP_VIA] => 1.1 google
//     [HTTP_X_FORWARDED_PROTO] => http
//     [HTTP_X_CDN_SLOT] => slot2-qa.cfvn66.com
//     [HTTP_X_CDN_LW] => lw2-qa.cfvn66.com
//     [HTTP_X_CDN_CW] => cw2-qa.cfvn66.com
//     [HTTP_X_CDN_VX] => vx2-qa.cfvn66.com
//     [HTTP_X_CDN_LT] => lt-bbgp-qa.cfvn66.com
//     [HTTP_X_CDN_ANDROID_CN] => app.vir999.net
//     [HTTP_X_CDN_INHOUSE] => cloudapp.powercolorzi.com
//     [HTTP_X_ADC_CLIENT_IP] => 111.235.135.54
//     [HTTP_HTTPS] => on
//     [HTTP_X_FORWARDED_FOR] => 111.235.135.54,10.198.5.112,10.103.9.67
//     [HTTP_PRAGMA] => no-cache
//     [HTTP_CACHE_CONTROL] => no-cache
//     [HTTP_USER_AGENT] => Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36
//     [HTTP_ACCEPT] => */*
//     [HTTP_REFERER] => http://192.168.204.43:5173/
//     [HTTP_ACCEPT_ENCODING] => gzip, deflate
//     [HTTP_ACCEPT_LANGUAGE] => zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7
//     [HTTP_COOKIE] => PPA_CI=818fb56a012edd96306ec66a9f027732
//     [HTTP_HOST] => bbgp-game1.casinovir999.net
//     [HTTPS] => off
//     [REDIRECT_STATUS] => 200
//     [SERVER_NAME] => 
//     [SERVER_PORT] => 80
//     [SERVER_ADDR] => 10.125.131.58
//     [REMOTE_PORT] => 
//     [REMOTE_ADDR] => 111.235.135.54
//     [SERVER_SOFTWARE] => nginx/1.14.2
//     [GATEWAY_INTERFACE] => CGI/1.1
//     [REQUEST_SCHEME] => http
//     [SERVER_PROTOCOL] => HTTP/1.1
//     [DOCUMENT_ROOT] => /home/rd3-casino/casino_member/www
//     [DOCUMENT_URI] => /ipl/app/flash/pig/game/casinoH5/test.php
//     [REQUEST_URI] => /ipl/app/flash/pig/game/casinoH5/test.php
//     [SCRIPT_NAME] => /ipl/app/flash/pig/game/casinoH5/test.php
//     [CONTENT_LENGTH] => 
//     [CONTENT_TYPE] => 
//     [REQUEST_METHOD] => GET
//     [QUERY_STRING] => 
//     [PATH_INFO] => 
//     [SCRIPT_FILENAME] => /home/rd3-casino/casino_member/www/ipl/app/flash/pig/game/casinoH5/test.php
//     [FCGI_ROLE] => RESPONDER
//     [PHP_SELF] => /ipl/app/flash/pig/game/casinoH5/test.php
//     [REQUEST_TIME_FLOAT] => 1691027611.4274
//     [REQUEST_TIME] => 1691027611
// )
// array(1) {
//   ["PPA_CI"]=>
//   string(32) "818fb56a012edd96306ec66a9f027732"
// }

