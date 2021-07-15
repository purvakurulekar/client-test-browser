const
    fs = require("fs"),
    util = require("util"),
    promiseReadFile = util.promisify(fs.readFile),
    promiseWriteFile = util.promisify(fs.writeFile),
    APP_CONFIG_PATH = "./public/appconfig.json";

async function setup() {
    if (process.env.stage_env && process.env.cicapi_url) {
        try {
            console.log("Updating appconfig.json...");
            let appConfigContent = await promiseReadFile(APP_CONFIG_PATH);
            appConfigContent = JSON.parse(appConfigContent);
            appConfigContent.cicapi_url = process.env.cicapi_url;
            await promiseWriteFile(APP_CONFIG_PATH, JSON.stringify(appConfigContent, null, "\t"));
            console.log("appconfig.json updated.");
        } catch (e) {
            console.log("Unable to read appconfig ", APP_CONFIG_PATH, " file ", e);
            process.exit(1);
        }
    }
}

setup();