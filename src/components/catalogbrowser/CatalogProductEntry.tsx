import React from 'react';

interface CatalogProductEntryProps {
    item: IItem,
    isSelected: boolean,
    onItemSelected: Function,
    onAddItem: Function
}

//=============================================================================
function CatalogProductEntry(props: CatalogProductEntryProps) {
    let classNames = ["catalog-product-entry"],
        imageContent;

    if (props.isSelected) {
        classNames.push("catalog-product-entry-selected");
    }

    if (props.item.imageURL?.trim() !== "") {
        imageContent = (<img src={props.item.imageURL} />); // onLoad={() => setLoading(false)}
    } else {
        imageContent = (<div className="catalog-product-no-image"><span>No Image</span></div>);
    }

    function _handleDragStart(event: React.DragEvent<HTMLDivElement>) {
        event.dataTransfer?.setData("text/plain", JSON.stringify({
            event: "add-product",
            data: props.item
        }));
    }
    
    return (
        <div className={classNames.join(" ")} onClick={() => props.onItemSelected(props.item)} onDoubleClick={() => props.onAddItem(props.item)} onDragStart={_handleDragStart} >
            <div className="catalog-product-image-container">
                {imageContent}
            </div>
            <div className="catalog-product-entry-label">
                {props.item.name}
            </div>
            <span className="catalog-product-tooltip">{props.item.name}</span>
        </div>
    );
}

export default CatalogProductEntry;