import React from 'react';
import { Loader } from "client-ui-toolkit";

import CatalogProductEntry from "./CatalogProductEntry";

//=============================================================================
interface ICatalogProductListProps {
    className?: string,
    isLoading: boolean,
    items: Array<IItem>,
    selectedItem: IItem | null,
    onItemSelected: Function,
    onAddItem: Function
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
            {props.items.map((item: IItem) => {
                let key = item.id;

                return <CatalogProductEntry
                    key={key}
                    item={item}
                    isSelected={item === props.selectedItem}
                    onItemSelected={props.onItemSelected}
                    onAddItem={props.onAddItem}
                />;
            })}
            {isLoading && <Loader />}
        </div>
    );
}