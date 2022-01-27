import React from "react";
import FlatCatalogList from "./FlatCatalogList";


interface ICompanyCatalogListEntryProps {
    companyCode: string,
    companyCatalogList: Array<ICatalog>,
    isCompanyChecked: boolean,
    selectedCatalogs: Array<ICatalog>,
    availableWidth: number,
    selectedGroups: Array<ICatalogGroup>,
    onCompanySelectionChanged(code: string, checked: boolean): void,
    onGroupsSelected: Function,
    onSelectionChanged: Function,
    onSelectOnlyCatalogSelected: Function
}

export default function CompanyCatalogListEntry(props: ICompanyCatalogListEntryProps) {

    function handleCompanyCheckChanged(ev: React.ChangeEvent<HTMLInputElement>) {
        props.onCompanySelectionChanged(props.companyCode, ev.target.checked);
    }

    return (
        <div key={props.companyCode} className="company-catalog-list-entry">
            <div className="company-catalog-list-entry-name">
                <input type="checkbox" checked={props.isCompanyChecked} onChange={handleCompanyCheckChanged} />
                <span>{props.companyCode}</span>
            </div>
            <div className="company-catalog-list-entry-catalogs">
                <FlatCatalogList
                    catalogList={props.companyCatalogList}
                    selectedCatalogs={props.selectedCatalogs}
                    availableWidth={props.availableWidth}
                    selectedGroups={props.selectedGroups}
                    onGroupsSelected={props.onGroupsSelected}
                    onSelectionChanged={props.onSelectionChanged}
                    onSelectOnlyCatalogSelected={props.onSelectOnlyCatalogSelected}
                />
            </div>
        </div>
    );
}