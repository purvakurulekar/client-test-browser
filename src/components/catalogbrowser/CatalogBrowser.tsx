import React, { useEffect, useState } from 'react';

import { SELECT_ALL_CATALOG } from "../../interfaces/IPublicAPIInterfaces";

import "./catalogBrowser.scss";

import DataSourceControl from "../../footer/DataSourceControl";
import SettingsPanel from "../../footer/SettingsPanel";

import CatalogSelector from './CatalogSelector';

import CombinedCatalogProductList from './CombinedCatalogProductList';
import ProductInformationPanel from './ProductInformationPanel';

import CatalogSearch from './CatalogSearch';
import { Loader } from "client-ui-toolkit";
import CategorySelector from './CategorySelector';

import CatalogResultsPreview from './CatalogResultsPreview';
import CatalogProductList from './CatalogProductList';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

const
    DEFAULT_NB_PER_PAGE = 50,
    GLOBAL_CONFIG_RE = /^(sources.)?(cic[23]|mooble)(_enabled)?$/i,
    CATALOG_CONFIG_CHANGED_RE = /region|contextCode|catalogs?ApiUrl/i,
    SOURCES_CONFIG_PREFIX = "sources.",
    KEYS_TO_CHECK: Array<string> = ["client", "partnership", "region", "contextCode", "catalogsApiUrl", "sources.cic2_enabled", "sources.cic3_enabled", "sources.mooble_enabled"];

interface ICatalogBrowserProps {
    onProductAdd?: Function,
    includeDataSourceSwitcher?: boolean,
    includeSettings?: boolean
}

let pageOffset: number = 0;

interface IFetchDataSourceProductsOptions {
    searchQuery: string,
    nbPerPage: number,
    selectedCatalogs: Array<IPublicCatalog>,
    productList?: Array<IPublicProduct>,
    totalResults?: number
}

interface IFetchDataSourceProductResults {
    totalResults: number,
    productList: Array<IPublicProduct>
}

// move to utils ?
//=============================================================================
function _isSourceEnabled(src: DATA_SOURCES) {
    return CiCAPI.getConfig(`sources.${src.toLowerCase()}_enabled`);
}

//=============================================================================
async function _fetchDataSourceProducts(source: DATA_SOURCES, options: IFetchDataSourceProductsOptions): Promise<IFetchDataSourceProductResults | undefined> {
    let
        { searchQuery, nbPerPage, selectedCatalogs, productList, totalResults } = options,
        searchCatalogs: Array<IPublicCatalog> = _getSearchCatalogsList(selectedCatalogs),
        searchCatalogIds: Array<string>,
        // searchPayload: ICommonFetchProductOptions = {
        //     search: searchQuery,
        //     offset: pageOffset,
        //     nbPerPage: nbPerPage,
        //     searchingAllCatalogs: (selectedCatalogs.length > 0 && (selectedCatalogs as Array<IPublicCatalog>)[0].id === SELECT_ALL_CATALOG.id)
        // },
        catalogProductList: Array<IPublicProduct> = productList || [];

    searchCatalogIds = searchCatalogs
        .filter((publicCatalog: IPublicCatalog) => publicCatalog.source === source)
        .map((publicCatalog: IPublicCatalog) => publicCatalog.id);

    return CiCAPI.content.findProducts(searchQuery ?? "", searchCatalogIds, { nbPerPage, offset: pageOffset })
        .then((productResults: IProductResults) => {
            let combinedProducts: Array<IPublicProduct>,
                existingProductIds: Array<string>;

            if (pageOffset > 0) {
                if (source === CiCAPI.content.constants.DATA_SOURCES.cic2) {
                    existingProductIds = catalogProductList.map((product: IPublicProduct) => product.id);
                    // prevent from adding dups
                    combinedProducts = [].concat(catalogProductList as []);

                    productResults.products.forEach((productToAdd: IPublicProduct) => {
                        if (!existingProductIds.includes(productToAdd.id)) {
                            combinedProducts.push(productToAdd);
                        } else {
                            console.log("\n\n *** DUPLICATE PRODUCT RETURNED FROM SEARCH ***\n\n");
                        }
                    });
                } else {
                    combinedProducts = [].concat(catalogProductList as [], productResults.products as []);
                }
            } else {
                combinedProducts = productResults.products;
                totalResults = productResults.total;
            }

            return {
                totalResults: totalResults,
                productList: combinedProducts
            } as IFetchDataSourceProductResults;
        });
}

export { SELECT_ALL_CATALOG };

// make fetch request change the page offset ?!
//=============================================================================
export default function CatalogBrowser(props: ICatalogBrowserProps) {
    let nbActiveSources: number,
        nbPerPage: number,
        // 
        [stateCatalogs, setCatalogs] = useState([]),
        [selectedCatalogs, setSelectedCatalogs] = useState([]),
        [cic2CatalogProducts, setCiC2CatalogProducts] = useState([]),
        [moobleCatalogProducts, setMoobleCatalogProducts] = useState([]),
        [cic3CatalogProducts, setCiC3CatalogProducts] = useState([]),
        [isLoadingCatalogs, setLoadingCatalogs] = useState(false),
        [selectedProduct, setSelectedProduct] = useState(null),
        [searchQuery, setSearchQuery] = useState(""),
        [isSettingsVisible, setSettingsVisible] = useState(false),

        // put in custom hook ?!
        [totalCiC2Results, setTotalCiC2Results] = useState(0),
        [isCiC2ProductsFetching, setCiC2ProductsFetching] = useState(false),

        [totalMoobleResults, setTotalMoobleResults] = useState(0),
        [isMoobleProductsFetching, setMoobleProductsFetching] = useState(false),

        [totalCiC3Results, setTotalCiC3Results] = useState(0),
        [isCiC3ProductsFetching, setCiC3ProductsFetching] = useState(false),

        loader,
        previewProps,
        resetProductsFunc = () => {
            pageOffset = 0;
            setCiC2CatalogProducts([]);
            setMoobleCatalogProducts([]);
            setTotalCiC2Results(0);
            setTotalMoobleResults(0);
            setCiC3CatalogProducts([]);
            setTotalCiC3Results(0);
        },
        addProduct = (product: IPublicProduct | null) => {
            if (product !== null && props.onProductAdd) {
                props.onProductAdd(product);
            }
        },
        fetchProductsFunc = () => {
            if (stateCatalogs.length > 0 || (stateCatalogs.length === 0 && (totalCiC2Results + totalMoobleResults + totalCiC3Results) > 0)) {
                resetProductsFunc();
                updateProductsFunc();
            }

        },
        fetchMoreProductsRequests = () => {
            pageOffset += nbPerPage;
            updateProductsFunc();
        },
        updateProductsFunc = async () => {
            let searchCatalogs: Array<IPublicCatalog> | undefined = _getSearchCatalogsList(selectedCatalogs),
                fetchProductOptions: IFetchDataSourceProductsOptions = { searchQuery, nbPerPage, selectedCatalogs };

            // console.log("Updating product list...");
            if (searchCatalogs.length > 0) {
                if (_isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.cic2) && !isCiC2ProductsFetching && (pageOffset < totalCiC2Results || pageOffset === 0)) {
                    setCiC2ProductsFetching(true);
                    fetchProductOptions.productList = cic2CatalogProducts;
                    fetchProductOptions.totalResults = totalCiC2Results;
                    _fetchDataSourceProducts(CiCAPI.content.constants.DATA_SOURCES.cic2, fetchProductOptions)
                        .then((result: IFetchDataSourceProductResults | undefined) => {
                            setCiC2ProductsFetching(false);
                            if (result !== void (0)) {
                                setCiC2CatalogProducts(result?.productList as []);
                                setTotalCiC2Results(result?.totalResults);
                            }
                        });
                }

                if (_isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.mooble) && !isMoobleProductsFetching && (pageOffset < totalMoobleResults || pageOffset === 0)) {
                    setMoobleProductsFetching(true);
                    fetchProductOptions.productList = moobleCatalogProducts;
                    fetchProductOptions.totalResults = totalMoobleResults;
                    _fetchDataSourceProducts(CiCAPI.content.constants.DATA_SOURCES.mooble, fetchProductOptions)
                        .then((result: IFetchDataSourceProductResults | undefined) => {
                            setMoobleProductsFetching(false);
                            if (result !== void (0)) {
                                setMoobleCatalogProducts(result?.productList as []);
                                setTotalMoobleResults(result?.totalResults);
                            }
                        });
                }
                if (_isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.cic3) && !isCiC3ProductsFetching && (pageOffset < totalCiC3Results || pageOffset === 0)) {
                    setCiC3ProductsFetching(true);
                    fetchProductOptions.productList = cic3CatalogProducts;
                    fetchProductOptions.totalResults = totalCiC3Results;
                    _fetchDataSourceProducts(CiCAPI.content.constants.DATA_SOURCES.cic3, fetchProductOptions)
                        .then((result: IFetchDataSourceProductResults | undefined) => {
                            setCiC3ProductsFetching(false);
                            if (result !== void (0)) {
                                setCiC3CatalogProducts(result?.productList as []);
                                setTotalCiC3Results(result?.totalResults);
                            }
                        });
                }
            }
        };

    nbActiveSources = 0;
    if (_isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.cic2)) {
        nbActiveSources++;
    }
    if (_isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.cic3)) {
        nbActiveSources++;
    }
    if (_isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.mooble)) {
        nbActiveSources++;
    }
    nbPerPage = Math.round(DEFAULT_NB_PER_PAGE / nbActiveSources);

    previewProps = {
        totalCatalogs: selectedCatalogs.length,
        totalResults: 0,
        totalCiC2Results: totalCiC2Results,
        totalMoobleResults: totalMoobleResults,
        totalCiC3Results: totalCiC3Results,
        nbActiveSources: nbActiveSources
    };
    useEffect(() => {
        let abortCtrl: AbortController,
            fetchCatalogFunc = async () => {
                let catalogs: Array<IPublicCatalog>,
                    sources: Array<DATA_SOURCES> = [];
                // use abort controller's signal here
                if (abortCtrl) {
                    abortCtrl.abort();
                }

                if (_isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.cic2)) {
                    sources.push(CiCAPI.content.constants.DATA_SOURCES.cic2);
                }

                if (_isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.cic3)) {
                    sources.push(CiCAPI.content.constants.DATA_SOURCES.cic3);
                }

                if (_isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.mooble)) {
                    sources.push(CiCAPI.content.constants.DATA_SOURCES.mooble);
                }

                if (sources.length > 0) {
                    setLoadingCatalogs(true);
                    abortCtrl = new AbortController();
                    try {
                        catalogs = await CiCAPI.content.getCatalogs({
                            sources,
                            signal: abortCtrl.signal
                        });
                        catalogs.unshift(SELECT_ALL_CATALOG);
                    } catch (e) {
                        // console.log("Fetch Catalog Aborted... ", e.message);
                        catalogs = [];
                    }
                } else {
                    catalogs = [];
                }


                setLoadingCatalogs(false);
                setCatalogs(catalogs as []);
                setSelectedCatalogs(catalogs as []);
                pageOffset = 0;

                // console.log("Catalogs Loaded!");
            },
            onConfigChanged = (configKey: string, value: ConfigValue, oldValue: ConfigValue) => {
                let isFetchingCatalogs: boolean = configKey === "reset" || CATALOG_CONFIG_CHANGED_RE.test(configKey); // direct config

                if (!isFetchingCatalogs && GLOBAL_CONFIG_RE.test(configKey)) {
                    if (configKey.startsWith(SOURCES_CONFIG_PREFIX)) {
                        isFetchingCatalogs = true;
                    } else {
                        KEYS_TO_CHECK.every((key: string) => {
                            isFetchingCatalogs = (value as ConfigMap).get(key) != (oldValue as ConfigMap).get(key);
                            return !isFetchingCatalogs;
                        });
                    }

                }

                if (isFetchingCatalogs) {
                    fetchCatalogFunc();
                }
            };

        // AppState.dataEndpoint.registerToChanges(fetchCatalogFunc); // changes to DataSources
        // AppState.registerToConfigChange(onConfigChanged);
        CiCAPI.content.registerToChanges(onConfigChanged);

        fetchCatalogFunc(); // initial fetch
        return () => {
            if (abortCtrl) {
                abortCtrl.abort();
            }
            // AppState.dataEndpoint.unregisterToChanges(fetchCatalogFunc);
            // AppState.unregisterToConfigChange(onConfigChanged);
            CiCAPI.content.unregisterToChanges(onConfigChanged);
        };
    }, []);

    // input search query 
    // useEffect(() => {
    //     // debouncing request
    //     let updateTimeoutHandle = setTimeout(() => {
    //         fetchProductsFunc();
    //     }, 500);

    //     return () => clearTimeout(updateTimeoutHandle);
    // }, [searchQuery]);

    // no need to wait here, if catalogs change lets update directly
    useEffect(() => { fetchProductsFunc(); }, [selectedCatalogs, searchQuery]);

    if (isLoadingCatalogs || isCiC2ProductsFetching || isMoobleProductsFetching || isCiC3ProductsFetching) {
        loader = (<Loader />);
    }

    if (pageOffset === 0) {
        if (isCiC2ProductsFetching) {
            previewProps.totalCiC2Results = 0;
        }

        if (isMoobleProductsFetching) {
            previewProps.totalMoobleResults = 0;
        }

        if (isCiC3ProductsFetching) {
            previewProps.totalCiC3Results = 0;
        }

        if (isCiC2ProductsFetching || isMoobleProductsFetching || isCiC3ProductsFetching) {
            previewProps.totalResults = 0;
        }
    }
    previewProps.totalResults = previewProps.totalCiC2Results + previewProps.totalMoobleResults + previewProps.totalCiC3Results;

    return (
        <div className="catalog-browser">
            {
                isSettingsVisible && <SettingsPanel onClose={() => setSettingsVisible(false)} />
            }
            <CatalogSelector
                catalogs={stateCatalogs}
                selectedCatalogs={selectedCatalogs}
                onCatalogSelected={setSelectedCatalogs}
                onSelectOnlyCatalogSelected={(catalog: IPublicCatalog) => { setSelectedCatalogs(([catalog] as Array<IPublicCatalog>) as []) }}
            />

            <CategorySelector categories={[]} />

            <CatalogSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchFunc={fetchProductsFunc} />

            <CatalogResultsPreview {...previewProps} >
                {loader}
            </CatalogResultsPreview>

            <CombinedCatalogProductList onFetchRequest={fetchMoreProductsRequests} isFetching={isMoobleProductsFetching || isCiC2ProductsFetching || isCiC3ProductsFetching}>
                {_isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.mooble) &&
                    <CatalogProductList
                        isLoading={isMoobleProductsFetching}
                        products={moobleCatalogProducts}
                        selectedProduct={selectedProduct}
                        onProductSelected={setSelectedProduct}
                        onAddProduct={addProduct}
                    />}

                {_isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.cic2) &&
                    <CatalogProductList
                        isLoading={isCiC2ProductsFetching}
                        products={cic2CatalogProducts}
                        selectedProduct={selectedProduct}
                        onProductSelected={setSelectedProduct}
                        onAddProduct={addProduct}
                    />}

                {_isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.cic3) &&
                    <CatalogProductList
                        isLoading={isCiC3ProductsFetching}
                        products={cic3CatalogProducts}
                        selectedProduct={selectedProduct}
                        onProductSelected={setSelectedProduct}
                        onAddProduct={addProduct}
                    />}
            </CombinedCatalogProductList>

            <ProductInformationPanel product={selectedProduct} />

            <div className="catalog-browser-action-btn-container">
                {props.includeSettings && <button className="settings-btn" onClick={() => setSettingsVisible(true)}><FontAwesomeIcon icon={faCog} /></button>}
                {props.includeDataSourceSwitcher && <DataSourceControl />}

                <button className="catalog-action-btn" disabled={true}>Replace</button>
                <button className="catalog-action-btn" disabled={selectedProduct === null} onClick={() => addProduct(selectedProduct)}>Add</button>
            </div>
        </div>
    );
}

//=============================================================================
function _getSearchCatalogsList(selectedCatalogs: Array<IPublicCatalog>): Array<IPublicCatalog> {
    let searchCatalogs: Array<IPublicCatalog> = [];

    if (selectedCatalogs.length > 0) {
        searchCatalogs = selectedCatalogs.filter((catalog: IPublicCatalog) => catalog.id !== SELECT_ALL_CATALOG.id);
    }

    return searchCatalogs;
}