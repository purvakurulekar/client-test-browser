import React from 'react';
import ReactDOM from 'react-dom';
import "./index.scss";
import CatalogBrowser from "components/catalogbrowser/CatalogBrowser";

const
    DEFAULT_CICAPI_SRC_URL = "http://localhost:2020/content-platform/client-api/dist/debug/cicapi.web.js",
    // DEFAULT_CICAPI_SRC_URL = "https://clientapi-dev.2020-contentplatform.net/cicapi.web.js",
    APP_CONFIG_NAME = "appconfig.json";

interface IAppConfig {
    cicapi_url?: string
}

//=============================================================================
async function _loadConfig() {
    let config: IAppConfig = {
        cicapi_url: DEFAULT_CICAPI_SRC_URL
    };

    try {
        let response: Response = await fetch(APP_CONFIG_NAME);
        if (response.status < 400) {
            config = await response.json();
        } else {
            console.log("[+] no Config Override present, continuing load...");
        }
    } catch (e) {
        console.error(e);
        console.log(`[!] crash occured while trying to fetch ${APP_CONFIG_NAME}, continuing load...`);
    }

    return config;
}

//=============================================================================
async function _importCiCAPI(apiCodeUrl: string) {
    let response: Response = await fetch(apiCodeUrl),
        code: string;

    code = await response.text();
    (new Function(code))();
}

//=============================================================================
function render() {

    let onProductAdd = (catalogProduct: IPublicProduct) => {
        CiCAPI.design.addProduct(catalogProduct.id, { select: true });
    };

    ReactDOM.render(
        <React.StrictMode>
            <CatalogBrowser onProductAdd={onProductAdd} includeDataSourceSwitcher={true} includeSettings={true} />
        </React.StrictMode>, document.getElementById("root"));
}

//=============================================================================
async function main() {
    let config: IAppConfig;

    console.log("[-] Loading Application Config...");
    config = await _loadConfig();
    console.log("[*] Application Config Loaded.");

    console.log("[-] Loading CiCAPI...");
    //@ts-ignore
    await _importCiCAPI(config.cicapi_url);
    console.log("[+] CiCAPI Loaded, initializing....");
    //@ts-ignore
    await CiCAPI.init();
    console.log("[*] CiCAPI Initialized.");
    render();
}

//=============================================================================
window.addEventListener("load", () => {
    console.log("[*] Bootstrapping application...");
    main();
});