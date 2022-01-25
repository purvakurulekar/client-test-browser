import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { SELECT_ALL_CATALOG } from "../../interfaces/IPublicAPIInterfaces";
import "./catalogBrowser.scss";
import { SettingsPanel, SlidingPanel, SLIDER_DIRECTION, ISlidingPanelProps } from "client-ui-toolkit";
import CatalogSelector from './CatalogSelector';
import CombinedCatalogProductList from './CombinedCatalogProductList';
import ProductInformationPanel from './ProductInformationPanel';
import CatalogSearch from './CatalogSearch';
import { Loader } from "client-ui-toolkit";
import CatalogResultsPreview from './CatalogResultsPreview';
import CatalogProductList from './CatalogProductList';
import GroupsBrowser from 'components/groupsBrowser/GroupsBrowser';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import CatalogItemDetails from './CatalogItemDetails';


const
    DEFAULT_NB_PER_PAGE = 50,
    MIN_NB_TILES_PER_PAGE = 10,
    MAX_NB_TILES_PER_PAGE = 100,
    MIN_WIDTH_RESTRICTED = 520,
    STORAGE_SELECTED_CATALOGS_KEY = "ctb-sel-catalog-ids";

interface ICatalogBrowserProps {
    handleItemAdd?: Function,
    handleGetComponentState?: Function,
    handleItemReplace?: Function,
    includeSettings?: boolean,
    width?: number,
    height?: number
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

interface IDOMDimensions {
    width: number,
    height: number
}

export { SELECT_ALL_CATALOG };

// make fetch request change the page offset ?!
//=============================================================================
export default function CatalogBrowser(props: ICatalogBrowserProps) {
    let pageOffset = useRef(0),
        domRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null),
        focusedItemRef: React.MutableRefObject<IItem | null> = useRef(null),
        ctrlKeyRef: React.MutableRefObject<boolean> = useRef(false),
        dimensionRef: React.MutableRefObject<IDOMDimensions> = useRef<IDOMDimensions>({
            width: 0,
            height: 0
        }),
        [nbPerPage, setNbPerPage] = useState(DEFAULT_NB_PER_PAGE),
        [isSliderClosed, setSliderClosed] = useState(true),
        // 
        [stateCatalogs, setCatalogs] = useState<Array<ICatalog>>([]),
        [selectedCatalogs, setSelectedCatalogs] = useState<Array<ICatalog>>([]),
        [selectedGroups, setSelectedGroups] = useState<Array<ICatalogGroup>>([]),
        [itemDetails, setItemDetails] = useState<IItem | null>(null),

        // item lists
        [catalogItems, setCatalogItems] = useState([]),

        [isLoadingCatalogs, setLoadingCatalogs] = useState(false),
        [selectedItem, setSelectedItem] = useState<IItem | null>(null),
        [searchQuery, setSearchQuery] = useState(""),
        [isSettingsVisible, setSettingsVisible] = useState(false),
        [showHiddenContent, setShowHiddenContent] = useState(true),

        [totalResults, setTotalResults] = useState(0),
        [isFetchingCatalogItems, setFetchingCatalogItems] = useState(false),

        loader,
        previewProps,
        sliderProps: ISlidingPanelProps,
        slidingPanelClassNames: Array<string>,
        isSizeRestricted: boolean = props.width! <= MIN_WIDTH_RESTRICTED,
        resetProductsFunc = () => {
            pageOffset.current = 0;
            setCatalogItems([]);
            setTotalResults(0);
        },
        addItem = (item: IItem | null) => {
            if (item !== null && props.handleItemAdd) {
                props.handleItemAdd(item);
            }
        },
        fetchItemsFunc = () => {
            if (stateCatalogs.length > 0 || (stateCatalogs.length === 0 && totalResults > 0)) {
                resetProductsFunc();
                updateProductsFunc();
            }

        },
        fetchMoreProductsRequests = () => {
            pageOffset.current += nbPerPage;
            updateProductsFunc();
        },
        updateProductsFunc = async () => {
            let searchCatalogs: Array<ICatalog> | undefined = _getSearchCatalogsList(selectedCatalogs),
                catalogsToSearch: Array<ICatalog> = selectedCatalogs.length === stateCatalogs.length ? [] : selectedCatalogs,
                fetchProductOptions: IFetchCatalogItemsOptions = {
                    searchQuery,
                    nbPerPage,
                    selectedCatalogs: catalogsToSearch,
                    selectedGroups: selectedGroups.map((group: ICatalogGroup) => group.code),
                    showHiddenContent
                },
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
        },
        handleGroupsSelected = (group: ICatalogGroup, isSelected: boolean) => {
            let groupsToSelect: Array<ICatalogGroup>;

            if (ctrlKeyRef.current) {
                if (isSelected) {
                    if (!selectedGroups.includes(group)) {
                        selectedGroups.push(group);
                    }
                } else {
                    let idx: number = selectedGroups.indexOf(group);
                    selectedGroups.splice(idx, 1);
                }

                groupsToSelect = selectedGroups.flat();
            } else {
                if (isSelected) {
                    groupsToSelect = [group];
                } else {
                    groupsToSelect = [];
                }
            }

            setSelectedGroups(groupsToSelect);
            if (isSizeRestricted) {
                setSliderClosed(!isSliderClosed);
            }
        },
        handleShellDimensionChanged = () => {
            if (domRef.current) {
                setNbPerPage(_calculateOptimalNbTiles(domRef.current! as HTMLDivElement));
            }
        },
        handleShowItemDetails = (catalogItem: IItem) => {
            setItemDetails(catalogItem);
        },
        handleItemSelected = (catalogItem: IItem) => {
            setSelectedItem(catalogItem);
            focusedItemRef.current = catalogItem;
        },
        onComponentMount = () => {
            let containerBounds: DOMRect,
                calcOptimalTilesFunc = () => setNbPerPage(_calculateOptimalNbTiles(domRef.current! as HTMLDivElement)),
                fetchCatalogFunc = async () => {
                    let catalogs: Array<ICatalog> = await _fetchCatalogs(setLoadingCatalogs),
                        catalogsToSelect: Array<ICatalog> = catalogs,
                        storedCatalogIds: Array<string>;

                    try {
                        let rawStoredIds: string | null = localStorage.getItem(STORAGE_SELECTED_CATALOGS_KEY);

                        if (rawStoredIds) {
                            storedCatalogIds = JSON.parse(rawStoredIds);
                            catalogsToSelect = catalogs.filter((catalog: ICatalog) => storedCatalogIds.includes(catalog.id));
                        }
                    } catch (e) {
                        // graceful fallback
                    }

                    setCatalogs(catalogs);
                    handleSetCatalogSelection(catalogsToSelect);

                    pageOffset.current = 0;
                    // console.log("Catalogs Loaded!");
                },
                onConfigChanged = (configPath: string, valueToSet: ConfigValue, oldValue: ConfigValue) => {
                    if (configPath.includes("showHiddenContent") || configPath.includes("root") || configPath.includes("reset")) {
                        setShowHiddenContent(/true/.test(CiCAPI.getConfig("contentPlatform.showHiddenContent") as string));
                    }
                },
                checkForControlKey = (e: KeyboardEvent) => {
                    if (e.ctrlKey) {
                        ctrlKeyRef.current = true;
                    }
                },
                releaseCtrlKey = (e: KeyboardEvent) => {
                    if (!e.ctrlKey) {
                        ctrlKeyRef.current = false;
                    }
                },
                onWindowMsgReceived = (ev: MessageEvent) => {
                    if (ev.data === "getComponentState") {
                        if (props.handleGetComponentState) {
                            props.handleGetComponentState({
                                focusedItems: [focusedItemRef.current]
                            });
                        }
                    }
                };

            containerBounds = domRef.current!.getBoundingClientRect();

            dimensionRef.current.width = containerBounds.width;
            dimensionRef.current.height = containerBounds.height;

            fetchCatalogFunc(); // initial fetch
            onConfigChanged("reset");

            calcOptimalTilesFunc();
            window.addEventListener("message", onWindowMsgReceived);
            window.addEventListener("resize", calcOptimalTilesFunc);
            window.addEventListener("keydown", checkForControlKey);
            window.addEventListener("keyup", releaseCtrlKey);
            CiCAPI.content.registerToChanges(onConfigChanged);

            return () => {
                window.removeEventListener("message", onWindowMsgReceived);
                window.removeEventListener("resize", calcOptimalTilesFunc);
                window.removeEventListener("keydown", checkForControlKey);
                window.removeEventListener("keyup", releaseCtrlKey);
                CiCAPI.content.unregisterToChanges(onConfigChanged);
            };
        },
        onRenderComplete = () => {
            let containerBounds: DOMRect = domRef.current!.getBoundingClientRect();

            if (containerBounds.width !== dimensionRef.current.width || containerBounds.height !== dimensionRef.current.height) {
                dimensionRef.current.width = containerBounds.width;
                dimensionRef.current.height = containerBounds.height;
                setNbPerPage(_calculateOptimalNbTiles(domRef.current! as HTMLDivElement));
            }
        },
        handleSetCatalogSelection = (catalogsToSelect: Array<ICatalog>) => {
            setSelectedCatalogs(catalogsToSelect);
            setSelectedGroups([]);
            localStorage.setItem(STORAGE_SELECTED_CATALOGS_KEY, JSON.stringify(catalogsToSelect.map((catalog: ICatalog) => catalog.id)));
        }

    previewProps = {
        totalCatalogs: selectedCatalogs.length,
        totalResults: totalResults || 0
    };

    useEffect(handleShellDimensionChanged, [props.width, props.height]);
    useEffect(onComponentMount, []);
    useEffect(fetchItemsFunc, [selectedCatalogs, searchQuery, selectedGroups, nbPerPage]);// no need to wait here, if catalogs change lets update directly
    useLayoutEffect(onRenderComplete);

    if (isLoadingCatalogs || isFetchingCatalogItems) {
        loader = (<Loader />);
    }

    if (pageOffset.current === 0) {
        if (isFetchingCatalogItems) {
            previewProps.totalResults = 0;
        }
    }
    previewProps.totalResults += previewProps.totalResults;

    slidingPanelClassNames = ["catalog-browser-slider-section"];
    sliderProps = {
        direction: SLIDER_DIRECTION.horizontal,
        isCollapsable: true,
        isCollapsed: true,
        initialDimension: 260
    }

    if (isSizeRestricted) {
        slidingPanelClassNames.push("catalog-browser-slider-section-overlay");
        sliderProps.initialDimension = props.width!;
        sliderProps.isResizable = false;
        sliderProps.isCollapsed = isSliderClosed;
        sliderProps.onCollapseToggle = () => setSliderClosed(!isSliderClosed);
    } else {
        slidingPanelClassNames.push("catalog-browser-slider-section-resizable");
    }

    sliderProps.className = slidingPanelClassNames.join(" ");

    return (
        <div ref={domRef} className="catalog-browser">
            {isSettingsVisible && <SettingsPanel onClose={() => setSettingsVisible(false)} />}
            {itemDetails && <CatalogItemDetails item={itemDetails} onCloseClicked={() => setItemDetails(null)} />}

            <div className="catalog-browser-results-container">
                <SlidingPanel {...sliderProps}>
                    <div className="catalog-browser-slider-content">
                        <CatalogSelector
                            isOpened={isSizeRestricted && selectedCatalogs.length === stateCatalogs.length}
                            catalogs={stateCatalogs}
                            selectedCatalogs={selectedCatalogs}
                            onCatalogSelected={handleSetCatalogSelection}
                            onSelectOnlyCatalogSelected={(catalog: ICatalog) => { handleSetCatalogSelection([catalog]) }}
                        />
                        <GroupsBrowser
                            catalogs={selectedCatalogs.length !== stateCatalogs.length ? selectedCatalogs : []}
                            selectedGroups={selectedGroups}
                            onGroupsSelected={handleGroupsSelected}
                        />
                    </div>
                </SlidingPanel>

                <div className="catalog-browser-results-section">
                    <CatalogSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchFunc={fetchItemsFunc} />
                    <CatalogResultsPreview {...previewProps} >
                        {loader}
                    </CatalogResultsPreview>

                    <CombinedCatalogProductList onFetchRequest={fetchMoreProductsRequests} isFetching={isFetchingCatalogItems}>
                        <CatalogProductList
                            isLoading={isFetchingCatalogItems}
                            items={catalogItems}
                            selectedItem={selectedItem}
                            onItemSelected={handleItemSelected}
                            onAddItem={addItem}
                            onShowItemDetails={handleShowItemDetails}
                        />
                    </CombinedCatalogProductList>
                </div>
            </div>

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
    maxNbTilesPerPage = Math.min(maxNbTilesPerPage, MAX_NB_TILES_PER_PAGE);

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

    catalogs = catalogs.filter((catalog: ICatalog) => !catalog.status || catalog.status !== "Deleted");

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

    return CiCAPI.content.searchItems(searchQuery ?? "", searchCatalogIds.length > 0 ? searchCatalogIds : "", { nbPerPage, offset: pageOffset, groupNames: selectedGroups, onlyVisible })
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