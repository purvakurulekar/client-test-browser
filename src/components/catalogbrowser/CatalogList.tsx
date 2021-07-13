import React, { useState, ReactElement } from 'react';
import CatalogEntry from './CatalogEntry';
import { SELECT_ALL_CATALOG } from "../../interfaces/IPublicAPIInterfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

type CatalogList = Array<IPublicCatalog>;

interface ICatalogListProps {
    catalogs: Array<IPublicCatalog>,
    selectedCatalogs: Array<IPublicCatalog>,
    onCatalogSelected: Function
    onSelectOnlyCatalogSelected: Function
}

//=============================================================================
export default function CatalogList(props: ICatalogListProps) {
    let catalogsList: CatalogList = props.catalogs,
        [catalogFilter, setcatalogFilter] = useState(""),
        onCatalogSelectedFunc = _onCatalogSelected.bind(null, props);

    catalogFilter = catalogFilter.trim().toLowerCase();

    if (catalogFilter.length > 0) {
        catalogsList = catalogsList.filter((catalog: IPublicCatalog) => catalog.name.toLowerCase().includes(catalogFilter));
    }

    return (
        <div className="catalog-list-root">
            <div className="catalog-list-filter">
                <input type="text" placeholder="Filter catalogs..." onChange={e => setcatalogFilter(e.target.value)} value={catalogFilter} />
                <FontAwesomeIcon icon={faSearch} />
            </div>
            <div className="catalog-list" >
                {catalogsList.map(_renderCatalogEntry.bind(null, props, onCatalogSelectedFunc))}
            </div>
        </div>
    );
}

//=============================================================================
function _onCatalogSelected(props: ICatalogListProps, catalog: IPublicCatalog, isSelecting: boolean) {
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
function _renderCatalogEntry(props: ICatalogListProps, onCatalogSelectedFunc: Function, catalog: IPublicCatalog): ReactElement {
    let isSelected: boolean;

    if (catalog.id === SELECT_ALL_CATALOG.id) {
        isSelected = props.catalogs.length === props.selectedCatalogs.length;
    } else {
        isSelected = props.selectedCatalogs.includes(catalog);
    }

    return (
        <CatalogEntry
            key={catalog.id}
            catalog={catalog}
            isSelected={isSelected}
            onSelected={onCatalogSelectedFunc}
            onSelectOnly={props.onSelectOnlyCatalogSelected}
        />
    );
}