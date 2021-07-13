import React from 'react';
import { IPublicProduct } from "../../api/ContentAPI";

interface CatalogProductEntryProps {
    product: IPublicProduct,
    isSelected: boolean,
    onProductSelected: Function,
    onAddProduct: Function
}

//=============================================================================
function CatalogProductEntry(props: CatalogProductEntryProps) {
    let classNames = ["catalog-product-entry"],
        imageContent;

    if (props.isSelected) {
        classNames.push("catalog-product-entry-selected");
    }

    if (props.product.imageURL?.trim() !== "") {
        imageContent = (<img src={props.product.imageURL} />); // onLoad={() => setLoading(false)}
    } else {
        imageContent = (<div className="catalog-product-no-image"><span>No Image</span></div>);
    }

    return (
        <div className={classNames.join(" ")} onClick={() => props.onProductSelected(props.product)} onDoubleClick={() => props.onAddProduct(props.product)}>
            <div className="catalog-product-image-container">
                {imageContent}
            </div>
            <div className="catalog-product-entry-label">
                {props.product.name}
            </div>
            <span className="catalog-product-tooltip">{props.product.name}</span>
        </div>
    );
}

export default CatalogProductEntry;