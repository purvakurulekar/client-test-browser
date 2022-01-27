import React from "react";
import CompanyCatalogListEntry from "./CompanyCatalogListEntry";

interface ICompanyCatalogsList {
    catalogList: Array<ICatalog>,
    selectedCatalogs: Array<ICatalog>,
    availableWidth: number,
    selectedGroups: Array<ICatalogGroup>,
    onGroupsSelected: Function,
    onSelectionChanged: Function,
    onSelectOnlyCatalogSelected: Function,
    onCompanySelectionChanged(code: string, checked: boolean): void
}

export default function CompanyCatalogList(props: ICompanyCatalogsList) {
    let companyCatalogs: Map<string, Array<ICatalog>> = new Map();

    props.catalogList.forEach((catalog: ICatalog) => {
        if (companyCatalogs.has(catalog.companyRefCode)) {
            companyCatalogs.get(catalog.companyRefCode)?.push(catalog);
        } else {
            companyCatalogs.set(catalog.companyRefCode, [catalog]);
        }
    });

    return (
        <div className="company-catalog-list-root">
            {
                Array.from(companyCatalogs.keys())
                    .sort()
                    .map((companyRefCode: string) => {
                        let catalogList: Array<ICatalog> = companyCatalogs.get(companyRefCode)!;

                        return <CompanyCatalogListEntry
                            key={companyRefCode}
                            companyCode={companyRefCode}
                            companyCatalogList={catalogList}
                            isCompanyChecked={!catalogList.some((catalog: ICatalog) => !props.selectedCatalogs.includes(catalog))}
                            selectedCatalogs={props.selectedCatalogs}
                            availableWidth={props.availableWidth}
                            selectedGroups={props.selectedGroups}
                            onGroupsSelected={props.onGroupsSelected}
                            onSelectionChanged={props.onSelectionChanged}
                            onSelectOnlyCatalogSelected={props.onSelectOnlyCatalogSelected}
                            onCompanySelectionChanged={props.onCompanySelectionChanged}
                        />
                    })
            }
        </div>
    );
}