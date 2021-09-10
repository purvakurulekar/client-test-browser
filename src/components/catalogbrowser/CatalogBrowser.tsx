import React, { useRef, useEffect, useState } from 'react';
import { SELECT_ALL_CATALOG } from "../../interfaces/IPublicAPIInterfaces";
import "./catalogBrowser.scss";
import { DataSourceControl, SettingsPanel } from "client-ui-toolkit";
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

let categoriesMap: Map<string, Array<ICommonGroup>> = new Map();

const
    DEFAULT_NB_PER_PAGE = 50,
    MIN_NB_TILES_PER_PAGE = 10,
    GLOBAL_CONFIG_RE = /^(sources.)?(cic[23]|mooble)(_enabled)?$/i,
    CATALOG_CONFIG_CHANGED_RE = /region|contextCode|catalogs?ApiUrl/i,
    SOURCES_CONFIG_PREFIX = "sources.",
    KEYS_TO_CHECK: Array<string> = ["client", "partnership", "region", "contextCode", "catalogsApiUrl", "sources.cic2_enabled", "sources.cic3_enabled", "sources.mooble_enabled"];

interface ICatalogBrowserProps {
    onProductAdd?: Function,
    includeDataSourceSwitcher?: boolean,
    includeSettings?: boolean
}

interface IFetchDataSourceProductsOptions {
    searchQuery: string,
    nbPerPage: number,
    selectedCatalogs: Array<IPublicCatalog>,
    selectedCategories: Array<string>,
    productList?: Array<IPublicProduct>,
    totalResults?: number
}

interface IFetchDataSourceProductResults {
    totalResults: number,
    productList: Array<IPublicProduct>
}

interface IFetchCatalogCategoriesOptions {
    selectedCatalogs: Array<IPublicCatalog>
}

interface IFetchCatalogCategoriesResults {
    categoryList: Array<ICommonGroup>
}

interface IEnabledSourceMap {
    [key: string]: boolean
}

export { SELECT_ALL_CATALOG };

// make fetch request change the page offset ?!
//=============================================================================
export default function CatalogBrowser(props: ICatalogBrowserProps) {
    let nbActiveSources: number,
        pageOffset = useRef(0),
        domRef = useRef(null),

        [nbPerPage, setNbPerPage] = useState(DEFAULT_NB_PER_PAGE),
        // 
        [stateCatalogs, setCatalogs] = useState([]),
        [selectedCatalogs, setSelectedCatalogs] = useState([]),
        [categories, setCategories] = useState([]),
        [selectedCategoryIDs, setSelectedCategoryIDs] = useState([]),
        [selectedCategoryName, setSelectedCategoryName] = useState(""),
        [expandedCategoryNodes, setExpandedCategoryNodes] = useState([]),
        [needsCategoriesUpdate, setNeedsCategoriesUpdate] = useState(false),

        // product lists
        [cic2CatalogProducts, setCiC2CatalogProducts] = useState([]),
        [moobleCatalogProducts, setMoobleCatalogProducts] = useState([]),
        [cic3CatalogProducts, setCiC3CatalogProducts] = useState([]),

        [isLoadingCatalogs, setLoadingCatalogs] = useState(false),
        [selectedProduct, setSelectedProduct] = useState(null),
        [searchQuery, setSearchQuery] = useState(""),
        [isSettingsVisible, setSettingsVisible] = useState(false),

        // sources control
        [isCiC2SourceEnabled, setCiC2SourceEnabled] = useState(false),
        [isMoobleSourceEnabled, setMoobleSourceEnabled] = useState(false),
        [isCiC3SourceEnabled, setCiC3SourceEnabled] = useState(false),

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
            pageOffset.current = 0;
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
                if (needsCategoriesUpdate) {
                    setNeedsCategoriesUpdate(false);
                    updateCategoriesFunc();
                }
                updateProductsFunc();
            }

        },
        fetchMoreProductsRequests = () => {
            pageOffset.current += nbPerPage;
            updateProductsFunc();
        },
        updateCategoriesFunc = async () => {
            let offset = pageOffset.current;
            if (isCiC3SourceEnabled && (offset < totalCiC3Results || offset === 0)) {
                setSelectedCategoryName("");
                setSelectedCategoryIDs([]);
                setExpandedCategoryNodes([]);
                let fetchCategoryOptions: IFetchCatalogCategoriesOptions = { selectedCatalogs };
                _fetchCatalogCategories(fetchCategoryOptions).then((result: IFetchCatalogCategoriesResults) => {
                    setCategories(result.categoryList as []);
                });
            }
        },
        updateProductsFunc = async () => {
            let searchCatalogs: Array<IPublicCatalog> | undefined = _getSearchCatalogsList(selectedCatalogs),
                fetchProductOptions: IFetchDataSourceProductsOptions = { searchQuery, nbPerPage, selectedCatalogs, selectedCategories: selectedCategoryIDs},
                offset: Number = pageOffset.current;

            // console.log("Updating product list...");
            if (searchCatalogs.length > 0) {
                if (isCiC2SourceEnabled && !isCiC2ProductsFetching && (offset < totalCiC2Results || offset === 0)) {
                    setCiC2ProductsFetching(true);
                    fetchProductOptions.productList = cic2CatalogProducts;
                    fetchProductOptions.totalResults = totalCiC2Results;
                    _fetchDataSourceProducts(pageOffset.current, CiCAPI.content.constants.DATA_SOURCES.cic2, fetchProductOptions)
                        .then((result: IFetchDataSourceProductResults | undefined) => {
                            setCiC2ProductsFetching(false);
                            if (result !== void (0)) {
                                setCiC2CatalogProducts(result?.productList as []);
                                setTotalCiC2Results(result?.totalResults);
                            }
                        });
                }

                if (isMoobleSourceEnabled && !isMoobleProductsFetching && (offset < totalMoobleResults || offset === 0)) {
                    setMoobleProductsFetching(true);
                    fetchProductOptions.productList = moobleCatalogProducts;
                    fetchProductOptions.totalResults = totalMoobleResults;
                    _fetchDataSourceProducts(pageOffset.current, CiCAPI.content.constants.DATA_SOURCES.mooble, fetchProductOptions)
                        .then((result: IFetchDataSourceProductResults | undefined) => {
                            setMoobleProductsFetching(false);
                            if (result !== void (0)) {
                                setMoobleCatalogProducts(result?.productList as []);
                                setTotalMoobleResults(result?.totalResults);
                            }
                        });
                }
                if (isCiC3SourceEnabled && !isCiC3ProductsFetching && (offset < totalCiC3Results || offset === 0)) {
                    setCiC3ProductsFetching(true);
                    fetchProductOptions.productList = cic3CatalogProducts;
                    fetchProductOptions.totalResults = totalCiC3Results;
                    _fetchDataSourceProducts(pageOffset.current, CiCAPI.content.constants.DATA_SOURCES.cic3, fetchProductOptions)
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
    if (isCiC2SourceEnabled) {
        nbActiveSources++;
    }
    if (isCiC3SourceEnabled) {
        nbActiveSources++;
    }
    if (isMoobleSourceEnabled) {
        nbActiveSources++;
    }
    nbPerPage = Math.round(nbPerPage / nbActiveSources);

    previewProps = {
        totalCatalogs: selectedCatalogs.length,
        totalResults: 0,
        totalCiC2Results: totalCiC2Results,
        totalMoobleResults: totalMoobleResults,
        totalCiC3Results: totalCiC3Results,
        nbActiveSources: nbActiveSources
    };
    useEffect(() => {
        let calcOptimalTilesFunc = () => setNbPerPage(_calculateOptimalNbTiles(domRef.current! as HTMLDivElement)),
            fetchCatalogFunc = async () => {
            let catalogs: Array<IPublicCatalog> = await _fetchCatalogs(isCiC2SourceEnabled, isCiC3SourceEnabled, isMoobleSourceEnabled, setLoadingCatalogs);

            setCatalogs(catalogs as []);
            setSelectedCatalogs(catalogs as []);
            setSelectedCategoryName("");
            setSelectedCategoryIDs([]);
            setCategories([]);
            setExpandedCategoryNodes([]);
            pageOffset.current = 0;
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

                if (configKey.includes(CiCAPI.content.constants.DATA_SOURCES.cic2.toLocaleLowerCase())) {
                    isCiC2SourceEnabled = value as boolean;
                    setCiC2SourceEnabled(isCiC2SourceEnabled);
                }

                if (configKey.includes(CiCAPI.content.constants.DATA_SOURCES.mooble.toLocaleLowerCase())) {
                    isMoobleSourceEnabled = value as boolean;
                    setMoobleSourceEnabled(isMoobleSourceEnabled);
                }

                if (configKey.includes(CiCAPI.content.constants.DATA_SOURCES.cic3.toLocaleLowerCase())) {
                    isCiC3SourceEnabled = value as boolean;
                    setCiC3SourceEnabled(isCiC3SourceEnabled);
                }

                // console.log("CONFIG CHANGED, FETCHING CATALOG: ", isFetchingCatalogs);
                if (isFetchingCatalogs) {
                    fetchCatalogFunc();
                }
            };

        CiCAPI.content.registerToChanges(onConfigChanged);

        isCiC2SourceEnabled = _isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.cic2) as boolean;
        setCiC2SourceEnabled(isCiC2SourceEnabled);
        isMoobleSourceEnabled = _isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.mooble) as boolean;
        setMoobleSourceEnabled(isMoobleSourceEnabled);
        isCiC3SourceEnabled = _isSourceEnabled(CiCAPI.content.constants.DATA_SOURCES.cic3) as boolean;
        setCiC3SourceEnabled(isCiC3SourceEnabled);

        fetchCatalogFunc(); // initial fetch

        calcOptimalTilesFunc();
        window.addEventListener("resize", calcOptimalTilesFunc);

        return () => {
            CiCAPI.content.unregisterToChanges(onConfigChanged);
            window.removeEventListener("resize", calcOptimalTilesFunc);
        };
    }, []);

    // no need to wait here, if catalogs change lets update directly
    useEffect(() => { fetchProductsFunc(); }, [selectedCatalogs, searchQuery, selectedCategoryIDs]);

    if (isLoadingCatalogs || isCiC2ProductsFetching || isMoobleProductsFetching || isCiC3ProductsFetching) {
        loader = (<Loader />);
    }

    if (pageOffset.current === 0) {
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
    previewProps.totalResults = 0;
    if (isCiC2SourceEnabled) {
        previewProps.totalResults += previewProps.totalCiC2Results;
    }

    if (isMoobleSourceEnabled) {
        previewProps.totalResults += previewProps.totalMoobleResults;
    }

    if (isCiC3SourceEnabled) {
        previewProps.totalResults += previewProps.totalCiC3Results;
    }

    return (
        <div ref={domRef} className="catalog-browser">
            {
                isSettingsVisible && <SettingsPanel onClose={() => setSettingsVisible(false)} />
            }
            <CatalogSelector
                catalogs={stateCatalogs}
                selectedCatalogs={selectedCatalogs}
                onCatalogSelected={setSelectedCatalogs}
                onSelectOnlyCatalogSelected={(catalog: IPublicCatalog) => { setSelectedCatalogs(([catalog] as Array<IPublicCatalog>) as []), setNeedsCategoriesUpdate(true) }}
            />

            <CategorySelector
                categories={categories}
                onCategorySelected={(categoryIDs: Array<string>, categoryName: string, expandedNodes: Array<string>) => { setSelectedCategoryIDs(categoryIDs as []), setSelectedCategoryName(categoryName), setExpandedCategoryNodes( expandedNodes as [] ) }}
                selectedCategoryName={selectedCategoryName}
                selectedCategoryIDs={selectedCategoryIDs}
                expandedCategoryNodes={expandedCategoryNodes}
            />

            <CatalogSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchFunc={fetchProductsFunc} />

            <CatalogResultsPreview {...previewProps} >
                {loader}
            </CatalogResultsPreview>

            <CombinedCatalogProductList onFetchRequest={fetchMoreProductsRequests} isFetching={isMoobleProductsFetching || isCiC2ProductsFetching || isCiC3ProductsFetching}>
                {isMoobleSourceEnabled &&
                    <CatalogProductList
                        isLoading={isMoobleProductsFetching}
                        products={moobleCatalogProducts}
                        selectedProduct={selectedProduct}
                        onProductSelected={setSelectedProduct}
                        onAddProduct={addProduct}
                    />}

                {isCiC2SourceEnabled &&
                    <CatalogProductList
                        isLoading={isCiC2ProductsFetching}
                        products={cic2CatalogProducts}
                        selectedProduct={selectedProduct}
                        onProductSelected={setSelectedProduct}
                        onAddProduct={addProduct}
                    />}

                {isCiC3SourceEnabled &&
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
function _calculateOptimalNbTiles(rootContainer: HTMLDivElement): number {
    let boundingRect: DOMRect,
        workWidth: number,
        workHeight: number,
        maxNbTilesPerPage: number = 0,
        prodSquareSize: number = 105 + 4; // 105x105 gap of 4px

    boundingRect = rootContainer.getBoundingClientRect();

    workWidth = boundingRect.width - 10; // 10 => padding, borders
    workHeight = boundingRect.height - 174; // 174 rest of UI

    maxNbTilesPerPage += Math.ceil(workWidth / prodSquareSize) * Math.ceil(workHeight / prodSquareSize); // we want a bit of overflow

    maxNbTilesPerPage = Math.max(maxNbTilesPerPage, MIN_NB_TILES_PER_PAGE);

    return maxNbTilesPerPage;
}

//=============================================================================
async function _fetchCatalogs(isCiC2SourceEnabled: boolean, isCiC3SourceEnabled: boolean, isMoobleSourceEnabled: boolean, setLoadingCatalogs: Function): Promise<Array<IPublicCatalog>> {
    let catalogs: Array<IPublicCatalog>,
        sources: Array<DATA_SOURCES> = [];

    if (isCiC2SourceEnabled) {
        sources.push(CiCAPI.content.constants.DATA_SOURCES.cic2);
    }

    if (isCiC3SourceEnabled) {
        sources.push(CiCAPI.content.constants.DATA_SOURCES.cic3);
    }

    if (isMoobleSourceEnabled) {
        sources.push(CiCAPI.content.constants.DATA_SOURCES.mooble);
    }

    if (sources.length > 0) {
        setLoadingCatalogs(true);
        try {
            catalogs = await CiCAPI.content.getCatalogs({
                sources
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

    // make sure source is still enabled
    catalogs = _assertEnabledSources(catalogs, sources, { isCiC2SourceEnabled, isMoobleSourceEnabled, isCiC3SourceEnabled });

    return catalogs;
}

//=============================================================================
function _getSearchCatalogsList(selectedCatalogs: Array<IPublicCatalog>): Array<IPublicCatalog> {
    let searchCatalogs: Array<IPublicCatalog> = [];

    if (selectedCatalogs.length > 0) {
        searchCatalogs = selectedCatalogs.filter((catalog: IPublicCatalog) => catalog.id !== SELECT_ALL_CATALOG.id);
    }

    return searchCatalogs;
}

// move to utils ?
//=============================================================================
function _isSourceEnabled(src: DATA_SOURCES) {
    return CiCAPI.getConfig(`sources.${src.toLowerCase()}_enabled`);
}

//=============================================================================
function _assertEnabledSources(catalogsToAssert: Array<IPublicCatalog>, sources: Array<string>, enabledSourceMap: IEnabledSourceMap) {
    let catalogs: Array<IPublicCatalog> = catalogsToAssert;
    Object.values(CiCAPI.content.constants.DATA_SOURCES)
        .forEach((value: string) => {

            let found: boolean = sources.find((src: string) => src === value) !== void (0),
                isEnabled: boolean = false;
            if (found) {

                if (value === CiCAPI.content.constants.DATA_SOURCES.cic2) {
                    isEnabled = enabledSourceMap.isCiC2SourceEnabled;
                }
                else if (value === CiCAPI.content.constants.DATA_SOURCES.mooble) {
                    isEnabled = enabledSourceMap.isMoobleSourceEnabled;
                }
                else if (value === CiCAPI.content.constants.DATA_SOURCES.cic3) {
                    isEnabled = enabledSourceMap.isCiC3SourceEnabled;
                }

                if (!isEnabled) {
                    if (sources.length === 1) {
                        catalogs = [];
                    } else {
                        catalogs = catalogs.filter((catalog: IPublicCatalog) => { catalog.source !== value })
                    }
                }
            }
        });

    return catalogs;
}

//=============================================================================
async function _fetchDataSourceProducts(pageOffset: number, source: DATA_SOURCES, options: IFetchDataSourceProductsOptions): Promise<IFetchDataSourceProductResults | undefined> {
    let
        { searchQuery, nbPerPage, selectedCatalogs, selectedCategories, productList, totalResults } = options,
        searchCatalogs: Array<IPublicCatalog> = _getSearchCatalogsList(selectedCatalogs),
        searchCatalogIds: Array<string>,
        catalogProductList: Array<IPublicProduct> = productList || [];

    searchCatalogIds = searchCatalogs
        .filter((publicCatalog: IPublicCatalog) => publicCatalog.source === source)
        .map((publicCatalog: IPublicCatalog) => publicCatalog.id);

    return CiCAPI.content.findProducts(searchQuery ?? "", searchCatalogIds, { nbPerPage, offset: pageOffset, categoryNames: selectedCategories })
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

//=============================================================================
async function _fetchCatalogCategories(options: IFetchCatalogCategoriesOptions): Promise<IFetchCatalogCategoriesResults> {
    let
        { selectedCatalogs } = options,
        searchCatalogs: Array<IPublicCatalog> = _getSearchCatalogsList(selectedCatalogs),
        searchCatalogIds: Array<string>;

        searchCatalogIds = searchCatalogs.map((publicCatalog: IPublicCatalog) => publicCatalog.id.substr(publicCatalog.source.length+1));
        if ( !categoriesMap.has(searchCatalogIds[0]) ){
        return CiCAPI.content.getCategoriesForCatalog(searchCatalogIds[0]).then( (categoryResults: Array<ICommonGroup> ) => {
            categoriesMap.set(searchCatalogIds[0], categoryResults);
            return {
                categoryList: categoryResults
            } as IFetchCatalogCategoriesResults;
        });
    } else {

        return {
            categoryList: categoriesMap.get(searchCatalogIds[0])
        } as IFetchCatalogCategoriesResults;
    }
}