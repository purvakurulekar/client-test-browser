import React, { useState } from "react";
import GroupTree from "./GroupTree"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

interface GroupSelectorProps {
    categories: Array<ICatalogGroup>,
    onGroupSelected: Function,
    selectedGroupName: string,
    selectedGroupIds: Array<string>,
    expandedGroupNodes: Array<string>
}

export default function GroupSelector(props: GroupSelectorProps) {
    /**
     * if props.categories is [] ==> "Categories"
     * else props.categories.length > 0 ? ==> "all items"
     */
    let label: string,
    [isOpened, setOpened] = useState(false),
    selectorIcon,
    groupTreeElement,
    onGroupSelected = (categoryIds: Array<string>, categoryName: string, expandedNodes: Array<string>) => {
        setOpened(false);
        props.onGroupSelected( categoryIds, categoryName, expandedNodes );
    };
    const handleClick = () => {
        setOpened((prev) => !prev);
      };
    
    const handleClickAway = () => {
        setOpened(false);
    };

    if (isOpened) {
        selectorIcon = faCaretUp;
    } else {
        selectorIcon = faCaretDown;
    }

    if (isOpened) {
        groupTreeElement = (
            <GroupTree {...Object.assign({}, props, props.selectedGroupIds, 
                props.expandedGroupNodes, { onGroupSelected })} />
        );
    }
    
    if ( props.categories.length === 0 ) {
        label = "Categories";
    } else if ( props.selectedGroupName?.length > 0 ) {
        label = props.selectedGroupName;
    } else {
        label = "All Items";
    }
    //
    return (
        <ClickAwayListener onClickAway={handleClickAway}>
        <div className="catalog-categories-container">
            <button className="catalog-categories-selector-toggle" onClick={handleClick} disabled={props.categories.length === 0}>
                <div className="catalog-categories-selector-toggle-label">{label}</div>
                <div className="catalog-categories-selector-toggle-btn"><FontAwesomeIcon icon={selectorIcon} /></div>
            </button>
            {groupTreeElement}
        </div>
        </ClickAwayListener>
    );
}