import React from "react";
import GroupEntry from "./GroupEntry";
import "./groupsBrowser.scss";

import { LARGE_MODE_MIN_WIDTH } from "./GroupsBrowser";

interface IFlatCatalogListProps {
    catalogList: Array<ICatalog>,
    selectedCatalogs: Array<ICatalog>,
    availableWidth: number,
    selectedGroups: Array<ICatalogGroup>,
    onGroupsSelected: Function,
    onSelectionChanged: Function,
    onSelectOnlyCatalogSelected: Function
}

export default function FlatCatalogList(props: IFlatCatalogListProps) {
    return (
        <div className="groups-browser-catalogs-list">
            {props.catalogList
                .map((catalog: ICatalog) =>
                    <GroupEntry
                        key={catalog.id}
                        isLargeMode={props.availableWidth >= LARGE_MODE_MIN_WIDTH}
                        catalog={catalog}
                        isSelected={props.selectedCatalogs.includes(catalog)}
                        selectedGroups={props.selectedGroups}
                        onGroupsSelected={props.onGroupsSelected}
                        onSelectionChanged={props.onSelectionChanged}
                        onSelectOnlyCatalogSelected={props.onSelectOnlyCatalogSelected}
                        isCollapsed={props.catalogList.length > 1}
                    />)}
        </div>
    );
}