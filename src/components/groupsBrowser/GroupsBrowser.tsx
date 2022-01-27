import CatalogListFilter from "components/catalogListFilter/CatalogListFilter";
import React, { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import FlatCatalogList from "./FlatCatalogList";
import "./groupsBrowser.scss";
import CompanyCatalogList from "./CompanyCatalogList";
import { IRefinedFilter } from "components/catalogListFilter/RefinedFilter";


export const
    LARGE_MODE_MIN_WIDTH: number = 285,
    RESIZE_CHECK_INTERVAL_TIME = 500;

interface IGroupsBrowserProps {
    catalogs: Array<ICatalog>,
    selectedCatalogs: Array<ICatalog>,
    selectedGroups: Array<ICatalogGroup>,
    onGroupsSelected: Function,
    onCatalogSelected: Function,
    onSelectOnlyCatalogSelected: Function
}


// rename to catalog navigator / selector / inspector ?
export default function GroupsBrowser(props: IGroupsBrowserProps) {
    let [filteredCatalogs, setFilteredCatalogs] = useState<Array<ICatalog>>([]),
        [refinedFilters, setRefinedFilters] = useState<IRefinedFilter>({
            sortByCompany: false,
            sortByDate: false,
            filterLatestVersionOnly: false,
            filterSelectedOnly: false,
            filterActive: true,
            filterInProgress: true,
            filterDeactivated: false
        }),
        [browserWidth, setBrowserWidth] = useState(0),
        groupContainerRef: MutableRefObject<HTMLDivElement | null> = useRef(null),
        prevDOMRect: MutableRefObject<DOMRect | undefined> = useRef(),
        isAllCatalogsSelected: boolean = true,
        renderedCatalogList: JSX.Element;

    function handleRefineFilterChangedCatalog(updatedRefinedFilter: IRefinedFilter) {
        if (Object.entries(updatedRefinedFilter).some(([propName, propVal]) => refinedFilters[propName as keyof IRefinedFilter] !== propVal)) {
            setRefinedFilters(updatedRefinedFilter);
        }
    }

    //=============================================================================
    function handleFilteredCatalog(filteredList: Array<ICatalog>) {
        setFilteredCatalogs(filteredList);
    }

    //=============================================================================
    function handleCatalogSelectionChange(catalog: ICatalog, isSelected: boolean) {
        let updatedSelecedCatalogs = props.selectedCatalogs.flat(),
            isIncluded: boolean = updatedSelecedCatalogs.includes(catalog),
            idx: number;

        if (isSelected) {
            if (!isIncluded) {
                updatedSelecedCatalogs.push(catalog);
            }
        } else {
            if (isIncluded) {
                idx = updatedSelecedCatalogs.findIndex((catalogToFind: ICatalog) => catalogToFind === catalog);
                if (idx > -1) {
                    updatedSelecedCatalogs.splice(idx, 1);
                }
            }
        }

        props.onCatalogSelected(updatedSelecedCatalogs);
    }

    //=============================================================================
    function handleSelectAllChanged(ev: React.ChangeEvent<HTMLInputElement>) {
        toggleSelectAll(ev.target.checked);
        // ev.preventDefault();
        ev.stopPropagation();
    }

    //=============================================================================
    function handleCompanySelectionChanged(companyCode: string, isSelected: boolean) {
        let catalogsToSelect: Array<ICatalog> = props.selectedCatalogs.flat();

        props
            .catalogs
            .filter((catalog: ICatalog) => catalog.companyRefCode === companyCode)
            .forEach((catalog: ICatalog) => {
                let isIncluded: boolean = catalogsToSelect.includes(catalog),
                    idx: number;

                if (isSelected) {
                    if (!isIncluded) {
                        catalogsToSelect.push(catalog);
                    }
                } else {
                    if (isIncluded) {
                        idx = catalogsToSelect.findIndex((catalogToSelect: ICatalog) => catalogToSelect === catalog);
                        if (idx > -1) {
                            catalogsToSelect.splice(idx, 1);
                        }
                    }
                }
            });

        props.onCatalogSelected(catalogsToSelect);
    }


    function toggleSelectAll(isSelected: boolean) {
        if (isSelected) {
            props.onCatalogSelected(props.catalogs);
        } else {
            props.onCatalogSelected([]);
        }
    }

    // resize checker
    useEffect(() => {
        let intervalHandle: any;

        function checkForResize() {
            if (groupContainerRef.current) {
                let currentRect: DOMRect = groupContainerRef.current.getBoundingClientRect();
                if (prevDOMRect.current?.width !== currentRect.width) {
                    prevDOMRect.current = currentRect;
                    setBrowserWidth(currentRect.width);
                }
            }
        }

        setFilteredCatalogs(props.catalogs);

        intervalHandle = setInterval(checkForResize, RESIZE_CHECK_INTERVAL_TIME);

        return () => {
            clearInterval(intervalHandle);
        }
    }, []);

    useLayoutEffect(() => {
        if (groupContainerRef.current) {
            prevDOMRect.current = groupContainerRef.current?.getBoundingClientRect();
            setBrowserWidth(prevDOMRect.current.width);
        }
    }, []);


    isAllCatalogsSelected = props.catalogs.length === props.selectedCatalogs.length;

    let companyCatalogsByVersions: Map<string, Array<ICatalog>> = new Map();

    if (refinedFilters.filterLatestVersionOnly) {
        filteredCatalogs.forEach((catalog: ICatalog) => {
            if (companyCatalogsByVersions.has(catalog.companyRefCode)) {
                companyCatalogsByVersions.get(catalog.companyRefCode)?.push(catalog);
            } else {
                companyCatalogsByVersions.set(catalog.companyRefCode, [catalog]);
            }
        });

        Array.from(companyCatalogsByVersions.entries())
            .forEach(([companyRefCode, catalogList]) => {
                companyCatalogsByVersions.set(companyRefCode, catalogList.sort((catalogB: ICatalog, catalogA: ICatalog) => compareVersions(catalogB.version, catalogA.version)));
            });
    }

    filteredCatalogs = filteredCatalogs
        .filter((catalog: ICatalog) => {
            let isValid: boolean = true;

            if (refinedFilters.filterSelectedOnly) {
                isValid = props.selectedCatalogs.includes(catalog);
            }

            if (isValid && refinedFilters.filterLatestVersionOnly) {
                if (companyCatalogsByVersions.has(catalog.companyRefCode)) {
                    let sortedList: Array<ICatalog> = companyCatalogsByVersions.get(catalog.companyRefCode) as Array<ICatalog>;
                    if (sortedList.length > 0) {
                        isValid = sortedList[0].version === catalog.version;
                    }
                }
            }

            if (isValid) {
                isValid = (
                    (catalog.status === CiCAPI.content.constants.CATALOG_STATUS.ACTIVATED && refinedFilters.filterActive) ||
                    (catalog.status === CiCAPI.content.constants.CATALOG_STATUS.INPROGRESS && refinedFilters.filterInProgress) ||
                    (catalog.status === CiCAPI.content.constants.CATALOG_STATUS.DEACTIVATED && refinedFilters.filterDeactivated)
                );
            }

            return isValid;
        });

    if (refinedFilters.sortByDate) {
        filteredCatalogs.sort((catalogB: ICatalog, catalogA: ICatalog): number => {
            let rc: number = 0,
                dateCatalogB: number = (new Date(catalogB.updatedDate)).getTime(),  // in millis
                dateCatalogA: number = (new Date(catalogA.updatedDate)).getTime(); // in millis

            if (dateCatalogB > dateCatalogA) {
                rc = -1;
            } else if (dateCatalogB < dateCatalogA) {
                rc = 1;
            }

            return rc;
        });
    }

    if (refinedFilters.sortByCompany) {
        renderedCatalogList = <CompanyCatalogList
            key="company-catalog-list"
            catalogList={filteredCatalogs}
            selectedCatalogs={props.selectedCatalogs}
            availableWidth={browserWidth}
            selectedGroups={props.selectedGroups}
            onCompanySelectionChanged={handleCompanySelectionChanged}
            onGroupsSelected={props.onGroupsSelected}
            onSelectionChanged={handleCatalogSelectionChange}
            onSelectOnlyCatalogSelected={props.onSelectOnlyCatalogSelected}
        />
    } else {
        renderedCatalogList = <FlatCatalogList
            key="flat-catalog-list"
            catalogList={filteredCatalogs}
            selectedCatalogs={props.selectedCatalogs}
            availableWidth={browserWidth}
            selectedGroups={props.selectedGroups}
            onGroupsSelected={props.onGroupsSelected}
            onSelectionChanged={handleCatalogSelectionChange}
            onSelectOnlyCatalogSelected={props.onSelectOnlyCatalogSelected}
        />
    }
    return (
        <div className="groups-browser-root" ref={groupContainerRef}>
            <CatalogListFilter
                catalogsList={props.catalogs}
                refinedFilters={refinedFilters}
                onFiltered={handleFilteredCatalog}
                onRefinedFilterChanged={handleRefineFilterChangedCatalog}
            />
            <div className="groups-browser-actions-bar">
                <div className="groups-browser-select-all-container" onClick={() => toggleSelectAll(!isAllCatalogsSelected)}>
                    <input type="checkbox" checked={isAllCatalogsSelected} onChange={handleSelectAllChanged} />
                    <span>Select All</span>
                </div>
            </div>

            {renderedCatalogList}
        </div>
    );
}

/*
                <div className="group-browser-sort-btns-container">
                    <FontAwesomeIcon icon={faBuilding} />
                    <FontAwesomeIcon icon={faSortNumericUpAlt} />
                    <FontAwesomeIcon icon={faSortNumericDownAlt} />
                </div>
*/

const VERSION_RE = /(\d+)\.(\d+)\.(\d+)/;

//=============================================================================
function compareVersions(version2: string, version1: string): number {
    let version1Chunks: RegExpMatchArray | null,
        version2Chunks: RegExpMatchArray | null,
        rc: number = 0;

    version1Chunks = version1.match(VERSION_RE);
    version2Chunks = version2.match(VERSION_RE);

    if (version1Chunks && version2Chunks) {
        if (Number(version2Chunks[1]) > Number(version1Chunks[1])) {
            rc = -1;
        } else if (Number(version2Chunks[1]) < Number(version1Chunks[1])) {
            rc = 1;
        } else { // equal major versions, comparing minor
            if (Number(version2Chunks[2]) > Number(version1Chunks[2])) {
                rc = -1;
            } else if (Number(version2Chunks[2]) < Number(version1Chunks[2])) {
                rc = 1;
            } else { // minor versions equal, comparing build
                if (Number(version2Chunks[3]) > Number(version1Chunks[3])) {
                    rc = -1;
                } else if (Number(version2Chunks[3]) < Number(version1Chunks[3])) {
                    rc = 1;
                }
            }
        }
    }

    return rc;
}