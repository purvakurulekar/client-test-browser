import React, { useRef, useState, useEffect } from 'react';

interface ICombinedCatalogProductListProps {
    children: any,
    isFetching: boolean,
    onFetchRequest: Function
}

const
    MIN_PIXEL_SCROLL_FETCH_DIST = 50;

//=============================================================================
export default function CombinedCatalogProductList(props: ICombinedCatalogProductListProps) {
    let [hasScrolledEnough, setScrolledEnough] = useState(false),
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
            setScrolledEnough(false);
        }
    }, [props.isFetching]);

    return (
        <div ref={listDivRef} className="catalog-product-list-container" onScroll={checkScrollAmountFunc}>
            {props.children}
        </div>

    );
}
