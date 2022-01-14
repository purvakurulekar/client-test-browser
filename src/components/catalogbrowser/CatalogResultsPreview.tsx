import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faThLarge } from "@fortawesome/free-solid-svg-icons";

interface ICatalogResultsPreview {
    totalCatalogs: number,
    totalResults: number,
    children: any
}

export default function CatalogResultsPreview(props: ICatalogResultsPreview) {
    let countSummary: string = "";

    countSummary = `${props.totalCatalogs} Catalog`;

    if (props.totalCatalogs > 1) {
        countSummary += "s"
    }

    countSummary += ` / ${props.totalResults} results`;

    return (
        <div className="catalog-results-preview">
            <div className="catalog-results-count">
                <span>{countSummary}</span>
                {props.children}
            </div>
        </div>
    );
}