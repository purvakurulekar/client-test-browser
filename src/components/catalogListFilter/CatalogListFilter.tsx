import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter } from "@fortawesome/free-solid-svg-icons";
import RefinedFilter, { IRefinedFilter } from './RefinedFilter';

interface ICatalogListFilterProps {
    catalogsList: Array<ICatalog>,
    refinedFilters: IRefinedFilter,
    onFiltered(filteredCatalogs: Array<ICatalog>): void
    onRefinedFilterChanged: Function
}

//=============================================================================
export default function CatalogListFilter(props: ICatalogListFilterProps) {
    let [catalogTextFilter, setCatalogTextFilter] = useState(""),
        [isShowingRefinedFilters, setShowingRefinedFilters] = useState(false);

    function handleRefinedFilterClicked() {
        setShowingRefinedFilters(!isShowingRefinedFilters);
    }

    useEffect(() => {
        let filteredCatalogs: Array<ICatalog>;

        catalogTextFilter = catalogTextFilter.trim().toLowerCase();

        if (catalogTextFilter.length > 0) {
            filteredCatalogs = props.catalogsList.filter((catalog: ICatalog) => {
                let isValid: boolean;

                isValid = catalog.name.toLowerCase().includes(catalogTextFilter);
                if (!isValid) {
                    isValid = catalog.id.includes(catalogTextFilter);
                }
                if (!isValid) {
                    isValid = Boolean(catalog.version && catalog.version.includes(catalogTextFilter));
                }
                if (!isValid) {
                    isValid = Boolean(catalog.updatedDate && catalog.updatedDate.includes(catalogTextFilter));
                }

                return isValid;
            });
        } else {
            filteredCatalogs = props.catalogsList;
        }

        props.onFiltered(filteredCatalogs);
    }, [catalogTextFilter]);

    return (
        <div className="catalog-list-filter">
            {
                isShowingRefinedFilters && <RefinedFilter refinedFilters={props.refinedFilters} onFilterChanged={props.onRefinedFilterChanged} />
            }
            <input type="text" placeholder="Filter catalogs..." onChange={e => setCatalogTextFilter(e.target.value)} value={catalogTextFilter} />
            <FontAwesomeIcon icon={faSearch} />
            <button className="catalog-list-filter-btn" onClick={handleRefinedFilterClicked}><FontAwesomeIcon icon={faFilter} /></button>
        </div>
    );

}