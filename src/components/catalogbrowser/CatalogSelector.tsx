import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import CatalogList from './CatalogList';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

interface Props {
    catalogs: Array<ICatalog>,
    selectedCatalogs: Array<ICatalog>,
    onCatalogSelected: Function,
    onSelectOnlyCatalogSelected: Function
}

// use context for selected catalogs ?
//=============================================================================
function CatalogSelector(props: Props) {
    let [isOpened, setOpened] = useState(false),
        selectorIcon,
        catalogListElement,
        label: string,
        onSelectOnlyCatalogSelected = (catalog: ICatalog) => {
            setOpened(false);
            props.onSelectOnlyCatalogSelected(catalog);
        }

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
        catalogListElement = (
            <CatalogList {...Object.assign({}, props, { onSelectOnlyCatalogSelected })} />
        );
    }

    if (props.catalogs.length === 0) {
        label = `No Catalogs Loaded.`;
    } else if (props.catalogs.length === props.selectedCatalogs.length) {
        label = `All Selected`;
    } else {
        if (props.selectedCatalogs.length > 4) {
            label = `${props.selectedCatalogs.length} / ${props.catalogs.length} catalogs`;
        } else {
            label = `${props.selectedCatalogs.map((i_oCatalog: ICatalog) => i_oCatalog.name).join(",")}`;
        }
    }

    return (
        <ClickAwayListener onClickAway={handleClickAway}>
        <div className="catalog-selector">
            <button className="catalog-selector-toggle" onClick={handleClick}  disabled={props.catalogs.length === 0}>
                <div className="catalog-selector-toggle-label truncatable-text">{label}</div>
                <div className="catalog-selector-toggle-btn"><FontAwesomeIcon icon={selectorIcon} /></div>
            </button>
            {catalogListElement}
        </div>
        </ClickAwayListener>
    );
}

export default CatalogSelector;