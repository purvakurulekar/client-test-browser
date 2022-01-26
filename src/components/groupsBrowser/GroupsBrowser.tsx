import CatalogListFilter from "components/catalogListFilter/CatalogListFilter";
import React, { useEffect, useState } from "react";
import GroupEntry from "./GroupEntry";
import "./groupsBrowser.scss";

interface IGroupsBrowserProps {
    catalogs: Array<ICatalog>,
    selectedCatalogs: Array<ICatalog>,
    selectedGroups: Array<ICatalogGroup>,
    onGroupsSelected: Function,
    onCatalogSelected: Function
}

export default function GroupsBrowser(props: IGroupsBrowserProps) {
    let [filteredCatalogs, setFilteredCatalogs] = useState<Array<ICatalog>>([]),
        isAllCatalogsSelected: boolean = true;

    function handleFilteredCatalog(filteredList: Array<ICatalog>) {
        setFilteredCatalogs(filteredList);
    }

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

    function handleSelectAllChanged(ev: React.ChangeEvent<HTMLInputElement>) {
        toggleSelectAll(ev.target.checked);
        // ev.preventDefault();
        ev.stopPropagation();
    }

    function toggleSelectAll(isSelected: boolean) {
        if (isSelected) {
            props.onCatalogSelected(props.catalogs);
        } else {
            props.onCatalogSelected([]);
        }
    }

    useEffect(() => {
        setFilteredCatalogs(props.catalogs);
    }, []);

    isAllCatalogsSelected = props.catalogs.length === props.selectedCatalogs.length;
    return (
        <div className="groups-browser-root">
            <CatalogListFilter catalogsList={props.catalogs} onFiltered={handleFilteredCatalog} />
            <div className="groups-browser-select-all-container" onClick={() => toggleSelectAll(!isAllCatalogsSelected)}>
                <input type="checkbox" checked={isAllCatalogsSelected} onChange={handleSelectAllChanged} />
                <span>Select All</span>
            </div>
            <div className="groups-browser-catalogs-list">
                {filteredCatalogs
                    .map((catalog: ICatalog) =>
                        <GroupEntry
                            key={catalog.id}
                            catalog={catalog}
                            isSelected={props.selectedCatalogs.includes(catalog)}
                            selectedGroups={props.selectedGroups}
                            onGroupsSelected={props.onGroupsSelected}
                            onSelectionChanged={handleCatalogSelectionChange}
                            isCollapsed={props.catalogs.length > 1}
                        />)}
            </div>
        </div>
    );
}