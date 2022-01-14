import React, { useState, ReactElement } from 'react';
import CatalogEntry from './CatalogEntry';
import { SELECT_ALL_CATALOG } from "../../interfaces/IPublicAPIInterfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

type CatalogList = Array<ICatalog>;

interface ICatalogListProps {
    catalogs: Array<ICatalog>,
    selectedCatalogs: Array<ICatalog>,
    onCatalogSelected: Function
    onSelectOnlyCatalogSelected: Function
}

//=============================================================================
export default function CatalogList(props: ICatalogListProps) {
    let catalogsList: CatalogList = props.catalogs,
        [catalogFilter, setcatalogFilter] = useState(""),
        onCatalogSelectedFunc = _onCatalogSelected.bind(null, props),
        groupedCatalogs: Map<string, Array<ICatalog>> = new Map();

    catalogFilter = catalogFilter.trim().toLowerCase();

    if (catalogFilter.length > 0) {
        catalogsList = catalogsList.filter((catalog: ICatalog) => catalog.name.toLowerCase().includes(catalogFilter));
    }

    catalogsList.forEach((catalog: ICatalog) => {
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
            <div className="catalog-list-filter">
                <input type="text" placeholder="Filter catalogs..." onChange={e => setcatalogFilter(e.target.value)} value={catalogFilter} />
                <FontAwesomeIcon icon={faSearch} />
            </div>
            <div className="catalog-list" >
                {Array.from(groupedCatalogs.entries())
                    .map((entry: Array<string | Array<ICatalog>>) => {
                        let rendered: JSX.Element | Array<JSX.Element>;
                        if (!entry[0]) {
                            rendered = (entry[1] as Array<ICatalog>).map(_renderCatalogEntry.bind(null, props, onCatalogSelectedFunc));
                        } else {
                            rendered = (
                                <div key={entry[0]} className="catalog-list-company-container">
                                    <div className="catalog-list-company">{entry[0]}</div>
                                    {(entry[1] as Array<ICatalog>).map(_renderCatalogEntry.bind(null, props, onCatalogSelectedFunc))}
                                </div>
                            );
                        }
                        return rendered;
                    })}

            </div>
        </div>
    );
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
            l_aSelectedCatalogs.splice(l_nCatalogIndex, 1);
        }
    }

    props.onCatalogSelected(l_aSelectedCatalogs);
}

//=============================================================================
function _renderCatalogEntry(props: ICatalogListProps, onCatalogSelectedFunc: Function, catalog: ICatalog, idx: number): ReactElement {
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
            onSelected={onCatalogSelectedFunc}
            onSelectOnly={props.onSelectOnlyCatalogSelected}
        />
    );
}