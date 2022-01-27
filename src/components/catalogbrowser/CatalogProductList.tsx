import React from 'react';
import { Loader } from "client-ui-toolkit";

import CatalogProductEntry from "./CatalogProductEntry";

//=============================================================================
interface ICatalogProductListProps {
    className?: string,
    searchQuery?: string, 
    isLoading: boolean,
    items: Array<IItem>,
    selectedItem: IItem | null,
    onItemSelected: Function,
    onAddItem(catalogItem: IItem): void,
    onShowItemDetails(ctalogItem: IItem): void
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
            {props.items.length === 0 && props.searchQuery && <div className="catalog-product-list-empty">No Items found for {props.searchQuery}.</div>}
            {props.items.map((item: IItem) => {
                let key = item.id;

                return <CatalogProductEntry
                    key={key}
                    item={item}
                    isSelected={item === props.selectedItem}
                    onItemSelected={props.onItemSelected}
                    onAddItem={props.onAddItem}
                    onShowItemDetails={props.onShowItemDetails}
                />;
            })}
            {isLoading && <Loader />}
        </div>
    );
}