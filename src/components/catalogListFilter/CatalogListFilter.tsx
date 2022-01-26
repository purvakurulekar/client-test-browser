import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface ICatalogListFilterProps {
    catalogsList: Array<ICatalog>,
    onFiltered(filteredCatalogs: Array<ICatalog>): void
}

//=============================================================================
export default function CatalogListFilter(props: ICatalogListFilterProps) {
    let [catalogFilter, setcatalogFilter] = useState("");

    useEffect(() => {
        let filteredCatalogs: Array<ICatalog>;

        catalogFilter = catalogFilter.trim().toLowerCase();

        if (catalogFilter.length > 0) {
            filteredCatalogs = props.catalogsList.filter((catalog: ICatalog) => {
                let isValid: boolean;
    
                isValid = catalog.name.toLowerCase().includes(catalogFilter);
                if (!isValid) {
                    isValid = catalog.id.includes(catalogFilter);
                }
                if (!isValid) {
                    isValid = Boolean(catalog.version && catalog.version.includes(catalogFilter));
                }
                if (!isValid) {
                    isValid = Boolean(catalog.updatedDate && catalog.updatedDate.includes(catalogFilter));
                }
    
                return isValid;
            });
        } else {
            filteredCatalogs = [];
        }

        props.onFiltered(filteredCatalogs);
    }, [catalogFilter]);

    return (
        <div className="catalog-list-filter">
            <input type="text" placeholder="Filter catalogs..." onChange={e => setcatalogFilter(e.target.value)} value={catalogFilter} />
            <FontAwesomeIcon icon={faSearch} />
        </div>
    );

}