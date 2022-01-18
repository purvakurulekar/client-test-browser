import React, { ReactElement } from "react";
import { ICatalogListProps } from "./CatalogList";
import CatalogEntry from "./CatalogEntry";

interface ICatalogCompanyEntryProps {
    companyName: string,
    catalogs: Array<ICatalog>,
    selectedCatalogs: Array<ICatalog>,
    onCompanySelected(isSelected: boolean): void,
    onCatalogSelected: Function
    onSelectOnlyCatalogSelected: Function
}

export default function CatalogCompanyEntry(props: ICatalogCompanyEntryProps) {

    function handleCompanyCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
        console.log("Checkbox Changed!");
        props.onCompanySelected(e.target.checked);
    }
    
    /*
    checked state is if all catalogs are in selectedCatalogs
    */
   let isCompanySelected: boolean = props.catalogs.find((cieCatalog: ICatalog) => !props.selectedCatalogs.includes(cieCatalog)) === undefined;

    return (
        <div key={props.companyName} className="catalog-list-company-container">
            <div className="catalog-list-company">
                <input type="checkbox" checked={isCompanySelected} onChange={handleCompanyCheckbox} />
                <span>{props.companyName}</span>
            </div>
            {props.catalogs.map(_renderCatalogEntry.bind(null, props))}
        </div>
    );
}

//=============================================================================
function _renderCatalogEntry(props: ICatalogListProps, catalog: ICatalog, idx: number): ReactElement {
    let isSelected: boolean,
        entryClassName: string = "";

    isSelected = props.selectedCatalogs.includes(catalog);

    if (idx % 2 === 1 && idx !== 0) {
        entryClassName = "catalog-entry-odd-row";
    }

    return (
        <CatalogEntry
            key={catalog.id}
            className={entryClassName}
            catalog={catalog}
            isSelected={isSelected}
            onSelected={props.onCatalogSelected}
            onSelectOnly={props.onSelectOnlyCatalogSelected}
        />
    );
}