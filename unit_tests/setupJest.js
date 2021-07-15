const B18_SPEC_ID = "9a539759-273f-417d-92ca-4520ba1c8463";

let moobleUSCatalogsMock = require("./mocks/moobleUSCatalogs.json"),
    moobleBRCatalogsMock = require("./mocks/moobleBRCatalogs.json"),
    cic2CatalogsMock = require("./mocks/cic2Catalogs.json"),
    cic2CatalogProducts = require("./mocks/cic2CatalogProducts.json"),
    cic3B18GetSpecs = require("./mocks/cic3B18GetSpecs.json"),
    cic3B18GetProperties = require("./mocks/cic3B18GetProperties.json"),
    findProductsMooble1Catalog = require("./mocks/findProductsMooble1Catalog.json"),
    cic2CommonStructuralWall = require("./mocks/cic2CommonStructuralWall.json");



// adds the 'fetchMock' global variable and rewires 'fetch' global to call 'fetchMock' instead of the real implementation
require('jest-fetch-mock').enableMocks();
// changes default behavior of fetchMock to use the real 'fetch' implementation and not mock responses
fetchMock.dontMock();

//=============================================================================
function queryToMap(queryString) {
    let queryMap = {};

    if (queryString) {
        queryMap = Object.assign({}, ...queryString
            .split("&")
            .map(chunk => {
                let pair = chunk.split("=");
                return {
                    [pair[0]]: pair[1]
                };
            }));
    }

    return queryMap;
}



// https://catalog.mooble.com/api/specifications
// https://catalog.mooble.com/api/specifications/9a539759-273f-417d-92ca-4520ba1c8463/properties?client=mooble&region=us

fetchMock.doMockIf(/https?:\/\/(catalog\.mooble\.com\/api|localhost:3030)/i, req => {
    let urlString = req.url.toString(),
        promise;

    if (/localhost:3030/.test(urlString)) {
        promise = mockLocalHost(req);
    } else if (/catalog\.mooble\.com\/api/i.test(urlString)) {
        promise = mockCatalogMoobleHost(req);
    }

    return promise;
});

//=============================================================================
function mockCatalogMoobleHost(req) {
    let urlString = req.url.toString(),
        parsedURL = req[Object.getOwnPropertySymbols(req)[1]].parsedURL,
        queryMap = queryToMap(parsedURL.query),
        promisedReturn,
        promise;

    // console.log("*** MOCKING CATALOG.MOOBLE.COM : ", urlString);
    if (/Brand\/GetBrandsPlannerFilter/i.test(urlString)) {
        if (queryMap.region = "us") {
            promisedReturn = JSON.stringify(moobleUSCatalogsMock);
        } else if (queryMap.region = "br") {
            promisedReturn = JSON.stringify(moobleBRCatalogsMock);
        }
        promise = Promise.resolve(promisedReturn);
    } else if (/specifications\/9a539759-273f-417d-92ca-4520ba1c8463\/properties/i.test(urlString)) {
        if (urlString.includes(B18_SPEC_ID)) {
            promisedReturn = JSON.stringify(cic3B18GetProperties);
        }
        promise = Promise.resolve(promisedReturn);
    } else if (/explorer\/GetSpec\/9a539759-273f-417d-92ca-4520ba1c8463/i.test(urlString)) {
        if (urlString.includes(B18_SPEC_ID)) {
            promisedReturn = JSON.stringify(cic3B18GetSpecs);
        }
        promise = Promise.resolve(promisedReturn);
    } else if (/https?:\/\/catalog\.mooble\.com\/api\/explorer\/v2/.test(urlString)) {
        // client=mooble&
        // region=us&
        // count=true&
        // ShowAllBrands=true&
        // $top=30&
        // filterBrands=DesignPremium
        // https://catalog.mooble.com/api/explorer/v2?client=mooble&region=us&count=true&ShowAllBrands=true&$top=30&filterBrands=Mooble&search=Flower
        if (queryMap.region === "us") {
            promisedReturn = JSON.stringify(findProductsMooble1Catalog);
        } else {
            promisedReturn = [];
        }
        promise = Promise.resolve(promisedReturn);
    } else {
        console.log("MOCK BAD MATCH => ", urlString);
    }

    return promise || Promise.resolve([]);
}

//=============================================================================
function mockLocalHost(req) {
    let urlString = req.url.toString(),
        promise;

    // http://localhost:3030/BackOffice_Public/API/CatalogVersions?status=Activated

    // console.log("*** MOCKING LOCALHOST : ", urlString);
    // BackOffice_Public/API/Products
    // BackOffice_ProductOffering/API/Catalogs/1leGycrLzM0/Locales/en-US/Products?code=Common.Structural.Wall
    if (/BackOffice_Public\/API\/CatalogVersions/i.test(urlString)) {
        promise = Promise.resolve(JSON.stringify(cic2CatalogsMock));
    } else if (/BackOffice_Public\/API\/Products/i.test(urlString)) {
        promise = Promise.resolve(JSON.stringify(cic2CatalogProducts));
    } else if (/BackOffice_ProductOffering\/API\/Catalog\/1leGycrLzM0\/Locales\/en-US\/Products?code=Common.Structural.Wall/) {
        promise = Promise.resolve(JSON.stringify(cic2CommonStructuralWall));
    } else {
        console.log("MOCK BAD MATCH => ", urlString);
    }

    return promise || Promise.resolve([]);
}