import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faRuler, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { SELECT_ALL_CATALOG } from "../../interfaces/IPublicAPIInterfaces";

interface CatalogEntryProps {
    className: string,
    catalog: ICatalog,
    isSelected: boolean,
    onSelected: Function,
    onSelectOnly: Function
}

//=============================================================================
export default function CatalogEntry(props: CatalogEntryProps) {
    let [isHovered, setHovered] = useState(false),
        rootElement = useRef(null),
        uomIcon: IconDefinition | undefined,
        onChangeFunc = (e: React.ChangeEvent<HTMLInputElement>) => props.onSelected(props.catalog, e.target.checked),
        onSelectOnly = () => props.onSelectOnly(props.catalog),
        toggleHandlers,
        classNames: Array<string> = ["catalog-id"],
        uomClassName: string = "",
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

    if (props.catalog && props.catalog.status) {
        if (props.catalog.status.toLowerCase() === "activated") {
            classNames.push("catalog-activated");
        }
    }

    if (props.catalog.measurementSystem) {
        if (props.catalog.measurementSystem.toLowerCase() === "imperial") {
            uomIcon = faCrown;
            uomClassName = "catalog-entry-uom-imperial";
        } else {
            uomIcon = faRuler;
            uomClassName = "catalog-entry-uom-metric";
        }
    }

    return (
        <div className={`catalog-entry ${props.className}`} ref={rootElement} onMouseOver={_handleRootMouseOver} onMouseOut={_handleRootMouseOut}>
            <div className="catalog-entry-selector">
                <input id={props.catalog.id} type="checkbox" checked={props.isSelected} {...toggleHandlers} onChange={onChangeFunc} />
                <label htmlFor={props.catalog.id as string} className={classNames.join(" ")}>{props.catalog.name}</label>
                {uomIcon && <span className={uomClassName}><FontAwesomeIcon title={props.catalog.measurementSystem} icon={uomIcon} /></span>}
            </div>
            {
                props.catalog.id !== SELECT_ALL_CATALOG.id &&
                <div className="catalog-entry-details">
                    <div className="catalog-id">
                        <span className="catalog-entry-details-label">id:</span>
                        <span>{props.catalog.id}</span>
                    </div>
                    <div className="catalog-version">
                        <span className="catalog-entry-details-label">version:</span>
                        <span>{props.catalog.version}</span>
                    </div>
                    <span className="catalog-status">{props.catalog.status}</span>
                </div>
            }

            {props.catalog.id !== SELECT_ALL_CATALOG.id &&
                <div className="catalog-entry-timestamp">
                    <span className="catalog-entry-details-label">updated:</span>
                    <span>{props.catalog.updatedDate.replace(/T|\.\d+$/, " ").trim()}</span>
                </div>
            }

            {isHovered && props.catalog.id !== SELECT_ALL_CATALOG.id && <button className="catalog-entry-select-only-btn" {...toggleHandlers} onClick={onSelectOnly} >Select Only</button>}
        </div>
    );
}