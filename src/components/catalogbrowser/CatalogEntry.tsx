import React, { useState, useRef } from 'react';
import { SELECT_ALL_CATALOG } from "../../interfaces/IPublicAPIInterfaces";

interface CatalogEntryProps {
    catalog: IPublicCatalog,
    isSelected: boolean,
    onSelected: Function,
    onSelectOnly: Function
}

//=============================================================================
export default function CatalogEntry(props: CatalogEntryProps) {
    let [isHovered, setHovered] = useState(false),
        rootElement = useRef(null),
        catalogLabel: string,
        onChangeFunc = (e: React.ChangeEvent<HTMLInputElement>) => props.onSelected(props.catalog, e.target.checked),
        onSelectOnly = () => props.onSelectOnly(props.catalog),
        toggleHandlers,
        timeoutHandle: any; // number

    function _hideBtn() {
        timeoutHandle = setTimeout(() => {
            setHovered(false);
        }, 0);
    }

    function _handleRootMouseOver() {
        setHovered(true);
        clearTimeout(timeoutHandle);
    }

    function _handleRootMouseOut(e: React.MouseEvent) {
        _hideBtn();
    }

    function _handleMouseOver(e: React.MouseEvent) {
        clearTimeout(timeoutHandle);
    }

    function _handleMouseOut(e: React.MouseEvent) {
        _hideBtn();
        e.preventDefault();
        e.stopPropagation();
    }

    toggleHandlers = {
        onMouseOver: _handleMouseOver,
        onMouseOut: _handleMouseOut
    }

    catalogLabel = `${props.catalog.name} / ${props.catalog.version} (${props.catalog.status})`;

    return (
        <div className="catalog-entry" ref={rootElement} onMouseOver={_handleRootMouseOver} onMouseOut={_handleRootMouseOut}>
            <input id={props.catalog.id} type="checkbox" checked={props.isSelected} {...toggleHandlers} onChange={onChangeFunc} />
            <label htmlFor={props.catalog.id as string} className="catalog-id">{catalogLabel}</label>
            {isHovered && props.catalog.id !== SELECT_ALL_CATALOG.id && <button className="catalog-entry-select-only-btn" {...toggleHandlers} onClick={onSelectOnly} >Select Only</button>}
        </div>
    );
}