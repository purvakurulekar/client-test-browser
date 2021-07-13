import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faThLarge } from "@fortawesome/free-solid-svg-icons";

interface ICatalogResultsPreview {
    totalCatalogs: number,
    totalResults: number,
    totalMoobleResults?: number,
    totalCiC2Results?: number,
    nbActiveSources: number,
    children: any
}

export default function CatalogResultsPreview(props: ICatalogResultsPreview) {
    let countSummary: string = "";

    countSummary = `${props.totalCatalogs} Catalog`;

    if(props.totalCatalogs > 1) {
        countSummary += "s"
    }

    countSummary += ` / ${props.totalResults} results`;
    
    if (props.nbActiveSources > 1) {
        countSummary += ` / CiC3 (${props.totalMoobleResults}) - CiC2 (${props.totalCiC2Results})`;
    }

    return (
        <div className="catalog-results-preview">
            <div className="catalog-results-nb-per-page catalog-results-preview-btn">
                <span className="catalog-results-preview-nb-per-page-btn">All</span>
            </div>
            <div className="catalog-results-count">
                <span>{countSummary}</span>
                {props.children}
            </div>
            <div className="catalog-results-preview-btn">
                <FontAwesomeIcon icon={faThLarge} />
            </div>
            <div className="catalog-results-preview-btn">
                <FontAwesomeIcon icon={faList} />
            </div>
        </div>
    );
}