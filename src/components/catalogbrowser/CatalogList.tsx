import React, { useState, ReactElement, useEffect } from 'react';
import CatalogEntry from './CatalogEntry';
import { SELECT_ALL_CATALOG } from "../../interfaces/IPublicAPIInterfaces";
import CatalogCompanyEntry from "./CatalogCompanyEntry";
import CatalogListFilter from 'components/catalogListFilter/CatalogListFilter';
import { IRefinedFilter } from 'components/catalogListFilter/RefinedFilter';

type CatalogList = Array<ICatalog>;

export interface ICatalogListProps {
    catalogs: Array<ICatalog>,
    selectedCatalogs: Array<ICatalog>,
    onCatalogSelected: Function
    onSelectOnlyCatalogSelected: Function
}

//=============================================================================
export default function CatalogList(props: ICatalogListProps) {
    // let catalogsList: CatalogList = props.catalogs,
    let [catalogsList, setCatalogsList] = useState<Array<ICatalog>>([]),
        [filteredCatalogsList, setFilteredCatalogsList] = useState<Array<ICatalog>>([]),
        groupedCatalogs: Map<string, Array<ICatalog>> = new Map();

    useEffect(() => {
        // catalogsList: CatalogList = props.catalogs,
        setCatalogsList(props.catalogs);
        setFilteredCatalogsList(props.catalogs); // all present on mount
    }, []);

    function handleFilteredCatalogs(filteredList: Array<ICatalog>) {
        setFilteredCatalogsList(filteredList);
    }

    filteredCatalogsList.forEach((catalog: ICatalog) => {
        let listByCompany: Array<ICatalog>;

        if (groupedCatalogs.has(catalog.companyRefCode)) {
            listByCompany = groupedCatalogs.get(catalog.companyRefCode) as Array<ICatalog>;
        } else {
            listByCompany = [];
        }

        listByCompany.push(catalog);

        groupedCatalogs.set(catalog.companyRefCode, listByCompany);
    });

    return (
        <div className="catalog-list-root">
            <CatalogListFilter catalogsList={catalogsList} onRefinedFilterChanged={() => {}} refinedFilters={{} as IRefinedFilter} onFiltered={handleFilteredCatalogs} />
            <div className="catalog-list" >
                {Array.from(groupedCatalogs.entries())
                    .map(([companyName, companyCatalogs]) => { // entry: Array<string | Array<ICatalog>>
                        let rendered: JSX.Element | Array<JSX.Element>;
                        if (!companyName) {
                            rendered = (companyCatalogs as Array<ICatalog>).map(renderCatalogEntry.bind(null, props));
                        } else {
                            rendered = (
                                <CatalogCompanyEntry
                                    key={`cie-${companyName}`}
                                    companyName={companyName as string}
                                    catalogs={companyCatalogs as Array<ICatalog>}
                                    selectedCatalogs={props.selectedCatalogs}
                                    onCatalogSelected={_onCatalogSelected.bind(null, props)}
                                    onCompanySelected={_onCompanySelected.bind(null, props.selectedCatalogs, companyCatalogs, props.onCatalogSelected)}
                                    onSelectOnlyCatalogSelected={props.onSelectOnlyCatalogSelected}
                                />
                            );
                        }
                        return rendered;
                    })}
            </div>
        </div>
    );
}

//=============================================================================
function _onCompanySelected(allSelectedCatalogs: Array<ICatalog>, companyCatalogs: Array<ICatalog>, onCatalogsSelected: Function, isSelected: boolean) {
    let catalogSelection: Array<ICatalog> = allSelectedCatalogs.flat();

    // make sure all catalogs from company are in the selection
    companyCatalogs.forEach((cieCatalog: ICatalog) => {
        let idx: number = catalogSelection.indexOf(cieCatalog);

        if (isSelected) {
            if (idx < 0) {
                catalogSelection.push(cieCatalog);
            }
        } else {
            if (idx > -1) {
                catalogSelection.splice(idx, 1);
            }
        }
    });

    onCatalogsSelected(catalogSelection);
}

//=============================================================================
function _onCatalogSelected(props: ICatalogListProps, catalog: ICatalog, isSelecting: boolean) {
    let l_nCatalogIndex: number,
        l_aSelectedCatalogs: CatalogList = ([] as CatalogList).concat(props.selectedCatalogs);

    if (isSelecting) {
        if (catalog.id === SELECT_ALL_CATALOG.id) {
            l_aSelectedCatalogs = props.catalogs.concat();
        } else {
            if (!l_aSelectedCatalogs.includes(catalog)) {
                l_aSelectedCatalogs.push(catalog);
            }
        }
    } else {
        if (catalog.id === SELECT_ALL_CATALOG.id) {
            l_aSelectedCatalogs = [] as CatalogList;
        } else {
            l_nCatalogIndex = l_aSelectedCatalogs.indexOf(catalog);
            if (l_nCatalogIndex > -1) {
                l_aSelectedCatalogs.splice(l_nCatalogIndex, 1);
            }

        }
    }

    props.onCatalogSelected(l_aSelectedCatalogs);
}

//=============================================================================
export function renderCatalogEntry(props: ICatalogListProps, catalog: ICatalog, idx: number): ReactElement {
    let isSelected: boolean,
        entryClassName: string = "";

    if (catalog.id === SELECT_ALL_CATALOG.id) {
        isSelected = props.catalogs.length === props.selectedCatalogs.length;
    } else {
        isSelected = props.selectedCatalogs.includes(catalog);
    }

    if (idx % 2 === 1 && idx !== 0) {
        entryClassName = "catalog-entry-odd-row";
    }

    return (
        <CatalogEntry
            key={catalog.id}
            className={entryClassName}
            catalog={catalog}
            isSelected={isSelected}
            onSelected={_onCatalogSelected.bind(null, props)}
            onSelectOnly={props.onSelectOnlyCatalogSelected}
        />
    );
}

