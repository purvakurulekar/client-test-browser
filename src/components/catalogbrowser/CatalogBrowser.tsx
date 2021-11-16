import React, { useRef, useEffect, useState } from 'react';
import { SELECT_ALL_CATALOG } from "../../interfaces/IPublicAPIInterfaces";
import "./catalogBrowser.scss";
import { SettingsPanel } from "client-ui-toolkit";
import CatalogSelector from './CatalogSelector';
import CombinedCatalogProductList from './CombinedCatalogProductList';
import ProductInformationPanel from './ProductInformationPanel';
import CatalogSearch from './CatalogSearch';
import { Loader } from "client-ui-toolkit";
import GroupSelector from './GroupSelector';
import CatalogResultsPreview from './CatalogResultsPreview';
import CatalogProductList from './CatalogProductList';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

let groupsMap: Map<string, Array<IGroup>> = new Map();

const
    DEFAULT_NB_PER_PAGE = 50,
    MIN_NB_TILES_PER_PAGE = 10;

interface ICatalogBrowserProps {
    onItemAdd?: Function,
    includeSettings?: boolean
}

interface IFetchCatalogItemsOptions {
    searchQuery: string,
    nbPerPage: number,
    selectedCatalogs: Array<ICatalog>,
    selectedGroups: Array<string>,
    itemList?: Array<IItem>,
    totalResults?: number,
    showHiddenContent: boolean
}

interface IFetchItemResults {
    totalResults: number,
    itemList: Array<IItem>
}

interface IFetchCatalogGroupOptions {
    selectedCatalogs: Array<ICatalog>,
    showHiddenContent: boolean
}

interface IFetchCatalogGroupResults {
    categoryList: Array<IGroup>
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
        [selectedGroupIds, setSelectedGroupIds] = useState([]),
        [selectedGroupName, setSelectedGroupName] = useState(""),
        [expandedGroupNodes, setExpandedGroupNodes] = useState([]),
        [needsGroupsUpdate, setNeedsGroupsUpdate] = useState(false),

        // item lists
        [catalogItems, setCatalogItems] = useState([]),

        [isLoadingCatalogs, setLoadingCatalogs] = useState(false),
        [selectedItem, setSelectedItem] = useState(null),
        [searchQuery, setSearchQuery] = useState(""),
        [isSettingsVisible, setSettingsVisible] = useState(false),
        [showHiddenContent, setShowHiddenContent] = useState(true),

        [totalResults, setTotalResults] = useState(0),
        [isFetchingCatalogItems, setFetchingCatalogItems] = useState(false),

        loader,
        previewProps,
        resetProductsFunc = () => {
            pageOffset.current = 0;
            setCatalogItems([]);
            setTotalResults(0);
        },
        addItem = (item: IItem | null) => {
            if (item !== null && props.onItemAdd) {
                props.onItemAdd(item);
            }
        },
        fetchItemsFunc = () => {
            if (stateCatalogs.length > 0 || (stateCatalogs.length === 0 && totalResults > 0)) {
                resetProductsFunc();
                if (needsGroupsUpdate) {
                    setNeedsGroupsUpdate(false);
                    updateGroupsFunc();
                }
                updateProductsFunc();
            }

        },
        fetchMoreProductsRequests = () => {
            pageOffset.current += nbPerPage;
            updateProductsFunc();
        },
        updateGroupsFunc = async () => {
            let offset = pageOffset.current;
            if (offset < totalResults || offset === 0) {
                setSelectedGroupName("");
                setSelectedGroupIds([]);
                setExpandedGroupNodes([]);
                let fetchGroupOptions: IFetchCatalogGroupOptions = { selectedCatalogs, showHiddenContent };
                _fetchCatalogGroups(fetchGroupOptions).then((result: IFetchCatalogGroupResults) => {
                    setCategories(result.categoryList as []);
                });
            }
        },
        updateProductsFunc = async () => {
            let searchCatalogs: Array<ICatalog> | undefined = _getSearchCatalogsList(selectedCatalogs),
                fetchProductOptions: IFetchCatalogItemsOptions = { searchQuery, nbPerPage, selectedCatalogs, selectedGroups: selectedGroupIds, showHiddenContent },
                offset: Number = pageOffset.current;

            // console.log("Updating product list...");
            if (searchCatalogs.length > 0) {
                if (!isFetchingCatalogItems && (offset < totalResults || offset === 0)) {
                    setFetchingCatalogItems(true);
                    fetchProductOptions.itemList = catalogItems;
                    fetchProductOptions.totalResults = totalResults;
                    _fetchCatalogItems(pageOffset.current, fetchProductOptions)
                        .then((result: IFetchItemResults | undefined) => {
                            setFetchingCatalogItems(false);
                            if (result !== void (0)) {
                                setCatalogItems(result?.itemList as []);
                                setTotalResults(result?.totalResults);
                            }
                        });
                }
            }
        };

    previewProps = {
        totalCatalogs: selectedCatalogs.length,
        totalResults: totalResults || 0
    };
    useEffect(() => {
        let calcOptimalTilesFunc = () => setNbPerPage(_calculateOptimalNbTiles(domRef.current! as HTMLDivElement)),
            fetchCatalogFunc = async () => {
                let catalogs: Array<ICatalog> = await _fetchCatalogs(setLoadingCatalogs);

                setCatalogs(catalogs as []);
                setSelectedCatalogs(catalogs as []);
                setSelectedGroupName("");
                setSelectedGroupIds([]);
                setCategories([]);
                setExpandedGroupNodes([]);
                pageOffset.current = 0;
                // console.log("Catalogs Loaded!");
            },
            onConfigChanged = (configPath: string, valueToSet: ConfigValue, oldValue: ConfigValue) => {
                if(configPath.includes("showHiddenContent") || configPath.includes("root") || configPath.includes("reset")) {
                    setShowHiddenContent(/true/.test(CiCAPI.getConfig("contentPlatform.showHiddenContent") as string));
                }
            };

        fetchCatalogFunc(); // initial fetch
        onConfigChanged("reset");

        calcOptimalTilesFunc();
        window.addEventListener("resize", calcOptimalTilesFunc);
        CiCAPI.content.registerToChanges(onConfigChanged);

        return () => {
            window.removeEventListener("resize", calcOptimalTilesFunc);
            CiCAPI.content.unregisterToChanges(onConfigChanged);
        };
    }, []);

    // no need to wait here, if catalogs change lets update directly
    useEffect(() => { fetchItemsFunc(); }, [selectedCatalogs, searchQuery, selectedGroupIds]);

    if (isLoadingCatalogs || isFetchingCatalogItems) {
        loader = (<Loader />);
    }

    if (pageOffset.current === 0) {
        if (isFetchingCatalogItems) {
            previewProps.totalResults = 0;
        }
    }
    previewProps.totalResults += previewProps.totalResults;

    return (
        <div ref={domRef} className="catalog-browser">
            {
                isSettingsVisible && <SettingsPanel onClose={() => setSettingsVisible(false)} />
            }
            <CatalogSelector
                catalogs={stateCatalogs}
                selectedCatalogs={selectedCatalogs}
                onCatalogSelected={setSelectedCatalogs}
                onSelectOnlyCatalogSelected={(catalog: ICatalog) => { setSelectedCatalogs(([catalog] as Array<ICatalog>) as []), setNeedsGroupsUpdate(true) }}
            />

            <GroupSelector
                categories={categories}
                onGroupSelected={(categoryIds: Array<string>, categoryName: string, expandedNodes: Array<string>) => { setSelectedGroupIds(categoryIds as []), setSelectedGroupName(categoryName), setExpandedGroupNodes(expandedNodes as []), setSearchQuery("") }}
                selectedGroupName={selectedGroupName}
                selectedGroupIds={selectedGroupIds}
                expandedGroupNodes={expandedGroupNodes}
            />

            <CatalogSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchFunc={fetchItemsFunc} />

            <CatalogResultsPreview {...previewProps} >
                {loader}
            </CatalogResultsPreview>

            <CombinedCatalogProductList onFetchRequest={fetchMoreProductsRequests} isFetching={isFetchingCatalogItems}>
                <CatalogProductList
                    isLoading={isFetchingCatalogItems}
                    items={catalogItems}
                    selectedItem={selectedItem}
                    onItemSelected={setSelectedItem}
                    onAddItem={addItem}
                />
            </CombinedCatalogProductList>

            <ProductInformationPanel product={selectedItem} />

            <div className="catalog-browser-action-btn-container">
                {props.includeSettings && <button className="settings-btn" onClick={() => setSettingsVisible(true)}><FontAwesomeIcon icon={faCog} /></button>}

                <button className="catalog-action-btn" disabled={true}>Replace</button>
                <button className="catalog-action-btn" disabled={selectedItem === null} onClick={() => addItem(selectedItem)}>Add</button>
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
async function _fetchCatalogs(setLoadingCatalogs: Function): Promise<Array<ICatalog>> {
    let catalogs: Array<ICatalog>;

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
function _getSearchCatalogsList(selectedCatalogs: Array<ICatalog>): Array<ICatalog> {
    let searchCatalogs: Array<ICatalog> = [];

    if (selectedCatalogs.length > 0) {
        searchCatalogs = selectedCatalogs.filter((catalog: ICatalog) => catalog.id !== SELECT_ALL_CATALOG.id);
    }

    return searchCatalogs;
}

//=============================================================================
async function _fetchCatalogItems(pageOffset: number, options: IFetchCatalogItemsOptions): Promise<IFetchItemResults | undefined> {
    let
        { searchQuery, nbPerPage, selectedCatalogs, selectedGroups, itemList, totalResults, showHiddenContent } = options,
        searchCatalogs: Array<ICatalog> = _getSearchCatalogsList(selectedCatalogs),
        searchCatalogIds: Array<string>,
        catalogItemList: Array<IItem> = itemList || [],
        onlyVisible: boolean | undefined = showHiddenContent === true ? false : undefined;

    searchCatalogIds = searchCatalogs
        .map((publicCatalog: ICatalog) => publicCatalog.id);

    return CiCAPI.content.getItems(searchQuery ?? "", searchCatalogIds, { nbPerPage, offset: pageOffset, groupNames: selectedGroups, onlyVisible })
        .then((productResults: IItemResults) => {
            let combinedProducts: Array<IItem>;

            if (pageOffset > 0) {
                combinedProducts = [].concat(catalogItemList as [], productResults.items as []);
            } else {
                combinedProducts = productResults.items;
                totalResults = productResults.total;
            }

            return {
                totalResults: totalResults,
                itemList: combinedProducts
            } as IFetchItemResults;
        });
}

//=============================================================================
async function _fetchCatalogGroups(options: IFetchCatalogGroupOptions): Promise<IFetchCatalogGroupResults> {
    let
        { selectedCatalogs } = options,
        searchCatalogs: Array<ICatalog> = _getSearchCatalogsList(selectedCatalogs),
        searchCatalogIds: Array<string>,
        visibleOnly: boolean = options.showHiddenContent ? false : true;

    searchCatalogIds = searchCatalogs.map((publicCatalog: ICatalog) => publicCatalog.id);
    if (!groupsMap.has(searchCatalogIds[0])) {
        return CiCAPI.content.getGroupsForCatalog(searchCatalogIds[0], visibleOnly).then((categoryResults: Array<IGroup>) => {
            groupsMap.set(searchCatalogIds[0], categoryResults);
            return {
                categoryList: categoryResults
            } as IFetchCatalogGroupResults;
        });
    } else {

        return {
            categoryList: groupsMap.get(searchCatalogIds[0])
        } as IFetchCatalogGroupResults;
    }
}