import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare, faMinusSquare, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { Loader } from "client-ui-toolkit";
import React, { useEffect, useState } from "react";
import GroupNode from "./GroupNode";

interface IGroupEntryProps {
    catalog: ICatalog,
    isCollapsed?: boolean,
    selectedGroups: Array<ICatalogGroup>,
    onGroupsSelected: Function
}

export default function GroupEntry(props: IGroupEntryProps) {
    let [loading, setLoading] = useState(false),
        [isCollapsed, setCollapsed] = useState(true),
        [groups, setGroups] = useState<Array<ICatalogGroup>>([]),
        collapseIcon: IconDefinition;

    useEffect(() => {
        let fetchGroups = async () => {
            let groups: Array<ICatalogGroup>;

            setLoading(true);

            try {
                groups = await CiCAPI.content.getCatalogGroups(props.catalog.id);
            } catch (e) {
                // no groups for catalog
                groups = [];
            }

            if (props.isCollapsed !== undefined) {
                setCollapsed(props.isCollapsed);
            }

            setLoading(false);
            setGroups(groups);
        }

        fetchGroups();
    }, []);

    if (isCollapsed) {
        collapseIcon = faPlusSquare;
    } else {
        collapseIcon = faMinusSquare;
    }

    return (
        <div className="group-entry">
            <div className="group-entry-catalog-name-container" onClick={() => setCollapsed(!isCollapsed)}>
                <span className="group-entry-catalog-name">{props.catalog.name}</span>
                <span className="group-entry-catalog-info"> v{props.catalog.version.replace(/\.(\d{2}).*/, ".$1")} {props.catalog.updatedDate.replace(/T.*/, "")}</span>
                <FontAwesomeIcon className="group-collapse-btn" icon={collapseIcon} />
            </div>
            {loading && <Loader />}
            {!isCollapsed &&
                <div className="group-node-children">
                    {groups.map((group: ICatalogGroup, idx: number) =>
                        <GroupNode
                            key={props.catalog.id + group.code}
                            catalog={props.catalog}
                            group={group}
                            selectedGroups={props.selectedGroups}
                            onGroupsSelected={props.onGroupsSelected}
                        />)}
                </div>
            }
        </div>
    );
}