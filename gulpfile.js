const gulp = require('gulp');
var jeditor = require("gulp-json-editor");
const fs = require('fs');
const { env } = require('process');

const tasks = {
    cocos_build: 'cocos_build',
    cleanIcon: 'cleanIcon',
    autoIncrementingVersion: 'autoIncrementingVersion',
    test: 'test'
};

async function cocos_build() {

    const os = require('os');
    const platform = os.platform();

    let cmd = '';

    if (!process.env.CI) {
        //不是在 ci 環境下，讀取 .gitlab-ci.yml 變數設定到 process.env
        const yaml = require('js-yaml');
        const fs = require('fs');

        const { variables } = yaml.load(fs.readFileSync('.gitlab-ci.yml', 'utf8'));

        for (const key in variables) {
            console.log(`set env ${key}=${variables[key]}`);
            process.env[key] = variables[key];
        }
    }

    const { COCOS_CREATOR_VERSION, COCOS_BUILD_CONFIG_PATH } = process.env;

    console.log(`[build] cocos creator version ${COCOS_CREATOR_VERSION} config path ${COCOS_BUILD_CONFIG_PATH} in ${platform}`);

    if (platform === 'win32') {
        cmd = `C:\\ProgramData\\cocos\\editors\\Creator\\${COCOS_CREATOR_VERSION}\\CocosCreator.exe --project . --build "configPath=${COCOS_BUILD_CONFIG_PATH};"`;
    }
    else if (platform === 'darwin') {
        cmd = `/Applications/Cocos/Creator/${COCOS_CREATOR_VERSION}/CocosCreator.app/Contents/MacOS/CocosCreator --project ./ --build "configPath=${COCOS_BUILD_CONFIG_PATH}"`;
    }
    else {
        console.error(`[build] not support platform ${platform}`);
        return;
    }

    const spawnSync = require('child_process').spawnSync;

    const result = spawnSync(cmd, { shell: true, stdio: 'inherit' });

    const { status } = result;

    let build_success = false;

    if (status == 32) {
        console.log(`[build] exit status : 32 构建失败 —— 构建参数不合法`);
    }
    else if (status == 34) {
        console.log(`[build] exit status : 34 构建失败 —— 构建过程出错失败，详情请参考构建日志`);
    }
    else if (status == 36) {
        console.log(`[build] exit status : 36 构建成功`);
        build_success = true;
    }
    else {
        console.log(`[build] unknown exit status : ${status}`);
    }

    if (!build_success) {
        throw new Error(`[build] build failed with exit status ${status}`);
    }

}
gulp.task(tasks.cocos_build, cocos_build);

gulp.task(tasks.cleanIcon, () => {
    // 清除cocos settings splash icon
    console.log(`build after cleaning icon`);

    return gulp.src("./dist/web-mobile/src/settings.json").pipe(jeditor(function (json) {
        json.splashScreen.totalTime = 0;
        json.splashScreen.logo.type = "none";
        json.splashScreen.logo.base64 = "";
        return json;
    }))
        .pipe(gulp.dest("dist/web-mobile/src", "settings.json"));

});

gulp.task(tasks.autoIncrementingVersion, () => {
    // console.log(`setting add version ${}`);

    //將 package.json 的 version 設定到 cocos creator settings.json
    const node_package = require('./package.json');

    return gulp.src("./dist/web-mobile/src/settings.json").pipe(jeditor(function (json) {
        json.project = {
            version: node_package.version,
            environment: process.env.CI_COMMIT_BRANCH
        };
        return json;
    })).pipe(gulp.dest("dist/web-mobile/src", "settings.json"));
});
gulp.task(tasks.test, (cb) => {
    console.log(`pwd`, __dirname);
    try {
        const node_package = require('./package.json');
        console.log(`node_package.version`, node_package.version);
    } catch (err) {
        console.log(err);
    }
    cb();
});



/**
 * 產生base64圖檔字串
 * @param {sting} file
 * @param {sting} format
 * @returns
 */
function base64_encode(file, format) {
    if (!format) format = 'image/png';
    let bitmap = fs.readFileSync(file);
    return `data:${format};base64,${bitmap.toString("base64")}`;
}


gulp.task('default', gulp.series(tasks.cocos_build, tasks.autoIncrementingVersion));
// gulp.task('default', gulp.series(tasks.test));