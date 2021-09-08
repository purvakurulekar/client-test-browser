import React, { useState } from "react";
import CategoryTree from "./CategoryTree"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

interface CategorySelectorProps {
    categories: Array<ICommonGroup>,
    onCategorySelected: Function,
    selectedCategoryName: string,
    selectedCategoryIDs: Array<string>,
    expandedCategoryNodes: Array<string>
}

export default function CategorySelector(props: CategorySelectorProps) {
    /**
     * if props.categories is [] ==> "Categories"
     * else props.categories.length > 0 ? ==> "all items"
     */
    let label: string,
    [isOpened, setOpened] = useState(false),
    selectorIcon,
    categoryTreeElement,
    onCategorySelected = (categoryIDs: Array<string>, categoryName: string, expandedNodes: Array<string>) => {
        setOpened(false);
        props.onCategorySelected( categoryIDs, categoryName, expandedNodes );
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
        categoryTreeElement = (
            <CategoryTree {...Object.assign({}, props, props.selectedCategoryIDs, props.expandedCategoryNodes,  { onCategorySelected })} />
        );
    }
    
    if ( props.categories.length === 0 ) {
        label = "Categories";
    } else if ( props.selectedCategoryName?.length > 0 ) {
        label = props.selectedCategoryName;
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
            {categoryTreeElement}
        </div>
        </ClickAwayListener>
    );
}