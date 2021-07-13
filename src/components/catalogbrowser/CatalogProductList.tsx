import React, { useRef, useState, useEffect } from 'react';
import { Loader, Overlay } from "client-ui-toolkit";

import CatalogProductEntry from "./CatalogProductEntry";

//=============================================================================
interface ICatalogProductListProps {
    className?: string,
    isLoading: boolean,
    products: Array<IPublicProduct>,
    selectedProduct: IPublicProduct | null,
    onProductSelected: Function,
    onAddProduct: Function
}

//=============================================================================
export default function CatalogProductList(props: ICatalogProductListProps) {
    let // [productList, setProductList] = useState([]),
        isLoading: boolean = props.isLoading,
        classNames: Array<string> = ["catalog-product-list"];

    if (props.className) {
        classNames.push(props.className);
    }

    return (
        <div className={classNames.join(" ")}>
            {props.products.map((i_oProduct: IPublicProduct) => {
                let key = i_oProduct.id;

                return <CatalogProductEntry
                    key={key}
                    product={i_oProduct}
                    isSelected={i_oProduct === props.selectedProduct}
                    onProductSelected={props.onProductSelected}
                    onAddProduct={props.onAddProduct}
                />;
            })}
            {isLoading && <Loader />}
        </div>
    );
}