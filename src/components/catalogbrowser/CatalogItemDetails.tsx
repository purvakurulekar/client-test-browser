import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons"

// imageURL: string,

// id: string,
// name: string,
// description: string,
// dimensions: DimensionsStr,
// orderCode: string,
// updateTStamp?: number,
// subItems?: Array<IItem>,
// legacyItemType?: string,
// groupCodes?: Array<string>,
// configurationState?: IConfigurationState,
// proposedVariants?: Array<IItem>

interface ICatalogItemDetailsProps {
    item: IItem,
    onCloseClicked: Function
}

export default function CatalogItemDetails(props: ICatalogItemDetailsProps) {
    return (
        <div className="catalog-item-details">
            <button className="catalog-item-details-close-btn" onClick={props.onCloseClicked as any}><FontAwesomeIcon icon={faTimesCircle} /></button>
            <img className="catalog-item-details-image" src={props.item.image!?.uri || ""} />
            <div className="catalog-item-details-entry">
                <div className="catalog-item-details-entry-name">id:</div>
                <div className="catalog-item-details-entry-value">{props.item.id}</div>
            </div>
            <div className="catalog-item-details-entry">
                <div className="catalog-item-details-entry-name">name:</div>
                <div className="catalog-item-details-entry-value truncatable-text">{props.item.name}</div>
            </div>
            <div className="catalog-item-details-entry">
                <div className="catalog-item-details-entry-name">description:</div>
                <div className="catalog-item-details-entry-value truncatable-text">{props.item.descriptions!?.short || ""}</div>
            </div>
            <div className="catalog-item-details-entry">
                <div className="catalog-item-details-entry-name">Order code:</div>
                <div className="catalog-item-details-entry-value">{props.item.refCodes!["sku"] || ""}</div>
            </div>
            <div className="catalog-item-details-entry">
                <div className="catalog-item-details-entry-name">legacyItemType:</div>
                <div className="catalog-item-details-entry-value truncatable-text">{props.item.classification?.legacyItemType}</div>
            </div>
            <div className="catalog-item-details-entry">
                <div className="catalog-item-details-entry-name">dimensions:</div>
                <ul>
                    {Array.from(Object.entries(props.item.dimensions || {}))
                    .map(([propName, propVal]) => (
                    <li key={propName}>
                        <span>{propName}: </span>
                        <span>{propVal}</span>
                    </li>
                    ))}
                </ul>
            </div>
            <div className="catalog-item-details-entry">
                <div className="catalog-item-details-entry-name">groupCodes:</div>
                <ul>
                    {props.item.groupRefs?.map((code: string, idx: number) => <li key={code + idx}>{code}</li>)}
                </ul>
            </div>
        </div>
    );
}