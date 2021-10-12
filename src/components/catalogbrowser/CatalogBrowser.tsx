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
    totalResults?: number,
    showHiddenContent: boolean
}

interface IFetchDataSourceProductResults {
    totalResults: number,
    productList: Array<IPublicProduct>
}

interface IFetchCatalogCategoriesOptions {
    selectedCatalogs: Array<IPublicCatalog>,
    showHiddenContent: boolean
}

interface IFetchCatalogCategoriesResults {
    categoryList: Array<ICommonGroup>
}

export { SELECT_ALL_CATALOG };

// make fetch request change the page offset ?!
//=============================================================================
export default function CatalogBrowser(props: ICatalogBrowserProps) {
    let pageOffset = useRef(0),
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
        [cic3CatalogProducts, setCiC3CatalogProducts] = useState([]),

        [isLoadingCatalogs, setLoadingCatalogs] = useState(false),
        [selectedProduct, setSelectedProduct] = useState(null),
        [searchQuery, setSearchQuery] = useState(""),
        [isSettingsVisible, setSettingsVisible] = useState(false),
        [showHiddenContent, setShowHiddenContent] = useState(_getShowHiddenContent()),

        [totalCiC3Results, setTotalCiC3Results] = useState(0),
        [isCiC3ProductsFetching, setCiC3ProductsFetching] = useState(false),

        loader,
        previewProps,
        resetProductsFunc = () => {
            pageOffset.current = 0;
            setCiC3CatalogProducts([]);
            setTotalCiC3Results(0);
        },
        addProduct = (product: IPublicProduct | null) => {
            if (product !== null && props.onProductAdd) {
                props.onProductAdd(product);
            }
        },
        fetchProductsFunc = () => {
            if (stateCatalogs.length > 0 || (stateCatalogs.length === 0 && totalCiC3Results > 0)) {
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
            if (offset < totalCiC3Results || offset === 0) {
                setSelectedCategoryName("");
                setSelectedCategoryIDs([]);
                setExpandedCategoryNodes([]);
                let fetchCategoryOptions: IFetchCatalogCategoriesOptions = { selectedCatalogs, showHiddenContent };
                _fetchCatalogCategories(fetchCategoryOptions).then((result: IFetchCatalogCategoriesResults) => {
                    setCategories(result.categoryList as []);
                });
            }
        },
        updateProductsFunc = async () => {
            let searchCatalogs: Array<IPublicCatalog> | undefined = _getSearchCatalogsList(selectedCatalogs),
                fetchProductOptions: IFetchDataSourceProductsOptions = { searchQuery, nbPerPage, selectedCatalogs, selectedCategories: selectedCategoryIDs, showHiddenContent },
                offset: Number = pageOffset.current;

            // console.log("Updating product list...");
            if (searchCatalogs.length > 0) {
                if (!isCiC3ProductsFetching && (offset < totalCiC3Results || offset === 0)) {
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

    previewProps = {
        totalCatalogs: selectedCatalogs.length,
        totalResults: 0,
        totalCiC3Results: totalCiC3Results
    };
    useEffect(() => {
        let calcOptimalTilesFunc = () => setNbPerPage(_calculateOptimalNbTiles(domRef.current! as HTMLDivElement)),
            fetchCatalogFunc = async () => {
                let catalogs: Array<IPublicCatalog> = await _fetchCatalogs(setLoadingCatalogs);

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

                // console.log("CONFIG CHANGED, FETCHING CATALOG: ", isFetchingCatalogs);
                if (isFetchingCatalogs) {
                    setShowHiddenContent(_getShowHiddenContent());
                    categoriesMap.clear();
                    fetchCatalogFunc();
                }
            };

        CiCAPI.content.registerToChanges(onConfigChanged);

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

    if (isLoadingCatalogs || isCiC3ProductsFetching) {
        loader = (<Loader />);
    }

    if (pageOffset.current === 0) {
        if (isCiC3ProductsFetching) {
            previewProps.totalCiC3Results = 0;
        }

        if (isCiC3ProductsFetching) {
            previewProps.totalResults = 0;
        }

    }
    previewProps.totalResults = 0;
    previewProps.totalResults += previewProps.totalCiC3Results;

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
                onCategorySelected={(categoryIDs: Array<string>, categoryName: string, expandedNodes: Array<string>) => { setSelectedCategoryIDs(categoryIDs as []), setSelectedCategoryName(categoryName), setExpandedCategoryNodes(expandedNodes as []), setSearchQuery("") }}
                selectedCategoryName={selectedCategoryName}
                selectedCategoryIDs={selectedCategoryIDs}
                expandedCategoryNodes={expandedCategoryNodes}
            />

            <CatalogSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchFunc={fetchProductsFunc} />

            <CatalogResultsPreview {...previewProps} >
                {loader}
            </CatalogResultsPreview>

            <CombinedCatalogProductList onFetchRequest={fetchMoreProductsRequests} isFetching={isCiC3ProductsFetching}>
                <CatalogProductList
                    isLoading={isCiC3ProductsFetching}
                    products={cic3CatalogProducts}
                    selectedProduct={selectedProduct}
                    onProductSelected={setSelectedProduct}
                    onAddProduct={addProduct}
                />
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
async function _fetchCatalogs(setLoadingCatalogs: Function): Promise<Array<IPublicCatalog>> {
    let catalogs: Array<IPublicCatalog>;

    setLoadingCatalogs(true);
    try {
        catalogs = await CiCAPI.content.getCatalogs();
        catalogs.unshift(SELECT_ALL_CATALOG);
    } catch (e) {
        // console.log("Fetch Catalog Aborted... ", e.message);
        catalogs = [];
    }

    setLoadingCatalogs(false);

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

//=============================================================================
function _getShowHiddenContent(): boolean {
    return /true/.test(CiCAPI.getConfig("cic3.showHiddenContent") as string);
}
//=============================================================================
async function _fetchDataSourceProducts(pageOffset: number, source: DATA_SOURCES, options: IFetchDataSourceProductsOptions): Promise<IFetchDataSourceProductResults | undefined> {
    let
        { searchQuery, nbPerPage, selectedCatalogs, selectedCategories, productList, totalResults, showHiddenContent } = options,
        searchCatalogs: Array<IPublicCatalog> = _getSearchCatalogsList(selectedCatalogs),
        searchCatalogIds: Array<string>,
        catalogProductList: Array<IPublicProduct> = productList || [],
        onlyVisible: boolean | undefined = showHiddenContent === true ? false : undefined;

    searchCatalogIds = searchCatalogs
        .filter((publicCatalog: IPublicCatalog) => publicCatalog.source === source)
        .map((publicCatalog: IPublicCatalog) => publicCatalog.id);

    return CiCAPI.content.findProducts(searchQuery ?? "", searchCatalogIds, { nbPerPage, offset: pageOffset, categoryNames: selectedCategories, onlyVisible })
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
        searchCatalogIds: Array<string>,
        visibleOnly: boolean = options.showHiddenContent ? false : true;

    searchCatalogIds = searchCatalogs.map((publicCatalog: IPublicCatalog) => publicCatalog.id.substr(publicCatalog.source.length + 1));
    if (!categoriesMap.has(searchCatalogIds[0])) {
        return CiCAPI.content.getCategoriesForCatalog(searchCatalogIds[0], visibleOnly).then((categoryResults: Array<ICommonGroup>) => {
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