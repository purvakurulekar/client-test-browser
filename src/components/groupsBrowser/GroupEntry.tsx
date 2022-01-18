import { Loader } from "client-ui-toolkit";
import React, { useEffect, useState } from "react";
import GroupNode from "./GroupNode";

interface IGroupEntryProps {
    catalog: ICatalog,
    selectedGroups: Array<ICatalogGroup>,
    onGroupsSelected: Function
}

export default function GroupEntry(props: IGroupEntryProps) {
    let [loading, setLoading] = useState(false),
        [groups, setGroups] = useState<Array<ICatalogGroup>>([]);

    useEffect(() => {
        let fetchGroups = async () => {
            setLoading(true);
            
            let groups: Array<ICatalogGroup> = await CiCAPI.content.getCatalogGroups(props.catalog.id);

            setLoading(false);
            setGroups(groups);
        }
        
        fetchGroups();
    }, []);

    return (
        <div className="group-entry">
            <div className="group-entry-catalog-name">{props.catalog.name}</div>
            {loading && <Loader />}
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
        </div>
    );
}