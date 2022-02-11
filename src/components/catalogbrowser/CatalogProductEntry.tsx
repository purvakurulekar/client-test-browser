import React, { LegacyRef, useLayoutEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faListAlt } from "@fortawesome/free-regular-svg-icons";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

interface CatalogProductEntryProps {
    item: IItem,
    isSelected: boolean,
    onItemSelected: Function,
    onAddItem(catalogItem: IItem): void,
    onShowItemDetails(ctalogItem: IItem): void
}

//=============================================================================
function CatalogProductEntry(props: CatalogProductEntryProps) {
    let [isShowingVariantsList, setShowingVariantsList] = useState(false),
        classNames = ["catalog-product-entry"],
        imageContent,
        hasVariants: boolean = Boolean(props.item.variantProposals && props.item.variantProposals.length > 0),
        variantBtn: JSX.Element | undefined;

    if (props.isSelected) {
        classNames.push("catalog-product-entry-selected");
    }

    if (props.item.image!?.uri?.trim() !== "") {
        imageContent = (<img src={props.item.image!?.uri || ""} />); // onLoad={() => setLoading(false)}
    } else {
        imageContent = (<div className="catalog-product-no-image"><span>No Image</span></div>);
    }

    function _handleDragStart(event: React.DragEvent<HTMLDivElement>) {
        event.dataTransfer?.setData("text/plain", JSON.stringify({
            event: "add-item",
            data: props.item
        }));
    }

    function _handleVariantBtnClicked() {
        setShowingVariantsList(true);
    }

    if (hasVariants) {
        variantBtn = (
            <button className="catalog-product-variants-btn" onClick={_handleVariantBtnClicked}>
                <FontAwesomeIcon icon={faListAlt} />
            </button>
        );
    }

    //     <button className="catalog-product-info-btn" onClick={() => props.onShowItemDetails(props.item)}>
    //     <FontAwesomeIcon icon={faInfoCircle} />
    // </button>

    return (
        <div className={classNames.join(" ")} onClick={() => props.onItemSelected(props.item)} onDoubleClick={() => props.onAddItem(props.item)} onDragStart={_handleDragStart} >
            {variantBtn}
            {
                isShowingVariantsList &&
                <VariantsList
                    list={props.item.variantProposals!}
                    onVariantClicked={props.onAddItem}
                    onClose={() => setShowingVariantsList(false)} />

            }
            <div className="catalog-product-image-container">
                {imageContent}
            </div>
            <div className="catalog-item-details-small">
                <div className="catalog-item-details-entry">
                    <div className="catalog-item-details-entry-name">id:</div>
                    <div className="catalog-item-details-entry-value">{props.item.id}</div>
                </div>
                <div className="catalog-item-details-entry">
                    <div className="catalog-item-details-entry-name">name:</div>
                    <div className="catalog-item-details-entry-value wrap-text">{props.item.name}</div>
                </div>
                
                <div className="catalog-item-details-entry">
                    <div className="catalog-item-details-entry-name">description:</div>
                    <div className="catalog-item-details-entry-value wrap-text">{props.item.descriptions!?.short || ""}</div>
                </div>
                <div className="catalog-item-details-entry">
                    <div className="catalog-item-details-entry-name">externalCodes:</div>
                    <div className="catalog-item-details-entry-value">{props.item.externalCodes?.sku}</div>
                </div>
                <div className="catalog-item-details-entry">
                    <div className="catalog-item-details-entry-name">fullItemType:</div>
                    <div className="catalog-item-details-entry-value wrap-text">{props.item.classification?.fullItemType}</div>
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
                    <div className="catalog-item-details-entry-name">groupRefs:</div>
                    <ul>
                        {props.item.groupRefs?.map((code: string, idx: number) => <li key={code + idx}>{code}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
}

interface IVariantsListProps {
    list: Array<IItem>,
    onVariantClicked(item: IItem): void,
    onClose(): void
}

function VariantsList(props: IVariantsListProps) {
    let listRef: React.MutableRefObject<HTMLDivElement | undefined> = useRef<HTMLDivElement | undefined>(),
        listRefRect: React.MutableRefObject<DOMRect | undefined> = useRef<DOMRect>();

    useLayoutEffect(() => {
        let listRect: DOMRect = listRef.current!.getBoundingClientRect(),
            parentContainerRect: DOMRect = (listRef.current!.parentNode!.parentNode as HTMLDivElement).getBoundingClientRect(),
            offset: number;


        if (listRect.width < parentContainerRect.width && listRect.x + listRect.width > parentContainerRect.x + parentContainerRect.width) {
            offset = parentContainerRect.width - (listRect.x + listRect.width);
            listRef.current!.style.left = `${offset}px`;
        }

        // setTimeout(() => {
        listRefRect.current = listRef.current!.getBoundingClientRect();
        // });

        window.addEventListener("mousemove", _handleOnMouseMove);

        return () => {
            window.removeEventListener("mousemove", _handleOnMouseMove);
        }
    }, []);

    function _handleOnMouseMove(e: MouseEvent) {
        let isInside: boolean;

        if (listRefRect.current) {
            let mouseX: number = e.clientX,
                mouseY: number = e.clientY,
                divX: number = listRefRect.current!.x,
                divY: number = listRefRect.current!.y;

            isInside = (mouseX >= divX) && (mouseX <= (divX + listRefRect.current!.width)) &&
                (mouseY >= divY) && (mouseY <= (divY + listRefRect.current!.height));
        } else {
            isInside = false;
        }

        if (!isInside) {
            props.onClose();
        }
    }

    return (
        <div className="catalog-product-variants-list" ref={listRef as LegacyRef<HTMLDivElement>}>
            {props.list.map((variantItem: IItem, idx: number) =>
                <div
                    key={`${variantItem.id}-${idx}`}
                    onClick={() => props.onVariantClicked(variantItem)}
                    className="catalog-product-variant-entry">{variantItem.name}</div>
            )}
        </div>
    );
}

export default CatalogProductEntry;