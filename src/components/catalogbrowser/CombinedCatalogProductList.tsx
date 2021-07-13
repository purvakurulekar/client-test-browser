import React, { useRef, useState, useEffect } from 'react';
// import { DATA_SOURCES } from "../../endPoints/DataEndpoint";
// import ICommonCatalog from 'src/interfaces/ICommonCatalog.tsx';
// import ICommonProduct from '../../interfaces/ICommonProduct';
// import CatalogProductList from "./CatalogProductList";

interface ICombinedCatalogProductListProps {
    // products: Array<ICommonProduct>,
    // catalogs: Array<ICommonCatalog>
    // sourcesLoading: any,// { cic2: boolean, mooble: boolean }
    // selectedProduct: ICommonProduct | null,
    // onProductSelected: Function,
    children: any,
    isFetching: boolean,
    onFetchRequest: Function
}

const
    MIN_PIXEL_SCROLL_FETCH_DIST = 50;

//=============================================================================
export default function CombinedCatalogProductList(props: ICombinedCatalogProductListProps) {
    let [hasScrolledEnough, setScrolledEnough] = useState(false),
        // cic2ProductsList: Array<ICommonProduct> = [],
        // moobleProductsList: Array<ICommonProduct> = [],
        // renderedCiC2ProductList,
        // renderedMoobleProductList,
        listDivRef = useRef(null),
        checkScrollAmountFunc = () => {
            let domDivEl: HTMLDivElement | null = listDivRef.current,
                remainingScroll: number = 0;

            if (domDivEl !== null && !hasScrolledEnough) {
                domDivEl = domDivEl as HTMLDivElement;
                remainingScroll = domDivEl.scrollHeight - (domDivEl.clientHeight + domDivEl.scrollTop);

                if (remainingScroll <= MIN_PIXEL_SCROLL_FETCH_DIST) {
                    setScrolledEnough(true);
                    console.log("** NEED TO FETCH MORE PRODUCTS IF AVAIL **");
                    props.onFetchRequest();
                }
            }
        }

    useEffect(() => {
        if(!props.isFetching) {
            console.log("Fetching Catalog Product List Completed!");
            setScrolledEnough(false);
        }
    }, [props.isFetching]);

    // props.products.forEach((catalog: ICommonProduct) => {
    //     if (catalog.Source === DATA_SOURCES.cic2) {
    //         cic2ProductsList.push(catalog);
    //     } else {
    //         moobleProductsList.push(catalog);
    //     }
    // });

    // if (cic2ProductsList.length > 0 || props.sourcesLoading[DATA_SOURCES.cic2]) {
    //     renderedCiC2ProductList = (<CatalogProductList
    //         className="catalog-product-list-cic2"
    //         isLoading={true}
    //         products={props.products || []}
    //         selectedProduct={props.selectedProduct}
    //         onProductSelected={props.onProductSelected} />);
    // }

    // if (moobleProductsList.length > 0 || props.sourcesLoading[DATA_SOURCES.mooble]) {
    //     renderedMoobleProductList = (
    //         <CatalogProductList
    //             className="catalog-product-list-mooble"
    //             isLoading={true}
    //             products={moobleProductsList || []}
    //             selectedProduct={props.selectedProduct}
    //             onProductSelected={props.onProductSelected} />
    //     );
    // }

    // {renderedMoobleProductList}
    // {renderedCiC2ProductList}

    return (
        <div ref={listDivRef} className="catalog-product-list-container" onScroll={checkScrollAmountFunc}>
            {props.children}
        </div>

    );
}
