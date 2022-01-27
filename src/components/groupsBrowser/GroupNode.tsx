import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight, faCaretDown, IconDefinition, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

interface IGroupNodeProps {
    catalog: ICatalog,
    group: ICatalogGroup,
    selectedGroups: Array<ICatalogGroup>,
    onGroupsSelected: Function,
    isChild?: boolean
}

/*
code: "cic3example_cic3"
groups: [{…}]
name: "AR's Test catalog"
visible: true
*/

export default function GroupNode(props: IGroupNodeProps) {
    let [isOpened, setOpened] = useState(false),
        [isSelected, setSelected] = useState(false),
        icon: IconDefinition,
        headerClassNames: Array<string> = ["group-node-header"],
        hasGroups: boolean = Array.isArray(props.group.groups) && props.group.groups.length > 0;

    useEffect(() => {
        // check if selected or not
        setSelected(props.selectedGroups.includes(props.group));
    }, [props.selectedGroups]);

    useEffect(() => {
        let isOpened: boolean = false;
        isOpened = _hasSelectedChild(props.selectedGroups, props.group);
        setOpened(isOpened);
    }, []);

    function handleExpandClick() {
        setOpened(!isOpened);
    }

    function handleGroupSelected() {
        props.onGroupsSelected(props.catalog, props.group, !isSelected);
    }

    if (isOpened) {
        icon = faCaretDown;
    } else {
        icon = faCaretRight;
    }

    if (hasGroups) {
        headerClassNames.push("group-node-header-wchildren");
    } else {
        headerClassNames.push("group-node-header-no-children");
    }

    if (isSelected) {
        headerClassNames.push("group-selected");
    }

    return (
        <div className="group-node">
            <div className={headerClassNames.join(" ")}>
                {hasGroups &&
                    <button className="group-node-collapse-btn" onClick={handleExpandClick}><FontAwesomeIcon icon={icon} /></button>
                }
                <div className="group-node-name" onClick={handleGroupSelected}>{props.group.name}</div>
                {!props.group.visible && <FontAwesomeIcon icon={faEyeSlash} />}
            </div>
            {props.isChild && hasGroups && <div className="group-node-linenotch-cube"></div>}
            {isOpened && hasGroups && <div className="group-node-linedown-cube"></div>}
            {isOpened && hasGroups &&
                <div className="group-node-children">
                    {props.group.groups!.map((group: ICatalogGroup) =>
                        <GroupNode
                            key={props.catalog.id + group.code}
                            group={group}
                            catalog={props.catalog}
                            isChild={true}
                            selectedGroups={props.selectedGroups}
                            onGroupsSelected={props.onGroupsSelected}
                        />)}
                </div>
            }
        </div>
    );
}

//=============================================================================
function _hasSelectedChild(selectedGroups: Array<ICatalogGroup>, group: ICatalogGroup): boolean {
    let hasSelectedChild: boolean = selectedGroups.includes(group);

    if (!hasSelectedChild && Array.isArray(group.groups)) {
        hasSelectedChild = group.groups.some(_hasSelectedChild.bind(null, selectedGroups));
    }

    return hasSelectedChild;
}