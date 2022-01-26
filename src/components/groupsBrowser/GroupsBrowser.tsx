import React from "react";
import GroupEntry from "./GroupEntry";
import "./groupsBrowser.scss";

interface IGroupsBrowserProps {
    catalogs: Array<ICatalog>,
    selectedGroups: Array<ICatalogGroup>,
    onGroupsSelected: Function
}

export default function GroupsBrowser(props: IGroupsBrowserProps) {

    return (
        <div className="groups-browser-root">
            {props.catalogs.length === 0 && <span className="groups-browser-root-no-catalogs">No Catalogs / all catalogs specified.</span>}
            {props.catalogs
                .filter((catalog: ICatalog) => catalog.version)
                .map((catalog: ICatalog) =>
                    <GroupEntry
                        key={catalog.id}
                        catalog={catalog}
                        selectedGroups={props.selectedGroups}
                        onGroupsSelected={props.onGroupsSelected}
                        isCollapsed={props.catalogs.length > 1}
                    />)}
        </div>
    );
}